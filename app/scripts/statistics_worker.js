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
            var row = {
                "id": "row" + i,
                "hit_value": groups[word],
                "total_value": [
                    valueGetter(total.absolute, word),
                    valueGetter(total.relative, word) 
                ]
            }
            for(corpus in allcorpora) {
                if(allcorpora.hasOwnProperty(corpus)) {
                    var obj = allcorpora[corpus];
                    row[corpus + "_value"] = [
                        valueGetter(obj.absolute, word),
                        valueGetter(obj.relative, word)
                    ]
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
                "total_value": [total.absolute[word], total.relative[word]]
            }
            for(var corpus in allcorpora) {
                if(allcorpora.hasOwnProperty(corpus)) {
                    var obj = allcorpora[corpus];
                    row[corpus + "_value"] = [obj.absolute[word], obj.relative[word]];
                }
            }
            dataset[i+1] = row;
        }

    }

    dataset.sort(function(a, b) { return b["total_value"][0] - a["total_value"][0] } );

    postMessage(dataset);
};