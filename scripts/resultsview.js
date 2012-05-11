//************
// Result view objects
//************

//view.disableTab = function(index) {
//	c.log("disableTab", index);
//	if($("#result-container").korptabs("option", "selected") == index) {
//		c.log("iscurrentselected")
//		$("#result-container li:first > a").trigger("click");
//	}
//	$("#result-container").korptabs("disable", index);
//};


var BaseResults = {
	initialize : function(tabSelector, resultSelector) {
		this.$tab = $(tabSelector);
		this.$result = $(resultSelector);
		this.index = this.$tab.index();
		this.optionWidget = $("#search_options"); 
	},
	
	renderResult : function(data) {
		this.resetView();
		c.log("renderResults", this.proxy);
		if(this.$result.is(":visible"))
			util.setJsonLink(this.proxy.prevRequest);
		var self = this;
        //$("#result-container").tabs("select", 0);
        var disabled = $("#result-container").korptabs("option", "disabled");
        var newDisabled = $.grep(disabled, function(item) {
        	return item != self.index;
        });
        $("#result-container").korptabs("option", "disabled", newDisabled);
        
        if(data.ERROR) {
			this.resultError(data);
			return false;
		}
	},
	
	resultError : function(data) {
		c.log("json fetch error: " + $.dump(data.ERROR));
		this.hidePreloader();
		this.resetView();
		$('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg"> ')
		.append("<img class='korp_fail' src='img/korp_fail.svg'>")
		.add($("<div class='fail_text' />").localeKey("fail_text"))
		.addClass("inline_block")
		.prependTo(this.$result)
		.wrapAll("<div class='error_msg'>");
		
		
		util.setJsonLink(this.proxy.prevRequest);
	},
	
	showPreloader : function() {
		this.hidePreloader();
		$("<div class='spinner' />").appendTo(this.$tab)
		.spinner({innerRadius: 5, outerRadius: 7, dashes: 8, strokeWidth: 3});
	},
	hidePreloader : function() {
		this.$tab.find(".spinner").remove();
	},
	
	resetView : function() {
		this.$result.find(".error_msg").remove();
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
		
		this.$result.click(function(){
			if(!self.selectionManager.hasSelected()) return;
			self.selectionManager.deselect();
			$.sm.send("word.deselect");
		});
		
		
	},
	resetView : function() {
		this.parent();
		this.$result.find(".results_table,.pager-wrapper,.results_table").empty();
	},
//	resultError : function(data) {
//		this.parent(data);
//		this.$result.find(".results_table").empty();
//		this.$result.find(".pager-wrapper").empty();
//		this.$result.find(".results_table").html($.format("<i>There was a CQP error: <br/>%s:</i>", data.ERROR.traceback.join("<br/>")));
//		util.setJsonLink(this.proxy.prevRequest);
//	},
	
	onentry : function() {
		this.centerScrollbar();
		c.log("onentry");
		$(document).keydown($.proxy(this.onKeydown, this));
	},
	
	onexit : function() {
		$(document).unbind("keydown", this.onKeydown);
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
		c.log("getPageInterval", this.optionWidget.find(".num_hits").val());
		var items_per_page = parseInt(this.optionWidget.find(".num_hits").val());
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
		
		//c.log(data);
		
		if(!data.hits) {

			c.log("no kwic results");
			this.showNoResults();
			return;
		}
//		this.$result.find(".sort_select").show();
		this.renderHitsPicture(data);
		

		var effectSpeed = 100;
		if($.trim(this.$result.find(".results_table").html()).length) {
			this.$result.fadeOut(effectSpeed, function() {
				$(this).find(".results_table").empty();
				self.renderResult(data, sourceCQP);
			});
			return;
		}
//		else {
//			$("#results-kwic").css("opacity", 0);
//		}
		c.log("corpus_results");
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
//		this.$result.find(".sort_select").hide();
		this.$result.find(".hits_picture").html("");
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
			this.$result.find(".hits_picture").html(hits_picture_html);
                        
			// Make sure that there is no mousover effect on touch screen devices:
			if( navigator.userAgent.match(/Android/i) ||
					navigator.userAgent.match(/webOS/i)   ||
					navigator.userAgent.match(/iPhone/i)  ||
					navigator.userAgent.match(/iPod/i)
			) {
				this.$result.find(".hits_picture_table").css("opacity","1");
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
			this.$result.find(".hits_picture_table").hoverIntent(hoverHitPictureConfig);


			this.$result.find(".hits_picture_corp").each(function() {
				var corpus_name = $(this).attr("data");
				$(this).tooltip({delay : 0, bodyHandler : function() {
					return '<img src="img/korp_icon.png" style="vertical-align:middle"/> <b>' + 
						settings.corpora[corpus_name.toLowerCase()]["title"] + 
						' (' + prettyNumbers(data["corpus_hits"][corpus_name].toString()) + 
						' ' + util.getLocaleString("hitspicture_hits") + ')</b><br/><br/><i>' + 
						util.getLocaleString("hitspicture_gotocorpushits") + '</i>';
					}
				});
			});

			// Click to ge to the first page with a hit in the particular corpus
			this.$result.find(".hits_picture_corp").click(function(event) {
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
			this.$result.find(".hits_picture").html("");
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
		c.log("buildPager", this.current_page);
		var items_per_page = this.optionWidget.find(".num_hits").val();
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
		c.log("handlePaginationClick", new_page_index, this.current_page);
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
		opts.sort = $(".sort_select").val();
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
		c.log("onscrollout", upOpts.point, downOpts.point);
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
				c.log("ExampleResults success", data, opts);
				self.renderResult(data, opts.cqp);
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
		c.log("handlePaginationClick", new_page_index, this.current_page);
		if(new_page_index != this.current_page || !!force_click) {
			var items_per_page = parseInt(this.optionWidget.find(".num_hits").val());
			
			var opts = {};
			opts.cqp = this.prevCQP;
			
			opts.start = new_page_index*items_per_page;
			opts.end = (opts.start + items_per_page);
			opts.sort = $(".sort_select").val();
			this.current_page = new_page_index;
			this.makeRequest(opts);
		}
	    
	   return false;
	},
	
	onSortChange : function(event) {
		var opt = $(event.currentTarget).find(":selected");
		c.log("sort", opt);
		if(opt.is(":first-child")) {
			$.bbq.removeState("sort");
		} else {
			c.log("sort", opt.val());
			this.handlePaginationClick(0, null, true);
//			$.bbq.pushState({"sort" : opt.val()});
		}
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
		this.proxy = lemgramProxy;

		this.order = {  //		"_" represents the actual word in the order
			vb : ["SS_d,_,OBJ_d,ADV_d".split(",")], //OBJ_h, , "SS_h,_".split(",")
			nn : ["PA_h,AT_d,_,ET_d".split(","), "_,SS_h".split(","), "OBJ_h,_".split(",")],
//				pn : ["PA_h,AT_d,_,ET_d".split(","), "_,SS_h".split(","), "OBJ_h,_".split(",")],
			av : [[], "_,AT_h".split(",")],
			jj : [[], "_,AT_h".split(",")],
			pp : [[], "_,PA_d".split(",")]
		};
		
		
		
	},
	
	resetView : function() {
		this.parent();
		$("#results-lemgram").empty();
	},
	
	renderResult : function(data, query) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
//		$("#results-lemgram").empty();
		if(!data.relations){
			this.showNoResults();
			this.resultDeferred.reject();
		} else if(util.isLemgramId(query)) {
			this.renderTables(query, data.relations);
			this.resultDeferred.resolve();
		}
		else {
			this.renderWordTables(query, data.relations);
			this.resultDeferred.resolve();
			
		}
		
	},
	
	renderHeader : function(wordClass, sections) {
		var colorMapping = {
				SS : "color_blue", 
				OBJ : "color_purple", 
				ADV : "color_green", 
				Head : "color_yellow", 
				AT : "color_azure", 
				ET : "color_red",
				PA : "color_green"};
		$(".tableContainer:last .lemgram_section").each(function(i) {
//			var $parent = $("<div class='lemgram_help' />").prependTo(this);
			var $parent = $(this).find(".lemgram_help");
			
			$(this).find(".lemgram_result").each(function() {
				if($(this).data("rel")) {
					var color = colorMapping[$(this).data("rel")];
					var cell = $("<span />", {"class" : "lemgram_header_item"}).localeKey((i == 1 ? altLabel : "malt_" + $(this).data("rel")))
					.addClass(color)
					.appendTo($parent);
					if(i > 0) {
						var altLabel = {
							"av" : "nn",
							"jj" : "nn",
							"nn" : "vb",
							"pp" : "nn"
						}[wordClass]; 
							
						cell.attr("rel", altLabel).text(util.getLocaleString(altLabel).capitalize());
					}
					$(this).addClass(color)
					.css("border-color", $(this).css("background-color"));
				}
				else {
					$($.format("<span class='hit'><b>%s</b></span>", $(this).data("word")))
					.appendTo($parent);
				}
					
			});
//			$(".explanation").localeKey("lemgram_explan_" + i);
		}).append("<div style='clear:both;'/>");
		
		
	},
	
	renderWordTables : function(word, data) {
		var self = this;
		
		var wordlist = $.map(data, function(item) {
			var output = [];
			if(item.head.split("_")[0] == word) {
				output.push(item.head);
			} 
			if(item.dep.split("_")[0] == word) {
				output.push(item.dep);
			}
			return output;
		});
		
		
		var unique_words = [];
		$.each(wordlist, function(i, word) {
			if($.inArray(word, unique_words) == -1)
				unique_words.push(word);
		});
		
		$.each(unique_words, function(i, currentWd) {
			var wordClass = currentWd.split("_")[1].toLowerCase();
			function getRelType(item) {
				if(item.dep == currentWd) return item.rel + "_h";
				else if(item.head == currentWd) return item.rel + "_d";
				else return false;
			}
			self.drawTable(currentWd, wordClass, data, getRelType);
			self.renderHeader(wordClass);
			$(".tableContainer:last").prepend($("<div>", {"class" : "header"}).html(util.lemgramToString(currentWd)))
			.find(".hit .wordclass_suffix").hide();
			
		});
		
		
		$(".lemgram_result .wordclass_suffix").hide();
		
//		$(".tableContainer:odd").css("background-color", settings.primaryLight);
		this.drawChk();
		this.hidePreloader();
	},
	
	renderTables : function (lemgram, data) {
		var self = this;
		
		var wordClass = util.splitLemgram(lemgram)[1].slice(0, 2);
		
		function getRelType(item) {
			if(item.dep == lemgram) return item.rel + "_h";
			else return item.rel + "_d";
		}
		
		this.drawTable(lemgram, wordClass, data, getRelType);
//		table.appendTo("#results-lemgram");
		$(".lemgram_result .wordclass_suffix").hide();
		
		this.renderHeader(wordClass);
		this.drawChk();
		this.hidePreloader();
		
	},
	
	drawChk : function() {
		$("<div><input id='wordclassChk' type='checkbox' /></div>").css({"margin-bottom" : "10px", "float" : "right"})
		.append($("<label>", {"for" : "wordclassChk"}).localeKey("show_wordclass"))
		.change(function() {
			if($(this).find("#wordclassChk").is(":checked")) {
				$(".lemgram_result .wordclass_suffix").show();
			}
			else {
				$(".lemgram_result .wordclass_suffix").hide();
			}
			
		})
		.prependTo("#results-lemgram")
		.filter("label").css("margin-left", "5px");
		
	},
	
	drawTable : function(token, wordClass, data, relTypeFunc) {
		var self = this;
		c.log("drawTable", wordClass, this.order[wordClass]);
		if(this.order[wordClass] == null) {
			this.showNoResults();
			return;
		}
		
		function inArray(rel, orderList) {
			var i = $.inArray(rel, orderList);
			var type = rel.slice(-1) == "h" ? "head" : "dep";
			return {"i" : i, "type" : type};
		}
		
		
		var orderArrays = [[], [], []];
		
		$.each(data, function(index, item) {
			$.each(self.order[wordClass], function(i, rel_type_list) {
				var list = orderArrays[i];
				var rel = relTypeFunc(item);
				if(rel === false) return;
				var ret = inArray(rel, rel_type_list);
				if(ret.i == -1) {
					return;
				}
				if(!list[ret.i]) list[ret.i] = [];
				item.show_rel = ret.type;
				list[ret.i].push(item); 
			});
		});
		$.each(orderArrays, function(i, unsortedList) {
			
			$.each(unsortedList, function(_, list) {
				if(list) {
					list.sort(function(first, second) {
						return second.mi - first.mi;
					});
				}
			});
			if(self.order[wordClass][i] && unsortedList.length) {
				var toIndex = $.inArray("_", self.order[wordClass][i]);
				if(util.isLemgramId(token))
					unsortedList.splice(toIndex, 0, {"word" : token.split("..")[0].replace(/_/g, " ")});
				else
					unsortedList.splice(toIndex, 0, {"word" : util.lemgramToString(token)});
			}
			unsortedList = $.grep ( unsortedList, function(item, index){
				return Boolean(item);
			});
			//c.log("unsortedList", unsortedList.length, unsortedList);
			
		});
		var container = $("<div>", {"class" : "tableContainer radialBkg"}).appendTo("#results-lemgram");
		$("#lemgramResultsTmpl").tmpl(orderArrays, {lemgram : token})
		.find(".example_link").addClass("ui-icon ui-icon-document")
		.css("cursor", "pointer")
		.click($.proxy(self.onClickExample, self)).end()
		.appendTo(container);
//		.appendTo("#results-lemgram");
		
		
		$("#results-lemgram td:nth-child(2)").each(function() { // labels
			var $siblings = $(this).parent().siblings().find("td:nth-child(2)");
			
			var siblingLemgrams = $.map($siblings, function(item) {
				return $(item).data("lemgram").slice(0, -1);
			});
			var hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) != -1;
			var prefix = $(this).data("depextra").length ? $(this).data("depextra") + " " : "";
//				prefix = "";
			var label = $(this).data("lemgram") != "" ? util.lemgramToString($(this).data("lemgram"), hasHomograph) : "&mdash;";
			$(this).html(prefix + label);
			
		});
		
//		self.renderHeader(wordClass);
	},
	
	onClickExample : function(event) {
		var self = this;
		var $target = $(event.currentTarget);
		c.log("onClickExample", $target);
		var data = $target.parent().tmplItem().data;
		var instance = $("#result-container").korptabs("addTab", view.ExampleResults);
		var opts = instance.getPageInterval();
		opts.ajaxParams = {
				head : data.head, 
				dep : data.dep,
				rel : data.rel,
				depextra : data.depextra,
				corpus : data.corpus
			};
		util.localize(instance.$result);
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
		c.log("lemgramResults.onentry", $.sm.getConfiguration());
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
		.appendTo("#results-lemgram")
		.append('<br/><div id="statistics_switch" style="text-align:center"><a href="javascript:" rel="localize[statstable_relfigures]" data-mode="relative">Relativa frekvenser</a><a href="javascript:" rel="localize[statstable_absfigures]" data-mode="absolute">Absoluta frekvenser</a></div><div id="chartFrame" style="height:380"></div><p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">' + relHitsString + '</p>')
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
			selected : "relative"
		});


	} 
}


