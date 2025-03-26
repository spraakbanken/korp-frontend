/** @format */
import settings from "@/settings"
import { lemgramToHtml, regescape, saldoToHtml, splitFirst } from "@/util"
import { locAttribute } from "@/i18n"
import { CorpusListing } from "@/corpus_listing"

type Stringifier = (tokens: string[], ignoreCase?: boolean) => string

let customFunctions: Record<string, Stringifier> = {}

try {
    customFunctions = require("custom/statistics.js").default
} catch (error) {
    console.log("No module for statistics functions available")
}

export function getCqp(hitValues: Record<string, string[]>[], ignoreCase: boolean): string {
    const positionalAttributes = ["word", ...Object.keys(settings.corpusListing.getCurrentAttributes())]

    const tokens = hitValues
        .map((token) => Object.entries(token).map(([attr, values]) => reduceCqp(attr, values, ignoreCase)))
        .map((conditions) => "[" + conditions.join(" & ") + "]")

    // If reducing by structural attributes only, then `hitValues` has only the first match token,
    // so allow any number of subsequent tokens in the match.
    const structOnly = hitValues.length == 1 && !positionalAttributes.some((attr) => attr in hitValues[0])
    if (structOnly) tokens.push("[]{0,}")

    return `<match> ${tokens.join(" ")} </match>`
}

function reduceCqp(
    name: string,
    /** `values` is multiple if multiple result rows were grouped into one, e.g. ranked or MWE */
    values: string[],
    ignoreCase: boolean
): string {
    const attrs = settings.corpusListing.getCurrentAttributes()
    const structAttrs = settings.corpusListing.getStructAttrs()
    const attr = attrs[name] || structAttrs[name]

    // Use named CQP'ifier from custom config code. It must escape values as regex.
    if (attr?.stats_cqp) return customFunctions[attr.stats_cqp](values, ignoreCase)

    const cqpName = name in structAttrs ? `_.${name}` : name

    // Empty value: require number of values to be 0
    if (values[0] == "") return `ambiguity(${cqpName}) = 0`

    // Escape values for use in CQP regex
    values = values.map(regescape)
    // Combine grouped values
    let cqpValue = values.length > 1 ? mergeRegex(values) : values[0]
    // Case-insensitive search
    if (name == "word" && ignoreCase) cqpValue += " %c"

    const op = attr?.type === "set" ? "contains" : "="
    return `${cqpName} ${op} '${cqpValue}'`
}

/** Merge ["foo:X", "foo:Y"] to "foo:(X|Y)" */
function mergeRegex(values: string[]): string {
    const init = splitFirst(":", values[0])[0]
    const tails = values.map((v) => splitFirst(":", v)[1])
    return init + ":(" + tails.join("|") + ")"
}

// Get the html (no linking) representation of the result for the statistics table
export function reduceStringify(name: string, cl?: CorpusListing): (values: string[]) => string {
    cl ??= settings.corpusListing
    const attrs = cl.getCurrentAttributes()
    const structAttrs = cl.getStructAttrs()
    const attr = attrs[name] || structAttrs[name]

    // Use named stringifier from custom config code
    if (attr?.stats_stringify) return customFunctions[attr.stats_stringify]

    const transforms: ((token: string) => string)[] = []

    if (attr?.ranked) transforms.push((token) => token.replace(/:.*/g, ""))
    if (attr?.translation) transforms.push((token) => locAttribute(attr.translation, token))

    if (["prefix", "suffix", "lex"].includes(name)) transforms.push((token) => lemgramToHtml(token, true))
    else if (name == "saldo" || name == "sense") transforms.push((token) => saldoToHtml(token, true))
    else if (name == "lemma") transforms.push((lemma) => lemma.replace(/_/g, " "))

    // TODO This is specific to ASU corpus, move out to config
    if (name == "msd_orig") transforms.push((token) => ($("<span>").text(token) as any).outerHTML())

    const transform = (value: string) => transforms.reduce((acc, f) => f(acc), value)
    // Join with spaces and then squash redundant and surrounding space.
    return (values) => values.map(transform).join(" ").trim().replace(/\s+/g, " ")
}
