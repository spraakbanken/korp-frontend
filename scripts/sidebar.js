

function updateSidebar(sentenceData, wordData, corpus) {
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	var corpusObj = settings.corpora[corpus.toLowerCase()];
	
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl")
		.tmpl([wordData], {"header" : "word", "corpusAttributes" : corpusObj.attributes})
		.appendTo("#selected_word");
	else
		$.error("sidebartemplate broken");
	
	if(corpusObj.struct_attributes) {
		$("#sidebarTmpl")
		.tmpl([sentenceData], {"header" : "sentence", "corpusAttributes" : corpusObj.struct_attributes})
		.appendTo("#selected_sentence");
	}
	$("<div />").html(
			$.format("<h4 rel='localize[corpus]'>%s</h4> <p>%s</p>", [util.getLocaleString("corpus"), corpusObj.title]))
			.prependTo("#selected_sentence");
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
				var i = $(this).index();
				$.log("sidebar click", $(this).index());
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
		var match = saldoId.match(/(.*?)\.\.(\d\d?)(\:\d+)?$/);
		var infixIndex = "";
		if(appendIndex != null && match[2] != "1")
			infixIndex = $.format("<sup>%s</sup>", match[2]);
		return $.format("%s%s", [match[1], infixIndex]);
	});
	$saldo.html($.arrayToHTMLList(saldolabelArray))
	.find("li")
	.each(function(i, item){
		$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", saldoidArray[i]));
	})
	.hover(function(){
		$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-extlink'/>").appendTo($(this));
		
	}, function() {
		$(this).find(".ui-icon").remove();
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