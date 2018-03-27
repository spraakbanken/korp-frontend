/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

require("lodash");

onmessage = function(e) {
    var data = e.data.data;
    var total = data.total;
    var reduceVals = e.data.reduceVals;
    var groupStatistics = e.data.groupStatistics;

    var simplifyValue = function(values, field) {
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

    var groupRowsByAttribute = function(groupData) {
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

    var simplifyHitString = function(item) {
        var newFields = [];
        _.map(item.value, function(values, field) {
            var newValues = simplifyValue(values, field);
            newFields.push(newValues.join(" "));
        });
        return newFields.join("/");
    };

    var totalAbsoluteGroups = _.groupBy(total.absolute, simplifyHitString);
    var totalRelativeGroups = _.groupBy(total.relative, simplifyHitString);
    
    // this is for presentation and just needs to be done on a part of the result
    // that has data for all rows
    var rowsByAttribute = groupRowsByAttribute(totalAbsoluteGroups);

    var rowIds = _.keys(totalAbsoluteGroups);
    var rowCount = rowIds.length + 1
    var dataset = new Array(rowCount);

    var totalRow = {
        id: "row_total",
        total_value: [total.sums.absolute, total.sums.relative],
        rowId: 0
    }

    var corporaKeys = _.keys(data.corpora);
    var corporaFreqs = {};
    _.map(corporaKeys, function(corpus) {
        var obj = data.corpora[corpus];
        totalRow[corpus + "_value"] = [obj.sums.absolute, obj.sums.relative]
        
        corporaFreqs[corpus] = {}
        corporaFreqs[corpus]["absolute"] = _.groupBy(obj.absolute, simplifyHitString);
        corporaFreqs[corpus]["relative"] = _.groupBy(obj.relative, simplifyHitString);
    });

    dataset[0] = totalRow

    function valueGetter(obj) {
        var sum = 0;
        if(obj) {
          for(var i = 0; i < obj.length; i++) {
              sum += obj[i].freq
          }
        }
        return sum;
    }

    for(var i = 0; i < rowCount - 1; i++) {
        var word = rowIds[i];
        var totalAbs = valueGetter(totalAbsoluteGroups[word]);
        var totalRel = valueGetter(totalRelativeGroups[word]);
        statsValues = []
        for(var j = 0; j < totalAbsoluteGroups[word].length; j++) {
            var variant = totalAbsoluteGroups[word][j];
            _.map(variant.value, function(terms, reduceVal) {
                if(!_.isArray(terms)) {
                    if(!statsValues[0]) {
                        statsValues[0] = {};
                    }
                    statsValues[0][reduceVal] = [terms];
                } else {
                    _.map(terms, function(term, idx) {
                        if(!statsValues[idx]) {
                            statsValues[idx] = {}
                        }
                        if(!statsValues[idx][reduceVal]) {
                            statsValues[idx][reduceVal] = [];
                        }
                        if(statsValues[idx][reduceVal].indexOf(term) == -1) {
                            statsValues[idx][reduceVal].push(term);
                        }
                    });
                }
            });
        }
        
        var row = {
            rowId: i + 1,
            total_value: [totalAbs, totalRel],
            statsValues: statsValues,
            formattedValue: {}
        }

        _.map(corporaKeys, function(corpus) {
            var abs = valueGetter(corporaFreqs[corpus].absolute[word]);
            var rel = valueGetter(corporaFreqs[corpus].relative[word]);

            row[corpus + "_value"] = [abs, rel];
        });

        for(var j = 0; j < reduceVals.length; j++) {
            row[reduceVals[j]] = rowsByAttribute[word][reduceVals[j]]
        }

        dataset[i+1] = row;
    }

    dataset.sort(function(a, b) { return b["total_value"][0] - a["total_value"][0] } );

    postMessage(dataset);
};
