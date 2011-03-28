
/*function submitForm() {
    var corpus = getCorpus();
	
    var cqp = $("#cqp_string").val();
    cqp = cqp.replace(/\n/g, " ");
    $("#corpus").val(corpus);
    $("#cqp").val(cqp);

    var languages = settings.corpora[getCorpus()].languages;
    for (var lng in languages) {
        if (cqp.indexOf(":" + lng + " ") >= 0) {
            $("#automatic_attributes").append(
                $("<input type='hidden' name='show'/>").val(lng.toLowerCase())
            );
        }
    }
} */

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


function loadCorporaFolderRecursive(first_level, folder) {
	var outHTML;
	if (first_level) 
		outHTML = '<ul>';
	else {
		if(!folder["contents"] || folder["contents"].length == 0) {
			return "";
		}
		outHTML = '<ul title="' + folder.title + '">';
	}
	if(folder) { //This check makes the code work even if there isn't a ___settings.corporafolders = {};___ in config.js
		// Folders
		for (var fol in folder) {
			if (fol != "contents" && fol != "title")
				outHTML += '<li>' + loadCorporaFolderRecursive(false, folder[fol]) + "</li>";
		}
		// Corpora
		if (folder["contents"] && folder["contents"].length > 0) {
			for (var corpid in folder["contents"]) {
				outHTML += '<li id="' + folder.contents[corpid] + '">' + settings.corpora[folder.contents[corpid]]["title"] + '</li>';
				added_corpora_ids.push(folder.contents[corpid]);
			}
		}
	}
	
	if(first_level) {
		// Add all corpora which have not been added to a corpus
		searchloop: for (var val in settings.corpora) {
			for (var usedid in added_corpora_ids) {
				if (added_corpora_ids[usedid] == val) {
					continue searchloop;
				}
			}
			// Add it anyway:
			outHTML += '<li id="' + val + '">' + settings.corpora[val].title + '</li>';
		}
	}
	
	outHTML += "</ul>";
	return outHTML;
}

/* Goes through the settings.corporafolders and recursively adds the settings.corpora hierarchically to the corpus chooser widget */
function loadCorpora() {
	added_corpora_ids = [];
	outStr = loadCorporaFolderRecursive(true, settings.corporafolders);
	/*var outStr;
	outStr = "<ul>";
	for (var val in settings.corpora) {
    	outStr += '<li id="' + val + '">' + settings.corpora[val].title + '</li>';
    };
    outStr += "</ul>";*/
    corpusChooserInstance = $('#corpusbox').corpusChooser({template: outStr, allSelectedString : 'All corpora selected'});
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
    insertRowButtons();
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
    return $('<img/>', {src: "img/plus.png"})
        .addClass("image_button");
}

function mkRemoveButton() {
    return $('<img/>', {src: "img/minus.png"})
        .addClass("image_button");
}

function insertRowButtons() {
    $("#buttons_row").append(
        mkRemoveButton().addClass("remove_row")
            .click(function(){removeRow()})
    ).append(
        mkInsertButton().addClass("insert_row")
            .click(function(){insertRow()})
    );
}

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
    token = $(token).closest(".query_token").children("tbody")
    var row = $("<tr/>").addClass("query_arg").appendTo(token);

    var arg_select = $("<select/>").addClass("arg_type")
        .change(function(){didSelectArgtype(this)});
    for (var lbl in settings.arg_groups) {
        var group = settings.arg_groups[lbl];
        var optgroup = $("<optgroup/>", {label: lbl}).appendTo(arg_select);
        for (var val in group) {
            optgroup.append($('<option/>').val(val).text(group[val]));
        }
    }
    setSelectWidth(arg_select);

    var arg_value = $("<input type='text'/>").addClass("arg_value")
        .change(function(){didChangeArgvalue()});

    var remove = mkRemoveButton().addClass("remove_arg")
        .click(function(){removeArg(this)});

    var insert = mkInsertButton().addClass("insert_arg")
        .click(function(){insertArg(this)})

    row.append(
        $("<td/>").append(arg_select, arg_value)
    ).append(
        $("<td/>").append(remove, insert)
    );

    didToggleToken(row);
}

