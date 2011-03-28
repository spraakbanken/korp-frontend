var view = {};

//**************
// Search view objects
//**************

view.SimpleSearch = function() {
	this.prevLemgramRequest = null;
	var self = this;
	$("#simple_text").keyup(this.onSimpleChange);
	$("#similar_lemgrams").hide();
	$("#simple_text").autocomplete({
		html : true,
		source: function( request, response ) {
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + request.term,
				success : function(lemArray) {
					$.log("autocomplete success");
					lemArray.sort(function(first, second){
						if(first.split(".")[0] == second.split(".")[0])
							return parseInt(first.slice(-1)) - parseInt(second.slice(-1)); 
						return first.length - second.length;
					});
					
					var labelArray = util.lemgramArraytoString(lemArray);
					var listItems = $.map(lemArray, function(item, i) {
						return {
							label : labelArray[i],
							value : item,
							input : request.term
						};
					});
					
					$( "#simple_text" ).data("dataArray", listItems);
					response(listItems);
					if($( ".ui-autocomplete" ).height() > 300) {
						$( ".ui-autocomplete" ).addClass("ui-autocomplete-tall");
					}
					$("#autocomplete_header").remove();	
					$(".ui-autocomplete")
					.prepend("<li id='autocomplete_header' rel='localize[autocomplete_header]'/>")
					.find("li").first().text(util.getLocaleString("autocomplete_header")).css("font-weight", "bold").css("font-size", 10);
					
					$("#simple_text").preloader("hide");
				}
			});
		},
		search: function() {
			$("#simple_text").preloader({ 
				timeout: 500,
				position: {
					my: "right center",
					at: "right center",
					offset: "-1 2",
					collision: "none"
				}
			}).preloader("show");
		},
		minLength: 1,
		select: function( event, ui ) {
			event.preventDefault();
			var selectedItem = ui.item.value;
			$.log( selectedItem, ui.item.value, ui, event);
			
			self.renderSimilarHeader(selectedItem);
			self.selectLemgram(selectedItem);
		},
		focus : function(event) {
			event.preventDefault();
		}
	});
};

view.SimpleSearch.prototype = {
		
		selectLemgram : function(lemgram) {
			var self = this;
			var corpus = getSelectedCorpora();
			$("#similar_lemgrams a").remove();
			$("#similar_lemgrams").show();
			$("#result-container").tabs("option", "disabled", []);
			$.ajax({
				url: "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi",
				data : {
					command : "relations",
					lemgram : lemgram,
					corpus : $.map(corpus, function(item){return item.toUpperCase();}) 
				},
				beforeSend : function(jqXHR, settings) {
					$.log("before relations send", settings);
					self.prevLemgramRequest = settings;
					if($("#results-lemgram").is(":visible"))
						setJsonLink(settings);
				},
				success : function(data) {
					$.log("relations success", data);
					$("#results-lemgram").empty();
					if(data.relations){
						lemgramResults.renderResults(lemgram, data.relations);
					}
					else {
						lemgramResults.showNoResults();
					}
				}	
			});
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/rel/json/" + lemgram,
				success : function(data) {
					$.log("related words success", data);
					
					$($.map(data, function(item, i){
						return $.format("<a href='javascript:void(0)' data-lemgram='%s'>%s</a>", [item, item.split(".")[0]]);
					}).join(" "))
					.click(function() {
						self.selectLemgram($(this).data("lemgram"));
					})
					.appendTo("#similar_lemgrams");
					$("<div name='wrapper' style='clear : both;float: none;' />").appendTo("#similar_lemgrams");
					
				}
			});

			var cqp = lemgramProxy.lemgramSearch(lemgram);
			$("#cqp_string").val(cqp);
			$("#simple_text").val("");
		},
		
		renderSimilarHeader : function(selectedItem) {
			$.log("renderSimilarHeader");
			var self = this;
			$("#similar_header").empty();
			$("<p rel='localize[similar_header]' />").html(util.getLocaleString("similar_header"))
			.css("float", "left")
			.appendTo("#similar_header");
			
			
			if($( "#simple_text" ).data("dataArray")) {
				var optionElems = $.map($( "#simple_text" ).data("dataArray"), function(item) {
					return $.format("<option value='%(value)s'>%(label)s</option>", item);
				});
				$("<select id='lemgram_select' />").appendTo("#similar_header")
				.css("float", "right")
				.html(optionElems.join(""))
				.change(function(){
					self.renderSimilarHeader($(this).val());
					self.selectLemgram($(this).val());
				})
				.val(selectedItem);
			}
			$("<div name='wrapper' style='clear : both;' />").appendTo("#similar_header");
		},
		
		onSimpleChange : function() {
			var val;
			var lemgram = $("#simple_text").val().match(/\w+\.\.\w+\.\d/);
			if(lemgram) { // if the input is a lemgram, do semantic search.
				val = $.format('[(lex contains "%s")]', lemgram);
			} else {
				var valArray = $("#simple_text").val().split(" ");
				var cqp = $.map(valArray, function(item, i){
					return '[(word = "' + item + '")]';
				});
				val = cqp.join(" ");
			}
			$("#cqp_string").val(val);
		} 
		
};

