

function updateSidebar(sentenceData, wordData, corpus) {
	$.log("updateSidebar");
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	
	
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl").tmpl([wordData], {"header" : "word", "attrGetter" : function(attr) {
			return settings.corpora[corpus.toLowerCase()].attributes[attr];
		}}).appendTo("#selected_word");
	else
		$.error("sidebartemplate broken");
	
	if(sentenceData) {
		$("#sidebarTmpl").tmpl([sentenceData], {"header" : "sentence", attrGetter : function(attr) {
			return settings.corpora[corpus.toLowerCase()].struct_attributes[attr];
		}}).appendTo("#selected_sentence");
	}
	$("<p />").html("corpus : " + corpus).appendTo("#selected_word");
	sidebarSaldoFormat();
	
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
}

function sidebarSaldoFormat() {
	
	var $lex = $("#sidebar_lex"); 
	var idArray = $.grep($lex.text().split("|"), Boolean);
	$.log("idArray", idArray);
	
	$lex.html($.arrayToHTMLList(idArray))
	.find("li")
	.wrap("<a href='javascript:void(0)' />")
	.css("list-style", "none")
	.click(function() {
		$("#cqp_string").val($.format('[(lex contains "%s")]', $(this).text()));
		selectLemgram($(this).text());
	});
}

function hideSidebar() {
	var speed = 400;
	$("#sidebar").hide("slide", {direction : "right"}, speed);
	$("#left-column").animate({
		right : 8
	}, speed);
	
}
function showSidebar() {
	$.log("showSidebar", $("#sidebar").css("right"));
//	if($("#sidebar").css("right") == "270px") return;
	var speed = 400;
	$("#sidebar").show("slide", {direction : "right"}, speed);
	$("#left-column").animate({
		right : 270
	}, speed);
	
}