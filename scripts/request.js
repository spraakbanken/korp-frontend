var current_page = 0;
var num_result = 0;

function handlePaginationClick(new_page_index, pagination_container) {
	if(new_page_index != current_page){
		var items_per_page = parseInt($("#num_hits").val());
		
		var cqp 	= $("#cqp_string").val();
		var corpus 	= getCorpus().toUpperCase();
		
		var start 	= new_page_index*items_per_page;
		var end 		= (start + items_per_page);
				
		makeRequest(cqp, corpus, start, end);
		current_page = new_page_index;
	}
    
   return false;
}

function makeRequest(cqp, corpus, start, end){
	var selected_corpus = settings.corpora[getCorpus()];
	var attributes = ['msd','lemma'];

	var data = {} 
	
	if(corpus == 'ALL'){
		
		data =	{
				command:'query',
				corpus:getAllCorpora(),
				cqp:cqp,
				start:start,
				end:end,
				context:'1 sentence',
				show:[],
				show_struct:[]  
			};		
	}else{
			data =	{
					command:'query',
					corpus:corpus,
					cqp:cqp,
					start:start,
					end:end,
					context:'1 sentence',
					show:[],
					show_struct:[]  
				};
	}

	$.each(selected_corpus.attributes, function(key,val){
		data.show.push(key);
	});
	

	if (selected_corpus.struct_attributes) {
		$.each(selected_corpus.struct_attributes, function(key,val){
			data.show_struct.push(key);
		});
	}

	$.ajax({ url: settings.cgi_script, 
				dataType: "jsonp", 
				data:data,
				success: corpus_results
	});
	
	setJsonLink(data);
}

function setJsonLink(data){
	
	var url = settings.cgi_script+'?'+jQuery.param(data);
	$('#json-link').attr('href', url);
	$('#json-link').css('display', 'inline');
}

function onSubmit(evt) {
	var currentVisible = $("#tabs-container > div:visible");
	$.log("onSubmit", currentVisible, currentVisible.attr("id"))
	switch(currentVisible.attr("id")) {
	case "korp-simple":
		onSimpleChange();
		break;
	case "korp-extended":
		updateCQP();
		break;
//	case "korp-advanced":
//		break;
	}
	submitFormToServer();
}

function submitFormToServer(){
	num_result = 0;
//	TODO: loading text broken
	$('#results').append("<p alt='localize[loading]'/>").find("p");
	
	var cqp 	= $("#cqp_string").val();
	var corpus 	= getCorpus().toUpperCase();
	
	var start 	= 0;
	var end 	= $("#num_hits").val()-1;
		
	makeRequest(cqp, corpus, start, end);
	
}

function buildPager(number_of_hits){
	var items_per_page = $("#num_hits").val();
	
	if(number_of_hits > items_per_page){
		$("#Pagination").pagination(number_of_hits, {
			items_per_page:items_per_page, 
			callback:handlePaginationClick,
			next_text: util.getLocaleString("next"),
			prev_text: util.getLocaleString("prev"),
			link_to:"#",
			num_edge_entries:2,
			ellipse_text: '..'
		});
		$(".next").attr("rel", "localize[next]");
		$(".prev").attr("rel", "localize[prev]");
		
	}else{
		$("#Pagination").html('');
	}
}

function selectLeft(sentence, offset) {
	return sentence.tokens.slice(offset, sentence.match.start);
}

function selectMatch(sentence) {
	var from = sentence.match.start;
	return sentence.tokens.slice(from, sentence.match.end);
}

function selectRight(sentence) {
	var from = sentence.match.end;
	var len=sentence.tokens.length;

	var to = len;
	if((len-sentence.match.end) > 12)
		to = sentence.match.end+12;
	
	return sentence.tokens.slice(sentence.match.end, to);
}

