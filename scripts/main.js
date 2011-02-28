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