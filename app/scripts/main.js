var currentMode;

(function(){
	var t = $.now();
//	if(window.console == null) window.console = {"log" : $.noop};
	var isDev = window.location.host == "localhost";

	var deferred_load = $.get("markup/searchbar.html");

	$.ajaxSetup({
		dataType: "json",
		traditional: true
	});

	$.ajaxPrefilter('json', function(options, orig, jqXHR) {
	    if (options.crossDomain && !$.support.cors) return 'jsonp';
	});

	var deferred_sm = $.Deferred(function( dfd ){
		if( navigator.userAgent.match(/Android/i) && !window.XSLTProcessor) {
			alert("Använd Firefox eller Opera för att köra Korp i Android.");
			return;
		}
		$.sm("korp_statemachine.xml", dfd.resolve);


	}).promise();


	var deferred_mode = $.Deferred();
	var deferred_domReady = $.Deferred(function( dfd ){
		$(function() {

			var mode = $.deparam.querystring().mode;
			if(mode != null && mode != "default") {
				$.getScript($.format("modes/%s_mode.js", mode), function() {
					deferred_mode.resolve();
					dfd.resolve();
				});
			} else {
				deferred_mode.resolve();
				dfd.resolve();
			}
		});
	}).promise();

//	var deferred_mode = $.Deferred();
//	var mode = $.deparam.querystring().mode;
//	if(mode != null && mode != "default") {
//		deferred_mode = $.getScript($.format("modes/%s_mode.js", mode));
//	} else {
//		deferred_mode.resolve();
//	}

	var chained = deferred_mode.pipe(function() {
        return $.ajax({
			url : settings.cgi_script,
			data : {
				command : "info",
				corpus : $.map($.keys(settings.corpora), function(item) {
					return item.toUpperCase();
				}).join(),
				log : 1
			}
		});
    });

	chained.done(function( info_data ) {
		$.each(settings.corpora, function(key){
			settings.corpora[key]["info"] = info_data["corpora"][key.toUpperCase()]["info"];
		});
	});
	var loc_dfd = util.initLocalize();

	$.when(deferred_load, chained, deferred_domReady, deferred_sm, loc_dfd).then(function(searchbar_html) {
		$.revision = parseInt("$Rev$".split(" ")[1]);
		c.log("preloading done, t = ", $.now() - t);
		if(isLab) $("body").addClass("lab");

		currentMode = $.deparam.querystring().mode || "default";

		$("body").addClass("mode-" + currentMode);
		util.browserWarn();


		var from = $("#time_from");
		var to = $("#time_to");
		var start = 1900;
		var end = new Date().getFullYear();
		$("#time_slider").slider({
			range: true,
			min: start,
			max: end,
			values: [ 1982, end ],
			slide : function(event, ui) {
				from.val(ui.values[0]);
				to.val(ui.values[1]);
			},
			change : function(event, ui) {
				$(this).data("value", ui.values);
			}
		});

		$("#mode_switch").modeSelector({
            change : function() {
            	var mode = $(this).modeSelector("option", "selected");
    			$.bbq.removeState("corpus");
    			if(mode == "default") {
    				location.href = location.pathname;
    			} else {
    				location.href = location.pathname + "?mode=" + mode;
    			}
            },
            selected : currentMode,
            modes : [
                 {localekey : "modern_texts", mode : "default"},
                 {localekey : "parallel_texts", mode : "parallel"},
                 {localekey : "old_swedish_texts", mode : "old_swedish"},
                 {localekey : "faroese_texts", mode : "faroe"},
                 {localekey : "siberian_texts", mode : "siberian_german"},
                 {localekey : "1800_texts", mode : "1800"},
                 {localekey : "lb_texts", mode : "lb"},
                 {localekey : "lawroom", mode : "law"},
                 {localekey : "digidaily", mode : "digidaily"}
                     ]
		}).add("#about").vAlign();

		var paper = new Raphael(document.getElementById('cog'), 33, 33);
		paper.path("M26.974,16.514l3.765-1.991c-0.074-0.738-0.217-1.454-0.396-2.157l-4.182-0.579c-0.362-0.872-0.84-1.681-1.402-2.423l1.594-3.921c-0.524-0.511-1.09-0.977-1.686-1.406l-3.551,2.229c-0.833-0.438-1.73-0.77-2.672-0.984l-1.283-3.976c-0.364-0.027-0.728-0.056-1.099-0.056s-0.734,0.028-1.099,0.056l-1.271,3.941c-0.967,0.207-1.884,0.543-2.738,0.986L7.458,4.037C6.863,4.466,6.297,4.932,5.773,5.443l1.55,3.812c-0.604,0.775-1.11,1.629-1.49,2.55l-4.05,0.56c-0.178,0.703-0.322,1.418-0.395,2.157l3.635,1.923c0.041,1.013,0.209,1.994,0.506,2.918l-2.742,3.032c0.319,0.661,0.674,1.303,1.085,1.905l4.037-0.867c0.662,0.72,1.416,1.351,2.248,1.873l-0.153,4.131c0.663,0.299,1.352,0.549,2.062,0.749l2.554-3.283C15.073,26.961,15.532,27,16,27c0.507,0,1.003-0.046,1.491-0.113l2.567,3.301c0.711-0.2,1.399-0.45,2.062-0.749l-0.156-4.205c0.793-0.513,1.512-1.127,2.146-1.821l4.142,0.889c0.411-0.602,0.766-1.243,1.085-1.905l-2.831-3.131C26.778,18.391,26.93,17.467,26.974,16.514zM20.717,21.297l-1.785,1.162l-1.098-1.687c-0.571,0.22-1.186,0.353-1.834,0.353c-2.831,0-5.125-2.295-5.125-5.125c0-2.831,2.294-5.125,5.125-5.125c2.83,0,5.125,2.294,5.125,5.125c0,1.414-0.573,2.693-1.499,3.621L20.717,21.297z")
		.attr({fill: "#666", stroke: "none", transform : "s0.6"});

		paper = new Raphael(document.getElementById('labs_logo'), 39, 60);
		labs = paper.path("M22.121,24.438l-3.362-7.847c-0.329-0.769-0.599-2.081-0.599-2.917s0.513-1.521,1.14-1.521s1.141-0.513,1.141-1.14s-0.685-1.14-1.521-1.14h-6.84c-0.836,0-1.52,0.513-1.52,1.14s0.513,1.14,1.14,1.14s1.14,0.685,1.14,1.521s-0.269,2.148-0.599,2.917l-3.362,7.847C8.55,25.206,8.28,26.177,8.28,26.595s0.342,1.103,0.76,1.521s1.444,0.76,2.28,0.76h8.359c0.836,0,1.862-0.342,2.28-0.76s0.76-1.103,0.76-1.521S22.45,25.206,22.121,24.438zM16.582,7.625c0,0.599,0.484,1.083,1.083,1.083s1.083-0.484,1.083-1.083s-0.484-1.084-1.083-1.084S16.582,7.026,16.582,7.625zM13.667,7.792c0.276,0,0.5-0.224,0.5-0.5s-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5S13.391,7.792,13.667,7.792zM15.584,5.292c0.874,0,1.583-0.709,1.583-1.583c0-0.875-0.709-1.584-1.583-1.584C14.709,2.125,14,2.834,14,3.709C14,4.583,14.709,5.292,15.584,5.292z")
		.attr({fill: "#333", stroke: "none", transform : "t0,18s1.7"});


		$("#cog_menu")
		.menu({})
		.hide()
		//TODO: why do i have to do this?
		.find(".follow_link").click(function() {
			window.href = window.open($(this).attr("href"), $(this).attr("target") || "_self");
		});

		$("#cog").click(function() {
			if($("#cog_menu:visible").length) {
				return;
			}

			$("#cog_menu")
			.fadeIn("fast")
			.position({
				my : "right top",
				at : "right bottom",
				of : "#top_bar",
				offset : "-8 3"
			});

			$("body").one("click", function() {
				$("#cog_menu").fadeOut("fast");
			});
			return false;
		});

		$("#searchbar").html(searchbar_html[0]);

		$("#search_history").change(function(event) {
			c.log("select", $(this).find(":selected"));
			location.href = $(this).find(":selected").val();
		});

		loadCorpora();
		var creds = $.jStorage.get("creds");

		$.sm.start();
		if(creds) {
			authenticationProxy.loginObj = creds;
			util.setLogin();
		}
		var tab_a_selector = 'ul.ui-tabs-nav a';


		$("#search-tab").tabs({
			event : "change",
			activate : function(event, ui) {
				if($("#columns").position().top > 0)
					$("#sidebar").sidebar("updatePlacement"); //place sidebar
				var selected = ui.newPanel.attr("id").split("-")[1];
				$.sm.send("searchtab." + selected);
			}
		});

		if(currentMode == "parallel") {
			$(".ui-tabs-nav li").first().hide();
			$(".ui-tabs-nav li").last().hide();
			$("#korp-simple").hide();
			$(".ui-tabs-nav a").eq(1).localeKey("parallel");
			$("#korp-advanced").hide();
			$("#search-tab").tabs("select", 1);

			$("#result-container > ul li:last ").hide();
		}

		$("#result-container").korptabs({
			event : "change",
			activate : function(event, ui) {
				if(ui.newTab.parent().is(".custom_tab")) {
					$.sm.send("resultstab.custom");
				} else {
					var currentId = ui.newPanel.attr("id");
					var selected = currentId.split("-")[1];
					c.log("send ", "resultstab." + selected)
					$.sm.send("resultstab." + selected);
				}
			},
			panelTemplate : "<div>" + kwicResults.initHTML + "</div>",
			tabTemplate : '<li class="custom_tab"><a class="custom_anchor" href="#{href}"><span rel="localize[example]">#{label}</span></a><a class="tabClose" href="#"><span class="ui-icon ui-icon-circle-close"></span></a></li>'
		});

		var tabs = $(".ui-tabs");
		tabs.find(tab_a_selector).click(function() {
			if($(this).parent().is(".ui-state-disabled")) return;
			var state = {},
			id = $(this).closest( '.ui-tabs' ).attr( 'id' ),
			// Get the index of this tab.
			idx = $(this).parent().prevAll().length;

			// Set the state!
			state[ id ] = idx;
			$.bbq.pushState( state );
			return false;
		});

		$(".custom_anchor").live("mouseup", function() {
			c.log("custom click");
			$.bbq.removeState("result-container");
			$(this).triggerHandler( 'change' );
		});

		$("#log_out").click(function() {
			$.each(authenticationProxy.loginObj.credentials, function(i, item) {
				$($.format(".boxdiv[data=%s]", item.toLowerCase())).addClass("disabled");
			});
			authenticationProxy.loginObj = {};
			$.jStorage.deleteKey("creds");
			$("body").toggleClass("logged_in not_logged_in");
			$("#pass").val("");
			$('#corpusbox').corpusChooser("redraw");
		});

		function getAllCorporaInFolders(lastLevel, folderOrCorpus) {
		    var outCorpora = [];

		    // Go down the alley to the last subfolder
		    while(folderOrCorpus.contains(".")) {
		         var posOfPeriod = folderOrCorpus.indexOf(".");
		         var leftPart = folderOrCorpus.substr(0, posOfPeriod);
		         var rightPart = folderOrCorpus.substr(posOfPeriod+1);
		         if(lastLevel[leftPart]) {
		             lastLevel = lastLevel[leftPart];
		             folderOrCorpus = rightPart;
		         } else {
	            	 break;
	             }
		    }

		    if (lastLevel[folderOrCorpus]) {
		        // Folder
		        // Continue to go through any subfolders
		        $.each(lastLevel[folderOrCorpus], function(key, val) {
		            if(key != "title" && key != "contents" && key != "description")
		                outCorpora.extend(getAllCorporaInFolders(lastLevel[folderOrCorpus], key));
		        });
		        // And add the corpora in this folder level
		        outCorpora.extend(lastLevel[folderOrCorpus]["contents"]);
		    } else {
                // Corpus
                outCorpora.push(folderOrCorpus);
		    }
		    return outCorpora;
		}


		function onHashChange(event, isInit) {
			var prevFragment = $.bbq.prevFragment || {};
			var e = $.bbq;
			function hasChanged(key) {
				return prevFragment[key] != e.getState(key);
			}

			if(hasChanged("lang")) {
				var loc_dfd = util.initLocalize();
				loc_dfd.done(function() {
					util.localize();
				});
				$("#languages").radioList("select", $.localize("getLang"));
			}


			var page = e.getState("page", true);
			if(hasChanged("page") && !hasChanged("search")) {
				kwicResults.setPage(page);
			}

			if(isInit) {
				kwicResults.current_page = page;
			}

			var corpus = e.getState("corpus");
			if (isInit && corpus && corpus.length != 0 && hasChanged("corpus")){
				var corp_array = corpus.split(',');
				var processed_corp_array = [];
				$.each(corp_array, function(key, val) {
				    processed_corp_array.extend(getAllCorporaInFolders(settings.corporafolders, val));
				});

				corpusChooserInstance.corpusChooser("selectItems", processed_corp_array);
				$("#select_corpus").val(corpus);
				simpleSearch.enableSubmit();
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
				$("#about_content").find("a").blur(); // Prevents the focus of the first link in the "dialog"
			}
			var display = e.getState("display");
			if(display == "about") {
				if($("#about_content").is(":empty")) {
					$("#about_content").load("markup/about.html", function() {
						$("#revision").text($.revision);
						util.localize(this);
						showAbout();
					});
				} else {
					showAbout();
				}

			} else if(display == "login") {
				$("#login_popup").dialog({
					height : 220,
					width : 177,
					modal : true,
					resizable : false,
					create : function() {
						$(".err_msg", this).hide();
					},
					open: function(){
			            $('.ui-widget-overlay').hide().fadeIn();
			        },
			        beforeClose: function(){
			            $('.ui-widget-overlay').remove();
			            $("<div />", {
			                'class':'ui-widget-overlay'
			            }).css(
			                {
			                    height: $("body").outerHeight(),
			                    width: $("body").outerWidth(),
			                    zIndex: 1001
			                }
			            ).appendTo("body").fadeOut(function(){
			                $(this).remove();
			            });
			            $.bbq.removeState("display");
						return false;
			        }

				}).show()
				.unbind("submit")
				.submit(function() {
					var self = this;
					authenticationProxy.makeRequest($("#usrname", this).val(), $("#pass", this).val())
					.done(function(data) {
						util.setLogin();
						$.bbq.removeState("display");
					}).fail(function() {
						c.log("login fail");
						$("#pass", self).val("");
						$(".err_msg", self).show();
					});
					return false;
				});
				$("#ui-dialog-title-login_popup").attr("rel", "localize[log_in]");
			} else {

				$(".ui-dialog").fadeTo(400, 0, function() {
					$(".ui-dialog-content", this).dialog("destroy");
				});
			}

			if(!isInit && hasChanged("display")) {

				if(e.getState("display") == "bar_plot") {
					statsResults.drawBarPlot();
				} else {
					$("#plot_popup").dialog("destroy")
					.css({"opacity" : 0, "display" : "block", "height" : 0});
				}

			}


			var reading = e.getState("reading_mode");
			if(hasChanged("reading_mode")) {
//				$.sm.send("display_change");

				if(reading) {
					kwicResults.$result.addClass("reading_mode");
    				if(!isInit && kwicResults.$result.find(".results_table.reading").is(":empty")) {
						kwicResults.makeRequest();
					}
				} else {
					kwicResults.$result.removeClass("reading_mode");
					if(!isInit && kwicResults.$result.find(".results_table.kwic").is(":empty")) {
						kwicResults.makeRequest();
					} else {
						kwicResults.centerScrollbar();
					}
				}
			}


			var search = e.getState("search");
			if(search != null && search !== prevFragment["search"]) {
				kwicResults.current_page = page || 0;
				var type = search.split("|")[0];
				var value = search.split("|").slice(1).join("|");

				view.updateSearchHistory(value);
				var data = {value : value, page : page, isInit : isInit};
				switch(type) {
				case "word":
					$("#simple_text").val(value);
					simpleSearch.onSimpleChange();
					simpleSearch.setPlaceholder(null, null);
					if(settings.lemgramSelect)
						simpleSearch.makeLemgramSelect();
					$.sm.send("submit.word", data);
					break;
				case "lemgram":
					$.sm.send("submit.lemgram", data);
					break;
				case "saldo":
					extendedSearch.setOneToken("saldo", value);
					$.sm.send("submit.cqp", data);
					break;
				case "cqp":
					advancedSearch.setCQP(value);
					$.sm.send("submit.cqp", data);
					break;
				}
			}
			// if(!isInit)
			tabs.each(function() {
				var self = this;
				var idx = e.getState( this.id, true );
				if(idx === null) return;
				$(self).find( tab_a_selector ).eq( idx ).triggerHandler( 'change' );

			});
			// else



			$.bbq.prevFragment = $.deparam.fragment();
		}
		$(window).bind( 'hashchange', onHashChange);

		$(window).scroll(function() {
			$("#sidebar").sidebar("updatePlacement");
		});

		//setup about link
		$("#about").click(function() {
			if($.bbq.getState("display") == null) {
				$.bbq.pushState({display : "about"});
			} else {
				$.bbq.removeState("display");
			}
		});
		$("#login").click(function() {
			if($.bbq.getState("display") == null) {
				$.bbq.pushState({display : "login"});
			} else {
				$.bbq.removeState("display");
			}


		});
		$("#languages").radioList({
			change : function() {
				c.log("this", $(this))
				$.bbq.pushState({lang : $(this).radioList("getSelected").data("mode")});
			},
			selected : "sv"
		}).vAlign();


		$("#sidebar").sidebar().sidebar("hide");

		$("#simple_text")[0].focus();

		$(document).click(function() {
			$("#simple_text").autocomplete("close");
		});

		view.initSearchOptions();
		onHashChange(null, true);
		$("body").animate({"opacity" : 1}, function() {
			$(this).css("opacity", "");
		});

//		$("body").css("opacity", 1)
//		view.updateSearchHistory();

		initTimeGraph();

	}, function() {
		c.log("failed to load some resource at startup.", arguments)
		$("body")
		.css({"opacity" : 1, padding : 20})
		.html('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg"> ')
		.append("<p>The server failed to respond, please try again later.</p>");
	});



	function initTimeGraph() {
		var time_comb = timeProxy.makeRequest(true);

		var time = timeProxy.makeRequest(false).done(function(data) {

			$.each(data, function(corpus, struct) {
				if(corpus !== "time") {
					var cor = settings.corpora[corpus.toLowerCase()];
					timeProxy.expandTimeStruct(struct);
					cor.time = struct;
					if(_.keys(struct).length > 1) {
						cor.struct_attributes.date_interval = {
								label : "date_interval",
								displayType : "date_interval",
								opts : settings.liteOptions
						};
					}
				}
			});
			$("#corpusbox").trigger("corpuschooserchange", [settings.corpusListing.getSelectedCorpora()]);
		});
		var timestruct;
		var all_timestruct;
		var restdata;
		var restyear;
		$.when(time_comb, time).then(function(combdata, timedata) {
//			c.log("combdata", combdata);
			all_timestruct = combdata[0];
//			c.log("all_timestruct", all_timestruct)

			$("#corpusbox").bind("corpuschooserchange", function(evt, data) {
				var output = _.chain(settings.corpusListing.selected)
				  .pluck("time")
				  .filter(Boolean)
				  .map(_.pairs)
				  .flatten(true)
				  .reduce(function(memo, val) {
				    var a = val[0], b = val[1];
				    if(typeof memo[a] == "undefined") memo[a] = b;
				    else memo[a] += b;
				    return memo;
				  }, {}).value();

//				c.log("keys length", timestruct);
				var max = _.reduce(all_timestruct, function(accu,item) {
					if(item[1] > accu) return item[1];
					return accu;
				}, 0);
//				c.log('max', max);

				// the 46 here is the presumed value of
				//the height of the graph
				var one_px = max / 46;
				c.log('one_px', one_px);
				function normalize(array) {
					return _.map(array, function(item) {
						var out = [].concat(item);
						if(out[1] < one_px && out[1] > 0) out[1] = one_px;
						return out;
					});
				}


				timestruct = timeProxy.compilePlotArray(output);

//				c.log('timestruct before', output);
//				c.log('timestruct', timestruct);

				var endyear = all_timestruct.slice(-1)[0][0];
				var yeardiff = endyear - all_timestruct[0][0];
				restyear =  endyear + (yeardiff / 25);
				restdata = _.chain(settings.corpusListing.selected)
				.filter(function(item) {
					return item.time;
				})
				.reduce(function(accu, corp) {
					return accu + parseInt(corp.time[''] || "0");
				}, 0).value();

//				all_timestruct.push([restyear, combdata[1]]);
//				timestruct.push([restyear, restdata, 0]);
				var plots = [{
	                	//color : "white",
	                	data : normalize([].concat(all_timestruct, [[restyear, combdata[1]]])),
	              	bars :   {
	              		fillColor : "lightgrey"
	              	}
	                },
	                {
	              	  //color : "white",
	              	  data : normalize(timestruct),
	              	  bars : {
	              		  fillColor : "navy"
	              	  }
	                }
	            ];
				if(restdata) {
					plots.push({
	                	  //color : "white",
	                	  data : normalize([[restyear, restdata]]),
	                	  bars : {
	                		  fillColor : "indianred"
	                	  }
	                  });
				}

				plot = $.plot($("#time_graph"), plots,
                   {
					bars : {show : true, fill : 1, align : "center"},

					grid: {
						hoverable : true,
						borderColor : "white"

					},
					//stack : true,
					yaxis : {
						show : false
					},
					xaxis : {
						show : true
					},
					hoverable : true,
					colors : ["lightgrey", "navy"]


               });
				// hack for hiding the red future restyear graph.
				$.each($("#time_graph .tickLabel"), function() {
					if(parseInt($(this).text()) > new Date().getFullYear())
						$(this).hide();
				});
			});

			function getValByDate(date, struct) {
				var output;
				$.each(struct, function(i, item) {
					if(date == item[0]) {
						output = item[1];
						return false;
					}
				});
				return output;
			}

			$("#time_graph,#rest_time_graph").bind("plothover", _.throttle(function(event, pos, item) {
				if(item) {
					c.log("hover", pos, item, item.datapoint);
					var date = item.datapoint[0];
					var header = $("<h4>");
					var val, total;
					if(date == restyear) {
						header.text(util.getLocaleString("corpselector_rest_time"));
						val = restdata;
						total = combdata[1];

					} else {
						header.text(util.getLocaleString("corpselector_time") + " " + item.datapoint[0]);
						val = getValByDate(date, timestruct);  //item.datapoint[1].toString()
						total = getValByDate(date, all_timestruct);  //item.datapoint[1].toString()
					}

//					var body = $("<span>");
					c.log("output", timestruct[item.datapoint[0].toString()]);

//					var firstrow = $("<p>").append($("<span>").html(prettyNumbers(total) + " " + util.getLocaleString("corpselector_tokens")))

					var pTmpl = _.template("<p><span rel='localize[<%= loc %>]'></span>: <%= num %> <span rel='localize[corpselector_tokens]' </p>");

					var firstrow = pTmpl({loc : 'corpselector_time_chosen', num : prettyNumbers(val || 0)});
					var secondrow = pTmpl({loc : 'corpselector_of_total', num : prettyNumbers(total)});

					var time = item.datapoint[0];

					$(".corpusInfoSpace").css({"top": $(this).parent().offset().top});
					$(".corpusInfoSpace").find("p")
					.empty()
					.append(header, "<span> </span>", firstrow, secondrow)
					.localize()
					.end()
					.fadeIn("fast");


				} else {
					$(".corpusInfoSpace").fadeOut("fast");
				}
			},100));


		});

		var opendfd = $.Deferred();
//		opendfd.resolve();
		$("#corpusbox").one("corpuschooseropen", function() {
			opendfd.resolve();
		});
		$.when(time_comb, time, opendfd).then(function() {
			$("#corpusbox").trigger("corpuschooserchange", [settings.corpusListing.getSelectedCorpora()]);
		});
	}


})();


