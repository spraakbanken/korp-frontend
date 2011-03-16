

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
	var $saldo = $("#sidebar_saldo"); 
	var idArray = $.grep($lex.text().split("|"), Boolean).sort();
	var saldoidArray = $.grep($saldo.text().split("|"), Boolean).sort();
	$.log("idArray", idArray);
	var labelArray = util.lemgramArraytoString(idArray);
	var saldolabelArray = util.lemgramArraytoString(saldoidArray, function(saldoId, appendIndex) {
		var infixIndex = "";
		if(appendIndex)
			infixIndex = $.format("<sup>%s</sup>", saldoId.slice(-1));
		return $.format("%s%s", [saldoId.split(".")[0], infixIndex]);
	});
	
	$lex.html($.arrayToHTMLList(labelArray))
	.find("li")
	.wrap("<a href='javascript:void(0)' />")
	.click(function() {
		var i = $.inArray($(this).text(), labelArray);
		
		$("#cqp_string").val($.format('[(lex contains "%s")]', idArray[i]));
		selectLemgram($(this).text());
	});
	$saldo.html($.arrayToHTMLList(saldolabelArray))
	.find("li")
	.each(function(i, item){
		$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", saldoidArray[i]));
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
		right : 273
	}, speed);
	
}