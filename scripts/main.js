$(function(){
	loadCorpora();
	resetQuery();
	$("#query_form").attr("action", settings.cgi_script);
	
	$('#num_hits').tooltip('Number of hits');

	$("#tabs-container").tabs();
	$("#result-container").tabs();

	initSearch();
	$("#result-container").click(function(){
		util.SelectionManager.deselect();
	});
//	setup language
	$("#languages").children().click(function(){
		$("[rel^=localize]").localize("locale" ,{pathPrefix : "translations", language : $(this).data("lang")});
		$("#languages").children().removeClass("lang_selected");
		$(this).addClass("lang_selected");
	});
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
	
//	move out sidebar
	$("#sidebar").hide();
	var $autoComplete = $( "#simple_text" ).autocomplete({
		source: function( request, response ) {
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + request.term,
				dataType: "jsonp",
				traditional:true,
				success : function(lemArray) {
					$.log("success", lemArray);
					var listItems = $.map(lemArray, function(item, i) {
						return {
							label : util.lemgramToString(item),
							value : item,
							input : request.term
						};
					});
					response(listItems);
					$.log("height", $( ".ui-autocomplete" ).height());
					if($( ".ui-autocomplete" ).height() > 300) {
						$( ".ui-autocomplete" ).addClass("ui-autocomplete-tall");
					}
				}
			});
		},
		select: function( event, ui ) {
			event.preventDefault();
			var selectedItem = ui.item.value;
			$.log( selectedItem, ui.item.value, ui, event);

			$.ajax({
				url: "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi",
				dataType: "jsonp",
				data : {
					command : "relations",
					corpus : getCorpus() == "all" ? getAllCorpora() : getCorpus().toUpperCase(),
					lemgram : selectedItem
				},
				traditional:true,
				success : function(data) {
					$.log("success", data);
					if(data.relations){
						lemgramResult(selectedItem, data.relations);
					}
				}
			});
			$("#sendBtn").click();
		}
	});
	
	
//	debug
//	var dummyData = {"relations":[{"head":"|f\u00f6rs\u00f6rja..vb.1|","dep":"|ge..vb.1|","sources":["a83fd213-a839e53c","9b740d0c-9b72de9d"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|inf\u00f6ra..vb.1|","dep":"|ge..vb.1|","sources":["a17491a5-a17e7559","7c09d594-7c06200f"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|ske..vb.1|","dep":"|ge..vb.1|","sources":["76b4116e-76bf0f5e","c229862f-c22cd843"],"rel":"OO","corpus":"VIVILL","freq":2},{"head":"|s\u00e4ga..vb.1|s\u00e4ga_till..vbm.1|","dep":"|ge..vb.1|","sources":["4e0a2c19-4e09ca63","4e018a77-4e04233e","d571c0d2-d57d1c0e"],"rel":"SS","corpus":"VIVILL","freq":3},{"head":"|visa..vb.1|","dep":"|ge..vb.1|","sources":["4e006816-4e0b5c1d","4e02a022-4e00c628"],"rel":"OO","corpus":"VIVILL","freq":2}]};
//	lemgramResult("f\u00f6rs\u00f6rja..vb.1", dummyData.relations);
});


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
		return null;
	}
	return $.localize.data.locale[key];
};

util.lemgramToString = function(lemgram) {
	var concept = lemgram.split(".")[0].replace(/_/g, " ");
	var type = lemgram.split(".")[2].slice(0, 2);
	return concept + " (" + $.localize.data.locale[type] + ")";
};