

function updateSidebar(sentenceData, wordData) {
	$.log("updateSidebar");
	var displayList = ["word", "sentence", "pos", "lemma", "saldo", "deprel", "lex", "msd", "ref", "dephead"];
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl").tmpl(displayList, {word : wordData}).appendTo("#selected_word");
	else
		$.log("sidebartemplate broken");
	
	if(sentenceData) {
		$.each(sentenceData, function(k, v){
			$("#selected_sentence").append("<p>" + k + ": " + v + "</p>");
		});
	}
}

