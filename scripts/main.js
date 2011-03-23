var lemgramProxy;
var simpleSearch;

$(function(){
	$.ajaxSetup({ 
		traditional: true
		});
		
		
	$("#content").load("searchbar.html", function() {
		$.log("content load");
		loadCorpora();
		resetQuery();
		
		$("#tabs-container").tabs();
		$("#result-container").tabs({
			disabled : [2],
			show : function() {
				if($("#result-container").tabs("option", "selected")) { // any other than the first tab is selected
					//simpleSearch.centerLemgramLabel();
					hideSidebar();
				} else { // first tab selected
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
		lemgramProxy = new model.LemgramProxy();
		simplesearch = new view.SimpleSearch();
		
		$("#simple_text")[0].focus();
	});
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
		if(appendIndex != null && lemgram.slice(-1) != "1") {
			infixIndex = $.format("<sup>%s</sup>", lemgram.slice(-1));
		}
		var concept = lemgram.split(".")[0].replace(/_/g, " ");
		var type = lemgram.split(".")[2].slice(0, 2);
		return $.format("%s%s (%s)", [concept, infixIndex, util.getLocaleString(type)]);
	}
	else { // missing from saldo, and have the form word_NN instead.
		var concept = lemgram.split("_")[0];
		var type = lemgram.split("_")[1];
		return concept + " (" + util.getLocaleString(type) + ")";
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

util.corpusArrayToQuery = function(corpusArray) {
	return $.map(corpusArray, function(item) {
		return "corpus="+item.toUpperCase();
		}).join("&");
};