//************
// Result view objects
//************


view.KWICResults = function() {
	if($.browser.mozilla) {
		var $select = $('<select name="num_hits" id="num_hits"></div>');
		$("#num_hits").replaceWith($select);
		
		$.each([25, 50, 75, 100], function(i, item) {
			$("<option />").attr("value", item).text(item).appendTo($select);
		});
		$select.val(25)
		.css("margin-right", 5)
		.change(function() {
			$.log("select", $(this).val());
		});
		
	}
};

view.KWICResults.prototype = {
	
	renderTable : function(data) {
		var self = this;
		if(data.ERROR) {
			$.error("json fetch error: " + $.dump(data.ERROR));
			$("#results-table").empty();
			$("#Pagination").empty();
			kwicResults.hidePreloader();
			return;
		} 
		if(!num_result) {
			buildPager(data.hits);
		}
		num_result = data.hits;
		$('#num-result').html(data.hits);
		if(!data.hits) {

			$.log("no kwic results");
			$("#results-table").empty();
			$("#Pagination").empty();
			kwicResults.hidePreloader();
			return;
		}				


		var effectSpeed = 100;
		if($.trim($("#results-table").html()).length) {
			$("#results").fadeOut(effectSpeed, function() {
				$("#results-table").empty();
				self.renderTable(data);
			});
			return;
		}
		else {
			$("#results").hide();
		}
		if($("#sidebar").css("right") == "0px" && !$("#result-container").tabs("option", "selected"))
			showSidebar();
		$.log("corpus_results");
		
		$.each(data.kwic, function(i,sentence){
			var offset = 0; 
//				if(sentence.match.start > 12)
//					offset = sentence.match.start-12;
		    var splitObj = {
		    		"left" : selectLeft(sentence, offset),
		    		"match" : selectMatch(sentence),
		    		"right" : selectRight(sentence)
		    };
		    
			$( "#sentenceTmpl" ).tmpl( splitObj, {rowIndex : i})
					.appendTo( "#results-table" )
					.find(".word")
					.click(function(event) {
							event.stopPropagation();
							util.SelectionManager.select($(this));
							var clickedWord = parseInt($(this).attr("name").split("-")[1]);
							var data = sentence.tokens[offset + clickedWord];
							updateSidebar(sentence.structs, data, sentence.corpus);
						}
							
					);
			
			$('.result_table tr:even').addClass('alt');
		});
//			make the first matched word selected by default.
		$(".match").children().first().click();
		$("#results").fadeIn(effectSpeed);
		
		kwicResults.centerScrollbar();
		kwicResults.hidePreloader();
	},
		
	centerScrollbar : function() {
		$.log("centerScrollbar", $("#sidebar:visible").outerWidth());
		if(!$(".match").first().length) return;
		$("#table_scrollarea").scrollLeft(0);
		var matchLeft = $(".match").first().position().left;
		var sidebarWidth = $("#sidebar").outerWidth() || 0;
		$("#table_scrollarea").scrollLeft(matchLeft - ($("body").innerWidth() - sidebarWidth ) / 2);
	},
		
	showPreloader : function() {
		$("<div class='spinner' />").appendTo("#result-container li:first")
		.spinner({innerRadius: 5, outerRadius: 7, dashes: 8, strokeWidth: 3});
	},
	hidePreloader : function() {
		$(".spinner").remove();
	}

};

view.LemgramResults = function() {
};

