/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

// require("lodash");
// let _ = window['lodash']
import * as _ from "lodash"

interface StatsData {
  combined: InnerData;
  count: number;
  corpora: Corpora;
  time: number;
}
interface InnerData {
  rows?: (RowsEntity)[] | null;
  sums: Sums;
}
interface RowsEntity {
  value: Value;
  relative: number;
  absolute: number;
}
interface Value {
  word?: (string)[] | null;
}
interface Sums {
  relative: number;
  absolute: number;
}
interface Corpora {
    [key: string]: InnerData;
  
}

onmessage = function(e) {
    var data : StatsData = e.data.data;
    console.log("data", e.data)

    let {combined, corpora, count} = data;
    var reduceVals : string[] = e.data.reduceVals;
    var groupStatistics : string[] = e.data.groupStatistics;

    var simplifyValue = function(values : string[], field : string) {
        if(groupStatistics.indexOf(field) != -1) {
            var newValues = []
            _.map(values, function(value) {
                newValues.push(value.replace(/(:.+?)($| )/g, "$2"));
            });
            return newValues;
        } else {
            // for struct attributes only a value is sent, not list
            if (!_.isArray(values)) {
                values = [values];
            }
            return values;
        }
    };

    var groupRowsByAttribute = function (groupData: { [id : string]: RowsEntity[]}) {
        var rowsByAttribute = {};
        _.map(groupData, function(rows, rowId) {
            var byAttribute = {};
            _.map(rows[0].value, function(values, field) {
                var newValues = simplifyValue(values, field);
                byAttribute[field] = newValues;
            });
            rowsByAttribute[rowId] = byAttribute;
        });
        return rowsByAttribute;
    };

    var simplifyHitString = function (item: RowsEntity, absOrRel : string) : string {
        var newFields : any[] = [];
        _.map(item.value, function(values, field) {
            var newValues = simplifyValue(values, field);
            newFields.push(newValues.join(" "));
        });
        return newFields.join("/");
    };

    // var totalAbsoluteGroups = _.groupBy(total.rows, (item) => simplifyHitString(item, "absolute"));
    // var totalRelativeGroups = _.groupBy(total.rows, (item) => simplifyHitString(item, "relative"));
    
    // this is for presentation and just needs to be done on a part of the result
    // that has data for all rows
    // var rowsByAttribute = groupRowsByAttribute(totalAbsoluteGroups);

    // var rowIds = _.keys(totalAbsoluteGroups);
    // var rowCount = rowIds.length + 1
    // var dataset = new Array(rowCount);
    var dataset = new Array(count + 1);

    var totalRow = {
        id: "row_total",
        total_value: [combined.sums.absolute, combined.sums.relative],
        rowId: 0
    }

    var corporaKeys = _.keys(data.corpora);
    var corporaFreqs = {};
    for(let id of corporaKeys) {
        var obj = data.corpora[id];
        totalRow[id + "_value"] = [obj.sums.absolute, obj.sums.relative]
        
        // corporaFreqs[id] = {}
        // corporaFreqs[id]["absolute"] = _.groupBy(obj.rows, (item) => simplifyHitString(item, "absolute"));
        // corporaFreqs[id]["relative"] = _.groupBy(obj.rows, (item) => simplifyHitString(item, "relative"));
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

    let i = 1
    for (let { absolute, relative, value } of combined.rows) {
        let statsValues = []
        for (let reduceVal in value) {
            let terms = value[reduceVal]
            
            if (!_.isArray(terms)) {
                if (!statsValues[0]) {
                    statsValues[0] = {};
                }
                statsValues[0][reduceVal] = [terms];
            } else {
                for(let idx in terms) {
                    let term = terms[idx]

                    if (!statsValues[idx]) {
                        statsValues[idx] = {}
                    }
                    if (!statsValues[idx][reduceVal]) {
                        statsValues[idx][reduceVal] = [];
                    }
                    if (statsValues[idx][reduceVal].indexOf(term) == -1) {
                        statsValues[idx][reduceVal].push(term);
                    }
                }
            }
            
        }
        // let corp_val = corpora.rows[i].value

        let row = {
            rowId: i,
            total_value: [absolute, relative],
            formattedValue: {},
            statsValues: statsValues,
        }
        for (let key of corporaKeys) {
            let corp_abs = corpora[key].rows[i - 1].absolute
            let corp_rel = corpora[key].rows[i - 1].relative
            row[key + "_value"] = [corp_abs, corp_rel]
        }
        for(let val of statsValues) { // is statsValues.length every > 1 ?
            row = {...row, ...val}
        }
        
        dataset[i] = row
        i++

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

    dataset.sort(function(a, b) { return b["total_value"][0] - a["total_value"][0] } );

    const ctx: Worker = self as any
    ctx.postMessage(dataset);
};
