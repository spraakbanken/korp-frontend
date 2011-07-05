//************
// Result view objects
//************

view.disableTab = function(index) {
	if($("#result-container").tabs("option", "selected") == index) {
		$.log("iscurrentselected")
		$("#result-container li:first > a").trigger("change");
	}
	$("#result-container").tabs("disable", index);
};

var BaseResults = {
	initialize : function(tabSelector, resultSelector) {
		this.$tab = $(tabSelector);
		this.$result = $(resultSelector);
		this.index = this.$tab.index();
	},
	
	renderResult : function(data) {
		if(data.ERROR) {
			this.resultError(data);
			return false;
		}
		var self = this;
        //$("#result-container").tabs("select", 0);
        var disabled = $("#result-container").tabs("option", "disabled");
        var newDisabled = $.grep(disabled, function(item) {
        	return item != self.$tab.index();
        });
        $("#result-container").tabs("option", "disabled", newDisabled);
	},
	
	resultError : function(data) {
		$.log("json fetch error: " + $.dump(data.ERROR));
		this.hidePreloader();
	},
	
	showPreloader : function() {
		this.hidePreloader();
		$("<div class='spinner' />").appendTo(this.$tab)
		.spinner({innerRadius: 5, outerRadius: 7, dashes: 8, strokeWidth: 3});
	},
	hidePreloader : function() {
		this.$tab.find(".spinner").remove();
	}
};

view.BaseResults = new Class(BaseResults);
delete BaseResults;

