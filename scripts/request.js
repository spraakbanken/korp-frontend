var current_page = 0;
var num_result = 0;

function handlePaginationClick(new_page_index, pagination_container) {
	if(new_page_index != current_page){
		var items_per_page = parseInt($("#num_hits").val());
		
		var cqp 	= $("#Pagination").data("cqp");
		
		var start = new_page_index*items_per_page;
		var end = (start + items_per_page);
		$.log("make request", cqp, start, end);		
		kwicProxy.makeRequest(cqp, start, end);
		current_page = new_page_index;
	}
    
   return false;
}



function setJsonLink(settings){
	if(settings == null) return;
	$('#json-link').attr('href', settings.url);
	$('#json-link').show();
}

function onSubmit(evt) {
	var currentVisible = $("#tabs-container > div:visible");
	
	switch(currentVisible.attr("id")) {
	case "korp-simple":
		simpleSearch.onSimpleChange();
		// clear the simple search from previous lemgram search result widgets
		$("#result-container").tabs("option", "disabled", [2]);
		$("#lemgram_select").remove();
		$("#similar_lemgrams").empty();
		
		break;
	case "korp-extended":
		updateCQP();
		break;
//	case "korp-advanced":
//		break;
	}
	submitFormToServer();
}

function submitFormToServer(cqp) {
	num_result = 0;
	$('#results-wraper:hidden').show();
	
	cqp 	= cqp || $("#cqp_string").val();
	$.log("submitFormToServer", cqp);
	
	var start 	= 0;
	var end 	= $("#num_hits").val()-1;
		
	kwicProxy.makeRequest(cqp, start, end);
	
}

function buildPager(number_of_hits){
	var items_per_page = $("#num_hits").val();
	if(number_of_hits > items_per_page){
		$("#Pagination").pagination(number_of_hits, {
			items_per_page:items_per_page, 
			callback:handlePaginationClick,
			next_text: util.getLocaleString("next"),
			prev_text: util.getLocaleString("prev"),
			link_to:"javascript:void(0)",
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
//	if((len-sentence.match.end) > 12)
//		to = sentence.match.end+12;
	
	return sentence.tokens.slice(sentence.match.end, to);
}
