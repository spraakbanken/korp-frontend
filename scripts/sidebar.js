

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
	}
	
	sidebarSaldoFormat();
	
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
}

function sidebarSaldoFormat() {
	
	var $lex = $("#sidebar_lex"); 
	var idArray = $.grep($lex.text().split("|"), Boolean);
	$.log("idArray", idArray);
	var pElems = $.map(idArray, function(item) {
		return $.format("<li><a href='javascript:void(0);'>%s</a></li>", item);
	}).join("");
	
	$lex.html($.format("<ul>%s</ul>", pElems))
	.find("li")
	.css("list-style", "none")
	.click(function() {
		$("#cqp_string").val($.format('[(lex contains "%s")]', $(this).text()));
		submitFormToServer();
	});
}