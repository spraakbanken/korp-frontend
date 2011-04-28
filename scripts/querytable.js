	
function didSelectCorpus() {
    var corpus = settings.corpora[getCorpus()];

    var selects = $(".select_language");
    selects.children().remove();
    var nr_langs = 0;
    
    $.each(corpus.languages, function(lang) {
    	selects.append(new Option(corpus.languages[lang], lang));
    	nr_langs++;
    });
    selects.attr("disabled", nr_langs <= 1);

}

function getCorpus() {
	//return $("#tabs-container").children("div:visible").find("select").val();
	
	/* DEN HÄR FUNKTIONEN BÖR TAS BORT OCH ERSÄTTAS HELT MED getSelectedCorpora, MEN
	   DEN ANROPAS PÅ FLERA STÄLLEN AV KOD SOM ÄR TÄNKT ATT HANTERA PARALLELLKORPUSAR
	   FÖR TILLFÄLLET RETURNERAS DEN FÖRSTA KORPUSEN FRÅN getSelectedCorpora */
	   
	return getSelectedCorpora()[0];
}



/* Returns an array of all the selected corpora's IDs in uppercase */
function getSelectedCorpora() {
	var selectedOnes = corpusChooserInstance.corpusChooser("selectedItems");
	return selectedOnes;
}

/* function getAllCorpora(){
	var res = [];
	$.each(settings.corpora, function(key,val){
		if(key != 'all')
			res.push(key.toUpperCase());
	});
	return res;
} */


function resetQuery() {
    clearQuery();
//    insertRowButtons();
    didSelectCorpus();
    insertRow();
    //toggleFullQuery();
}

function clearQuery() {
    $("#query_table").children().remove();
    $("#buttons_row").children().remove();
}

function toggleFullQuery() {
    /*
	var full_query = $("#full_query").is(":checked");
    $("#cqp_string").attr("disabled", !full_query);
    $("#corpus_id").attr("disabled", !full_query);
    $("#simple_query").toggle(!full_query);
    */
}

function mkInsertButton() {
    return $('<img src="img/plus.png"/>')
        .addClass("image_button");
}

function mkRemoveButton() {
    return $('<img src="img/minus.png">')
        .addClass("image_button");
}

//function insertRowButtons() {
//    $("#buttons_row").append(
//        mkRemoveButton().addClass("remove_row")
//            .click(function(){removeRow();})
//    ).append(
//        mkInsertButton().addClass("insert_row")
//            .click(function(){insertRow();})
//    );
//}

function insertRow() {
    var row = $('<div/>').addClass("query_row")
    .appendTo($("#query_table"));

    var remove_row_button = mkRemoveButton().addClass("remove_row")
    .click(function(){
    	removeRow(this);
	});

    var insert_token_button = mkInsertButton().addClass("insert_token")
    .click(function(){
    	insertToken(this);
	});
    
    var operators = row.siblings().length ? settings.operators : settings.first_operators;
    var select_operation = $('<select/>').addClass("select_operation")
    .change(function(){
    	didSelectOperation(this);
	});
	$.each(operators, function(oper) {
		select_operation.append(new Option(operators[oper], oper));
	});
    select_operation.attr("disabled", select_operation.children().length <= 1);

    var select_language = $('<select/>').addClass("select_language")
    .change(function(){
    	didSelectLanguage(this);
	});
    var languages = settings.corpora[getCorpus()].languages;
    $.each(languages, function(lang) {
    	select_language.append(new Option(languages[lang], lang));
    }); 
    select_language.attr("disabled", select_language.children().length <= 1);

    row.append(remove_row_button, select_operation, select_language, insert_token_button);
    
    
    insert_token_button.click();
    select_operation.change();
//    TODO: hidden for now.
    select_operation.hide();
    select_language.hide();
    didToggleRow();
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



function makeSelect() {
	var arg_select = $("<select/>").addClass("arg_type")
    .change(extendedSearch.didSelectArgtype);

	var groups = $.extend({}, settings.arg_groups, {
		"word attributes" : getCurrentAttributes(),
		"sentence attributes" : getStructAttrs()
		});
	
	$.each(groups, function(lbl, group) {
		if($.isEmptyObject(group)) {
			return;
		}
		var optgroup = $("<optgroup/>", {label: lbl}).appendTo(arg_select);
		$.each(group, function(key, val) {
			if(val.displayType == "hidden")
				return;
			var labelKey = val.label || val;
			
			$('<option/>',{rel : $.format("localize[%s]", labelKey)})
			.val(key).text(util.getLocaleString(labelKey) || "")
			.appendTo(optgroup)
			.data("dataProvider", val);
		});
		
	});
	
	return arg_select;
}

function refreshSelects() {
	$(".arg_type").each(function() {
		var i = $(this).find(":selected").index();
		var before = $(this).find(":selected").val();
		var newSelect = makeSelect();
		newSelect.get(0).selectedIndex = i;
		$(this).replaceWith(newSelect);
		if(before != newSelect.val()) {
			newSelect.get(0).selectedIndex = 0;
			newSelect.trigger("change");
		}
	});
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

function didSelectLanguage(select) {
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
    var query = {token: [], min: "", max: ""};

    var args = {};
    $(token).find(".query_arg").each(function(){
        var type = $(this).find(".arg_type").val();
        var data = $(this).find(".arg_type :selected").data("dataProvider");
        var value = $(this).find(".arg_value").val();
        if (!args[type]) { 
        	args[type] = []; 
    	}
        args[type].push({data : data, value : value});
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

function getCurrentAttributes() {
	return mapping_intersection(mapSelectedCorpora(function(corpus) {
		return corpus.attributes;
	}));
}
function getStructAttrs() {
	return mapping_intersection(mapSelectedCorpora(function(corpus) {
		$.each(corpus.struct_attributes, function(key, value) {
			value["isStructAttr"] = true; 
		});
		return corpus.struct_attributes;
	}));
}
