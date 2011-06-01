

function updateSidebar(sentenceData, wordData, corpus) {
	$("#selected_word").empty();
	$("#selected_sentence").empty();
	var corpusObj = settings.corpora[corpus.toLowerCase()];
	$("<div />").html(
			$.format("<h4 rel='localize[corpus]'>%s</h4> <p>%s</p>", [util.getLocaleString("corpus"), corpusObj.title]))
			.prependTo("#selected_sentence");
	
	if(!$.isEmptyObject(corpusObj.struct_attributes)) {
		$("#sidebarTmpl")
		.tmpl([sentenceData], {"header" : "sentence", "corpusAttributes" : corpusObj.struct_attributes})
//		.find(".exturl").hoverIcon("ui-icon-extlink")
		.appendTo("#selected_sentence");
	}
	

	function parseLemma(attr) {
		var seq = [];
		if(attr != null) {
			seq = $.map(attr.split("|"), function(item) {
				return item.split(":")[0];
			});
		}
		seq = $.grep(seq, function(itm) {
			return itm && itm.length;
		});
		return $.arrayToHTMLList(seq).outerHTML();
	}
	
	if($("#sidebarTmpl").length > 0)
		$("#sidebarTmpl")
		.tmpl([wordData], {"header" : "word", "corpusAttributes" : corpusObj.attributes, parseLemma : parseLemma})
		.appendTo("#selected_word");
	else
		$.error("sidebartemplate broken");
	
	sidebarSaldoFormat();
	//$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
}

function sidebarSaldoFormat() {
	
	$("#sidebar_lex, #sidebar_prefix, #sidebar_suffix").each(function() {
		var idArray = $.grep($(this).text().split("|"), function(itm) {
			return itm && itm.length;  
		}).sort();
			
		var labelArray = util.sblexArraytoString(idArray);
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
		.hoverIcon("ui-icon-search");
//		.hover(function(){
//			$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon ui-icon-search'/>").appendTo($(this));
//			
//		}, function() {
//			$(".ui-icon").remove();
//		});
//		}
		
	});
	var $saldo = $("#sidebar_saldo"); 
	var saldoidArray = $.grep($saldo.text().split("|"), function(itm) {
		return itm && itm.length;  
	}).sort();
	var saldolabelArray = util.sblexArraytoString(saldoidArray, util.saldoToString);

	$saldo.html($.arrayToHTMLList(saldolabelArray))
	.find("li")
	.each(function(i, item){
		var id = saldoidArray[i].match(util.saldoRegExp).slice(1,3).join("..");
		$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", id));
	})
	.hoverIcon("ui-icon-extlink");
	
}

function hideSidebar() {
	if($("#sidebar").css("right") == 273) return;
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