/** @format */
/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

// require("lodash");
// let _ = window['lodash']
import * as _ from "lodash"

interface StatsData {
    combined: InnerData
    count: number
    corpora: Corpora
    time: number
}
interface InnerData {
    rows?: RowsEntity[] | null
    sums: Sums
}
interface RowsEntity {
    value: Value
    relative: number
    absolute: number
}
interface Value {
    word?: string[] | null
}
interface Sums {
    relative: number
    absolute: number
}
interface Corpora {
    [key: string]: InnerData
}

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

    var totalAbsoluteGroups = _.groupBy(combined.rows, item => simplifyHitString(item))
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
        total_value: [combined.sums.absolute, combined.sums.relative],
        rowId: 0
    }

    const corporaKeys = _.keys(data.corpora)
    const corporaFreqs = {}
    for (const id of corporaKeys) {
        const obj = data.corpora[id]
        totalRow[id + "_value"] = [obj.sums.absolute, obj.sums.relative]

        corporaFreqs[id] = _.groupBy(obj.rows, simplifyHitString)
    }

    dataset[0] = totalRow

    // function valueGetter(obj) {
    //     var sum = 0;
    //     if(obj) {
    //       for(var i = 0; i < obj.length; i++) {
    //           sum += obj[i].freq
    //       }
    //     }
    //     return sum;
    // }

    function valueToString(value: Value): string {
        const sorted = _.orderBy(_.toPairs(value), ([head]) => head)
        return _.map(sorted, ([key, val]) => key + val.join(",")).join("-")
    }

    let reduceMap = {}

    // for (const { absolute, relative, value } of combined.rows) {
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

        // for (const key of corporaKeys) {
        //   let corp_abs = 0
        //   let corp_rel = 0

        //   for (const corpRow of corpora[key].rows) {
        //     if (valueToString(value) == valueToString(corpRow.value)) {
        //       corp_abs = corpRow.absolute
        //       corp_rel = corpRow.relative
        //       break
        //     }
        //   }

        // console.log("corpora", corpora, key, corpora[key].rows.length, i)
        // const corp_abs = corpora[key].rows[i - 1].absolute
        // const corp_rel = corpora[key].rows[i - 1].relative
        // let valGroups = _.groupBy(corpora[key].rows, ({value}) => simplifyValue(value).join(" "))

        // console.log("valGroups", valGroups, value)
        // simplifyHitString(corpora[key].rows)
        // valGroups[]
        //   row[key + "_value"] = [corp_abs, corp_rel]
        // }

        for (let reduce of reduceVals) {
            row[reduce] = reduceMap[reduce]
        }

        dataset[i + 1] = row

        // var word = rowIds[i];
        // var totalAbs = valueGetter(totalAbsoluteGroups[word]);
        // var totalRel = valueGetter(totalRelativeGroups[word]);
        // let statsValues = []
        // for(var j = 0; j < totalAbsoluteGroups[word].length; j++) {
        //     var variant = totalAbsoluteGroups[word][j];
        //     _.map(variant.value, function(terms, reduceVal) {
        //         if(!_.isArray(terms)) {
        //             if(!statsValues[0]) {
        //                 statsValues[0] = {};
        //             }
        //             statsValues[0][reduceVal] = [terms];
        //         } else {
        //             _.map(terms, function(term, idx) {
        //                 if(!statsValues[idx]) {
        //                     statsValues[idx] = {}
        //                 }
        //                 if(!statsValues[idx][reduceVal]) {
        //                     statsValues[idx][reduceVal] = [];
        //                 }
        //                 if(statsValues[idx][reduceVal].indexOf(term) == -1) {
        //                     statsValues[idx][reduceVal].push(term);
        //                 }
        //             });
        //         }
        //     });
        // }

        // var row = {
        //     rowId: i + 1,
        //     total_value: [totalAbs, totalRel],
        //     statsValues: statsValues,
        //     formattedValue: {}
        // }

        // _.map(corporaKeys, function(corpus) {
        //     var abs = valueGetter(corporaFreqs[corpus].absolute[word]);
        //     var rel = valueGetter(corporaFreqs[corpus].relative[word]);

        //     row[corpus + "_value"] = [abs, rel];
        // });

        // for(var j = 0; j < reduceVals.length; j++) {
        //     row[reduceVals[j]] = rowsByAttribute[word][reduceVals[j]]
        // }

        // dataset[i+1] = row;
    }

    dataset.sort(function(a, b) {
        return b.total_value[0] - a.total_value[0]
    })
    console.log("dataset", dataset)

    const ctx: Worker = self as any
    ctx.postMessage(dataset)
}
