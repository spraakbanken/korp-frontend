if(window.console == null) window.console = {"log" : $.noop};
var isDev = window.location.host == "localhost";


// onDOMReady
$(function(){
	$.revision = parseInt("$Rev$".split(" ")[1]);
	$("#revision").text($.revision);
	
	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
		if(options.preloadCallback == null) {
			return;
		}
		var def = $.Deferred();
	
		setTimeout(function() {
			def.resolve();
		}, options.preloadTimeout || 1000);
		$.when(jqXHR, def).then(function() {
			options.preloadCallback();
		});
		
	});
	$.ajaxSetup({ 
		dataType: "jsonp",
		traditional: true
	});
	
	var deferred_sm = $.Deferred(function( dfd ){
		$.sm("korp_statemachine.xml", dfd.resolve);
	}).promise();
	
	var deferred_load = $.Deferred(function( dfd ){
		$("#searchbar").load("searchbar.html", dfd.resolve);
    }).promise();
	
	// this fires only when both have been loaded. 
	$.when(deferred_load, deferred_sm).then(function() {
		$.log("content load and sm init");
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
			
			tabs.each(function() {
				var idx = e.getState( this.id, true ) || 0;
				$(this).find( tab_a_selector ).eq( idx ).triggerHandler( 'change' );
			});
			
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
			
			if(e.getState("display") == "about") {
				$("#about_content").dialog({
					beforeClose : function() {
						$.bbq.removeState("display");
						return false;
					}
				}).css("opacity", 0);
				$("#ui-dialog-title-about_content").attr("rel", "localize[about]");
				$("#about_content").fadeTo(400,1);
			} else  {
				$("#about_content").closest(".ui-dialog").fadeTo(400, 0, function() {
					$("#about_content").dialog("destroy");
				});
			}
			
			var search = e.getState("search");
			if(search == null || search === prevFragment["search"]) {
				$.bbq.prevFragment = $.deparam.fragment();
				return;
			}
			
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
});

