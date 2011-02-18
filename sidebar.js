

function updateSidebar(sentenceData, wordData) {
	var displayList = ["word", "sentence", "pos", "lemma", "saldo", "deprel", "lex", "msd", "ref", "dephead"];
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	$("#sidebarTmpl").tmpl(displayList, {word : wordData}).appendTo("#selected_word");
	
	if(sentenceData) {
		$.each(sentenceData, function(k, v){
			$("#selected_sentence").append("<p>" + k + ": " + v + "</p>");
		});
	}
}

