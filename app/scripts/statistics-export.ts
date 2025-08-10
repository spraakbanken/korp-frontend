/** @format */
import CSV from "comma-separated-values/csv"
import { Dataset, isTotalRow } from "@/statistics.types"
import { loc, locObj } from "@/i18n"
import { CorpusTransformed } from "./settings/config-transformed.types"

export function createStatisticsCsv(
    data: Dataset,
    attrs: string[],
    corpora: CorpusTransformed[],
    frequencyType: string,
    csvType: string,
    lang?: string
): string {
    const delimiter = csvType == "tsv" ? "\t" : ";"
    const frequencyIndex = frequencyType == "absolute" ? 0 : 1
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
