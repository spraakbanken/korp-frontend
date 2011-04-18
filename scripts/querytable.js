	
function didSelectCorpus() {
    var corpus = settings.corpora[getCorpus()];

    var selects = $(".select_language");
    selects.children().remove();
    var nr_langs = 0;
    
    for (var lang in corpus.languages) {
        selects.append(new Option(corpus.languages[lang], lang));
        nr_langs++;
    }
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
        .click(function(){removeRow(this)});

    var insert_token_button = mkInsertButton().addClass("insert_token")
        .click(function(){insertToken(this)});
    
    var operators = row.siblings().length ? settings.operators : settings.first_operators;
    var select_operation = $('<select/>').addClass("select_operation")
        .change(function(){didSelectOperation(this)});
    for (oper in operators) {
        select_operation.append(new Option(operators[oper], oper));
    }
    select_operation.attr("disabled", select_operation.children().length <= 1);

    var select_language = $('<select/>').addClass("select_language")
        .change(function(){didSelectLanguage(this)});
    var languages = settings.corpora[getCorpus()].languages;
    for (var lang in languages) {
        select_language.append(new Option(languages[lang], lang));
    }
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
    insertArg(token);
    didToggleToken(button);
}

function insertArg(token) {
	$.log("insertArg");
	
    var token = $(token).closest(".query_token").children("tbody");
    var row = $("<tr/>").addClass("query_arg").appendTo(token);
    
    var arg_select = makeSelect();
    
    var arg_value = $("<input type='text'/>").addClass("arg_value")
    .change(function(){didChangeArgvalue();})
//    TODO: might want this.
//    .attr("placeholder", $.format("[%s]", util.getLocaleString("any")));
    
    var remove = mkRemoveButton().addClass("remove_arg")
        .click(function(){
        	if(row.is(":last-child"))
        		row.prev().find(".insert_arg").show();
        	removeArg(this);
    	});

    var insert = mkInsertButton().addClass("insert_arg")
    .click(function() {
    	insertArg(this);
    	$(this).hide();
    });
    
    var closeBtn = $("<span />", {"class" : "ui-icon ui-icon-circle-close btn-icon"})
    .click(function() {
    	$(this).closest("table").remove();
    	updateCQP();
    	
    	if($(".query_token").length == 1) {
    		$(".query_token .btn-icon:first").css("visibility", "hidden");
    	} else {
    		$(".query_token .btn-icon:first").css("visibility", "visible");
    	}
    });
    
    
    var leftCol = $("<div />").append(remove).css("display", "inline-block").css("vertical-align", "top");
    var rightCol = $("<div />").append(arg_select, arg_value)
    .css("display", "inline-block")
    .css("margin-left", 5);
    
    if($.browser.msie && $.browser.version.slice(0, 1) == "7") { // IE7 :(
    	// let's patch it up! (maybe I shouldn't have used inline-block)
    	leftCol.add(rightCol).css("display", "inline");
    	rightCol.find("input").css("float", "right");
    	closeBtn.css("right", "-235").css("top", "-55");
    }
    
    var wrapper = $("<div />").append($("<span rel='localize[and]'>and</span>"), insert);
    
    row.append(
        $("<td/>").append(leftCol, rightCol, closeBtn, wrapper)
    );
    
    if(row.is(":first-child")) {
    	remove.css("visibility", "hidden");
    }
    
	$.log("isFirstRow", row.is(":first-child"))
	if(!row.is(":first-child") ) {
		closeBtn.css("visibility", "hidden");
	}
	
	if($(".query_token").length == 1) {
		closeBtn.css("visibility", "hidden");
	}
	else {
		$(".query_token .btn-icon:first").css("visibility", "visible");
	}
    
    didToggleToken(row);
}

