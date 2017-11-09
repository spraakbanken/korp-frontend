/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

importScripts("../components/lodash/dist/lodash.js");

onmessage = function(e) {
    var data = e.data.data;
    var total = data.total;
    var reduceVals = e.data.reduceVals;
    var groupStatistics = e.data.groupStatistics;

    var simplifyHitString = function(item) {
        fields = item.split("/");
        newFields = [];
        ref = _.zip(reduceVals, fields);
        for(i = 0, len = ref.length; i < len; i++) {
            [reduceVal, field] = ref[i];
            if(groupStatistics.indexOf(reduceVal) != -1) {
                newFields.push(field.replace(/(:.+?)($| )/g, "$2"));
            } else {
                newFields.push(field);
            }
        }
        return newFields.join("/");
    };

    var groups = _.groupBy(_.keys(total.absolute), simplifyHitString);
    var rowIds = _.keys(groups)
    var rowCount = rowIds.length + 1
    var dataset = new Array(rowCount);

    var totalRow = {
        id: "row_total",
        total_value: [total.sums.absolute, total.sums.relative],
        rowId: 0
    }

    var corporaKeys = _.keys(data.corpora);
    _.map(corporaKeys, function(corpus) {
        var obj = data.corpora[corpus];
        totalRow[corpus + "_value"] = [obj.sums.absolute, obj.sums.relative]
    });

    dataset[0] = totalRow

    function valueGetter(obj, word) {
        var sum = 0;
        var wlen = groups[word].length;
        for(var i = 0; i < wlen; i++) {
            var wd = groups[word][i];
            sum += (obj[wd] || 0)
        }
        return sum;
    }

    for(var i = 0; i < rowCount - 1; i++) {
        var word = rowIds[i];
        var totalAbs = valueGetter(total.absolute, word)
        var totalRel = valueGetter(total.relative, word)

        //TODO: we need to know which attributes are structural and not
        statsValues = []
        for(var j = 0; j < groups[word].length; j++) {
            var variant = groups[word][j];
            _.map(_.zip(reduceVals, variant.split("/")), function(part) {
                var reduceVal = part[0];
                var terms = part[1];
                _.map(terms.split(" "), function(term, idx) {
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
            });
        }
        
        var row = {
            rowId: i + 1,
            total_value: [totalAbs, totalRel],
            statsValues: statsValues,
            formattedValue: {}
        }

        _.map(corporaKeys, function(corpus) {
            var obj = data.corpora[corpus];
            var abs = valueGetter(obj.absolute, word);
            var rel = valueGetter(obj.relative, word);
            row[corpus + "_value"] = [abs, rel];
        });

        var parts = word.split("/")
        for(var j = 0; j < reduceVals.length; j++) {
            row[reduceVals[j]] = parts[j].split(" ");
        }

        dataset[i+1] = row;
    }

    dataset.sort(function(a, b) { return b["total_value"][0] - a["total_value"][0] } );

    postMessage(dataset);
};