view.LemgramResults.prototype = {
		
		renderHeader : function(wordClass) {
			$.log("renderHeader", $("#results-lemgram"));
			var colorArray = ["color_blue", "color_purple", "color_green", "color_yellow", "color_azure", "color_red"];
			var $parent = $("<div id='lemgram_help' />").prependTo("#results-lemgram");
			
			$(".lemgram_result").each(function(i) {
				if($(this).data("rel")) {
					var color = colorArray.shift();
					$($.format("<span>%s</span>", wordClass == "av" ? util.getLocaleString("head") : $(this).data("rel")))
					.addClass(color)
					.appendTo($parent)
					.tooltip({
						delay : 600,
						bodyHandler : function() {
							return util.getLocaleString("tooltip_" + $(this).text());
						}
					})
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
		
		renderResults : function (lemgram, data) {
			var self = this;
//			"_" represents the actual word in the order
			var order = {
				vb : "SS,_,IO,OO,OA,RA,TA".split(","),
				nn : "AT,_,ET".split(","),
				av :"_,AT".split(",")
			};
			var wordClass = lemgram.split(".")[2].slice(0, 2);
			
			if(order[wordClass] == null) {
				lemgramResults.showNoResults();
				return;
			}
			
			$.log("wordClass", lemgram, wordClass);
			var relMapping = {};
			var sortedList = [];
			$.each(data, function(index, item) {
				var toIndex = $.inArray(item.rel, order[wordClass]);
				if(toIndex == -1) {
					$.log("getting rel index failed for " + item.rel);
					return;
				}
				if(!sortedList[toIndex]) sortedList[toIndex] = [];
				sortedList[toIndex].push(item); 
			});
			
			$.each(sortedList, function(index, list) {
				if(list) {
					list.sort(function(first, second) {
						return second.freq - first.freq;
					});
				}
			});
			var toIndex = $.inArray("_", order[wordClass]);
			sortedList.splice(toIndex, 0, {"word" : util.lemgramToString(lemgram).split(" ")[0]});
			sortedList = $.grep ( sortedList, function(item, index){
				return Boolean(item);
			});
			
			$("#lemgramRowTmpl").tmpl(sortedList, {lemgram : lemgram, wordClass : wordClass})
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
				$(this).html(util.lemgramToString($(this).data("lemgram"), hasHomograph));
				
			});
			$("#results-lemgram .wordclass_suffix").hide();
				
			this.renderHeader(wordClass);
			$('#results-wraper').show();
			util.localize();
		},
		
		onClickExample : function(event) {
			$("#dialog").remove();
			var self = this;
			this.showPreloader();
			var $target = $(event.currentTarget);
			
			$.log("clicked data", $target.data());
			
			var tmpl = '((a:[(%(dep)s) & (deprel = "%(rel)s")] []* [(%(lemgram)s) & (ref = a.dephead)])' + 
				'| (b:[(%(lemgram)s)] []* [(%(dep)s) & (deprel = "%(rel)s") & (dephead = b.ref)]))';
			var lemgram_query = $.format('lex contains "%s"', $target.data("head")); 
			var dep_query = $.format('lex contains "%s"', $target.data("dep"));
			
			if(!util.isLemgramId($target.data("head"))) {
				lemgram_query = $.format('word="%s" & pos = "%s"', $target.data("head").split("_"));
			}
			else if(!util.isLemgramId($target.data("dep"))) {
				dep_query = $.format('word="%s" & pos = "%s"', $target.data("dep").split("_"));
			}
			
			var cqp = $.format(tmpl, {
				lemgram : lemgram_query, 
				dep : dep_query,  
				rel : $target.data("rel")
				});
			$.ajax({ url : settings.cgi_script, // + "?" + $.map($target.data("corpus").split(","), function(item) {return "corpus="+item;}).join("&") 
				data:{
					command:'query',
					cqp:cqp,
					start:0,
					end:999,
					corpus : $target.data("corpus").split(","),
					context:'1 sentence',
					within : "sentence"
				},
				success: function(data) {
					$.log("success", data);
					self.hidePreloader();
					if(data.ERROR) {
						$.error($.dump(data));
						return;
					}
					
					var pElems = $.map(data.kwic, function(sentence) {
						return $.format("<li>%s</li>", $.map(sentence.tokens, function(token, i) {
							var prefix = postfix = "";
							if(sentence.match.start == i)
								prefix = "<b>";
							else if(sentence.match.end == (i+1))
								postfix = "</b>";
							return prefix + token.word + postfix;
						}).join(" ").replace(/\s([\.,\:])/g, "$1"));
					}).join("\n");
					
					$($.format("<div id='dialog' title='%s'></div>", util.getLocaleString("example_dialog_header")))
					.appendTo("#results-lemgram").append("<ol />")
					.dialog({
						width : 600,
						height : 500
					})
					.find("ol").html(pElems);
				}
			});
		},
		
		showNoResults : function() {
			$("#results-lemgram")
			.append($.format("<p><i rel='localize[no_lemgram_results]'>%s</i></p>", util.getLocaleString("no_lemgram_results")));
		},
		
		hideWordclass : function() {
			$("#results-lemgram td:first-child").each(function() {
				$(this).html($.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" ")))
			});
		},
		
		showPreloader : function() {
			$("<div class='spinner' />").appendTo("#result-container li:last")
			.spinner({innerRadius: 5, outerRadius: 7, dashes: 8, strokeWidth: 3});
		},
		hidePreloader : function() {
			$(".spinner").remove();
		}
		
};