function makeSelect() {
	var arg_select = $("<select/>").addClass("arg_type")
    .change(didSelectArgtype);

	var groups = $.extend({}, settings.arg_groups, {
		"word attributes" : getCurrentAttributes(),
		"sentence attributes" : getStructAttrs()
		});
	
	for (var lbl in groups) {
	    var group = groups[lbl];
	    if($.isEmptyObject(group)) {
	    	continue;
	    }
	    var optgroup = $("<optgroup/>", {label: lbl}).appendTo(arg_select);
	    for (var val in group) {
	    	if(group[val].displayType == "hidden")
	    		continue;
	    	var labelKey = group[val].label || group[val];
	    	
	    	$('<option/>',{rel : $.format("localize[%s]", labelKey)})
	    	.val(val).text(util.getLocaleString(labelKey) || "")
	    	.appendTo(optgroup)
	    	.data("dataProvider", group[val]);
	    	
	    }
	}
	
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


//////////////////////////////////////////////////////////////////////
/*
function setSelectWidth(select) {
	//abort if browser is ie7 or older
	if($.browser.msie && parseInt($.browser.version, 10) <= 7){return 0;}
	var text = $(select).find(":selected").text();
    var dummy_select = $("<select/>", {position: "absolute", display: "none"})
        .appendTo("body")
        .append(new Option(text));
    $(select).width((dummy_select.width() + 10) *1.8);
    dummy_select.remove();
	
}
*/

function didToggleRow() {
    var visibility = $(".query_row").length > 1 ? "visible" : "hidden";
    $(".remove_row").first().hide();
    $("#buttons_row").find(".remove_row").last().css("visibility", visibility);
    updateCQP();
}

function didToggleToken(row) {
    var args = $(row).closest(".query_row").find(".query_arg");
    var visibility = args.length > 1 ? "visible" : "hidden";
//    args.first().find(".remove_arg").css("visibility", visibility);
    updateCQP();
}

function didSelectOperation(select) {
    var is_include = $(select).val() == "include";
    $(select).closest(".query_row")
        .toggleClass("indent", is_include);
//        .toggleClass("line_above", ! is_include);
    $(select).siblings(".select_language").toggle(! is_include);
    updateCQP();
}

function didSelectLanguage(select) {
    updateCQP();
}

function didSelectArgtype() {
	// change input widget
	var oldVal = $(this).siblings(".arg_value:input[type=text]").val() || "";
	$(this).siblings(".arg_value").remove();
	
	
	var data = $(this).find(":selected").data("dataProvider");
	var arg_value;
	switch(data.displayType) {
	case "select":
		arg_value = $("<select />");
		$.each(data.dataset, function(key, value) {
			$("<option />", {val : key, rel : $.format("localize[%s]", value)}).text(util.getLocaleString(value)).appendTo(arg_value);
		});
		break;
	case "autocomplete":
		break;
	case "date":
		break;
	default:
		arg_value = $("<input type='text'/>");
		break;
	} 
	
	arg_value.addClass("arg_value")
    .change(didChangeArgvalue);
	$(this).after(arg_value);
	arg_value.val(oldVal);
	
    updateCQP();
}

function didChangeArgvalue(input) {
    updateCQP();
}


//////////////////////////////////////////////////////////////////////

function regescape(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"]/g, "\\$&");
}

function updateCQP() {
	
    var query = "";
    var nr_lines = 2;
    var main_corpus_lang = "";
    $(".query_row").each(function(){
        var language = $(this).find(".select_language").val();
        var corpus_lang = language.toUpperCase();
        switch ($(this).find(".select_operation").val()) {
        case "find":
            main_corpus_lang = corpus_lang;
            break;
        case "include":
            query += "  |  ";
            break;
        case "intersect":
            query += "\n :" + corpus_lang + " ";
            nr_lines++;
            break;
        case "exclude":
            query += "\n :" + corpus_lang + " ! ";
            nr_lines++;
            break;
        }
        query += cqpRow(this);
    });
    $.log("updateCQP", query, nr_lines, main_corpus_lang,$("#cqp_string"));
    $("#cqp_string").val(query).attr("rows", nr_lines);
    $("#corpus_id").val(main_corpus_lang);
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
