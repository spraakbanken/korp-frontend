/** @format */
import map from "lodash/map"
import groupBy from "lodash/groupBy"
import sumBy from "lodash/sumBy"
import isArray from "lodash/isArray"
import keys from "lodash/keys"

import { RowsEntity } from "./interfaces/stats"
import { StatisticsWorkerMessage, StatsNormalized, StatsRow } from "./statistics.types"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

onmessage = function (e) {
    // Ignore messages sent by Webpack dev server.
    if (e.data.type != "korpStatistics") return

    const message: StatisticsWorkerMessage = e.data
    const data: StatsNormalized = message.data
    const { combined, corpora, count } = data
    const reduceVals = message.reduceVals
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

    // TODO: why first element of combined?
    const totalAbsoluteGroups = groupBy(combined[0].rows, (item) => simplifyHitString(item))

    const totalRow: TotalRow = {
        id: "row_total",
        total_value: [combined[0].sums.absolute, combined[0].sums.relative],
        rowId: 0,
    }

    const corporaKeys = keys(data.corpora)
    const corporaFreqs: Record<string, Record<string, StatsRow[]>> = {}
    for (const id of corporaKeys) {
        const obj = data.corpora[id]
        totalRow[`${id}_value`] = [obj[0].sums.absolute, obj[0].sums.relative]
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
            var variant = totalAbsoluteGroups[word][j]
            map(variant.value, function (terms, reduceVal) {
                if (!isArray(terms)) {
                    if (!statsValues[0]) {
                        statsValues[0] = {}
                    }
                    statsValues[0][reduceVal] = [terms]
                    reduceMap[reduceVal] = [terms]
                } else {
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
            total_value: [totalAbs, totalRel] as AbsRelSeq,
            formattedValue: {},
            statsValues,
        }

        map(corporaKeys, function (corpus) {
            const abs = sumBy(corporaFreqs[corpus][word], "absolute")
            const rel = sumBy(corporaFreqs[corpus][word], "relative")
            row[`${corpus}_value`] = [abs, rel]
        })

        for (const reduce of reduceVals) {
            // TODO Put these under a prop so they can be typed?
            // @ts-ignore
            row[reduce] = reduceMap[reduce]
        }

        dataset[i + 1] = row
    }

    dataset.sort(function (a, b) {
        return b.total_value[0] - a.total_value[0]
    })
    const ctx: Worker = self as any
    ctx.postMessage(dataset)
}

export type Row = TotalRow | SingleRow

export type TotalRow = RowBase & {
    id: "row_total"
}

export type SingleRow = RowBase & {
    formattedValue: Record<string, string>
    statsValues: Record<number, Record<string, string[]>>
}

export type RowBase = {
    rowId: number
    total_value: AbsRelSeq
    [name: `${string}_value`]: AbsRelSeq
}

export type Dataset = Row[]

export type AbsRelSeq = [number, number]
