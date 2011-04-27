

function setJsonLink(settings){
	if(settings == null) return;
	$('#json-link').attr('href', settings.url);
	$('#json-link').show();
}

function onSubmit(evt) {
//	$.sm.send("submit");
	
	var currentVisible = $("#tabs-container > div:visible");
	
	//$("#result-container").tabs("select", 0);
	//$("#result-container").tabs("option", "disabled", [2, 3]);
//	simpleSearch.resetView();
	
	switch(currentVisible.attr("id")) {
	case "korp-simple":
//		simpleSearch.resetView();
		
		break;
	case "korp-extended":
		//updateCQP();
		break;
//	case "korp-advanced":
//		break;
	}
//	submitFormToServer();
}

function submitFormToServer(cqp) {
	kwicResults.num_result = 0;
	//$.sm.send("submit");
	
	cqp 	= cqp || $("#cqp_string").val();
	$.log("submitFormToServer", cqp);
	
	var start 	= 0;
	var end 	= $("#num_hits").val()-1;
		
	kwicProxy.makeRequest(cqp, start, end);
	
}

