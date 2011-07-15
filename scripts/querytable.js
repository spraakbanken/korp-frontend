	

/* Returns an array of all the selected corpora's IDs in uppercase */
function getSelectedCorpora() {
	return corpusChooserInstance.corpusChooser("selectedItems");
}

function regescape(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"]/g, "\\$&");
}

function cqpRow(row) {
    var query = [];
    $(row).find(".query_token").each(function(){
        query.push(cqpToken(this));
    });
    return query.join(" ");
}



function mapSelectedCorpora(f) {
	return $.map(getSelectedCorpora(), function(item) {
		return f(settings.corpora[item]);
	});
}
// takes an array of mapping objs and returns their intersection
function mapping_intersection(mappingArray) {
	return $.reduce(mappingArray, function(a,b) {
		var output = {};
		$.each(a, function(key, value) {
			if(b[key] != null)
				output[key] = value;
		});
		return output;
	});
}

function mapping_union(mappingArray) {
	return $.reduce(mappingArray, function(a, b) {
		return $.extend({}, a, b);
	}) || {};
}

function getCurrentAttributes() {
	var attrs = mapSelectedCorpora(function(corpus) {
		return corpus.attributes;
	});
	
	return invalidateAttrs(attrs);
	
}
function getStructAttrs() {
	var attrs = mapSelectedCorpora(function(corpus) {
		$.each(corpus.struct_attributes, function(key, value) {
			value["isStructAttr"] = true; 
		});
		return corpus.struct_attributes;
	});
	
	return invalidateAttrs(attrs);
}

function invalidateAttrs(attrs) {
	var union = mapping_union(attrs);
	var intersection = mapping_intersection(attrs);
	$.each(union, function(key, value) {
		if(intersection[key] == null) {
			value["disabled"] = true;
		} else {
			delete value["disabled"];
		}
	});
	return union;
}
