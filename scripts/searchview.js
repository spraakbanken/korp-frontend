var view = {};

//**************
// Search view objects
//**************

view.lemgramSort = function(first, second) {
	var match1 = util.splitLemgram(first);
	var match2 = util.splitLemgram(second);
	if(match1[0] == match2[0])
		return parseInt(match1[2]) - parseInt(match2[2]); 
	return first.length - second.length;
};

view.saldoSort = function(first, second) {
	var match1 = util.splitSaldo(first);
	var match2 = util.splitSaldo(second);
	if(match1[1] == match2[1])
		return parseInt(match1[2]) - parseInt(match2[2]); 
	return first.length - second.length;
};

view.updateSearchHistory = function(value) {
	var searches = $.jStorage.get("searches") || [];
	function filterParam(url) {
		return $.grep($.param.fragment(url).split("&"), function(item) {
			return item.split("=")[0] == "search" || item.split("=")[0] == "corpus";
		}).join("&");
	}
	var searchLocations = $.map(searches, function(item) {
		return filterParam(item.location);
	});
	if(value != null && $.inArray(filterParam(location.href), searchLocations) == -1) {
		searches.splice(0, 0, {label : value, location : location.href});
		$.jStorage.set("searches", searches);
	}
	
	if(!searches.length) return;
	var opts = $.map(searches, function(item) {
		var output = $("<option />", {value : item.location}).text(item.label).get(0);
		return output;
	});
	var placeholder = $("<option>").localeKey("search_history").get(0);
	$("#search_history").html([placeholder].concat(opts));
};
view.enableSearch = function(bool) {
	if(bool) {
		$("#search-tab").tabs("enable").removeClass("ui-state-disabled").uncover();
	} else {
		$("#search-tab").tabs("disable").addClass("ui-state-disabled").cover();
	}
	
};

var BaseSearch = {
	initialize : function(mainDivId) {
		this.$main = $(mainDivId);
		this.$main.find(":submit").click($.proxy(this.onSubmit, this));
		this._enabled = true;
	},
	
	refreshSearch : function() {
		$.bbq.removeState("search");
		$(window).trigger("hashchange");
	},
	
	onSubmit : function() {
		this.refreshSearch();
	},
	
	isVisible : function() {
		return this.$main.is(":visible");
	},
	isEnabled : function() {
		return this._enabled;
	},
	enableSubmit : function() {
		this._enabled = true;
		this.$main.find("#sendBtn").attr("disabled", false);
	},
	
	disableSubmit : function() {
		this._enabled = false;
		this.$main.find("#sendBtn").attr("disabled", "disabled");
	}
};

view.BaseSearch = new Class(BaseSearch);
delete BaseSearch;

