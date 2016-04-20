var osmium = require('osmium');
var _ = require('lodash');
var c = console;



var file = new osmium.File("sweden-latest.osm.pbf", "pbf");
var reader = new osmium.Reader(file);


var handler = new osmium.Handler();
handler.options({ "tagged_nodes_only": true });
var output = [];
handler.on('node', function(node) {
    var name = node.tags("name");
    var place = node.tags("place");
    if(place && name) {
        c.log([name, node.lat, node.lon, place].join(";"))
        // output.push()
    }
});
// handler.on('relation', function(rel) {
//     console.log(_.keys(rel))
// });
osmium.apply(reader, handler);
// c.log(output.sort().join("\n"))