var KWICResults = {
	Extends : view.BaseResults,
	initialize : function(tabSelector, resultSelector) {
		var self = this;
		this.parent(tabSelector, resultSelector);
		this.initHTML = this.$result.html();
		this.num_result = 0;
		this.current_page = 0;
		this.selectionManager = new util.SelectionManager();
		if(!Modernizr.inputtypes.number) {
			var $select = $('<select class="num_hits"></div>');
			this.$result.find(".num_hits").replaceWith($select);
			
			$.each([25, 50, 75, 100], function(i, item) {
				$("<option />").attr("value", item).text(item).appendTo($select);
			});
			$select.val(25)
			.css("margin-right", 5);
		}
		
		this.$result.click(function(){
			if(!self.selectionManager.hasSelected()) return;
			self.selectionManager.deselect();
			$.sm.send("word.deselect");
		});
	},
	
	resultError : function(data) {
		this.parent(data);
		this.$result.find(".results_table").empty();
		this.$result.find(".pagination").empty();
		this.$result.find(".results_table").html($.format("<i>There was a CQP error: <br/>%s:</i>", data.ERROR.traceback.join("<br/>")));
	},
	
	onentry : function() {
		this.centerScrollbar();
		$.log("onentry", this.keyListener);
		$(document).keydown($.proxy(this.onKeydown, this));
	},
	
	onexit : function() {
		$(document).unbind("keydown", this.onKeydown);
	},
	
	onKeydown : function(event) {
		if($("input[type=text], textarea").is(":focus")) return;
		
		switch(event.which) {
		case 78: // n
			this.$result.find(".pagination .next").click();
			return false;
		case 70: // f
			this.$result.find(".pagination .prev").click();
			return false;
		}
		
		if(!this.selectionManager.hasSelected()) return;
	    switch(event.which) {
			case 38: //up
				this.selectUp();
				return false;
			case 39: // right
				this.selectNext();
				return false;
			case 37: //left
				this.selectPrev();
				return false;
			case 40: // down
				this.selectDown();
				return false;
	    }
	},
		
	renderResult : function(data) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		var self = this;
		
		if(!this.num_result) {
			this.buildPager(data.hits);
		}
		this.num_result = data.hits;
		this.$result.find('.num-result').html(data.hits);
		if(!data.hits) {

			$.log("no kwic results");
			this.$result.find(".results_table").empty();
			this.$result.find(".pagination").empty();
			this.hidePreloader();
			return;
		}				


		var effectSpeed = 100;
		if($.trim(this.$result.find(".results_table").html()).length) {
			this.$result.fadeOut(effectSpeed, function() {
				$(this).find(".results_table").empty();
				self.renderResult(data);
			});
			return;
		}
//		else {
//			$("#results-kwic").css("opacity", 0);
//		}
		$.log("corpus_results", data.kwic);
		//$("#results-kwic").show();
		$.each(data.kwic, function(i,sentence) { 
			var offset = 0; 
		    var splitObj = {
		    		"left" : self.selectLeft(sentence, offset),
		    		"match" : self.selectMatch(sentence),
		    		"right" : self.selectRight(sentence)
		    };
			var rows = $( "#sentenceTmpl" ).tmpl( splitObj, {rowIndex : i, aligned : sentence.aligned})
					.appendTo( self.$result.find(".results_table") )
					.find(".word")
					.click(function(event) {
						event.stopPropagation();
						self.onWordClick($(this), sentence);
						$.sm.send("word.select");
						
					}).end();
					
			if(i % 2 == 0) {
				rows.css("background-color", settings.primaryColor);
			}
			
		});
		$.each([",", ".", ";", ":", "!", "?"], function(i, item) {
			$($.format(".word:contains(%s)", item)).prev().html('');
		});
		
//		$("#attrlistTmpl").tmpl(data.kwic)
//		.appendTo("#attrlist")
		
		this.$result.find(".match").children().first().click();
		this.$result.fadeIn(effectSpeed);
		
		this.centerScrollbar();
		this.hidePreloader();
	},
	
	onWordClick : function(word, sentence) {
		var data = word.tmplItem().data;
		
		this.selectionManager.select(word);
		updateSidebar(sentence.structs, data, sentence.corpus);
	},
	
	selectLeft : function(sentence, offset) {
		return sentence.tokens.slice(offset, sentence.match.start);
	},

	selectMatch : function(sentence) {
		var from = sentence.match.start;
		return sentence.tokens.slice(from, sentence.match.end);
	},

	selectRight : function(sentence) {
		var from = sentence.match.end;
		var len=sentence.tokens.length;
		var to = len;
		
		return sentence.tokens.slice(sentence.match.end, to);
	},
	
	buildPager : function(number_of_hits){
		var items_per_page = this.$result.find(".num_hits").val();
		if(number_of_hits > items_per_page){
			this.$result.find('.pagination').unbind();
			this.$result.find(".pagination").pagination(number_of_hits, {
				items_per_page : items_per_page, 
				callback : $.proxy(this.handlePaginationClick, this),
				next_text: util.getLocaleString("next"),
				prev_text: util.getLocaleString("prev"),
				link_to : "javascript:void(0)",
				num_edge_entries : 2,
				ellipse_text: '..',
				current_page : $.bbq.getState("page", true) || 0
			});
			this.$result.find(".next").attr("rel", "localize[next]");
			this.$result.find(".prev").attr("rel", "localize[prev]");
			
		}else{
			this.$result.find(".pagination").html('');
		}
	},
	
	handlePaginationClick : function(new_page_index, pagination_container) {
		$.log("handlePaginationClick", new_page_index, this.current_page);
		if(new_page_index != this.current_page) {
			var items_per_page = parseInt(this.$result.find(".num_hits").val());
			
//			var cqp 	= kwicProxy.prevRequest.cqp;
			var opts = {};
			opts.cqp 	= this.$result.find(".pagination").data("cqp");
			
			opts.start = new_page_index*items_per_page;
			opts.end = (opts.start + items_per_page);
			opts.queryData = kwicProxy.queryData;
			$.log("pagination request", opts);		
			kwicProxy.makeRequest(opts);
			this.current_page = new_page_index;
			$.bbq.pushState({"page" : this.current_page});
		}
	    
	   return false;
	},
	
	setPage : function(page) {
		this.$result.find(".Pagination").trigger('setPage', [page]);
	},
		
	centerScrollbar : function() {
		if(!this.$result.find(".match").first().length) return;
		this.$result.find(".table_scrollarea").scrollLeft(0);
		var matchLeft = this.$result.find(".match").first().position().left;
		var sidebarWidth = $("#sidebar").outerWidth() || 0;
		this.$result.find(".table_scrollarea").scrollLeft(matchLeft - ($("body").innerWidth() - sidebarWidth ) / 2);
	},
		
	
	getCurrentRow : function() {
		var tr = this.$result.find(".token_selected").closest("tr");
		if(this.$result.find(".token_selected").parent().is("td")) {
			return tr.find("td > .word");
		} else {
			return tr.find("div > .word");
		}
	},
	
	selectNext : function() {
		var i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0));
		var next = this.getCurrentRow().get(i+1);
		if(next == null) return;
		$(next).click();
	},
	selectPrev : function() {
		var i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0));
		if(i == 0) return;
		var prev = this.getCurrentRow().get(i-1);
		$(prev).click();
	},
	selectUp : function() {
		var prevMatch = this.selectionManager.selected.closest("tr").prevAll(".sentence:first").find(".match span:first");
		prevMatch.click();
	},
	
	selectDown : function() {
		var nextMatch = this.selectionManager.selected.closest("tr").nextAll(".sentence:first").find(".match span:first");
		nextMatch.click();
	}
	

};