var StatsResults = {
	Extends : view.BaseResults,
	initialize : function(tabSelector, resultSelector) {
		this.parent(tabSelector, resultSelector);
		var self = this;
		this.proxy = statsProxy;
		$(".arcDiagramPicture").live("click", function() {
			c.log("clicked arcDiagramPicture" );
			var parts = $(this).attr("id").split("__");
			if(parts[1] != "Σ")
				newDataInGraph(parts[1],true);
			else { // The ∑ row
				newDataInGraph("SIGMA_ALL",true);
			}

		});
		
		$(".c0 .link").live("click", function() {
			c.log("word click", $(this).data("context"), $(this).data("corpora"));
//			$.bbq.pushState({search : "word|" + context})
//			corpusChooserInstance.corpusChooser("selectItems",$(this).data("corpora"));
			var instance = $("#result-container").korptabs("addTab", view.ExampleResults);
			instance.proxy.command = "query";
			var query = $.map($(this).data("value").split(" "), function(item) {
				return $.format("[word='%s']", item);
			}).join(" ");
			c.log("query", query);
			instance.makeRequest({
				corpora : $(this).data("corpora").join(","),
				cqp : query
			});
			util.localize(instance.$result);
		});
		
		$(window).resize(function() {
			self.resizeGrid();
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
						output += util.formatDecimalString(amount.toString(), false, true) + dataDelimiter;
					else
						output += "0" + dataDelimiter;
				});
				output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
			});
			if (selType == "TSV")
				window.open( "data:text/tsv;charset=latin1," + escape(output));
			else
				window.open( "data:text/csv;charset=latin1," + escape(output));
		});
	},
	
	renderResult : function(columns, data) {
//		statsResults.savedData = data;
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		
		c.log("stats.renderResults columns", columns);
		c.log("stats.renderResults data", data);
		
		if(data[0].total_value.absolute === 0) {
			this.showNoResults();
			return;
		}
		
		
		var options = {
			enableCellNavigation: false,
            enableColumnReorder: true
		};
		var dataView = new Slick.Data.DataView();
		
		grid = new Slick.Grid($("#myGrid"), dataView.rows, columns, options);
		
		this.grid = grid;

		this.resizeGrid();
		
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
				var x = a[sortCol.field].absolute || 0, y = b[sortCol.field].absolute || 0;
				
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
		
//		grid.setSortColumn("total", true);
		$(".slick-header-column:nth(1)").click().click();
		$(".slick-column-name:nth(0),.slick-column-name:nth(1)").not("[rel^=localize]").each(function() {
			$(this).localeKey($(this).text());
		});
		
		this.renderPlot();
		
		this.hidePreloader();
	},
	
	renderPlot : function() {
		var self = this;
		var src;
		var css = {};
		if($.keys(statsResults.savedData.corpora).length > 1) {
			src = "stats3.png";
			css["cursor"] = "pointer";
		} else {
			src = "stats3_disabled.png";
			css["cursor"] = "normal";
		}
		
		// Line Diagram
		$("#showBarPlot")
		.attr("src", "img/" + src)
		.css(css)
		.click(function() {
		    $.bbq.pushState({"display" : "bar_plot"});
		    return false;
		});
		
		if($.bbq.getState("display") == "bar_plot")
			this.drawBarPlot();
	},
	
	drawBarPlot : function() {
		$.log("drawBarPlot", statsResults.savedData.corpora);
		var data = statsResults.savedData.corpora;
		var display = [];
		var max = 0;
		var ticks = [];
		var spacing = .25;
		var accu = 0;
		$.each($.keys(data).sort(), function(i, corpus) {
			ticks.push([accu + .5, corpus]);
			display.push([accu, data[corpus].sums.relative]);
			if(max < data[corpus].sums.relative) max = data[corpus].sums.relative;
			accu = accu + 1 + spacing;
		});
		var width = display.length * 60;
		$("#plot_canvas").width(width);
		$.plot($("#plot_canvas"), [display], {
			yaxis : {max : max},
			xaxis : {ticks : ticks},
			bars : {show : true}
//			lines : {show : true}
		});
		width = width > 1000 ? 1000 : width + 40;
		$("#plot_popup").dialog({
			width : width + 40,
			height : 500,
			title : "Träffar per miljon token",
			beforeClose : function() {
				$.bbq.removeState("display");
				return false;
			}
		}).css("opacity", 0);
		$("#ui-dialog-title-plot_popup").localeKey("hits_per_mil");
		$("#plot_popup").fadeTo(400,1);
//		$("#plot_popup").find("a").blur();
	},
	
	resizeGrid : function() {
		if(!this.grid) return;
		var widthArray = $(".slick-header-column").map(function(item) {
			return $(this).width();
		});
		var tableWidth = $.reduce(widthArray, function(a, b) {
			return a + b;
		}, 100);
//		tableWidth += 20;
		
		var parentWidth = $("body").width() - 65;
		$("#myGrid").width(parentWidth);
		if(tableWidth < parentWidth) {
			this.grid.autosizeColumns();
		}
		else {
			if(!$(".c0").length) {
				setTimeout($.proxy(this.resizeHits, this), 1);
			} else {
				this.resizeHits();
			}
		}
		
		$(".slick-column-name:nth(0),.slick-column-name:nth(1)").not("[rel^=localize]").each(function() {
            $(this).localeKey($(this).text());
        });
		
	},
	
	resizeHits : function() {
		this.setHitsWidth(this.getHitsWidth());
	},
	
	getHitsWidth : function() {
		var widthArray = $(".c0").map(function() {
			return $(this).find(":nth-child(1)").outerWidth() + ($(this).find(":nth-child(2)").outerWidth() || 0);
		});
		return $.reduce(widthArray, Math.max);
	},
	
	setHitsWidth : function(w) {
		if(!this.grid) return;
		var data = this.grid.getColumns();
		data[0].currentWidth = w;
		this.grid.setColumns(data);
	},
	
	
//	showError : function() {
//		this.hidePreloader();
//		$("<i/>")
//		.localeKey("error_occurred")
//		.appendTo("#results-stats");
//	},
	
	resetView : function() {
		this.parent();
		$("#exportStatsSection").show();
	},
	
	showNoResults : function() {
		this.hidePreloader();
		$("#results-stats").prepend($("<i/ class='error_msg'>").localeKey("no_stats_results"));
		$("#exportStatsSection").hide();
	}
	
};

view.ExampleResults = new Class(ExampleResults);
view.LemgramResults = new Class(LemgramResults);
view.StatsResults = new Class(StatsResults);
delete ExampleResults;
delete LemgramResults;
delete StatsResults;