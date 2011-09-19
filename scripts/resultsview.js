//************
// Result view objects
//************

view.disableTab = function(index) {
	$.log("disableTab", index);
	if($("#result-container").korptabs("option", "selected") == index) {
		$.log("iscurrentselected")
		$("#result-container li:first > a").trigger("click");
	}
	$("#result-container").korptabs("disable", index);
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
        var disabled = $("#result-container").korptabs("option", "disabled");
        var newDisabled = $.grep(disabled, function(item) {
        	return item != self.$tab.index();
        });
        $("#result-container").korptabs("option", "disabled", newDisabled);
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
		this.prevCQP = null;
		this.parent(tabSelector, resultSelector);
		this.initHTML = this.$result.html();
		this.proxy = kwicProxy;
		this.current_page = 0;
		this.selectionManager = new util.SelectionManager();
		if(this.$result.find(".num_hits").val() == null)
			this.$result.find(".num_hits").get(0).selectedIndex = 0;
		this.$result.find(".num_hits").bind("change", $.proxy(this.onHpp, this)).click(false);
		
		this.$result.click(function(){
			if(!self.selectionManager.hasSelected()) return;
			self.selectionManager.deselect();
			$.sm.send("word.deselect");
		});
		$.log("initialize", this.$result.find(".sort_select"), this.$result);
		this.$result.find(".sort_select").change(this.onSortChange).click(false);
		
	},
	
	resultError : function(data) {
		this.parent(data);
		this.$result.find(".results_table").empty();
		this.$result.find(".pager-wrapper").empty();
		this.$result.find(".results_table").html($.format("<i>There was a CQP error: <br/>%s:</i>", data.ERROR.traceback.join("<br/>")));
	},
	
	onSortChange : function() {
		var opt = $(this).find(":selected");
		$.log("sort", opt);
		if(opt.is(":first-child")) {
			$.bbq.removeState("sort");
		} else {
			$.log("sort", $(this).val());
			$.bbq.pushState({"sort" : $(this).val()});
		}
	},
	
	onentry : function() {
		this.centerScrollbar();
		$.log("onentry");
		$(document).keydown($.proxy(this.onKeydown, this));
	},
	
	onexit : function() {
		$(document).unbind("keydown", this.onKeydown);
	},
	
	onHpp : function(event) {
		$.bbq.pushState({hpp : $(event.currentTarget).val()});
		return false;
	},
	
	onKeydown : function(event) {
		var isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey;
		if(isSpecialKeyDown || $("input[type=text], textarea").is(":focus")) return;
		
		switch(event.which) {
		case 78: // n
			this.$result.find(".pager-wrapper .next").click();
			return false;
		case 70: // f
			this.$result.find(".pager-wrapper .prev").click();
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
	
	getPageInterval : function(page) {
		$.log("getPageInterval", this.$result.find(".num_hits").val());
		var items_per_page = parseInt(this.$result.find(".num_hits").val());
		var output = {};
		output.start = (page || 0) * items_per_page;
		output.end = (output.start + items_per_page) - 1;
		return output;
	},
		
	renderResult : function(data, sourceCQP) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		var self = this;
		this.prevCQP = sourceCQP;
		
		//$.log(data);
		
		if(!data.hits) {

			$.log("no kwic results");
			this.showNoResults();
			return;
		}
		this.$result.find(".sort_select").show();
		this.renderHitsPicture(data);
		

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
		$.log("corpus_results");
		//$("#results-kwic").show();
		
		this.$result.find('.num-result').html(prettyNumbers(data.hits.toString()));
		this.buildPager(data.hits);
		
		var colorMapping = {};
		$.each(data.corpus_order, function(i, corpus) {
			colorMapping[corpus] = util.colors.getNext();
		});
		
		var corpusOrderArray = $.grep(data.corpus_order, function(corpus) {
			return data.corpus_hits[corpus] > 0;
		});
		
		var punctArray = [",", ".", ";", ":", "!", "?"];
		var borderColor = util.changeColor(settings.primaryColor, -15);
		var prevCorpus = "";
		var table = self.$result.find(".results_table");
		$.each(data.kwic, function(i,sentence) {
			var offset = 0; 
		    var splitObj = {
		    		"left" : self.selectLeft(sentence, offset),
		    		"match" : self.selectMatch(sentence),
		    		"right" : self.selectRight(sentence)
		    };
		    
		    if(prevCorpus != sentence.corpus) {
		    	$($.format("<tr><td /><td class='corpus_title' colspan='1'><span class='corpus_title_span'>%s</span></td><td /></tr>", settings.corpora[sentence.corpus.toLowerCase()].title )).appendTo(table);
		    }
		    
		    prevCorpus = sentence.corpus;
			var rows = $( "#sentenceTmpl" ).tmpl( splitObj, {rowIndex : i, aligned : sentence.aligned})
					.appendTo( table )
					.find(".word")
					.each(function() {
						if($.inArray($(this).text(), punctArray) != -1)
							$(this).prev().html("");
					})
					.click(function(event) {
						event.stopPropagation();
						self.onWordClick($(this), sentence);
						$.sm.send("word.select");
						
					}).end();
			
			var color = i % 2 == 0 ? settings.primaryColor : settings.primaryLight;
//			color = $.inArray(sentence.corpus, corpusOrderArray) % 2 == 0 ? color : util.changeColor(color, 15);
			if($.inArray(sentence.corpus, corpusOrderArray) % 2 != 0) {
//				color = util.changeColor(color, 15);
				rows.addClass("odd_corpus");
			} else {
				rows.addClass("even_corpus");
			}
			 
			rows.css("background-color", color);
			rows.css("border-color", borderColor);
			
			
//			if(i % 2 == 0) {
////				rows.addClass(colorMapping[sentence.corpus]);
//				rows.css("background-color", settings.primaryColor);
//				
//			} else {
////				rows.addClass(colorMapping[sentence.corpus] + "_light");
//				rows.css("background-color", settings.primaryLight);
//			}
			
		});
		
		this.$result.find(".match").children().first().click();
		this.$result.fadeIn(effectSpeed, function() {
			self.setupPagerMover();
			self.centerScrollbar();
		});
		
		this.hidePreloader();

    },
	
    showNoResults : function() {
    	this.$result.find(".results_table").empty();
		this.$result.find(".pager-wrapper").empty();
		this.hidePreloader();
		this.$result.find('.num-result').html(0);
		this.$result.click();
		this.$result.find(".sort_select").hide();
		$("#hits_picture").html("");
    },
    
    renderHitsPicture : function(data) {
    	var self=this;
		if (getSelectedCorpora().length > 1) {
			var totalhits = data["hits"];
			var hits_picture_html = '<table class="hits_picture_table"><tr height="18px">';
			var barcolors = ["color_blue","color_purple","color_green","color_yellow","color_azure","color_red"];
			var ccounter = 0;
			var corpusOrderArray = $.grep(data.corpus_order, function(corpus) {
				return data.corpus_hits[corpus] > 0;
			});
            $.each(corpusOrderArray, function(index, corp) {
            	var hits = data["corpus_hits"][corp];
            	var color = index % 2 == 0 ? settings.primaryColor : settings.primaryLight;
				hits_picture_html += $.format('<td class="hits_picture_corp" data="%s" style="width:%s%;background-color : %s"></td>', [corp, hits/totalhits*100, color]); //'%;background-color:#EEEEEE"></td>';
//				hits_picture_html += '<td class="hits_picture_corp" data="' + corp + '" style="width:' + hits/totalhits*100 +'%;color="' + color + ';"></td>'; //'%;background-color:#EEEEEE"></td>';
//				ccounter = ++ccounter % 6;
			});
			hits_picture_html += '</tr></table>';
			$("#hits_picture").html(hits_picture_html);
                        
			// Make sure that there is no mousover effect on touch screen devices:
			if( navigator.userAgent.match(/Android/i) ||
					navigator.userAgent.match(/webOS/i)   ||
					navigator.userAgent.match(/iPhone/i)  ||
					navigator.userAgent.match(/iPod/i)
			) {
				$(".hits_picture_table").css("opacity","1");
			}


			hoverHitPictureConfig = {
				sensitivity: 3, interval: 100, timeout: 800,
				over: function() {                
//					$(".hits_picture_table").find("td").each(function() {
						//if ($(this).css("background-color") != "rgb(128, 128, 128)")
//							$(this).css({"background-color":""});
//					});
//                    $(".hits_picture_table").stop().animate({"opacity":"1"},400);
				},
				out: function() {
//                    $(".hits_picture_table").stop().animate({"opacity":".3"});  
				}
			};
			$(".hits_picture_table").hoverIntent(hoverHitPictureConfig);


			$(".hits_picture_corp").each(function() {
				var corpus_name = $(this).attr("data");
				$(this).tooltip({delay : 0, bodyHandler : function() {
					return '<img src="img/korp_icon.png" style="vertical-align:middle"/> <b>' + settings.corpora[corpus_name.toLowerCase()]["title"] + ' (' + prettyNumbers(data["corpus_hits"][corpus_name].toString()) + ' ' + util.getLocaleString("hitspicture_hits") + ')</b><br/><br/><i>' + util.getLocaleString("hitspicture_gotocorpushits") + '</i>';}
				});
			});

			// Click to ge to the first page with a hit in the particular corpus
			$(".hits_picture_corp").click(function(event) {
				var theCorpus = $(this).attr("data");
				// Count the index of the first hit for the corpus:
				var firstIndex = 0;
				$.each(data["corpus_order"], function(index, corp) {
					if(corp == theCorpus)
						return false;
					firstIndex += data["corpus_hits"][corp];
				});
				var firstHitPage = Math.floor(firstIndex / $("#num_hits").val());
				self.handlePaginationClick(firstHitPage, null, true);
				return false;
			});
		} else {
			$("#hits_picture").html("");
		}
    },
    
	scrollToShowWord : function(word) {
		var offset = 200;
		var wordTop = word.offset().top;
		var newY = window.scrollY;
		if(wordTop > $(window).height() + window.scrollY)
			newY += offset; 
		else if(wordTop < window.scrollY) {
			newY -= offset; 
		}
		$('html, body').stop(true, true).animate({"scrollTop" : newY});
		
		var wordLeft = word.offset().left;
		var area = this.$result.find(".table_scrollarea");

		var newX = parseInt(area.scrollLeft());
		if(wordLeft > (area.offset().left + area.width())) {
			newX += offset; 
		}
		else if(wordLeft < area.offset().left) {
			newX -= offset; 
		}
		area.stop(true, true).animate({"scrollLeft" : newX});
	},
	
	onWordClick : function(word, sentence) {
		var data = word.tmplItem().data;
		var i = Number(data.dephead);
		var aux = $(word.closest("tr").find(".word").get(i - 1));
		this.selectionManager.select(word, aux);
		
		this.scrollToShowWord(word);
		
		$("#sidebar").sidebar("updateContent", sentence.structs, data, sentence.corpus);
		$("#columns").height($("#sidebar").height());
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
		var len = sentence.tokens.length;
		
		return sentence.tokens.slice(from, len);
	},
	
	buildPager : function(number_of_hits){
		$.log("buildPager", this.current_page);
		var items_per_page = this.$result.find(".num_hits").val();
		this.movePager("up");
		$.onScrollOut("unbind");
		this.$result.find('.pager-wrapper').unbind().empty();
		
		if(number_of_hits > items_per_page){
			this.$result.find(".pager-wrapper").pagination(number_of_hits, {
				items_per_page : items_per_page, 
				callback : $.proxy(this.handlePaginationClick, this),
				next_text: util.getLocaleString("next"),
				prev_text: util.getLocaleString("prev"),
				link_to : "javascript:void(0)",
				num_edge_entries : 2,
				ellipse_text: '..',
				current_page : this.current_page || 0
			});
			this.$result.find(".next").attr("rel", "localize[next]");
			this.$result.find(".prev").attr("rel", "localize[prev]");
			
		}
	},
	
	handlePaginationClick : function(new_page_index, pagination_container, force_click) {
		$.log("handlePaginationClick", new_page_index, this.current_page);
		if(new_page_index != this.current_page || !!force_click) {
			
			this.showPreloader();
			this.current_page = new_page_index;
			this.makeRequest();
			$.bbq.pushState({"page" : new_page_index});
		}
	    
	   return false;
	},
	
	buildQueryOptions : function() {
		var opts = {};
		opts.cqp = this.prevCQP;
		opts.queryData = this.proxy.queryData;
		opts.sort = this.$result.find(".sort_select").val();
		return opts;
	},
	
	makeRequest : function(page_num) {
		this.proxy.makeRequest(this.buildQueryOptions(), page_num || this.current_page);
	},
	
	setPage : function(page) {
		this.$result.find(".pager-wrapper").trigger('setPage', [page]);
	},
		
	centerScrollbar : function() {
		var m = this.$result.find(".match:first"); 
		if(!m.length) return;
		var area = this.$result.find(".table_scrollarea").scrollLeft(0);
		var match = m.first().position().left + m.width() / 2;
		var sidebarWidth = $("#sidebar").outerWidth() || 0;
		area.stop(true, true).scrollLeft(match - ($("body").innerWidth() - sidebarWidth ) / 2);
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
		var current = this.selectionManager.selected;
		var prevMatch = this.getWordAt(current.offset().left + current.width()/2, current.closest("tr").prevAll(".sentence").first());
		prevMatch.click();
	},
	selectDown : function() {
		var current = this.selectionManager.selected;
		var nextMatch = this.getWordAt(current.offset().left + current.width()/2, current.closest("tr").nextAll(".sentence").first());
		nextMatch.click();
	},
	
	getWordAt : function(xCoor, $row) {
		var output = $();
		$row.find(".word").each(function() {
			output = $(this); 
			var thisLeft = $(this).offset().left;
			var thisRight = $(this).offset().left + $(this).width();
			if((xCoor > thisLeft && xCoor < thisRight) || thisLeft > xCoor ) {
				return false;
			}
		});
		return output;
	},
	
	setupPagerMover : function() {
		var self = this;
		var pager = this.$result.find(".pager-wrapper");
		var upOpts = {
			point : pager.offset().top + pager.height(),
			callback : function() {
				self.movePager("up");
			}
		};
		self.movePager("down");
		var downOpts = {
			point : pager.offset().top + pager.height(),
			callback : function() {
				self.movePager("down");
			}
		};
		self.movePager("up");
		$.log("onscrollout", upOpts.point, downOpts.point);
		$.onScrollOut(upOpts, downOpts);
	},
	
	movePager : function(dir) {
		var pager = this.$result.find(".pager-wrapper");
		if(dir == "down") {
			pager.data("prevPos", pager.prev()).appendTo(this.$result);
		} else {
			if(pager.data("prevPos")) {
				pager.data("prevPos").after(pager);
			}
		}
	}
};

