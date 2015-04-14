/*
    This is optimized code for transforming the statistics data.
    Speed/memory gains mostly come from using [absolute, relative] rather than {absolute: x, relative: y}
*/

onmessage = function(e) {

    var groups = e.data.groups;
    var total = e.data.total;
    var dataset = e.data.dataset;
    var allcorpora = e.data.corpora;
    var allrows = e.data.allrows;
    var len = allrows.length;
    var loc = e.data.loc

    var fmt = function(valTup) {
        if(typeof valTup[0] == "undefined" ) return ""
        return "<span>" +
                "<span class='relStat'>" + Number(valTup[1].toFixed(1)).toLocaleString(loc) + "</span> " + 
                "<span class='absStat'>(" + valTup[0].toLocaleString(loc) + ")</span> " +
          "<span>"

    }

    var totalRow = {
        id: "row_total",
        hit_value: "&Sigma;",
        total_value: [total.sums.absolute, total.sums.relative],
        total_display: fmt([total.sums.absolute, total.sums.relative])
    }
    
    for(corpus in allcorpora) {
        var obj = allcorpora[corpus]
        totalRow[corpus + "_value"] = [obj.sums.absolute, obj.sums.relative]
        totalRow[corpus + "_display"] = fmt([obj.sums.absolute, obj.sums.relative])
    }

    dataset[0] = totalRow
    if( groups ) { // WHEN AGGREGATED

        function valueGetter(obj, word) {
            var sum = 0;
            var wlen = groups[word].length;
            for(var i = 0; i < wlen; i++) {
                var wd = groups[word][i];
                sum += (obj[wd] || 0)
            }
            return sum;
        }

        for(var i = 0; i < len; i++) {
            var word = allrows[i];
            var abs = valueGetter(total.absolute, word)
            var rel = valueGetter(total.relative, word)
            var row = {
                "id": "row" + i,
                "hit_value": groups[word],
                "total_value": [abs, rel],
                "total_display" : fmt([abs, rel])
            }
            for(corpus in allcorpora) {
                if(allcorpora.hasOwnProperty(corpus)) {
                    var obj = allcorpora[corpus];
                    var abs = valueGetter(obj.absolute, word)
                    var rel = valueGetter(obj.relative, word)
                    
                    row[corpus + "_value"] = [abs, rel]
                    row[corpus + "_display"] = fmt([abs,rel])
                }
            }
            dataset[i+1] = row;
        }

    } else { // WHEN NORMAL

        for(var i = 0; i < len; i++) {
            var word = allrows[i];
            var row = {
                "id": "row" + i,
                "hit_value": word,
                "total_value": [total.absolute[word], total.relative[word]],
                "total_display": fmt([total.absolute[word], total.relative[word]])
            }
            for(var corpus in allcorpora) {
                if(allcorpora.hasOwnProperty(corpus)) {
                    var obj = allcorpora[corpus];
                    row[corpus + "_value"] = [obj.absolute[word], obj.relative[word]];
                    row[corpus + "_display"] = fmt([obj.absolute[word], obj.relative[word]]);
                }
            }
            dataset[i+1] = row;
        }

    }

    dataset.sort(function(a, b) { return b["total_value"][0] - a["total_value"][0] } );

    postMessage(dataset);
};