var LemgramResults = {
	Extends : view.BaseResults,
//	initialize : function(tabSelector, resultSelector) {
//		$.log("initialize", this.parent)
//		this.parent.initialize(tabSelector, resultSelector);
//	},
	
	renderResult : function(data, lemgram) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		$("#results-lemgram").empty();
		if(data.relations){
			this.renderTables(lemgram, data.relations);
		}
		else {
			this.showNoResults();
		}
		
	},
	
	renderHeader : function(wordClass) {
		$.log("renderHeader", $("#results-lemgram"));
		var colorMapping = {
				SS : "color_blue", 
				OBJ : "color_purple", 
				ADV : "color_green", 
				Head : "color_yellow", 
				AT : "color_azure", 
				ET : "color_red"};
		var $parent = $("<div id='lemgram_help' />").prependTo("#results-lemgram");
		
		$(".lemgram_result").each(function(i) {
			if($(this).data("rel")) {
				var color = colorMapping[$(this).data("rel")];
				$("<span />").localeKey(wordClass == "av" ? "head" : "malt_" + $(this).data("rel"))
				.addClass(color)
				.appendTo($parent)
//				.tooltip({
//					delay : 600,
//					bodyHandler : function() {
//						return util.getLocaleString("tooltip_" + $(this).text());
//					}
//				})
				.mouseenter(function(event) {
					$(".lemgram_result." + $(this).attr("class")).addClass("lemgram_highlight");
				})
				.mouseleave(function() {
					$(".lemgram_result." + $(this).attr("class")).removeClass("lemgram_highlight");
				});
				$(this).addClass(color)
				.css("border-color", $(this).css("background-color"));
			}
			else {
				$($.format("<span><b>%s</b></span>", $(this).data("word")))
				.appendTo($parent);
			}
				
		});
		$("</label><input id='wordclassChk' type='checkbox' /><label rel='localize[show_wordclass]' for='wordclassChk'>").appendTo($parent)
		.change(function() {
			if($(this).is(":checked")) {
				$("#results-lemgram .wordclass_suffix").show();
			}
			else {
				$("#results-lemgram .wordclass_suffix").hide();
			}
		
		}).filter("label").css("margin-left", "5px");
		
		util.localize();
	},
	
	renderTables : function (lemgram, data) {
		var self = this;
//			"_" represents the actual word in the order
		var order = {
			vb : "SS,_,OBJ,ADV".split(","),
			nn : "AT,_,ET".split(","),
			av :"_,AT".split(",")
		};
		var wordClass = util.splitLemgram(lemgram)[1].slice(0, 2);
		
		if(order[wordClass] == null) {
			this.showNoResults();
			return;
		}
		
		var sortedList = [];
		$.each(data, function(index, item) {
			var toIndex = $.inArray(item.rel, order[wordClass]);
			if(toIndex == -1) {
//				$.log("getting rel index failed for " + item.rel);
				return;
			}
			if(!sortedList[toIndex]) sortedList[toIndex] = [];
			sortedList[toIndex].push(item); 
		});
		
		$.each(sortedList, function(index, list) {
			if(list) {
				list.sort(function(first, second) {
					return second.mi - first.mi;
				});
			}
		});
		var toIndex = $.inArray("_", order[wordClass]);
		sortedList.splice(toIndex, 0, {"word" : lemgram.split("..")[0].replace(/_/g, " ")});
		sortedList = $.grep ( sortedList, function(item, index){
			return Boolean(item);
		});
		
		$("#lemgramRowTmpl").tmpl(sortedList, {lemgram : lemgram, isAdj : wordClass == "av"})
		.appendTo("#results-lemgram")
		.addClass("lemgram_result")
		.find("#example_link").addClass("ui-icon ui-icon-document")
		.css("cursor", "pointer")
		.click($.proxy(this.onClickExample, this));
		
		// splits up the label
		$("#results-lemgram td:first-child").each(function() {
			var $siblings = $(this).parent().siblings().find("td:first-child");
			
			var siblingLemgrams = $.map($siblings, function(item) {
				return $(item).data("lemgram").slice(0, -1);
			});
			var hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) != -1;
			var prefix = $(this).data("depextra").length ? $(this).data("depextra") + " " : "";
//				prefix = "";
			$(this).html(prefix + util.lemgramToString($(this).data("lemgram"), hasHomograph));
			
		});
		$("#results-lemgram .wordclass_suffix").hide();
			
		this.renderHeader(wordClass);
		//$('#results-wrapper').show();
		this.hidePreloader();
	},
	
	onClickExample : function(event) {
//		$("#dialog").remove();
		var self = this;
//		this.showPreloader();
		var $target = $(event.currentTarget);
		$.log("onClickExample", $target);
		new model.ExamplesProxy().makeRequest({
			ajaxParams : {
				head : $target.data("head"),
				dep : $target.data("dep"),
				rel : $target.data("rel"),
				depextra : $target.data("depextra"),
				corpus : $target.data("corpus").split(",")
			},
			success : function(data) {
				$.sm.send("request_examples", data);
			}
		});
		
		return;
		$.ajax({ url : settings.cgi_script, 
			data:{
				command : 'relations_sentences',
				head : $target.data("head"),
				dep : $target.data("dep"),
				rel : $target.data("rel"),
				depextra : $target.data("depextra"),
				corpus : $target.data("corpus").split(",")
//				context : "1 sentence",
//				defaultContext : "1 sentence"
			},
			success: function(data) {
				$.log("example success", data);
				self.hidePreloader();
				if(data.ERROR) {
					$.error($.dump(data));
					return;
				} else if(data.hits == 0) {
					$.log("An error has occurred: no results from example, head: " + $target.data("head"));
					var pElems = $("<i>An error occurred while fetching examples.</i>");
				} else {
//					$("#result-container").korptabs("addTab", "#custom_tab", "Custom");
//					
//					$(kwicResults.initHTML).appendTo("#custom_tab");
					$.sm.send("request_examples", data);
					
					
					
//					new view.KWICResults('#result-container li:last', '#custom_tab').renderResult(data);
				}		
//					return;
//					
//					var pElems = $.map(data.kwic, function(sentence) {
//						return $.format("<li>%s</li>", $.map(sentence.tokens, function(token, i) {
//							var prefix = postfix = "";
//							if(sentence.match.start == i)
//								prefix = "<b>";
//							else if(sentence.match.end == (i))
//								postfix = "</b>";
//							return prefix + token.word + postfix;
//						}).join(" ").replace(/\s([\.,\:])/g, "$1"));
//					}).join("\n");
//				}
//				
//				
//				$($.format("<div id='dialog' title='%s'></div>", util.getLocaleString("example_dialog_header")))
//				.appendTo("#results-lemgram").append("<ol />")
//				.dialog({
//					width : 600,
//					height : 500
//				})
//				.find("ol").html(pElems);
			}
		});
	},
	
	showNoResults : function() {
		this.hidePreloader();
		$("#results-lemgram")
		.append($("<i />").localeKey("no_lemgram_results"));
	},
	
	hideWordclass : function() {
		$("#results-lemgram td:first-child").each(function() {
			$(this).html($.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" ")));
		});
	}
	
};