function lemgramResult(lemgram, data) {
	
//	"_" represents the actual word in the order
	var order = {
		vb : "SS,_,IO,OO,OA,RA,TA".split(","),
		nn : "AT,_,ET".split(","),
		av :"AT,_".split(",")
	};

	var wordClass = lemgram.split(".")[2].slice(0, 2);
	$.log("wordClass", lemgram, wordClass);
	var relMapping = {};
	var sortedList = [];
	$.each(data, function(index, item) {
		var toIndex = order[wordClass].indexOf(item.rel);
		if(toIndex == -1) {
			$.log("getting rel index failed for " + item.rel);
			return;
		}
		if(!sortedList[toIndex]) sortedList[toIndex] = [];
		sortedList[toIndex].push(item); 
	});
	
	$.each(sortedList, function(index, list) {
		if(list) {
			//	inplace sort, let's make sure the references aren't screwed up later.
			list.sort(function(first, second) {
				return second.freq - first.freq;
			});
		}
	});
	var toIndex = order[wordClass].indexOf("_");
	sortedList.splice(toIndex, 0, {"word" : util.lemgramToString(lemgram).split(" ")[0]});
	sortedList = $.grep ( sortedList, function(item, index){
		return Boolean(item);
	});
	var showAttr;
	if($.inArray(wordClass, ["vb", "nn"]) != -1) {
		showAttr = "head";
	}
	else { // wordclass == av
		showAttr = "dep";
	}
	$.log("showAttr", showAttr);
	$("#lemgramRowTmpl").tmpl(sortedList, {"showAttr" : showAttr, lemgram : lemgram, wordClass : wordClass}).appendTo("#results-lemgram")
	.addClass("lemgram_result")
	.find("#example_link").addClass("ui-icon ui-icon-document")
	.css("cursor", "pointer")
	.click(function() {
		$("#dialog").remove();
		var $target = $(this);
		
		$.log("clicked data", $target.data());
		
		$.ajax({ url : settings.cgi_script, 
			dataType: "jsonp", 
			data:{
				command:'relations_sentences',
				corpus:$target.data("corpus"),
				rel : $target.data("rel"),
				dep : $target.data("dep"),
				head : $target.data("head")
			},
			success: function(data) {
				$.log("success", data);
				if(data.ERROR) {
					$.error($.dump(data));
					return;
				}
				
				var pElems = $.map(data.kwic, function(sentence) {
					return $.format("<li>%s</li>", $.map(sentence.tokens, function(token) {
						return token.word;
					}).join(" "));
				}).join("\n");
				
				$("<div id='dialog' title='Results'></div>").appendTo("#results-lemgram").append("<ol />")
				.dialog({
					width : 600,
					height : 500
				})
				.find("ol").html(pElems);
			}
		});
	});
	
	$("#display_word").parent().vAlign();
//	TODO: filter out the first 15 list items here.
//	$(".lemgram_result li : lt(15)").remove()
	util.localize();
	$('#results-wraper').css('display', 'block');
}

function corpus_results(data) {
	if(data.ERROR) {
		$.error("json fetch error: " + $.dump(data.ERROR));
		return;
	} 
	if(!num_result) {
		buildPager(data.hits);
	}
	num_result = data.hits;
	$('#num-result').html(data.hits);
	if(!num_result) {
		$.log("no kwic results");
		return;
	}
	var effectSpeed = 100;
	$('#results').find("p").remove();
	if($.trim($("#results-table").html()).length) {
		$("#results").fadeOut(effectSpeed, function() {
			$("#results-table").empty();
			corpus_results(data);
		});
	}
	else {
		$("#results").hide();
	}
//	$("#sidebar:hidden").show("slide", {direction : "right"}, 400);
	showSidebar();
	
	var corpus = settings.corpora[getCorpus()];
	
	
	
	$.each(data.kwic, function(i,sentence){
		var offset = 0; 
		if(sentence.match.start > 12)
			offset = sentence.match.start-12;
	    var splitObj = {
	    		"left" : selectLeft(sentence, offset),
	    		"match" : selectMatch(sentence),
	    		"right" : selectRight(sentence)
	    };
	    
		$( "#sentenceTmpl" ).tmpl( splitObj, {rowIndex : i})
				.appendTo( "#results-table" )
				.find(".word").hover(
						function(){
							$(this).addClass('token_hover'); 
						}, 
						function(){
							$(this).removeClass('token_hover');
						}
				).click(
						function(event) {
							event.stopPropagation();
							util.SelectionManager.select($(this));
							var clickedWord = parseInt($(this).attr("name").split("-")[1]);
							var data = sentence.tokens[offset + clickedWord];
							updateSidebar(sentence.structs, data);
						}
				);
		
		$('.result_table tr:even').addClass('alt');
	});
	$('#results-wraper').show();
//	make the first matched word selected by default.
	$(".match").children().first().click();
	$("#results").fadeIn(effectSpeed);
}


function renderSentence(tokens){
	//<span class="word">
	
}

function tooltipIn(object){
	//<span class='token'><span class='word'><span></span></span>
	$.log('in'+$(object).html());
}

function tooltipOut(object){
	$.log('out');
}

function renderToken(token){
	var output = '<span class="token"><span class="attr word">'+token.word+'</span><span class="attr pos">'+token.word+'</span><span class="attr lemma">'+tokens.lemma+'</span></span> ';
	return output;
}

// Read a page's GET URL variables and return them as an associative array.
$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;
  while(x<c.length){var m=r.exec(c.substr(x));
    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;
    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);
    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},
URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;
  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);
  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}
});

