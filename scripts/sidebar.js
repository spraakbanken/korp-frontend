

function updateSidebar(sentenceData, wordData) {
	$.log("updateSidebar");
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl").tmpl([wordData], {"header" : "word"}).appendTo("#selected_word");
	else
		$.log("sidebartemplate broken");
	
	if(sentenceData) {
		$("#sidebarTmpl").tmpl([sentenceData], {"header" : "sentence"}).appendTo("#selected_sentence");
		
//		$.each(sentenceData, function(k, v){
//			$("#selected_sentence").append("<p>" + k + ": " + v + "</p>");
//		});
	}
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
}

