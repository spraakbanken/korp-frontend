	

/* Returns an array of all the selected corpora's IDs in uppercase */
function getSelectedCorpora() {
	var selectedOnes = corpusChooserInstance.corpusChooser("selectedItems");
	return selectedOnes;
}

function mkInsertButton() {
    return $('<img src="img/plus.png"/>')
        .addClass("image_button");
}

function mkRemoveButton() {
    return $('<img src="img/minus.png">')
        .addClass("image_button");
}

function removeRow(ref) {
    if (ref) {
        $(ref).closest(".query_row").remove();
    } else {
        $(".query_row").last().remove();
    }
    didToggleRow();
}

function insertToken(button) {
    var token = $("<table><tbody/></table>")
        .addClass("query_token")
        .attr({cellPadding: 0, cellSpacing: 0})
        .insertBefore($(button));
    extendedSearch.insertArg(token);
    didToggleToken(button);
}

function removeArg(arg) {
    arg = $(arg).closest(".query_arg");
    var row = arg.closest(".query_row");
    if (arg.siblings().length >= 1) {
        arg.remove();
    } else {
        arg.closest(".query_token").remove();
    }
    didToggleToken(row);
}

function didToggleRow() {
    var visibility = $(".query_row").length > 1 ? "visible" : "hidden";
    $(".remove_row").first().hide();
    $("#buttons_row").find(".remove_row").last().css("visibility", visibility);
    advancedSearch.updateCQP();
}

function didToggleToken(row) {
    var args = $(row).closest(".query_row").find(".query_arg");
    var visibility = args.length > 1 ? "visible" : "hidden";
//    args.first().find(".remove_arg").css("visibility", visibility);
    advancedSearch.updateCQP();
}

function didSelectOperation(select) {
    var is_include = $(select).val() == "include";
    $(select).closest(".query_row")
        .toggleClass("indent", is_include);
//        .toggleClass("line_above", ! is_include);
    $(select).siblings(".select_language").toggle(! is_include);
    advancedSearch.updateCQP();
}


function didChangeArgvalue(input) {
    advancedSearch.updateCQP();
}


//////////////////////////////////////////////////////////////////////

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

function cqpToken(token) {
	$.log("cqpToken");
    var query = {token: [], min: "", max: ""};

    var args = {};
    $(token).find(".query_arg").each(function(){
        var type = $(this).find(".arg_type").val();
        var data = $(this).find(".arg_type :selected").data("dataProvider");
        var value = $(this).find(".arg_value").val();
        if(type == "word" && value == "") {
        	$(this).find(".arg_value").attr("placeholder", util.getLocaleString("any"));
        	return "[]";
        }
        
        if(data.displayType == "autocomplete") {
        	value = null;
        }
//        $(this).find(".arg_value").attr("placeholder", "");
        if (!args[type]) { 
        	args[type] = []; 
    	}
        $.log("arg_value data", $(this).find(".arg_value").data("value"), data.displayType);
        args[type].push({data : data, value : value || $(this).find(".arg_value").data("value") || ""});
        $.log("arg obj", data, value);
    });
    
    $.each(args, function(type, valueArray) {
    	var inner_query = [];
    	
    	if(settings.outer_args[type] != null) {
    		settings.outer_args[type](query, $.map(args[type], function(item) {
            	return item.value;
            }));
    		return;
    	} 
    	$.each(valueArray, function(i, obj) {
    		function defaultArgsFunc(s) {
    			var operator = obj.data.type == "set" ? "contains" : "=";
    			var prefix = obj.data.isStructAttr != null ? "_." : "";
    			
    			return $.format('%s%s %s "%s"', [prefix, type, operator, regescape(s)]);
    		};
    		var argFunc = settings.inner_args[type] ||  defaultArgsFunc; 
    		inner_query.push(argFunc(obj.value));
    	});
    	if (inner_query.length) {
    		query.token.push("(" + inner_query.join(" | ") + ")");
    	}
    	
    });

    var query_string = "[" + query.token.join(" & ") + "]";
    if (query.min | query.max) {
        query_string += "{" + (query.min || 0) + "," + query.max + "}";
    }
    return query_string;
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