formatOutput = function(x) { // Use "," instead of "." if Swedish
	return x.replace(".",",");
};

function newDataInPie(dataName, horizontalDiagram) {
	var dataItems = new Array();
	
	var wordArray = [];
	var corpusArray = [];
	
		
	statsResults["lastDataName"] = dataName;
	
	
	if (horizontalDiagram) { // hits/corpus
		
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			if(dataName == "SIGMA_ALL") {
				// ∑ selected
				var totfreq = 0;
				$.each(obj["relative"], function(wordform, freq) {
					var numFreq = parseFloat(freq);
					if(numFreq)
						totfreq += numFreq;
				});
				dataItems.push({"value":totfreq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + totfreq, "shape_id":"sigma_all"});
			} else {
				// Individual wordform selected
				
				var freq = parseFloat(obj["relative"][dataName]);
				if (freq) {
					dataItems.push({"value":freq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + freq, "shape_id":dataName});
				} else {
					dataItems.push({"value":0, "caption" : "", "shape_id" : dataName});
				}
			}
		});
		
		$("#dialog").remove();
		
		var topheader;
		var locstring;
		if(dataName == "SIGMA_ALL") {
			topheader = util.getLocaleString("statstable_hitsheader_lemgram");
			locstring = "statstable_hitsheader_lemgram";
		} else {
			topheader = util.getLocaleString("statstable_hitsheader") + "<i>" + dataName + "</i>";
			locstring = "statstable_hitsheader";
		}
		
		var absString = util.getLocaleString("statstable_absfigures");
		var relString = util.getLocaleString("statstable_relfigures");
		var relHitsString = util.getLocaleString("statstable_relfigures_hits");
		$($.format('<div id="dialog" title="' + topheader + '"></div>'))//util.getLocaleString("example_dialog_header")))
							.appendTo("#results-lemgram").append('<p style="text-align:center"><a class="statsAbsRelNumbers" id="statsRelNumbers" href="javascript:void(0)" rel="localize[statstable_relfigures]">' + relString + '</a> | <a class="statsAbsRelNumbers" id="statsAbsNumbers" href="javascript:void(0)" rel="localize[statstable_absfigures]">' + absString + '</a></p><div id="chartFrame" style="height:80%;"></div><p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">' + relHitsString + '</p>')
							.dialog({
								width : 400,
								height : 500,
								resize: function(){stats2Instance.pie_widget("resizeDiagram",$(this).width()-60);},
								resizeStop: function(event, ui) {
									var w = $(this).dialog("option","width");
									var h = $(this).dialog("option","height");
									if(this.width*1.25 > this.height) {
										$(this).dialog("option","height", w*1.25);
									} else {
										$(this).dialog("option","width", h*0.80);
									}
									stats2Instance.pie_widget("resizeDiagram",$(this).width()-60);
								}

							});
		stats2Instance = $('#chartFrame').pie_widget({container_id: "chartFrame", data_items: dataItems, bar_horizontal: false, diagram_type: 0});
		
		
		
		
		$(".statsAbsRelNumbers").click(function() {
			var typestring;
			if ($(this).attr("id") == "statsAbsNumbers")
				typestring = "absolute";
			else
				typestring = "relative";
				
			var dataItems = new Array();
			var dataName = statsResults["lastDataName"];
			
			$.each(statsResults.savedData["corpora"], function(corpus, obj) {
				if(dataName == "SIGMA_ALL") {
					// ∑ selected
					var totfreq = 0;
					$.each(obj[typestring], function(wordform, freq) {
						if (typestring == "absolute")
							var numFreq = parseInt(freq);
						else
							var numFreq = parseFloat(freq);
						if(numFreq)
							totfreq += numFreq;
					});
					dataItems.push({"value":totfreq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + totfreq, "shape_id":"sigma_all"});
				} else {
					// Individual wordform selected
					
					if(typestring == "absolute")
						var freq = parseInt(obj[typestring][dataName]);
					else
						var freq = parseFloat(obj[typestring][dataName]);
					if (freq) {
						dataItems.push({"value":freq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + freq, "shape_id":dataName});
					} else {
						dataItems.push({"value":0, "caption" : "", "shape_id" : dataName});
					}
				} 
			});
			stats2Instance.pie_widget("newData", dataItems);
			
			if(typestring == "absolute") {
				$("#hitsDescription").text(util.getLocaleString("statstable_absfigures_hits"));
				$("#hitsDescription").attr({"rel" : "localize[statstable_absfigures_hits]"});
			} else {
				$("#hitsDescription").text(util.getLocaleString("statstable_relfigures_hits"));
				$("#hitsDescription").attr({"rel" : "localize[statstable_relfigures_hits]"});
			}
		});
		
		
		
	} else { // hits/wordform
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			if(corpus == "time") return;
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
	
		$(".statstable").css({"background-color":"white"});
		if(dataName == "all") {
			
			$.each(statsResults.totalForWordform, function(key, fvalue) {
				dataItems.push({"value":fvalue, "caption" : wordArray[key], "shape_id" : wordArray[key]});
			});
			$(".statstable__all").css({"background-color":"#EEEEEE"});
			
		} else {
			$.each(statsResults.savedData["corpora"], function(corpus, obj) {
				if(corpus == dataName) {
					//$.each(obj, function(word, freq) {
					//	dataItems.push({"value":freq, "caption": word + ": " + freq, "shape_id" : word});
					//});
					$.each(wordArray, function(key, fvalue) {
						var freq = obj["relative"][fvalue];
						if (freq) {
							dataItems.push({"value":parseFloat(obj["relative"][fvalue]), "caption" : fvalue, "shape_id" : fvalue});
						} else {
							dataItems.push({"value":0, "caption" : fvalue, "shape_id" : fvalue});
						}
					});
					return false; // break it
				}
			});
			$(".statstablecorpus__" + dataName).css({"background-color":"#EEEEEE"});
		}
		
		statsResults.selectedCorpus = dataName;
		diagramInstance.pie_widget("newData", dataItems);
		
	//diagramInstance = $('#circle_diagram').pie_widget({container_id: "circle_diagram", data_items: dataItems});
	}
}