function removeArg(arg) {
    arg = $(arg).closest(".query_arg");
    var row = arg.closest(".query_row")
    if (arg.siblings().length >= 1) {
        arg.remove();
    } else {
        arg.closest(".query_token").remove();
    }
    didToggleToken(row);
}

function initSearch(){

	$('#tabs-container').keypress(function(event) {
		if (event.keyCode == '13') {
			
			event.preventDefault();
//			if($("#korp-extended:visible").length)
//				updateCQP();
//			submitFormToServer();
			if ( $("#simple_text").is(":visible" )) {
				$("#simple_text").autocomplete("close");
			}
			$("#sendBtn").click();
		}
	});

	
	var corpus = $.getUrlVar('corpus');
	if (corpus && corpus.length != 0){
		$("#select_corpus").val(corpus);
		didSelectCorpus();
	}
	
	var word = $.getUrlVar('word');
	if(word && word.length != 0){
		$('input[type=text]').val(decodeURIComponent(word));
		updateCQP();
		submitFormToServer();
	}
	
	var saldo = $.getUrlVar('saldo');
	if (saldo && saldo.length != 0){
		$("#cqp_string").val('[(saldo contains "'+saldo+'")]');
		$('a[href="#korp-advanced"]').trigger('click');
		submitFormToServer();
	}
	
	var lemgram = $.getUrlVar('lemgram');
	if (lemgram && lemgram.length != 0){
		$("#cqp_string").val('[(lex contains "'+decodeURIComponent(lemgram)+'")]');
		//$('a[href="#korp-advanced"]').trigger('click');
		submitFormToServer();
	}
	
	var cqp = $.getUrlVar('cqp');
	if (cqp && cqp.length != 0){
		$("#cqp_string").val(cqp);
		$('a[href="#korp-advanced"]').trigger('click');
		submitFormToServer();
	}		
}

//////////////////////////////////////////////////////////////////////

function setSelectWidth(select) {
	//abort if browser is ie7 or older
	if($.browser.msie && parseInt($.browser.version, 10) <= 7){return 0;}
	var text = $(select).find(":selected").text();
    var dummy_select = $("<select/>", {position: "absolute", display: "none"})
        .appendTo("body")
        .append(new Option(text));
    $(select).width(dummy_select.width()+25);
    dummy_select.remove();
	
}

function didToggleRow() {
    var visibility = $(".query_row").length > 1 ? "visible" : "hidden";
    $(".remove_row").first().hide();
    $("#buttons_row").find(".remove_row").last().css("visibility", visibility);
    updateCQP();
}

function didToggleToken(row) {
    var args = $(row).closest(".query_row").find(".query_arg")
    var visibility = args.length > 1 ? "visible" : "hidden";
    args.first().find(".remove_arg").css("visibility", visibility);
    updateCQP();
}

function didSelectOperation(select) {
    var is_include = $(select).val() == "include";
    $(select).closest(".query_row")
        .toggleClass("indent", is_include)
        .toggleClass("line_above", ! is_include);
    $(select).siblings(".select_language").toggle(! is_include);
    setSelectWidth(select);
    updateCQP();
}

function didSelectLanguage(select) {
    setSelectWidth(select);
    updateCQP();
}

function didSelectArgtype(select) {
    setSelectWidth(select);
    updateCQP();
}

function didChangeArgvalue(input) {
    updateCQP();
}


//////////////////////////////////////////////////////////////////////

function regescape(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"]/g, "\\$&")
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
        var value = $(this).find(".arg_value").val();
        if (! args[type]) { args[type] = [] }
        args[type].push(value);
    });

    for (type in settings.inner_args) {
        var inner_query = [];
        for (i in args[type]) {
            inner_query.push(settings.inner_args[type](args[type][i]))
        }
        if (inner_query.length) {
            query.token.push("(" + inner_query.join(" | ") + ")")
        }
    }

    for (type in settings.outer_args) {
        if (args[type]) {
            settings.outer_args[type](query, args[type]);
        }
    }

    var query_string = "[" + query.token.join(" & ") + "]";
    if (query.min | query.max) {
        query_string += "{" + (query.min || 0) + "," + query.max + "}";
    }
    return query_string;
}