view.KWICResults = new Class(KWICResults);
delete KWICResults;


var ExampleResults = {
	Extends : view.KWICResults,
	
	initialize : function(tabSelector, resultSelector) {
		this.parent(tabSelector, resultSelector);
		this.proxy = new model.ExamplesProxy();
//		this.$result.find(".num_hits").parent().hide();
	},
	
	makeRequest : function(opts) {
		var self = this;
		$.extend(opts, {
			success : function(data) {
				$.log("ExampleResults success", data);
				self.renderResult(data);
				util.setJsonLink(self.proxy.prevRequest);
			},
			error : function() {
				self.hidePreloader()
			}
		});
		this.showPreloader();
		this.proxy.makeRequest(opts);
	},
	
	onHpp : function() {
		//refresh search
		this.handlePaginationClick(0, null, true);
		return false;
	},
	
	handlePaginationClick : function(new_page_index, pagination_container, force_click) {
		$.log("handlePaginationClick", new_page_index, this.current_page);
		if(new_page_index != this.current_page || !!force_click) {
			var items_per_page = parseInt(this.$result.find(".num_hits").val());
			
			var opts = {};
			opts.cqp = this.prevCQP;
			
			opts.start = new_page_index*items_per_page;
			opts.end = (opts.start + items_per_page);
			opts.sort = this.$result.find(".sort_select").val();
			this.current_page = new_page_index;
			this.makeRequest(opts);
		}
	    
	   return false;
	},
	
	showPreloader : function() {
		this.parent();
		this.$tab.find(".spinner").css("padding-left", 8);
		this.$tab.find(".tabClose").hide();
	},
	hidePreloader : function() {
		this.parent();
		this.$tab.find(".tabClose").show();
	}
	
};


