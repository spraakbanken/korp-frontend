/** @format */
import settings, { prefixAttr } from "@/settings"
import { CountsMerged } from "@/backend/types/count"
import { Dataset, isTotalRow, StatisticsWorkerMessage, StatisticsProcessed, SearchParams } from "./statistics.types"
import { fromKeys, regescape, splitFirst } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { loc, locAttribute, locObj } from "@/i18n"
import CSV from "comma-separated-values/csv"
import { corpusListing, CorpusListing } from "@/corpora/corpus_listing"
import { Lemgram } from "@/lemgram"
import { Saldo } from "@/saldo"

type Stringifier = (tokens: string[], ignoreCase?: boolean) => string

let customFunctions: Record<string, Stringifier> = {}

try {
    customFunctions = require("custom/statistics.js").default
} catch (error) {
    console.log("No module for statistics functions available")
}

export function processStatisticsResult(
    originalCorpora: string,
    data: CountsMerged,
    reduceVals: string[],
    ignoreCase: boolean,
    prevNonExpandedCQP: string
): Promise<StatisticsProcessed> {
    const corpora = Object.keys(data.corpora)
    const cl = corpusListing.subsetFactory(corpora)

    // Get stringifiers for formatting attribute values
    const stringifiers = fromKeys(reduceVals, (attr) => reduceStringify(attr, cl))

    const params: SearchParams = {
        reduceVals,
        ignoreCase,
        originalCorpora,
        corpora,
        prevNonExpandedCQP,
    }

    // Delegate stats processing to a Web Worker for performance
    const worker = new Worker(new URL("./statistics_worker", import.meta.url))

    worker.postMessage({
        type: "korpStatistics",
        data,
        // Worker code cannot import settings
        groupStatistics: settings.group_statistics,
    } satisfies StatisticsWorkerMessage)

    // Return a promise that resolves when the worker is done
    return new Promise((resolve) => {
        worker.onmessage = (e: MessageEvent<Dataset>) => {
            // Terminate worker to free up resources
            worker.terminate()
            const rows = e.data

            // Format the values of the attributes we are reducing by
            for (const row of rows) {
                if (isTotalRow(row)) continue
                for (const attr of reduceVals) {
                    const words = row.statsValues.map((word) => word[attr]?.[0]).filter(Boolean)
                    row.formattedValue[attr] = stringifiers[attr](words)
                }
            }

            let processed: StatisticsProcessed = { rows, params }

            if (settings["statistics_postprocess"]) {
                processed = settings["statistics_postprocess"](processed)
            }

            resolve(processed)
        }
    })
}

export function getCqp(hitValues: Record<string, string[]>[], ignoreCase: boolean): string {
    const tokens = hitValues
        .map((token) => Object.entries(token).map(([attr, values]) => reduceCqp(attr, values, ignoreCase)))
        .map((conditions) => "[" + conditions.join(" & ") + "]")

    // If reducing by structural attributes only, then `hitValues` has only the first match token,
    // so allow any number of subsequent tokens in the match.
    return `<match> ${tokens.join(" ")} []{0,} </match>`
}

function reduceCqp(
    name: string,
    /** `values` is multiple if multiple result rows were grouped into one, e.g. ranked or MWE */
    values: string[],
    ignoreCase: boolean
): string {
    // Note: undefined if name is `word`
    const attr = corpusListing.getReduceAttrs()[name]

    // Use named CQP'ifier from custom config code. It must escape values as regex.
    if (attr?.stats_cqp) return customFunctions[attr.stats_cqp](values, ignoreCase)

    const cqpName = attr ? prefixAttr(attr) : name

    // Empty value: require number of values to be 0
    if (values[0] == "") return `ambiguity(${cqpName}) = 0`

    // Escape values for use in CQP regex
    values = values.map(regescape)
    // Combine grouped values
    const cqpValue = values.length > 1 ? mergeRegex(values) : values[0]
    // Enclose in quotes and support case-insensitive search
    let quoted = `'${cqpValue}'`
    if (name == "word" && ignoreCase) quoted += " %c"

    const op = attr?.type === "set" ? "contains" : "="
    return `${cqpName} ${op} ${quoted}`
}

/** Merge ["foo:X", "foo:Y"] to "foo:(X|Y)" */
function mergeRegex(values: string[]): string {
    const init = splitFirst(":", values[0])[0]
    const tails = values.map((v) => splitFirst(":", v)[1])
    return init + ":(" + tails.join("|") + ")"
}

// Get the html (no linking) representation of the result for the statistics table
function reduceStringify(name: string, cl?: CorpusListing): (values: string[]) => string {
    cl ??= corpusListing
    const attr = cl.getReduceAttrs()[name]

    // Use named stringifier from custom config code
    if (attr?.stats_stringify) return customFunctions[attr.stats_stringify]

    const transforms: ((token: string) => string)[] = []

    if (attr?.ranked) transforms.push((token) => token.replace(/:.*/g, ""))
    if (attr?.translation) transforms.push((token) => locAttribute(attr.translation, token))

    if (["prefix", "suffix", "lex"].includes(name)) transforms.push((token) => Lemgram.parse(token)?.toHtml() || token)
    else if (name == "saldo" || name == "sense") transforms.push((token) => Saldo.parse(token)?.toHtml() || token)
    else if (name == "lemma") transforms.push((lemma) => lemma.replace(/_/g, " "))

    // TODO This is specific to ASU corpus, move out to config
    if (name == "msd_orig") transforms.push((token) => ($("<span>").text(token) as any).outerHTML())

    const transform = (value: string) => transforms.reduce((acc, f) => f(acc), value)
    // Join with spaces and then squash redundant and surrounding space.
    return (values) => values.map(transform).join(" ").trim().replace(/\s+/g, " ")
}

export function createStatisticsCsv(
    data: Dataset,
    attrs: string[],
    corpora: CorpusTransformed[],
    relative: boolean,
    csvType: string,
    lang?: string
): string {
    const delimiter = csvType == "tsv" ? "\t" : ";"
    const frequencyIndex = relative ? 1 : 0
    const corpusTitles = corpora.map((corpus) => locObj(corpus.title, lang))
    const header = [...attrs, loc("stats_total", lang), ...corpusTitles]

    const output = data.map((row) => {
        // One cell per grouped attribute
        // TODO Should isPhraseLevelDisjunction be handled here?
        const attrValues = attrs.map((attr) => (isTotalRow(row) ? "Σ" : row.plainValue[attr]))
        const frequencies = corpora.map((corpus) => row.count[corpus.id.toUpperCase()][frequencyIndex])
        return [...attrValues, row.total[frequencyIndex], ...frequencies]
    })

    return CSV.encode(output, { header, delimiter })
}
