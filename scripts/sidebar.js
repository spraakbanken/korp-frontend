

function updateSidebar(sentenceData, wordData, corpus) {
	$.log("updateSidebar");
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	
	
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl").tmpl([wordData], {"header" : "word", "corpusAttributes" : settings.corpora[corpus.toLowerCase()].attributes}).appendTo("#selected_word");
	else
		$.error("sidebartemplate broken");
	
	if(sentenceData) {
		$("#sidebarTmpl").tmpl([sentenceData], {"header" : "sentence", "corpusAttributes" : settings.corpora[corpus.toLowerCase()].struct_attributes}).appendTo("#selected_sentence");
	}
	$("<p />").html("corpus : " + corpus).appendTo("#selected_word");
	sidebarSaldoFormat();
	
	$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
}

function sidebarSaldoFormat() {
	
	$("#sidebar_lex, #sidebar_prefix, #sidebar_suffix").each(function() {
		var idArray = $.grep($(this).text().split("|"), Boolean).sort();
		if(!idArray.length) {
			$(this).html($.format("<i rel='localize[empty]' style='color : grey'>%s</i>", util.getLocaleString("empty")));
		} else {
			
			var labelArray = util.lemgramArraytoString(idArray);
			$(this)
			.html($.arrayToHTMLList(labelArray))
			.find("li")
			.wrap("<a href='javascript:void(0)' />")
			.click(function() {
				var i = $.inArray($(this).text(), labelArray);
				simpleSearch.selectLemgram(idArray[i]);
			})
			.hover(function(){
				$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-search'/>").appendTo($(this));
				
			}, function() {
				$(".ui-icon").remove();
			});
		}
		
	});
	
	var $saldo = $("#sidebar_saldo"); 
	var saldoidArray = $.grep($saldo.text().split("|"), Boolean).sort();
	var saldolabelArray = util.lemgramArraytoString(saldoidArray, function(saldoId, appendIndex) {
		var infixIndex = "";
		if(appendIndex != null && saldoId.slice(-1) != "1")
			infixIndex = $.format("<sup>%s</sup>", saldoId.slice(-1));
		return $.format("%s%s", [saldoId.split(".")[0], infixIndex]);
	});
	$saldo.html($.arrayToHTMLList(saldolabelArray))
	.find("li")
	.each(function(i, item){
		$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", saldoidArray[i]));
	})
	.hover(function(){
		$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-extlink'/>").appendTo($(this));
		
	}, function() {
		$(".ui-icon").remove();
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
	var speed = 400;
	$("#sidebar").show("slide", {direction : "right"}, speed);
	$("#left-column").animate({
		right : 273
	}, speed);
	
}