var StatsResults = {
	Extends : view.BaseResults,
//	initialize : function(tabSelector, resultSelector) {
//	},
	
	renderResult : function(data) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		
		//$("#results-stats").children().empty();
		
		var wordArray = [];
		var corpusArray = [];
		
		var absdata;
		var reldata;
		
		$.each(data["corpora"], function(corpus, obj) {
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
		
		if(!$.all($.map(data["corpora"], function(item) { //if data only contains empty objects, display message
			return !$.isEmptyObject(item);
		}))) {
			this.showNoResults();
			return;
		}
		
		this["savedWordArray"] = wordArray;
		
		//$("#results-wraper").show();
		//$("#statTableTmpl").tmpl(data["corpora"], {wordArray : wordArray, corpusArray : corpusArray})
		//.appendTo("#results-stats");
		
		var totalForWordform = [];
		var totalForWordformAbs = [];
		$.each(wordArray, function(key, fvalue) {
			totalForWordform.push(0);
			totalForWordformAbs.push(0);
		});
		var totalForCorpus = [];
		var totalForCorpusAbs = [];
		$.each(corpusArray, function(key, fvalue) {
			totalForCorpus.push(0);
			totalForCorpusAbs.push(0);
		});
		
		
		var dataItems = new Array();
		var dummy;
		var firstIteration = true;
		var bc = 0;
		$.each(data["corpora"], function(corpus, obj) {
			var c = 0;
			$.each(wordArray, function(key, fvalue) {
				
				if(obj["relative"])
					var rel_freq = obj["relative"][fvalue];
				if(obj["absolute"])
					var abs_freq = obj["absolute"][fvalue];
				
				if (rel_freq) {
					totalForWordform[c] += parseFloat(rel_freq);
					totalForWordformAbs[c] += abs_freq;
					totalForCorpus[bc] += parseFloat(rel_freq);
					totalForCorpusAbs[bc] += abs_freq;
				}
						
				c++;
			});

			
			if(firstIteration) // ändra sen så att "alla" blir default
				dummy = corpus;
			firstIteration = false;
			bc++;
		});
		
		this.totalForWordform = totalForWordform;
		
		this.selectedCorpus = dummy;
		$(".statstablecorpus__" + this.selectedCorpus).css({"background-color":"#EEEEEE"});

		// Make Left Stats Table --------------------------------------------------------- //
		
		var leftHTML = '<table class="statisticWords"><th style="height:60px;"><span style="color:white">-<br/>-</span></th>';
		$.each(wordArray, function(key, fvalue) {
			leftHTML += '<tr style="height:26px"><td><a class="searchForWordform">' + fvalue + '</a> <a class="wordsName" id="wordstable__' + fvalue + '" href="javascript:void(0)"><img src="img/stats2.png" style="border:0px"/></a></td></tr>';
		});
		leftHTML += '<tr><td>∑ <a class="wordsName" id="wordstableTotal" href="javascript:void(0)"><img src="img/stats2.png" style="border:0px"/></a></td></tr></table>';
		
		function makeEllipsis(str) {
			if(str.length > 18) {
				return str.substr(0,14) + "...";
			} else {
				return str;
			}
		}
		
		$("#leftStatsTable").html(leftHTML);
		
		
		// Make Right Stats Table -------------------------------------------------------- //
		
		var theHTML = '<table style="border-collapse:collapse;border-spacing:0px;border-style:hidden"><th><i><span id="statsAllCorporaString">Samtliga</span></i><br/><a class="corpusNameAll" href="javascript:void(0)"><img src="img/stats.png" style="border:0px"/></a></th>';
		$.each(corpusArray, function(key, fvalue) {
			theHTML += '<th style="height:60px" class="corpusTitleClass"><a class="corpusTitleHeader" id="corpusTitleHeader__' + fvalue + '">' + makeEllipsis(settings.corpora[fvalue.toLowerCase()]["title"]).replace(new RegExp(" ", "gi"),"&nbsp;").replace(new RegExp("-","gi"),"&#8209;") + '</a><br/><a class="corpusName" id="corpustable__' + fvalue + '" href="javascript:void(0)"><img src="img/stats.png" style="border:0px"/></a></th>'; // ___/ /g___ Funkar inte ordentligt i Chrome!
		});
		var c = 0;
		var totalForAllWordforms = 0;
		var totalForAllWordformsAbs = 0;
		$.each(wordArray, function(key, fvalue) {
			theHTML += '<tr style="height:26px; width:60px;">';
			// First the value for ALL corpora
			var relTotForWordform = data["total"]["relative"][fvalue];
			var absTotForWordform = data["total"]["absolute"][fvalue];
			theHTML += '<td id="totcorpus__' + fvalue + '" class="statstable statstable__all">' + formatOutput(relTotForWordform.toFixed(1)) + '&nbsp;<span class="absStat">(' + formatOutput(absTotForWordform.toString()) + ")</span></td>";
			totalForAllWordforms += relTotForWordform;
			totalForAllWordformsAbs += absTotForWordform;
			//theHTML += '<td id="totcorpus_' + c + '" class="statstable">' + formatOutput(totalForWordform[c].toFixed(1)) + '&nbsp;<span class="absStat">(' + totalForWordformAbs[c] + ")</span></td>";
			// Then for each corpus seperately
			$.each(corpusArray, function(gkey, gvalue) {
				var rel_hits = data["corpora"][gvalue]["relative"][fvalue];
				var abs_hits = data["corpora"][gvalue]["absolute"][fvalue];
				
				if (rel_hits) {
					rel_hits = parseFloat(rel_hits);
					theHTML += '<td id="statstable__' + gvalue + '__' + fvalue + '" class="statstable statstablecorpus__' + gvalue +'"><a href="javascript:void(0)" class="relStat searchForWordformInCorpus">' + formatOutput(rel_hits.toFixed(1)) + '&nbsp;</a><a href="javascript:void(0)" class="absStat searchForWordformInCorpus">(' + abs_hits + ')</a></td>';
				} else {
					theHTML += '<td class="statstable statstablecorpus__' + gvalue + '"></td>';
				}
			});
			theHTML += '</tr>';
			c++;
		});
		
		//sum = function(o) { // Helper Method
		//	for(var s = 0, i = o.length; i; s += o[--i]);
		//	return s;
		//};
		
		theHTML += '<tr class="sumOfCorpora"><td>' + totalForAllWordforms.toFixed(1) + '&nbsp;<span class="absStat">(' + totalForAllWordformsAbs + ')</span></td>';
		$.each(totalForCorpus, function(key, fvalue) {
			theHTML += '<td>' + formatOutput(fvalue.toFixed(1)) + '&nbsp;<span class="absStat">(' + totalForCorpusAbs[key] + ')</span></td>';
		});
		theHTML += '</tr></table>';

		$("#rightStatsTable").html(theHTML);
		// $("#hp_corpora_title2").attr({"rel" : 'localize[' + header_text_2 + ']'});
		$("#statsAllCorporaString").attr({"rel" : "localize[statstable_allcorpora]"});
		
		$("#export_area").append('<a href="javascript:void(0)" class="export_csv" id="export_csv_rel"><img src="img/csvrel.png"></a> <a href="javascript:void(0)" class="export_csv" id="export_csv_abs"><img src="img/csvabs.png"></a>');
		
		$("#rightStatsTable").css("max-width", $("#rightStatsTable").parent().width() - ($("#leftStatsTable").width() + $("#stats1_diagram").width() + 20));
		
		
		$("#exportButton").click(function() {
			var selVal = $("#kindOfData option:selected").val();
			var selType = $("#kindOfFormat option:selected").val();
			var dataDelimiter = ";";
			if (selType == "TSV")
				dataDelimiter = "\t";
			// if ($(this).attr('id') == "export_csv_abs")
			//	datatype = "absolute";
			//else
			//	datatype = "relative";
				
			// Generate CSV from the data
			
			
			var output = "corpus" + dataDelimiter;
			$.each(statsResults.savedWordArray, function(key, aword) {
				output += aword + dataDelimiter;
			});
			output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
			
			$.each(statsResults.savedData["corpora"], function(key, acorpus) {
				output += settings.corpora[key.toLowerCase()]["title"] + dataDelimiter;
				$.each(statsResults.savedWordArray, function(wkey, aword) {
					var amount = acorpus[selVal][aword];
					if(amount)
						output += amount + dataDelimiter;
					else
						output += "0" + dataDelimiter;
				});
				output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
			});
			window.open( "data:text/csv;charset=utf-8," + escape(output));
		});
		
		
	
		//$(".statstable__all").css({"background-color":"#EEEEEE"});
		
		$(".searchForWordform").click(function() {
			//util.searchHash("cqp", '[(word = "' + $(this).text() + '") & (lex contains "' + $("#simple_text").data("lemgram") + '")]');
			$.bbq.pushState({search : "cqp|" + '[(lex contains "' + $("#simple_text").data("lemgram") + '") & (word = "' + $(this).text() + '" %c)]'});
		});
		
		$(".searchForWordformInCorpus").click(function() {
			//util.searchHash("cqp", '[(word = "' + $(this).text() + '") & (lex contains "' + $("#simple_text").data("lemgram") + '")]');
			var parts = $(this).parent().attr("id").split("__");
			$.bbq.pushState({search : "cqp|" + '[(lex contains "' + $("#simple_text").data("lemgram") + '") & (word = "' + parts[2] + '" %c)]', corpus : parts[1].toLowerCase()});
		});
		
		$(".corpusTitleHeader").click(function() {
			//util.searchHash("cqp", '[(word = "' + $(this).text() + '") & (lex contains "' + $("#simple_text").data("lemgram") + '")]');
			var parts = $(this).attr("id").split("__");
			//$.bbq.pushState({corpus : parts[1].toLowerCase(), search: "lemgram|" + '[(lex contains "' + $("#simple_text").data("lemgram") + '")]'});
			$.bbq.pushState({corpus : parts[1].toLowerCase()});
			simpleSearch.selectLemgram($("#simple_text").data("lemgram"));
		});
		
		$(".statstable").tooltip({
			delay : 80,
			bodyHandler : function() {
				var relString = util.getLocaleString("statstable_relfreq");
				var absString = util.getLocaleString("statstable_absfreq");
				if(!$(this).attr('id'))
					return relString + "<br/><b>0</b><br>" + absString + "<br/><b>0</b>";
				var parts = $(this).attr('id').split("__");
				if(parts.length == 3) {
					var hoveredCorpus = parts[1];
					var hoveredWord = parts[2];
					var relFreq = statsResults.savedData["corpora"][hoveredCorpus]["relative"][hoveredWord];
					if(!relFreq)
						relFreq = 0;
					var absFreq = statsResults.savedData["corpora"][hoveredCorpus]["absolute"][hoveredWord];
					return relString + "<br/><b>" + formatOutput(relFreq.toString()) +"</b><br/>" + absString + "<br/><b>" + absFreq + "</b>";
				} else if (parts.length == 2) {
					// Left total
					return relString + "<br/><b>" + statsResults.savedData["total"]["relative"][parts[1]] + "</b><br/>" + absString + "<br/><b>" + statsResults.savedData["total"]["absolute"][parts[1]] + "</b>";
					//return "relativ frekvens (per en miljon ord):<br/><b>" + formatOutput(totalForWordform[parts[1]].toString()) + "</b><br/>absolut frekvens:<br/><b>" + totalForWordformAbs[parts[1]] + "</b>";
				} else {
					return relString + "<br/><b>0</b><br>" + absString + "<br/><b>0</b>";
				}
			}
		});
		
		$(".corpusTitleHeader").tooltip({
			delay : 80,
			bodyHandler : function() {
				//return "test";
				return settings.corpora[$(this).attr('id').split("__")[1].toLowerCase()]["title"];
			}
		});



		// Make Bar Diagram ------------------------------------------------------- //
		
//		$("#stats1_diagram").height(parseInt($("#rightStatsTable").css("height"))-$(".corpusTitleClass").height()-$(".sumOfCorpora").height()-7);
//		$("#statsBubble").height(parseInt($("#rightStatsTable").css("height"))-$(".corpusTitleClass").height()-$(".sumOfCorpora").height()-7);
		
		$.each(totalForWordform, function(key, fvalue) {
			dataItems.push({"value":fvalue, "caption" : wordArray[key], "shape_id" : wordArray[key]});
		});
		
		
		diagramInstance = $('#stats1_diagram').pie_widget({container_id: "stats1_diagram", data_items: dataItems});
		
		
		$(".corpusName").click(function(e) {
			var parts = $(this).attr("id").split("__");
			newDataInPie(parts[1],false);
			$("#statsBubble").fadeIn();
			$("#statsBubble").css({"background-color":"white", "display": "block", "left": $(this).parent().offset().left + $(this).parent().width()+1, "top": $(this).parent().position().top + $(this).parent().height()+6});
			// Johan: H4CK3D UR C0DE!!!!.
			diagramInstance.find("svg").attr("height", 1000);
			e.stopPropagation();
		});
		

		
		$(".corpusNameAll").click(function(e) {
			newDataInPie("all",false);
			$("#statsBubble").css({"background-color":"white", "display": "block", "left": $(this).parent().offset().left + $(this).parent().width()+1, "top": $(this).parent().position().top + $(this).parent().height()+7});
			$("#stats1_diagram").height(parseInt($("#rightStatsTable").height())-$(".corpusTitleClass").height()-$(".sumOfCorpora").height()-7);
			$("#statsBubble").fadeIn();
			$("#statsBubble").css({"background-color":"white", "display": "block", "left": $(this).parent().offset().left + $(this).parent().width()+1, "top": $(this).parent().position().top + $(this).parent().height()+6});
			// Johan: H4CK3D UR C0DE!!!!.
			diagramInstance.find("svg").attr("height", 1000);
			e.stopPropagation();
		});
		
		$(".wordsName").click(function() {
			var parts = $(this).attr("id").split("__");
			if(parts.length == 2)
				newDataInPie(parts[1],true);
			else { // The ∑ row
				newDataInPie("SIGMA_ALL",true);
			}

		});
		
		$(window).unbind('click.statistics');
			$(window).bind('click.statistics', function() { clearStatisticsBars(); });
		$("#rightStatsTable").unbind('scroll');
			$("#rightStatsTable").bind('scroll', function() { clearStatisticsBars(); });
		$("#result-container").bind('tabsselect', function() { clearStatisticsBars(); });
		
		function clearStatisticsBars() {
			var disp = $("#statsBubble").css("display");
				if(disp != "none") {
					$("#statsBubble").fadeOut('fast');
				}
				$(".statstable").css({"background-color":"white"});
		}
		
		
		// ------------------------------------------------------------------------ //
		
		$(".statstable").hover(function() {
			if(!$(this).attr('id'))
					return;
			var currItem = $(this).attr('id');
			var parts = currItem.split("__");
			if (parts[1] == statsResults.selectedCorpus) {
				diagramInstance.pie_widget("highlightArc",parts[2]);
			}
		}, function() {
			if(!$(this).attr('id'))
					return;
			var currItem = $(this).attr('id');
			var parts = currItem.split("__");
			if (parts[1] == statsResults.selectedCorpus) {
				diagramInstance.pie_widget("deHighlightArc",parts[2]);
			}
		});
		//$("#results-stats").append($("<div />").css("clear", "both"));
		
		this.hidePreloader();
		
	},
	
	showError : function() {
		this.hidePreloader();
		$("<i/>")
		.localeKey("error_occurred")
		.appendTo("#results-stats");
	},
	
	showNoResults : function() {
		this.hidePreloader();
		$("<i/>")
		.localeKey("no_stats_results")
		.appendTo("#results-stats");
	}
	
};

view.KWICResults = new Class(KWICResults);
view.LemgramResults = new Class(LemgramResults);
view.StatsResults = new Class(StatsResults);
delete KWICResults;
delete LemgramResults;
delete StatsResults;