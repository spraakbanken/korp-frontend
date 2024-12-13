/** @format */
import map from "lodash/map"
import groupBy from "lodash/groupBy"
import sumBy from "lodash/sumBy"
import isArray from "lodash/isArray"
import keys from "lodash/keys"

import { RowsEntity } from "./interfaces/stats"
import { StatsNormalized, StatsRow } from "./backend/types/count"
import { AbsRelSeq, Dataset, SingleRow, TotalRow, StatisticsWorkerMessage } from "./statistics.types"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

onmessage = function (e) {
    // Ignore messages sent by Webpack dev server.
    if (e.data.type != "korpStatistics") return

    const message: StatisticsWorkerMessage = e.data
    const data: StatsNormalized = message.data
    const { combined } = data
    const groupStatistics = message.groupStatistics

    const simplifyValue = function (values: string[] | string, field: string): string[] {
        if (groupStatistics.indexOf(field) != -1) {
            // TODO Can this pattern produce false positives? Will ":" not be used for something other than ranking or MWE indexing?
            return (values as string[]).map((value) => value.replace(/(:.+?)($| )/g, "$2"))
        } else {
            // for struct attributes only a value is sent, not list
            return isArray(values) ? values : [values]
        }
    }

    /**
     * This function creates a string representation of
     * the row, to group values by. Using "simplifyValue"
     * it removes suffixes `:<rank/numbering>` from
     * attributes that are in `group_statistics` in config.yml
     */
    const simplifyHitString = function (item: RowsEntity): string {
        var newFields: string[] = []
        map(item.value, function (values, field) {
            var newValues = simplifyValue(values, field)
            newFields.push(newValues.join(" "))
        })
        return newFields.join("/")
    }

    // Group data by simplified values, e.g. "foo:12" and "foo:34" under "foo"
    // TODO: why first element of combined?
    const totalAbsoluteGroups = groupBy(combined[0].rows, (item) => simplifyHitString(item))

    const totalRow: TotalRow = {
        id: "row_total",
        count: {},
        total: [combined[0].sums.absolute, combined[0].sums.relative],
        rowId: 0,
    }

    const corporaKeys = keys(data.corpora)
    const corporaFreqs: Record<string, Record<string, StatsRow[]>> = {}
    for (const id of corporaKeys) {
        const obj = data.corpora[id]
        totalRow.count[id] = [obj[0].sums.absolute, obj[0].sums.relative]
        corporaFreqs[id] = groupBy(obj[0].rows, (item) => simplifyHitString(item))
    }

    const rowIds = keys(totalAbsoluteGroups)
    const rowCount = rowIds.length + 1
    const dataset: Dataset = new Array(rowCount)

    dataset[0] = totalRow

    const reduceMap: Record<string, string[]> = {}

    for (let i = 0; i < rowCount - 1; i++) {
        let word = rowIds[i]
        let totalAbs = sumBy(totalAbsoluteGroups[word], "absolute")
        let totalRel = sumBy(totalAbsoluteGroups[word], "relative")
        const statsValues: Record<string, string[]>[] = []

        for (var j = 0; j < totalAbsoluteGroups[word].length; j++) {
            // Walk through original values, e.g. "foo:12" and "foo:34"
            const originalValues = totalAbsoluteGroups[word][j].value
            map(originalValues, function (terms, reduceVal) {
                // Array if positional attr, single string if structural attr
                if (!isArray(terms)) {
                    if (!statsValues[0]) {
                        statsValues[0] = {}
                    }
                    statsValues[0][reduceVal] = [terms]
                    reduceMap[reduceVal] = [terms]
                } else {
                    // The array has one value per word in match
                    reduceMap[reduceVal] = terms
                    map(terms, function (term, idx) {
                        statsValues[idx] ??= {}
                        statsValues[idx][reduceVal] ??= []
                        if (!statsValues[idx][reduceVal].includes(term)) {
                            statsValues[idx][reduceVal].push(term)
                        }
                    })
                }
            })
        }

        const row: SingleRow = {
            rowId: i + 1,
            count: {},
            total: [totalAbs, totalRel] as AbsRelSeq,
            formattedValue: {},
            statsValues,
        }

        map(corporaKeys, function (corpus) {
            const abs = sumBy(corporaFreqs[corpus][word], "absolute")
            const rel = sumBy(corporaFreqs[corpus][word], "relative")
            row.count[corpus] = [abs, rel]
        })

        dataset[i + 1] = row
    }

    dataset.sort(function (a, b) {
        return b.total[0] - a.total[0]
    })
    const ctx: Worker = self as any
    ctx.postMessage(dataset)
}