var LemgramResults = {
	Extends : view.BaseResults,
	initialize : function(tabSelector, resultSelector) {
		this.parent(tabSelector, resultSelector);
		this.resultDeferred = $.Deferred();
		
	},
	
	renderResult : function(data, lemgram) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		$("#results-lemgram").empty();
		if(data.relations){
			this.renderTables(lemgram, data.relations);
			this.resultDeferred.resolve();
		}
		else {
			this.showNoResults();
			this.resultDeferred.reject();
		}
		
	},
	
	renderHeader : function(wordClass) {
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
				.appendTo($parent);
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
		$("#results-lemgram td:nth-child(2)").each(function() {
			var $siblings = $(this).parent().siblings().find("td:nth-child(2)");
			
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
		var self = this;
		var $target = $(event.currentTarget);
		$.log("onClickExample", $target);
		
		var instance = $("#result-container").korptabs("addTab", view.ExampleResults);
		var opts = instance.getPageInterval();
		opts.ajaxParams = {
				head : $target.data("head"),
				dep : $target.data("dep"),
				rel : $target.data("rel"),
				depextra : $target.data("depextra"),
				corpus : $target.data("corpus").split(",")
			};  
		instance.makeRequest(opts);
	},
	
	showWarning : function() {
		var hasWarned = !!$.jStorage.get("lemgram_warning");
//		var hasWarned = false;
		if(!hasWarned) {
			$.jStorage.set("lemgram_warning", true);
			$("#sidebar").sidebar("show", "lemgramWarning");
			self.timeout = setTimeout(function() {
				$("#sidebar").sidebar("hide");
			}, 5000);
		}
	},
	
	onentry : function() {
		$.log("lemgramResults.onentry", $.sm.getConfiguration());
		this.resultDeferred.done(this.showWarning);
	},
	
	onexit : function() {
		clearTimeout(self.timeout);
		$("#sidebar").sidebar("hide");
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



function newDataInGraph(dataName, horizontalDiagram, targetDiv) {
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
				dataItems.push({"value":totfreq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString()), "shape_id":"sigma_all"});
			} else {
				// Individual wordform selected
				var freq = parseFloat(obj["relative"][dataName]);
				if (freq) {
					dataItems.push({"value":freq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString()), "shape_id":dataName});
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
		$($.format('<div id="dialog" title="' + topheader + '"></div>'))
		.appendTo("#results-lemgram").append('<br/><div id="statistics_switch" style="text-align:center"><a href="javascript:" rel="localize[statstable_relfigures]" data-mode="relative">Relativa tal</a><a href="javascript:" rel="localize[statstable_absfigures]" data-mode="absolute">Absoluta tal</a></div><div id="chartFrame" style="height:380"></div><p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">' + relHitsString + '</p>')
		.dialog({
			width : 400,
			height : 500,
			resize: function(){
				$("#chartFrame").css("height",$("#chartFrame").parent().width()-20);
				stats2Instance.pie_widget("resizeDiagram",$(this).width()-60);},
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

		}).css("opacity", 0);
		$("#dialog").fadeTo(400,1);
		$("#dialog").find("a").blur(); // Prevents the focus of the first link in the "dialog"
		stats2Instance = $('#chartFrame').pie_widget({container_id: "chartFrame", data_items: dataItems, bar_horizontal: false, diagram_type: 0});
		statsSwitchInstance = $("#statistics_switch").radioList({
			change : function() {
				var typestring = statsSwitchInstance.radioList("getSelected").attr("data-mode");

				var dataItems = new Array();
				var dataName = statsResults["lastDataName"];

				$.each(statsResults.savedData["corpora"], function(corpus, obj) {
					if(dataName == "SIGMA_ALL") {
						// sigma selected
						var totfreq = 0;
						$.each(obj[typestring], function(wordform, freq) {
							if (typestring == "absolute")
								var numFreq = parseInt(freq);
							else
								numFreq = parseFloat(freq);
							if(numFreq)
								totfreq += numFreq;
						});
						dataItems.push({"value":totfreq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString(),false), "shape_id":"sigma_all"});
					} else {
						// Individual wordform selected
						if(typestring == "absolute")
							var freq = parseInt(obj[typestring][dataName]);
						else
							freq = parseFloat(obj[typestring][dataName]);
						if (freq) {
							dataItems.push({"value":freq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString(),false), "shape_id":dataName});
						} else {
							dataItems.push({"value":0, "caption" : "", "shape_id" : dataName});
						}
					} 
				});
				stats2Instance.pie_widget("newData", dataItems);

				if(typestring == "absolute") {
					$("#hitsDescription").text(util.getLocaleString("statstable_absfigures_hits")).attr({"rel" : "localize[statstable_absfigures_hits]"});
				} else {
					$("#hitsDescription").text(util.getLocaleString("statstable_relfigures_hits")).attr({"rel" : "localize[statstable_relfigures_hits]"});
				}
			},
			selected : 0
		});


	} else { // hits/wordform
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
	
		// Abstrahera avsnittet nedan vid tillfälle!
		$(".statstable").css({"background-color":"white"});
		if(dataName == "all") {
			
				$.each(wordArray, function(key, fvalue) {
					var freq = statsResults.savedData["total"]["relative"][fvalue];
					if (freq) {
						dataItems.push({"value":freq, "caption" : fvalue, "shape_id" : fvalue});
					} else {
						dataItems.push({"value":0, "caption" : key, "shape_id" : key});
					}
				});
			
		} else {
			$.each(statsResults.savedData["corpora"], function(corpus, obj) {
				if(corpus == dataName) {
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
			
		}
		
		statsResults.selectedCorpus = dataName;
		
		if (targetDiv) {
			
			var offset = -1;
			if ($.browser.webkit)
				offset = 3;
	
			$(".barContainerClass").find("svg").attr("width", 0);
			var targetDivID = '#' + targetDiv;
			diagramInstance = $(targetDivID).pie_widget({container_id: targetDiv, data_items: dataItems});
			diagramInstance.find("svg").attr("height", $("#actualRightStatsTable").height()-70);
			
			
		
			if(typeof(selected_statisticsbars_corpus) != "undefined") {
				if (targetDiv.split("__")[1] == selected_statisticsbars_corpus.attr("id").split("__")[1]) {
					// The same statistics bar icon was clicked as before
					if (!rollingOccupied) {
						rollingOccupied = true;
						var ssc = $(selected_statisticsbars_corpus)
						ssc.css({"width": $(selected_statisticsbars_corpus).width()});
						ssc.children().animate({"width": "0px"});
						ssc.animate({"width": "0px"});
						ssc.fadeOut("fast",function(){rollingOccupied = false;});
						selected_statisticsbars_corpus = undefined;
					}
				} else {
					// A new statistics bar icon was clicked
					if (!rollingOccupied) {
						rollingOccupied = true;
						ssc = $(selected_statisticsbars_corpus)
						ssc.css({"width": $(selected_statisticsbars_corpus).width()});
						ssc.children().animate({"width": "0px"});
						ssc.animate({"width": "0px"});
						ssc.fadeOut("fast");
						var tdi = $(targetDivID);
						tdi.css({"padding-top": $(".corpusTitleClass").height()+offset, "width": "1px"});
						tdi.find("svg").attr("width", 200);
						tdi.parent().css({"visibility":"visible", "display": "table-cell"});
						tdi.animate({"width": "200px"});
						if(targetDiv.split("__")[1] == "all")
							$(".statstable__all").animate({"background-color":"#F3F3F3"},"slow");
						else
							$(".statstablecorpus__" + targetDiv.split("__")[1]).animate({"background-color":"#F3F3F3"},"slow");
						selected_statisticsbars_corpus = $(targetDivID).parent();
						rollingOccupied = false;
					}
				}
			} else {
				if (!rollingOccupied) {
					rollingOccupied = true;
					tdi = $(targetDivID);
					tdi.css({"padding-top": $(".corpusTitleClass").height()+offset, "width": "1px"});
					tdi.find("svg").attr("width", 200);
					tdi.parent().css({"visibility":"visible", "display": "table-cell"});
					tdi.animate({"width": "200px"});
					if(targetDiv.split("__")[1] == "all")
						$(".statstable__all").animate({"background-color":"#F3F3F3"},"slow");
					else
						$(".statstablecorpus__" + targetDiv.split("__")[1]).animate({"background-color":"#F3F3F3"},"slow");
					selected_statisticsbars_corpus = $(targetDivID).parent();
					rollingOccupied = false;
				}
			}	
		} else {
			diagramInstance.pie_widget("newData", dataItems);
		}
	}
}


var StatsResults = {
	Extends : view.BaseResults,
//	initialize : function(tabSelector, resultSelector) {
//	},
	
	renderResult : function(columns, data) {
		statsResults.savedData = data;
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		var options = {
			enableCellNavigation: false,
            enableColumnReorder: true
            
		};
		var dataView = new Slick.Data.DataView();
		
		
		var grid = new Slick.Grid($("#myGrid"), dataView.rows, columns, options);
		this.grid = grid;
		this.resizeGrid();
//		grid.autosizeColumns();
		
		// wire up model events to drive the grid
		dataView.onRowCountChanged.subscribe(function(args) {
			grid.updateRowCount();
            grid.render();
		});
		var selectedRowIds = [];
		dataView.onRowsChanged.subscribe(function(rows) {
			grid.removeRows(rows);
			grid.render();

			if (selectedRowIds.length > 0)
			{
				// since how the original data maps onto rows has changed,
				// the selected rows in the grid need to be updated
				var selRows = [];
				for (var i = 0; i < selectedRowIds.length; i++)
				{
					var idx = dataView.getRowById(selectedRowIds[i]);
					if (idx != undefined)
						selRows.push(idx);
				}

				grid.setSelectedRows(selRows);
			}
		});
		var sortCol = columns[1];
		
		function sort(a,b) {
			if(sortCol.field == "hit_value")
				var x = a[sortCol.field], y = b[sortCol.field];
			else
				var x = a[sortCol.field].absolute, y = b[sortCol.field].absolute;
				
			return (x == y ? 0 : (x > y ? 1 : -1));
		}
		
		grid.onSort = function (col, sortAsc) {
			sortCol = col;
			dataView.sort(sort, sortAsc);
		};
        
        dataView.beginUpdate();
		dataView.setItems(data);
		dataView.setFilter(function(item) {
			return true;
		});
		dataView.endUpdate();
//		dataView.refresh();
//		grid.refresh();
		
		$(".slick-header-column:nth(1)").click().click();
		
		this.hidePreloader();
	},
	
	resizeGrid : function() {
		var tableWidth = $(".slick-header-column").last().width() * $(".slick-header-column").length;
		var parentWidth = $("#result-container > div:visible").width();
		if(tableWidth < parentWidth) {
			$("#myGrid").width(tableWidth + 20);
			if(this.grid)
				this.grid.autosizeColumns();
		}
		else
			$("#myGrid").width(parentWidth);
	},
	
	_old_renderResult : function(data) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		
		$("#stats_showing").html("");
		$("#stats_total").text(data.count);
		rollingOccupied = false;
		var wordArray = [];
		var corpusArray = [];

		$.each(data["corpora"], function(corpus, obj) {
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
		corpusArray.sort(function(c1, c2) {
			c1 = settings.corpora[c1.toLowerCase()].title;
			c2 = settings.corpora[c2.toLowerCase()].title;
			if(c1 > c2) {
				return 1;
			} else if(c1 == c2) {
				return 0;
			} else {
				return -1;
			}
		});
		var hasHit = false;
		$.each(data["total"]["absolute"], function(item) {
			if(!$.isEmptyObject(item))
				hasHit = true;
		});
		if(!hasHit) {
			this.showNoResults();
			return;	
		}
		
		this["savedWordArray"] = wordArray;
		

		// Snygga till koden nedan!!
		var totalForCorpus = [];
		var totalForCorpusAbs = [];
		$.each(corpusArray, function(key, fvalue) {
			totalForCorpus.push(0);
			totalForCorpusAbs.push(0);
		});
		
		
		var dataItems = new Array();

		var bc = 0;
		$.each(corpusArray, function(i, corpus) {
			var obj = data.corpora[corpus];
			$.each(wordArray, function(key, fvalue) {
				if(obj["relative"])
					var rel_freq = obj["relative"][fvalue];
				if(obj["absolute"])
					var abs_freq = obj["absolute"][fvalue];
				if (rel_freq) {
					totalForCorpus[bc] += parseFloat(rel_freq);
					totalForCorpusAbs[bc] += abs_freq;
				}		
			});
			bc++;
		});
		
		
		// Show export section -----
		$("#exportStatsSection").css({"display": "block"});

		// Make Left Stats Table --------------------------------------------------------- //
		
		var leftHTML = '<table class="statisticWords"><th style="height:60px;"><span style="color:white">-<br/>-</span></th>';
		$.each(wordArray, function(key, fvalue) {
			leftHTML += '<tr style="height:26px;"><td style="padding-right: 20px"><span class="searchForWordform">' + fvalue + '</span> <a class="wordsName" id="wordstable__' + fvalue + '" href="javascript:void(0)" style="visibility: hidden"><img id="circlediagrambutton__' + fvalue + '" src="img/stats2.png" class="arcDiagramPicture" style="border:0px;"/></a></td></tr>';
		});
		leftHTML += '<tr><td style="padding-right: 20px">∑ <a class="wordsName" id="wordstableTotal" href="javascript:void(0)"><img src="img/stats2.png" class="arcDiagramPicture" style="border:0px;"/></a></td></tr></table>';
		
		function makeEllipsis(str) {
			if(str.length > 18) {
				return str.substr(0,14) + "...";
			} else {
				return str;
			}
		}
		
		$("#leftStatsTable").html(leftHTML);
		
		if (corpusArray.length > 1) {
			$(".wordsName").css({"visibility":"visible"});
		}
		
		$.each(wordArray, function(wkey, wvalue) {
			var numCorporaWithWordform = 0;
			$.each(corpusArray, function(ckey, cvalue) {
				if (data["corpora"][cvalue]["relative"][wvalue]) {
					numCorporaWithWordform++;
				}
			});
			if(numCorporaWithWordform < 2) {
				$($.format(".searchForWordform:contains(%s)", wvalue)).next().css({"visibility": "hidden"});
			}
		});
		
		// Make Right Stats Table -------------------------------------------------------- //
		
		var theHTML = '<table id="actualRightStatsTable" style="border-collapse:collapse;border-spacing:0px;border-style:hidden">';
		if(corpusArray.length > 1) {
			theHTML += '<th><i><span id="statsAllCorporaString">Samtliga</span></i><br/><a class="corpusNameAll" href="javascript:void(0)" style="outline: none;"><img class="bardiagrambutton" src="img/stats.png" style="border:0px"/></a></th>';
			theHTML += '<th style="width:0px; visibility:hidden; display:none; padding:0px;" id="corpusStatisticsCell__all__" rowspan="100%"><div style="padding-top:52px" class="barContainerClass" id="corpusStatistics__all__"></div></th>';
		}
		$.each(corpusArray, function(key, fvalue) {
			theHTML += '<th style="height:60px" class="corpusTitleClass"><a class="corpusTitleHeader" id="corpusTitleHeader__' + fvalue + '">' + makeEllipsis(settings.corpora[fvalue.toLowerCase()]["title"]).replace(new RegExp(" ", "gi"),"&nbsp;").replace(new RegExp("-","gi"),"&#8209;") + '</a><br/><a style="outline: none;" class="corpusName" id="corpustable__' + fvalue + '" href="javascript:void(0)"><img class="bardiagrambutton" id="bardiagrambutton__' + fvalue + '" src="img/stats.png" style="border:0px"/></a></th><th style="width:0px; visibility:hidden; display:none; padding:0px;" id="corpusStatisticsCell__' + fvalue + '" rowspan="100%"><div style="padding-top:52px" class="barContainerClass" id="corpusStatistics__' + fvalue + '"></div></th>';
		});
		var totalForAllWordforms = 0;
		var totalForAllWordformsAbs = 0;
		$.each(wordArray, function(key, fvalue) {
			theHTML += '<tr style="height:26px; width:60px;">';
			// First the value for ALL corpora
			if(corpusArray.length > 1) {
				var relTotForWordform = data["total"]["relative"][fvalue];
				var absTotForWordform = data["total"]["absolute"][fvalue];
				theHTML += '<td id="totcorpus__' + fvalue + '" class="statstable statstable__all">' + util.formatDecimalString(relTotForWordform.toFixed(1),true) + '&nbsp;<span class="absStat">(' + prettyNumbers(absTotForWordform.toString()) + ")</span></td>";
				totalForAllWordforms += relTotForWordform;
				totalForAllWordformsAbs += absTotForWordform;
			}
			// Then for each corpus seperately
			$.each(corpusArray, function(gkey, gvalue) {
				var rel_hits = data["corpora"][gvalue]["relative"][fvalue];
				var abs_hits = data["corpora"][gvalue]["absolute"][fvalue];
				
				if (rel_hits) {
					rel_hits = parseFloat(rel_hits);
					theHTML += '<td id="statstable__' + gvalue + '__' + fvalue + '" class="statstable statstablecorpus__' + gvalue +'"><a href="javascript:void(0)" class="relStat searchForWordformInCorpus">' + util.formatDecimalString(rel_hits.toFixed(1),true) + '&nbsp;</a><a href="javascript:" class="absStat searchForWordformInCorpus">(' + prettyNumbers(abs_hits.toString()) + ')</a></td>';
				} else {
					theHTML += '<td class="statstable statstablecorpus__' + gvalue + '"></td>';
				}
			});
			theHTML += '</tr>';
		});
		
	
		
		//sum = function(o) { // Helper Method
		//	for(var s = 0, i = o.length; i; s += o[--i]);
		//	return s;
		//};
		if(corpusArray.length > 1) {
			theHTML += '<tr class="sumOfCorpora"><td>' + util.formatDecimalString(totalForAllWordforms.toFixed(1),true) + '&nbsp;<span class="absStat">(' + prettyNumbers(totalForAllWordformsAbs.toString()) + ')</span></td>';
		}
		$.each(totalForCorpus, function(key, fvalue) {
			theHTML += '<td>' + util.formatDecimalString(fvalue.toFixed(1),true) + '&nbsp;<span class="absStat">(' + prettyNumbers(totalForCorpusAbs[key].toString()) + ')</span></td>';
		});
		theHTML += '</tr></table>';

		$("#rightStatsTable").html(theHTML);

		if(wordArray.length < 2)
			$(".bardiagrambutton").css({"visibility": "hidden"});
		
		
		$.each(corpusArray, function(key, fvalue) {
			var c = 0;
			$.each(data["corpora"][fvalue]["relative"], function(bkey,bvalue) {
				c++; // fulväg att komma runt att .length returnerar undefined, vet inte varför
			});
			if(c < 2)
				$("#bardiagrambutton__" + fvalue).css({"visibility": "hidden"});
		});
		
		$("#statsAllCorporaString").attr({"rel" : "localize[statstable_allcorpora]"});
		
		$("#rightStatsTable").css("max-width", $("#rightStatsTable").parent().width() - ($("#leftStatsTable").width() + $("#stats1_diagram").width() + 20));
		
		$(window).resize(function() {
  			$("#rightStatsTable").css("max-width", $("#rightStatsTable").parent().width() - ($("#leftStatsTable").width() + $("#stats1_diagram").width() + 20));
		});
		
		$("#exportButton").unbind("click");
		$("#exportButton").click(function() {
			var selVal = $("#kindOfData option:selected").val();
			var selType = $("#kindOfFormat option:selected").val();
			var dataDelimiter = ";";
			if (selType == "TSV")
				dataDelimiter = "\t";
				
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
						output += util.formatDecimalString(amount.toString(), false) + dataDelimiter;
					else
						output += "0" + dataDelimiter;
				});
				output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
			});
			if (selType == "TSV")
				window.open( "data:text/tsv;charset=utf-8," + escape(output));
			else
				window.open( "data:text/csv;charset=utf-8," + escape(output));
		});
		
//		TODO: broken, might fix later.
//		$(".searchForWordform").click(function() {
//			$.bbq.pushState({
//				search : "cqp|" + '[(lex contains "' + $("#simple_text").data("lemgram") + '") & (word = "' + $(this).text() + '" %c)]',
//				"result-container" : 0,
//				"search-tab" : 2
//			});
//		});
		
		$(".searchForWordformInCorpus").click(function() {
			var parts = $(this).parent().attr("id").split("__");
			$.bbq.pushState({search : "cqp|" + '[(lex contains "' + $("#simple_text").data("lemgram") + '") & (word = "' + parts[2] + '" %c)]', corpus : parts[1].toLowerCase()});
		});
		
		$(".corpusTitleHeader").click(function() {
			var parts = $(this).attr("id").split("__");
			$.bbq.pushState({corpus : parts[1].toLowerCase()});
			simpleSearch.selectLemgram($("#simple_text").data("lemgram"));
		});
		
		$(".statstable").not(":empty").tooltip({
			delay : 80,
			bodyHandler : function() {
				var relString = util.getLocaleString("statstable_relfreq");
				var absString = util.getLocaleString("statstable_absfreq");
//				if(!$(this).attr('id'))
//					return relString + "<br/><b>0</b><br>" + absString + "<br/><b>0</b>";
				var parts = $(this).attr('id').split("__");
				if(parts.length == 3) {
					var hoveredCorpus = parts[1];
					var hoveredWord = parts[2];
					var relFreq = statsResults.savedData["corpora"][hoveredCorpus]["relative"][hoveredWord];
					var absFreq = statsResults.savedData["corpora"][hoveredCorpus]["absolute"][hoveredWord];
					return relString + "<br/><b>" + util.formatDecimalString(relFreq.toString()) +"</b><br/>" + absString + "<br/><b>" + prettyNumbers(absFreq.toString()) + "</b>";
				} else if (parts.length == 2) {
					// Left total
					return relString + "<br/><b>" + util.formatDecimalString(statsResults.savedData["total"]["relative"][parts[1]].toString()) + "</b><br/>" + absString + "<br/><b>" + prettyNumbers(statsResults.savedData["total"]["absolute"][parts[1]].toString()) + "</b>";
				} else {
					return relString + "<br/><b>0</b><br>" + absString + "<br/><b>0</b>";
				}
			}
		});
		
		$(".corpusTitleHeader").tooltip({
			delay : 80,
			bodyHandler : function() {
				return settings.corpora[$(this).attr('id').split("__")[1].toLowerCase()]["title"];
			}
		});



		// Make Bar Diagram ------------------------------------------------------- //
		
		
		diagramInstance = $('#theHide').pie_widget({container_id: "theHide", data_items: dataItems});
		
		
		$(".corpusName").click(function(e) {
			var parts = $(this).attr("id").split("__");
			newDataInGraph(parts[1], false, "corpusStatistics__" + parts[1]);
			e.stopPropagation();
		});

		
		$(".corpusNameAll").click(function(e) {
			newDataInGraph("all",false, "corpusStatistics__all__");
			e.stopPropagation();
		});
		
		$(".wordsName").click(function() {
			var parts = $(this).attr("id").split("__");
			if(parts.length == 2)
				newDataInGraph(parts[1],true);
			else { // The ∑ row
				newDataInGraph("SIGMA_ALL",true);
			}

		});
		
		
		
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
			if ($(this).attr('id').split("__")[1] == statsResults.selectedCorpus)
				diagramInstance.pie_widget("deHighlightArc",$(this).attr('id').split("__")[2]);
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
		$("#rightStatsTable").html("");
		$("#leftStatsTable").html($("<i/>").localeKey("no_stats_results"));
		$("#exportStatsSection").css({"display": "none"});
	}
	
};

view.ExampleResults = new Class(ExampleResults);
view.LemgramResults = new Class(LemgramResults);
view.StatsResults = new Class(StatsResults);
delete ExampleResults;
delete LemgramResults;
delete StatsResults;