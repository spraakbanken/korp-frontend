/** @format */
import map from "lodash/map"
import groupBy from "lodash/groupBy"
import sumBy from "lodash/sumBy"
import isArray from "lodash/isArray"
import keys from "lodash/keys"

import { StatsData, RowsEntity, Value } from "./interfaces/stats"

/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

onmessage = function (e) {
    const data: StatsData = e.data.data

    const { combined, corpora, count } = data
    const reduceVals: string[] = e.data.reduceVals
    const groupStatistics: string[] = e.data.groupStatistics

    const simplifyValue = function (values: string[], field: string): string[] {
        if (groupStatistics.indexOf(field) != -1) {
            const newValues: string[] = []
            map(values, function (value) {
                newValues.push(value.replace(/(:.+?)($| )/g, "$2"))
            })
            return newValues
        } else {
            // for struct attributes only a value is sent, not list
            if (!isArray(values)) {
                values = [values]
            }
            return values
        }
    }

    const simplifyHitString = function (item: RowsEntity): string {
        var newFields: any[] = []
        map(item.value, function (values, field) {
            var newValues = simplifyValue(values, field)
            newFields.push(newValues.join(" "))
        })
        return newFields.join("/")
    }

    // TODO: why first element of combined?
    const totalAbsoluteGroups = groupBy(combined[0].rows, (item) => simplifyHitString(item))

    const totalRow = {
        id: "row_total",
        total_value: [combined[0].sums.absolute, combined[0].sums.relative],
        rowId: 0,
    }

    const corporaKeys = keys(data.corpora)
    const corporaFreqs = {}
    for (const id of corporaKeys) {
        const obj = data.corpora[id]
        totalRow[id + "_value"] = [obj[0].sums.absolute, obj[0].sums.relative]

        corporaFreqs[id] = groupBy(obj[0].rows, simplifyHitString)
    }

    const rowIds = keys(totalAbsoluteGroups)
    const rowCount = rowIds.length + 1
    const dataset = new Array(rowCount)

    dataset[0] = totalRow

    const reduceMap = {}

    for (let i = 0; i < rowCount - 1; i++) {
        let word = rowIds[i]
        let totalAbs = sumBy(totalAbsoluteGroups[word], "absolute")
        let totalRel = sumBy(totalAbsoluteGroups[word], "relative")
        const statsValues = []

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
                        if (!statsValues[idx]) {
                            statsValues[idx] = {}
                        }
                        if (!statsValues[idx][reduceVal]) {
                            statsValues[idx][reduceVal] = []
                        }
                        if (statsValues[idx][reduceVal].indexOf(term) == -1) {
                            statsValues[idx][reduceVal].push(term)
                        }
                    })
                }
            })
        }

        let row = {
            rowId: i + 1,
            total_value: [totalAbs, totalRel],
            formattedValue: {},
            statsValues,
        }

        map(corporaKeys, function (corpus) {
            let abs = sumBy(corporaFreqs[corpus][word], "absolute")
            let rel = sumBy(corporaFreqs[corpus][word], "relative")

            row[corpus + "_value"] = [abs, rel]
        })

        for (let reduce of reduceVals) {
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
