
// onDOMReady
$(function(){
	$.ajaxSetup({ 
		dataType: "jsonp",
		traditional: true
	});
	
	
	
	$('body').bind("keydown.autocomplete", function(event) {
		var keyCode = $.ui.keyCode;
		switch(event.keyCode) {
		case keyCode.ENTER:
			
			
			if(!simpleSearch.isVisible() || !simpleSearch.isEnabled()) return;
			
			if ( $("#simple_text").is(":visible" )) {
				$("#simple_text").autocomplete("close");
			}
//			$("#sendBtn").click();
			$.sm.send("submit.lemgram");
			
			break;
		}
	});
	var deferred_sm = $.Deferred(function( dfd ){
		$.sm("korp_statemachine.xml", dfd.resolve);
	}).promise();
	
	var deferred_load = $.Deferred(function( dfd ){
		$("#searchbar").load("searchbar.html", dfd.resolve);
    }).promise();
	

//	$("#searchbar").load("searchbar.html", function() {
	$.when(deferred_load, deferred_sm).then(function() {
		$.log("content load and sm init");
		loadCorpora();
		
		$.sm.start();
		
		$("#tabs-container").tabs({
			show : function() {
				var selected = $("#tabs-container").children("div:visible").attr("id").split("-")[1];
				$.sm.send("searchtab." + selected);
			}
		});
		
		$("#result-container").tabs({
			disabled : [2, 3],
			show : function() {
				var currentId = $("#result-container").children("div:visible").attr("id");
				if(currentId == null) return;
				var selected = currentId.split("-")[1];
				$.log("tab", "resultstab." + selected)
				$.sm.send("resultstab." + selected);
			} 
		});
		
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
		hideSidebar();
		
		$("#simple_text")[0].focus();
		util.parseQuery();
		
		$(document).click(function() {
			$("#simple_text").autocomplete("close");
		});
		resetQuery();
	});
});
