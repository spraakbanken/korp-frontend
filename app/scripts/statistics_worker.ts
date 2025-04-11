/** @format */
import groupBy from "lodash/groupBy"
import mapValues from "lodash/mapValues"
import sumBy from "lodash/sumBy"
import type { RowsEntity } from "./interfaces/stats"
import type { StatsRow } from "./backend/types/count"
import type { AbsRelSeq, Dataset, SingleRow, TotalRow, StatisticsWorkerMessage } from "./statistics.types"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

const isStatisticsMessageEvent = (e: MessageEvent): e is MessageEvent<StatisticsWorkerMessage> =>
    e.data.type === "korpStatistics"

onmessage = function (e) {
    // Ignore messages sent by Webpack dev server.
    if (!isStatisticsMessageEvent(e)) return

    const message = e.data
    const { combined, corpora } = message.data

    const simplifyValue = function (values: string[] | string, attr: string): string[] {
        if (message.groupStatistics.includes(attr))
            // For these attrs, ":" must only be used when merging is desired, e.g. for ranking or MWE indexing.
            return (values as string[]).map((value) => value.replace(/(:.+?)($| )/g, "$2"))
        // for struct attributes only a value is sent, not list
        return Array.isArray(values) ? values : [values]
    }

    /**
     * This function creates a string representation of
     * the row, to group values by. Using "simplifyValue"
     * it removes suffixes `:<rank/numbering>` from
     * attributes that are in `group_statistics` in config.yml
     */
    const simplifyHitString = (item: RowsEntity): string =>
        Object.entries(item.value)
            .map(([attr, values]) => simplifyValue(values, attr).join(" "))
            .join("/")

    // Group data by simplified values, e.g. "foo:12" and "foo:34" under "foo"
    // Since `normalizeStatsData()` is applied, data has moved from `combined` into `combined[0]`
    const groupedRows = groupBy(combined[0].rows, (item) => simplifyHitString(item))
    const rowIds = Object.keys(groupedRows)
    // Pre-allocate array for performance
    const dataset: Dataset = new Array(rowIds.length + 1)

    // Since `normalizeStatsData()` is applied, data has moved from `corpora[id]` into `corpora[id][0]`
    const totalsByCorpus = mapValues(corpora, (data) => [data[0].sums.absolute, data[0].sums.relative] as AbsRelSeq)
    const corporaFreqs = mapValues(corpora, (data) => groupBy(data[0].rows, (item) => simplifyHitString(item)))

    dataset[0] = {
        id: "row_total",
        count: totalsByCorpus,
        total: [combined[0].sums.absolute, combined[0].sums.relative],
        rowId: 0,
    } satisfies TotalRow

    for (let i = 0; i < rowIds.length; i++) {
        const rowId = rowIds[i]
        /** Actual (pre grouping) values by attribute per token, used for creating sub CQPs. */
        const statsValues: Record<string, string[]>[] = []

        for (const row of groupedRows[rowId]) {
            // Walk through original values, e.g. "foo:12" and "foo:34"
            for (const [reduceVal, terms] of Object.entries(row.value)) {
                // Mostly array, but some structural attrs are single strings
                if (!Array.isArray(terms)) {
                    statsValues[0] ??= {}
                    statsValues[0][reduceVal] = [terms]
                } else {
                    // The array has one value per word in match
                    terms.forEach((term, idx) => {
                        statsValues[idx] ??= {}
                        statsValues[idx][reduceVal] ??= []
                        if (!statsValues[idx][reduceVal].includes(term)) {
                            statsValues[idx][reduceVal].push(term)
                        }
                    })
                }
            }
        }

        dataset[i + 1] = {
            rowId: i + 1,
            count: mapValues(corporaFreqs, (freqs) => sumByAbsRel(freqs[rowId])),
            total: sumByAbsRel(groupedRows[rowId]),
            formattedValue: {},
            statsValues,
        } satisfies SingleRow
    }

    dataset.sort((a, b) => b.total[0] - a.total[0])
    const ctx: Worker = self as any
    ctx.postMessage(dataset)
}

const sumByAbsRel = (rows: StatsRow[]): AbsRelSeq => [sumBy(rows, "absolute"), sumBy(rows, "relative")]