var SimpleSearch = {
	Extends : view.BaseSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
		$("#similar_lemgrams").css("background-color", settings.primaryColor);
		var self = this;
		$("#simple_text").keyup($.proxy(this.onSimpleChange, this));
		this.onSimpleChange();
		$("#similar_lemgrams").hide();
		this.savedSelect = null;
		var textinput = $("#simple_text").bind("keydown.autocomplete", function(event) {
			var keyCode = $.ui.keyCode;
			if(!self.isVisible() || $("#ui-active-menuitem").length !== 0) return;
				
			switch(event.keyCode) {
			case keyCode.ENTER:
				if($("#search-tab").data("cover") == null)
					self.onSubmit();
				break;
			}
		});
		if(settings.autocomplete)
			textinput.korp_autocomplete({
				type : "lem",
				select : $.proxy(this.selectLemgram, this),
				middleware : function(request, idArray) {
					var dfd = $.Deferred();
					lemgramProxy.lemgramCount(idArray, self.isSearchPrefix(), self.isSearchSuffix()).done(function(freqs) {
						delete freqs["time"];
						idArray.sort(function(first, second) {
							return (freqs[second] || 0) - (freqs[first] || 0);
						});
						
						var labelArray = util.sblexArraytoString(idArray, util.lemgramToString);
						var listItems = $.map(idArray, function(item, i) {
							return {
								label : labelArray[i],
								value : item,
								input : request.term,
								enabled : item in freqs
							};
						});
						
						dfd.resolve(listItems);
					});
					return dfd.promise();
				}
			});
		
		$("#prefixChk, #suffixChk").click(function() {
			if($("#simple_text").attr("placeholder") && $("#simple_text").text() == "" ) {
				self.enableSubmit();
			} else {
				self.onSimpleChange();
			}
		});
	},
	
	isSearchPrefix : function() {
		return $("#prefixChk").is(":checked");
	},
	isSearchSuffix : function() {
		return $("#suffixChk").is(":checked");
	},
	
	makeLemgramSelect : function(lemgram) {
		var self = this;
		
		var promise = $("#simple_text").data("promise") 
			|| lemgramProxy.sblexSearch(lemgram || $("#simple_text").val(), "lem"); 
		
		promise.done(function(lemgramArray) {
			$("#lemgram_select").prev("label").andSelf().remove();
			self.savedSelect = null;
			if(lemgramArray.length == 0) return;
			lemgramArray.sort(view.lemgramSort);
			lemgramArray = $.map(lemgramArray, function(item) {
				return {label : util.lemgramToString(item, true), value : item};
			});
			var select = self.buildLemgramSelect(lemgramArray)
			.appendTo("#korp-simple")
			.addClass("lemgram_select")
			.prepend(
				$("<option>").localeKey("none_selected")
			)
			.change(function() {
				if(this.selectedIndex != 0) {
					self.savedSelect = lemgramArray;
					self.selectLemgram($(this).val());
				}
				$(this).prev("label").andSelf().remove();
			});
			
			select.get(0).selectedIndex = 0;
			
			var label = $("<label />", {"for" : "lemgram_select"})
			.html($.format("<i>%s</i> <span rel='localize[autocomplete_header]'>%s</span>", 
					[$("#simple_text").val(), util.getLocaleString("autocomplete_header")]
			))
			.css("margin-right", 8);
			select.before( label );
		});
	},
	
	onSubmit : function() {
		this.parent();
		$("#simple_text").korp_autocomplete("abort");
		if($("#simple_text").val() != "")
			util.searchHash("word", $("#simple_text").val());
		else if($("#simple_text").attr("placeholder") != null)
			this.selectLemgram($("#simple_text").data("lemgram"));
	},
	
	selectLemgram : function(lemgram) {
		if($("#search-tab").data("cover") != null) return;
		this.refreshSearch();
		util.searchHash("lemgram", lemgram);
	},
	
	buildLemgramSelect : function(lemgrams) {
		$("#lemgram_select").prev("label").andSelf().remove();
		var optionElems = $.map(lemgrams, function(item) {
			return $("<option>", {value : item.value}).html(item.label).get(0);
		});
		return $("<select id='lemgram_select' />").html(optionElems).data("dataprovider", lemgrams);; 
	},
	
	renderSimilarHeader : function(selectedItem, data) {
		c.log("renderSimilarHeader");
		var self = this;
		
		$("#similar_lemgrams").empty().append("<div id='similar_header' />");
		$("<p/>")
		.localeKey("similar_header")
		.css("float", "left")
		.appendTo("#similar_header");
		
		var lemgrams = self.savedSelect || $( "#simple_text" ).data("dataArray");
		self.savedSelect = null;
		if(lemgrams != null && lemgrams.length ) {
			this.buildLemgramSelect(lemgrams).appendTo("#similar_header")
			.css("float", "right")
			.change(function(){
				self.savedSelect = lemgrams;
				self.selectLemgram($(this).val());
			})
			.val(selectedItem);
			$( "#simple_text" ).data("dataArray", null);
		}
		$("<div name='wrapper' style='clear : both;' />").appendTo("#similar_header");
		
		// wordlist
		data = $.grep(data, function(item) {
			return !!item.rel.length;
		});
		// find the first 30 words
		var count = 0;
		var index = 0;
		var sliced = $.extend(true, [], data);
		var isSliced = false;
		$.each(sliced, function(i, item) {
			index = i;
			if(count + item.rel.length > 30) {
				item.rel = item.rel.slice(0, 30 - count);
				isSliced = true;
				return false;
			}
			count += item.rel.length;
		});
		
		var list = $("<ul />").appendTo("#similar_lemgrams");
		$("#similarTmpl").tmpl(sliced.slice(0, index + 1)).appendTo(list)
		.find("a")
		.click(function() {
			self.selectLemgram($(this).data("lemgram"));
		});
		
		$("#show_more").remove();
		
		var div = $("#similar_lemgrams").show().height("auto").slideUp(0);
		
		if(isSliced) {
			div.after(
				$("<div id='show_more' />")
				.css("background-color", settings.primaryColor)
				.append($("<a href='javascript:' />").localeKey("show_more"))
				.click(function() {
					$(this).remove();
					var h = $("#similar_lemgrams").outerHeight();
					
					list.html( $("#similarTmpl").tmpl(data) )
					.find("a")
					.click(function() {
						self.selectLemgram($(this).data("lemgram"));
					});
					$("#similar_lemgrams").height("auto");
					var newH = $("#similar_lemgrams").outerHeight();
					$("#similar_lemgrams").height(h);
					
					$("#similar_lemgrams").animate({height : newH}, "fast");
				})
			);
		}
		div.slideDown("fast");
	},
	
	removeSimilarHeader : function() {
		$("#similar_lemgrams").slideUp(function() {
			$(this).empty();
		})
	},
	
	onSimpleChange : function(event) {
		$("#simple_text").data("promise", null);
		if(event && event.keyCode == 27) { //escape
			c.log("key", event.keyCode);
			return;
		}
		
		var currentText = $("#simple_text").val();
		currentText = $.trim(currentText, '"');
		var val;
		if(util.isLemgramId(currentText)) { // if the input is a lemgram, do semantic search.
			val = $.format('[lex contains "%s"]', currentText);
		} else if(this.isSearchPrefix() || this.isSearchSuffix()) {
			var query = [];
			this.isSearchPrefix() && query.push("%s.*");
			this.isSearchSuffix() && query.push(".*%s");
			val = $.map(currentText.split(" "), function(wd) {
				return "[" + $.map(query, function(q) {
					return $.format($.format('word = "%s"', q), wd);
				}).join(" | ")  + "]";
			}).join(" ");
			
		}
		else {
			var wordArray = currentText.split(" ");
			var cqp = $.map(wordArray, function(item, i){
				return '[word = "' + regescape(item) + '"]';
			});
			val = cqp.join(" ");
		}
		$("#cqp_string").val(val);
		if(currentText != "") {
			this.enableSubmit();
		} else {
			this.disableSubmit();
		}
	},
	
	resetView : function() {
		$("#similar_lemgrams").empty().height("auto");
		$("#show_more").remove();
		this.setPlaceholder(null, null);
//		$("#lemgram_select").prev("label").andSelf().remove();
		return this;
	},
	
	setPlaceholder : function(str, data) {
		$("#simple_text").data("lemgram", data).attr("placeholder", str)
		.placeholder();
		return this;
	},
	
	clear : function() {
		$("#simple_text").val("")
        .get(0).blur();
		this.disableSubmit();
		return this;
	}
	
};


