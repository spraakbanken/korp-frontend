$(function(){
	$.ajaxSetup({ 
		traditional: true,
		beforeSend : function() {
			$.log("send")
//			$("*").css("cursor", "progress");
		},
		complete : function() {
			$.log("complete")
//			$("*").css("cursor", "auto");
		}
		
		});
	loadCorpora();
	resetQuery();
	
	$("#tabs-container").tabs();
	$("#result-container").tabs({
		show : function() {
//			this code is here because the tab must be visible to compute the alignment.
			if($("#result-container").tabs("option", "selected")) {
				$("#display_word").parent().vAlign();
				hideSidebar();
			} else {
				showSidebar();
			}
		} 
	});

	initSearch();
	$("#result-container").click(function(){
		util.SelectionManager.deselect();
	});
//	setup language
	$("#languages").children().click(function(){
		$("#languages").children().removeClass("lang_selected");
		$(this).addClass("lang_selected");
		util.localize();
	});
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
	
//	move out sidebar
//	$("#sidebar").hide();
	hideSidebar();
	var $autoComplete = $("#simple_text").autocomplete({
		html : true,
		source: function( request, response ) {
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + request.term,
				dataType: "jsonp",
				success : function(lemArray) {
					lemArray.sort(function(first, second){
						return first.length - second.length ;
					});
					$.log("success", lemArray);
					var labelArray = util.lemgramArraytoString(lemArray);
					var listItems = $.map(lemArray, function(item, i) {
						return {
							label : labelArray[i],
							value : item,
							input : request.term
						};
					});
					$( "#simple_text" ).data("dataArray", listItems);
					response(listItems);
					if($( ".ui-autocomplete" ).height() > 300) {
						$( ".ui-autocomplete" ).addClass("ui-autocomplete-tall");
					}
					$("#autocomplete_header").remove();	
					$(".ui-autocomplete")
					.prepend("<li id='autocomplete_header' rel='localize[autocomplete_header]'/>")
					.find("li").first().text(util.getLocaleString("autocomplete_header")).css("font-weight", "bold").css("font-size", 10);
					
					$("#simple_text").preloader("hide");
				}
			});
		},
		search: function() {
			$("#simple_text").preloader({ 
				timeout: 500,
				position: {
					my: "right center",
					at: "right center",
					offset: "-1 2",
					collision: "none"
				}
			}).preloader("show");
		},
		minLength: 1,
		select: function( event, ui ) {
			event.preventDefault();
			var selectedItem = ui.item.value;
			$.log( selectedItem, ui.item.value, ui, event);

			selectLemgram(selectedItem);
			
//			first, build a dropdown list of the results
			
			var optionElems = $.map($( "#simple_text" ).data("dataArray"), function(item) {
				return $.format("<option value='%(value)s'>%(label)s</option>", item);
			});
			
			$("#lemgram_select").remove();
			$("<select id='lemgram_select' />").appendTo("#korp-simple")
			.html(optionElems.join(""))
			.change(function(){
				selectLemgram($(this).val());
			})
			.val(selectedItem);
			
			
		},
		focus : function(event) {
			event.preventDefault();
		}
	});
	
//	debug
	var dummyData = {"relations":[{"head":"|f\u00f6rs\u00f6rja..vb.1|","dep":"|ge..vb.1|","sources":["a83fd213-a839e53c","9b740d0c-9b72de9d"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|inf\u00f6ra..vb.1|","dep":"|ge..vb.1|","sources":["a17491a5-a17e7559","7c09d594-7c06200f"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|ske..vb.1|","dep":"|ge..vb.1|","sources":["76b4116e-76bf0f5e","c229862f-c22cd843"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|s\u00e4ga..vb.1|s\u00e4ga_till..vbm.1|","dep":"|ge..vb.1|","sources":["4e0a2c19-4e09ca63","4e018a77-4e04233e","d571c0d2-d57d1c0e"],"rel":"SS","corpus":"VIVILL","freq":3},{"head":"|visa..vb.1|","dep":"|ge..vb.1|","sources":["4e006816-4e0b5c1d","4e02a022-4e00c628"],"rel":"OO","corpus":"VIVILL","freq":2}]};
//	lemgramResult("f\u00f6rs\u00f6rja..vb.1", dummyData.relations);
//	
//	$("#result-container").tabs("select", 2);
	$("#simple_text")[0].focus();
});

function selectLemgram(lemgram) {
	$.ajax({
		url: "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi",
		dataType: "jsonp",
		data : {
			command : "relations",
			corpus : getCorpus() == "all" ? getAllCorpora() : getCorpus().toUpperCase(),
			lemgram : lemgram
		},
		success : function(data) {
			$.log("success", data);
			$("#results-lemgram").empty();
			if(data.relations){
				lemgramResult(lemgram, data.relations);
			}
			else {
				$("#results-lemgram").append($.format("<p><i>%s</i></p>", util.getLocaleString("no_lemgram_results")));
			}
		}
	});
	$("#cqp_string").val($.format('[(lex contains "%s")]', lemgram));
	$("#simple_text").val("");
	submitFormToServer();
}


var util = {};
// <!-- SelectionManager
util.SelectionManager = function() {
	$.error("SelectionManager is a static class, don't instantiate it.");
};

util.SelectionManager.select = function(word) {
	
	if(this.selected) {
		this.selected.removeClass("token_selected");
	}
		
	this.selected = word;
	word.addClass("token_selected");
};
util.SelectionManager.deselect = function() {
	if(!this.selected) return;
	this.selected.removeClass("token_selected");
	this.selected = null;
};
// SelectionManager -->

util.getLocaleString = function(key) {
	if(!$.localize.data) {
		$.error("Locale string cannot be found because no data file has been read.");
		return;
	}
	return $.localize.data.locale[key];
};

util.localize = function() {
	$("[rel^=localize]").localize("locale" ,{pathPrefix : "translations", language : $("#languages .lang_selected").data("lang")});
};

util.lemgramToString = function(lemgram, appendIndex) {
	if(util.isLemgramId(lemgram)) {
		var infixIndex = "";
		if(appendIndex)
			infixIndex = $.format("<sup>%s</sup>", lemgram.split(".").slice(-1));
		var concept = lemgram.split(".")[0].replace(/_/g, " ");
		var type = lemgram.split(".")[2].slice(0, 2);
		return $.format("%s%s (%s)", [concept, infixIndex, $.localize.data.locale[type]]);
	}
	else { // missing from saldo, and have the form word_NN instead.
		var concept = lemgram.split("_")[0];
		var type = lemgram.split("_")[1];
		return concept + " (" + $.localize.data.locale[type] + ")";
	}
};

util.lemgramArraytoString = function(lemgramArray, labelFunction) {
	labelFunction = labelFunction || util.lemgramToString;
	var tempArray = $.map(lemgramArray, function(lemgram){
		return lemgram.slice(0,-1);
	});
	return $.map(lemgramArray, function(lemgram) {
		var isAmbigous = $.grep(tempArray, function(tempLemgram) {
			return tempLemgram == lemgram.slice(0, -1);
		}).length > 1;
		return labelFunction(lemgram, isAmbigous);
	});
};

util.isLemgramId = function(lemgram) {
	return lemgram.search(/\.\.\w+\.\d/) != -1;
};

