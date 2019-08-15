/** @format */
/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/
import * as _ from "lodash"
import { StatsData, RowsEntity, Value } from "./interfaces/stats"

onmessage = function(e) {
    const data: StatsData = e.data.data
    console.log("data", e.data)

    const { combined, corpora, count } = data
    const reduceVals: string[] = e.data.reduceVals
    const groupStatistics: string[] = e.data.groupStatistics

    const simplifyValue = function(values: string[], field: string): string[] {
        if (groupStatistics.indexOf(field) != -1) {
            const newValues: string[] = []
            _.map(values, function(value) {
                newValues.push(value.replace(/(:.+?)($| )/g, "$2"))
            })
            return newValues
        } else {
            // for struct attributes only a value is sent, not list
            if (!_.isArray(values)) {
                values = [values]
            }
            return values
        }
    }

    const groupRowsByAttribute = function(groupData: { [id: string]: RowsEntity[] }) {
        const rowsByAttribute = {}
        _.map(groupData, function(rows, rowId) {
            const byAttribute = {}
            _.map(rows[0].value, function(values, field) {
                const newValues = simplifyValue(values, field)
                byAttribute[field] = newValues
            })
            rowsByAttribute[rowId] = byAttribute
        })
        return rowsByAttribute
    }

    var simplifyHitString = function(item: RowsEntity): string {
        var newFields: any[] = []
        _.map(item.value, function(values, field) {
            var newValues = simplifyValue(values, field)
            newFields.push(newValues.join(" "))
        })
        return newFields.join("/")
    }

    // TODO: why first element of combined?
    var totalAbsoluteGroups = _.groupBy(combined[0].rows, item => simplifyHitString(item))
    console.log("totalAbsoluteGroups", totalAbsoluteGroups, _.keys(totalAbsoluteGroups).length)
    // var totalRelativeGroups = _.groupBy(total.rows, (item) => simplifyHitString(item, "relative"));

    // this is for presentation and just needs to be done on a part of the result
    // that has data for all rows
    var rowsByAttribute = groupRowsByAttribute(totalAbsoluteGroups)

    var rowIds = _.keys(totalAbsoluteGroups)
    var rowCount = rowIds.length + 1
    var dataset = new Array(rowCount)
    // const dataset = new Array(count + 1)

    const totalRow = {
        id: "row_total",
        total_value: [combined[0].sums.absolute, combined[0].sums.relative],
        rowId: 0
    }

    const corporaKeys = _.keys(data.corpora)
    const corporaFreqs = {}
    for (const id of corporaKeys) {
        const obj = data.corpora[id]
        totalRow[id + "_value"] = [obj[0].sums.absolute, obj[0].sums.relative]

        corporaFreqs[id] = _.groupBy(obj[0].rows, simplifyHitString)
    }

    dataset[0] = totalRow

    function valueToString(value: Value): string {
        const sorted = _.orderBy(_.toPairs(value), ([head]) => head)
        return _.map(sorted, ([key, val]) => key + val.join(",")).join("-")
    }

    let reduceMap = {}

    for (var i = 0; i < rowCount - 1; i++) {
        let word = rowIds[i]
        let totalAbs = _.sumBy(totalAbsoluteGroups[word], "absolute")
        let totalRel = _.sumBy(totalAbsoluteGroups[word], "relative")
        const statsValues = []

        for (var j = 0; j < totalAbsoluteGroups[word].length; j++) {
            var variant = totalAbsoluteGroups[word][j]
            _.map(variant.value, function(terms, reduceVal) {
                if (!_.isArray(terms)) {
                    if (!statsValues[0]) {
                        statsValues[0] = {}
                    }
                    statsValues[0][reduceVal] = [terms]
                    reduceMap[reduceVal] = [terms]
                } else {
                    reduceMap[reduceVal] = terms
                    _.map(terms, function(term, idx) {
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
        // let corp_val = corpora.rows[i].value

        let row = {
            rowId: i + 1,
            total_value: [totalAbs, totalRel],
            formattedValue: {},
            statsValues
        }

        _.map(corporaKeys, function(corpus) {
            // var abs = valueGetter(corporaFreqs[corpus].absolute[word]);
            // var rel = valueGetter(corporaFreqs[corpus].relative[word]);
            let abs = _.sumBy(corporaFreqs[corpus][word], "absolute")
            let rel = _.sumBy(corporaFreqs[corpus][word], "relative")

            row[corpus + "_value"] = [abs, rel]
        })

        for (let reduce of reduceVals) {
            row[reduce] = reduceMap[reduce]
        }

        dataset[i + 1] = row
    }

    dataset.sort(function(a, b) {
        return b.total_value[0] - a.total_value[0]
    })
    const ctx: Worker = self as any
    ctx.postMessage(dataset)
}
