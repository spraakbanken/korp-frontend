var view = {};

view.SimpleSearch = function() {
	var self = this;
	$("#similar_lemgrams").hide();
	$("#simple_text").autocomplete({
		html : true,
		source: function( request, response ) {
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + request.term,
				dataType: "jsonp",
				success : function(lemArray) {
					lemArray.sort(function(first, second){
						if(first.split(".")[0] == second.split(".")[0])
							return parseInt(first.slice(-1)) - parseInt(second.slice(-1)); 
						return first.length - second.length;
					});
					$.log("success", lemArray);
					
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
			
			self.selectLemgram(selectedItem);
			
//				first, build a dropdown list of the results
			var optionElems = $.map($( "#simple_text" ).data("dataArray"), function(item) {
				return $.format("<option value='%(value)s'>%(label)s</option>", item);
			});
			$.log("lemgram_select", $("#lemgram_select"))
			$("#lemgram_select").remove();
			$("<select id='lemgram_select' />").appendTo("#korp-simple")
			.html(optionElems.join(""))
			.change(function(){
				self.selectLemgram($(this).val());
			})
			.val(selectedItem);
			
			
		},
		focus : function(event) {
			event.preventDefault();
		}
	});
//	TODO: remove this debug
//	this.selectLemgram("ge..vb.1");
};

view.SimpleSearch.prototype = {
		
		selectLemgram : function(lemgram) {
			var self = this;
//			var corpus = getCorpus() == "all" ? getAllCorpora() : getCorpus().toUpperCase();
			var corpus = getSelectedCorpora();
			$("#similar_lemgrams").empty();
			$("#similar_lemgrams").show();
			$("#result-container").tabs("option", "disabled", []);
			$.ajax({
				url: "http://demosb.spraakdata.gu.se/cgi-bin/korp/korp.cgi?" + util.corpusArrayToQuery(corpus),
				dataType: "jsonp",
				data : {
					command : "relations",
					lemgram : lemgram
				},
				success : function(data) {
					$.log("success", data);
					$("#results-lemgram").empty();
					if(data.relations){
						self.renderResults(lemgram, data.relations);
					}
					else {
						$("#results-lemgram").append($.format("<p><i rel='no_lemgram_results'>%s</i></p>", util.getLocaleString("no_lemgram_results")));
					}
				}
			});
			$.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/rel/json/" + lemgram,
				dataType: "jsonp",
				success : function(data) {
					$.log("related words success", data);
					
					$($.map(data, function(item, i){
						return $.format("<a href='javascript:void(0)' data-lemgram='%s'>%s</a>", [item, item.split(".")[0]]);
					}).join(" "))
					.click(function() {
						self.selectLemgram($(this).data("lemgram"));
					})
					.appendTo("#similar_lemgrams");
					$("#similar_lemgrams").prepend($.format("<p>%s</p>", util.getLocaleString("similar_header")));
					$("<div name='wrapper' style='clear : both;float: none;' />").appendTo("#similar_lemgrams");
					
				}
			});

			var cqp = lemgramProxy.lemgramSearch(lemgram);
			$("#cqp_string").val(cqp);
			$("#simple_text").val("");
		},
		
		renderHeader : function() {
			$.log("renderHeader", $("#results-lemgram"));
			var colorArray = ["color_blue", "color_purple", "color_green", "color_yellow", "color_azure", "color_red"];
			var $parent = $("<div id='lemgram_help' />").prependTo("#results-lemgram");
			
			$(".lemgram_result").each(function(i) {
				if($(this).data("rel")) {
					var color = colorArray.shift();
					$($.format("<span>%s</span>", $(this).data("rel")))
					.addClass(color)
					.appendTo($parent)
					.tooltip({
						delay : 600,
						bodyHandler : function() {
							return util.getLocaleString("tooltip_" + $(this).text());
						}
					})
					.mouseenter(function(event) {
//						$(".lemgram_result." + $(this).attr("class")).fadeTo("fast", 0.5, function() {
//							$(this).fadeTo("fast", 1);
//						});
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
			
			
		},
		
		renderResults : function (lemgram, data) {
			
//			"_" represents the actual word in the order
			var order = {
				vb : "SS,_,IO,OO,OA,RA,TA".split(","),
				nn : "AT,_,ET".split(","),
				av :"_,AT".split(",")
			};

			var wordClass = lemgram.split(".")[2].slice(0, 2);
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
					//	inplace sort, let's make sure the references aren't screwed up later.
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
			.click(function() {
				$("#dialog").remove();
				var $target = $(this);
				
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
				$.ajax({ url : settings.cgi_script + "?" + $.map($target.data("corpus").split(","), function(item) {return "corpus="+item;}).join("&"), 
					dataType: "jsonp", 
					data:{
						command:'query',
						cqp:cqp,
						start:0,
						end:999,
						context:'1 sentence',
						within : "sentence"
					},
					success: function(data) {
						$.log("success", data);
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
							}).join(" ").replace(/\s([\.,])/g, "$1"));
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
			});
			
			this.renderHeader();
			util.localize();
//			this.centerLemgramLabel();
			$('#results-wraper').show();
		},
		
		centerLemgramLabel : function() {
			$("#display_word").parent().css("margin-top", $(".lemgram_result").first().height()/2);
		}
		
};