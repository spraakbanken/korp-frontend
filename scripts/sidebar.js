

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
		var idArray = $.grep($(this).text().split("|"), function(itm) {
			return itm && itm.length;  
		}).sort();
//		if(!idArray.length) {
//			$(this).html($.format("<i rel='localize[empty]' style='color : grey'>%s</i>", util.getLocaleString("empty")));
//		} else {
			
		var labelArray = util.lemgramArraytoString(idArray);
		$(this)
		.html($.arrayToHTMLList(labelArray))
		.find("li")
		.wrap("<a href='javascript:void(0)' />")
		.click(function() {
			var split = util.splitLemgram(idArray[$(this).parent().index()]);
			var id = split[0] + ".." + split[1] + "." + split[2];
			$.log("sidebar click", split, idArray, $(this).parent().index(), $(this).data("lemgram"));
			simpleSearch.selectLemgram(id);
		})
		.hover(function(){
			$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-search'/>").appendTo($(this));
			
		}, function() {
			$(".ui-icon").remove();
		});
//		}
		
	});
	var saldoRegExp = /(.*?)\.\.(\d\d?)(\:\d+)?$/;
	var $saldo = $("#sidebar_saldo"); 
	var saldoidArray = $.grep($saldo.text().split("|"), function(itm) {
		return itm && itm.length;  
	}).sort();
	var saldolabelArray = util.lemgramArraytoString(saldoidArray, function(saldoId, appendIndex) {
		var match = saldoId.match(saldoRegExp);
		var infixIndex = "";
		if(appendIndex != null && match[2] != "1")
			infixIndex = $.format("<sup>%s</sup>", match[2]);
		return $.format("%s%s", [match[1], infixIndex]);
	});
//	if(!saldoidArray.length) {
//		$saldo.html($.format("<i rel='localize[empty]' style='color : grey'>%s</i>", util.getLocaleString("empty")));
//	} else {
	$saldo.html($.arrayToHTMLList(saldolabelArray))
	.find("li")
	.each(function(i, item){
		var id = saldoidArray[i].match(saldoRegExp).slice(1,3).join("..");
		$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", id));
	})
	.hover(function(){
		$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-extlink'/>").appendTo($(this));
	}, function() {
		$(this).find(".ui-icon").remove();
	});
//	}
	
	
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