var ExtendedSearch = {
	Extends : view.BaseSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
		var self = this;
		$("#korp-extended").keyup(function(event) {
			if(event.keyCode == "13" && $("#search-tab").data("cover") != null) {
				self.onSubmit();
			}
			return false;
		});
		
		var insert_token_button = $('<img src="img/plus.png"/>')
        .addClass("image_button")
        .addClass("insert_token")
	    .click(function(){
	    	self.insertToken(this);
		});
	    
	    $("#query_table").append(insert_token_button).sortable({
	    	items : ".query_token",
	    	delay : 50,
	    	tolerance : "pointer"
	    });
	    insert_token_button.click();
	},
	
	onentry : function() {
	},
	
	onSubmit : function() {
		this.parent();
		if(this.$main.find(".query_token, .or_arg").length > 1) {
			var query = advancedSearch.updateCQP();
			util.searchHash("cqp", query);
		} else {
			var $select = this.$main.find("select.arg_type");
			switch($select.val()) {
//			case "saldo":
//				break;
			case "lex":
				var searchType = $select.val() == "lex" ? "lemgram"  : $select.val();
				util.searchHash(searchType, $select.parent().next().data("value"));
				break;
			default:
				var query = advancedSearch.updateCQP();
				util.searchHash("cqp", query);
			}
		}
	},
	
	setOneToken : function(key, val) {
		$("#search-tab").find("a[href=#korp-extended]").click().end()
		.find("select.arg_type:first").val(key)
		.next().val(val);
		advancedSearch.updateCQP();
	},
	
	insertToken : function(button) {
//	    $("<table />").insertBefore($(button))
		var self = this;
		$.tmpl($("#tokenTmpl"))
	    .extendedToken({
	    	close : function() {
	    		advancedSearch.updateCQP();
	    	},
	    	change : function() {
	    		if(self.$main.is(":visible"))
	    			advancedSearch.updateCQP();
	    	}
	    }).insertBefore(button)
	    .quickLocalize();
	},
	
	refreshTokens : function() {
		$(".query_token").extendedToken("refresh");
	}
};

var AdvancedSearch = {
	Extends : view.BaseSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
	},
	
	setCQP : function(query) {
		$("#cqp_string").val(query);
	},
	
	updateCQP : function() {
	    var nr_lines = 2;
	    var query = $(".query_token").map(function() {
	    	return $(this).extendedToken("getCQP");
	    }).get().join(" ");
	    c.log("updateCQP", query, nr_lines,$("#cqp_string"));
	    this.setCQP(query);
	    return query;
	},
	
	onSubmit : function() {
		this.parent();
		util.searchHash("cqp", $("#cqp_string").val());
	}

};


view.SimpleSearch = new Class(SimpleSearch);
view.ExtendedSearch = new Class(ExtendedSearch);
view.AdvancedSearch = new Class(AdvancedSearch);
delete SimpleSearch;
delete ExtendedSearch;
delete AdvancedSearch;