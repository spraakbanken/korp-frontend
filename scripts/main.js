var PARALLEL_MODE = "parallel_mode";
var currentMode;


(function(){
	if(window.console == null) window.console = {"log" : $.noop};
	var isDev = window.location.host == "localhost";
	
	var deferred_load = $.get("searchbar.html");
	
	$.ajaxSetup({ 
		dataType: "jsonp",
		traditional: true
	});
	
	var deferred_sm = $.Deferred(function( dfd ){
		$.sm("korp_statemachine.xml", dfd.resolve);
	}).promise();
	
	
	var deferred_domReady = $.Deferred(function( dfd ){
		$(dfd.resolve);
	}).promise();
	
	var deferred_mode = $.Deferred();
	if($.deparam.querystring().mode != null) {
		deferred_mode = $.getScript($.format("modes/%s_mode.js", $.deparam.querystring().mode));
	} else {
		deferred_mode.resolve();
	}
	
    var chained = deferred_mode.pipe(function() {
        return $.ajax({
			url : settings.cgi_script,
			data : {
				command : "info",
				corpus : $.map($.keys(settings.corpora), function(item) {
					return item.toUpperCase();
				}).join()
			}
		});
    });

	chained.done(function( info_data ) {
		$.each(settings.corpora, function(key){
			settings.corpora[key]["info"] = info_data["corpora"][key.toUpperCase()]["info"];
		});
	});
	
	$.when(deferred_load, chained, deferred_domReady, deferred_sm, deferred_mode).then(function(searchbar_html) {
		$.revision = parseInt("$Rev$".split(" ")[1]);
		
		currentMode = $.deparam.querystring().mode || "default";
		$.log("radio", $.format("#radio > input[data-mode=%s]", currentMode))
		$($.format("#radio > input[data-mode=%s]", currentMode)).click();
		
		$( "#radio" ).buttonset().find("input").click(function(event) {
			var mode = $(event.target).data("mode");
			location.search = "?mode=" + mode;
		});
		
		$("#searchbar").html(searchbar_html[0]);
		
		loadCorpora();
		
		$.sm.start();
		var tab_a_selector = 'ul.ui-tabs-nav a';
		
		$("#search-tab").tabs({
			event : "change",
			show : function(event, ui) {
				var selected = $(ui.panel).attr("id").split("-")[1];
				$.sm.send("searchtab." + selected);
			}
		});
		$("#result-container").tabs({
			event : "change",
			show : function(event, ui) {
				var currentId = $(ui.panel).attr("id");
	//				if(currentId == null) return;
				var selected = currentId.split("-")[1];
				$("#rightStatsTable").css("max-width", $("#content").innerWidth() - ($("#leftStatsTable").width() + $("#stats1_diagram").width() + 50));
				$.sm.send("resultstab." + selected);
			} 
		});
		$("#result-container li.ui-state-disabled").live({
			mouseover : function() {
				nTimeout = setTimeout(function() {
					$("#lemgram_select").highlight();
				}, 750);
				
			},
			mouseout : function() {
				if(nTimeout)
					clearTimeout(nTimeout);
				$("#lemgram_select").highlight("abort");
			}
		});
		
		var tabs = $(".ui-tabs");
		tabs.find( tab_a_selector ).click(function() {
			if($(this).parent().is(".ui-state-disabled")) return;
			var state = {},
			id = $(this).closest( '.ui-tabs' ).attr( 'id' ),
			// Get the index of this tab.
			idx = $(this).parent().prevAll().length;
			
			// Set the state!
			state[ id ] = idx;
			$.bbq.pushState( state );
		});
		
		$(window).bind( 'hashchange', function(e) {
			var prevFragment = $.bbq.prevFragment || {};
			
			function hasChanged(key) {
				return prevFragment[key] != e.getState(key);
			}
			
			var page = e.getState("page", true);
			if(hasChanged("page") && !hasChanged("search"))
				kwicResults.setPage(page);
			
			var corpus = e.getState("corpus");
			if (corpus && corpus.length != 0 && corpus != prevFragment["corpus"]){
				var corp_array = corpus.split(',');
				corpusChooserInstance.corpusChooser("selectItems",corp_array);
				$("#select_corpus").val(corpus);
				simpleSearch.enable();
			}
			
			function showAbout() {
				$("#about_content").dialog({
					beforeClose : function() {
						$.bbq.removeState("display");
						return false;
					}
				}).css("opacity", 0);
				$("#ui-dialog-title-about_content").attr("rel", "localize[about]");
				$("#about_content").fadeTo(400,1);
			}
			
			if(e.getState("display") == "about") {
				if($("#about_content").is(":empty")) {
					$("#about_content").load("about.html", function() {
						$("#revision").text($.revision);
						showAbout();
					});
				} else {
					showAbout();
				}
				
			} else  {
				$("#about_content").closest(".ui-dialog").fadeTo(400, 0, function() {
					$("#about_content").dialog("destroy");
				});
			}
			
			var search = e.getState("search");
			if(search != null && search !== prevFragment["search"]) {
				
				var type = search.split("|")[0];
				var value = search.split("|")[1];
				
				switch(type) {
				case "word":
					$("#simple_text").val(value);
					simpleSearch.onSimpleChange();
					simpleSearch.setPlaceholder(null, null);
					simpleSearch.makeLemgramSelect();
					$.sm.send("submit.kwic", value);
					break;
				case "lemgram":
					$.sm.send("submit.lemgram", value);
					break;
				case "saldo":
					extendedSearch.setOneToken("saldo", value);
					$.sm.send("submit.kwic", value);
					break;
				case "cqp":
					advancedSearch.setCQP(value);
					$.sm.send("submit.kwic", value);
					break;
				}
			}
			tabs.each(function() {
				var idx = e.getState( this.id, true ) || 0;
				$(this).find( tab_a_selector ).eq( idx ).triggerHandler( 'change' );
			});
			
			$.bbq.prevFragment = $.deparam.fragment();
		});
		
		$("#result-container").click(function(){
			util.SelectionManager.deselect();
			$.sm.send("word.deselect");
		});
		
		//setup about link
		$("#about").click(function() {
			if($.bbq.getState("display") == null) {
				$.bbq.pushState({display : "about"});
			} else {
				$.bbq.removeState("display");
			}
		});
		
		// setup language
		$("#languages").children().click(function(){
			$("#languages").children().removeClass("lang_selected");
			$(this).addClass("lang_selected");
			util.localize();
		});
		$($.format("[data-lang=%s]", settings.defaultLanguage)).click();
		
		// move out sidebar
		hideSidebar();
		
		$("#simple_text")[0].focus();
		
		$(document).click(function() {
			$("#simple_text").autocomplete("close");
		});
		extendedSearch.insertRow();
	//		resetQuery();
		
		$(window).trigger("hashchange");
		$("body").fadeTo(400, 1);
	});
			
})();

