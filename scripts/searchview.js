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
	
	onSubmit : function(event) {
		this.refreshSearch();
	},
	
	isVisible : function() {
		return this.$main.is(":visible");
	},
	isEnabled : function() {
		return this._enabled;
	},
	enable : function() {
		this._enabled = true;
		this.$main.find("#sendBtn").attr("disabled", false);
	},
	disable : function() {
		this._enabled = false;
		this.$main.find("#sendBtn").attr("disabled", "disabled");
	}
};

view.BaseSearch = new Class(BaseSearch);
delete BaseSearch;

$.fn.korp_autocomplete = function(options) {
	var selector = $(this);
	
	options = $.extend({
		type : "lem",
		select : $.noop,
		labelFunction : util.lemgramToString,
		sortFunction : view.lemgramSort
	},options);
	
	selector.preloader({
		timeout: 500,
		position: {
			my: "right center",
			at: "right center",
			offset: "-1 0",
			collision: "none"
		}
	})
	.autocomplete({
		html : true,
		source: function( request, response ) {
			
			var promise = lemgramProxy.sblexSearch(request.term, options.type)
			.done(function(idArray) {
				idArray = $.unique(idArray);
				idArray.sort(options.sortFunction);
				
				var labelArray = util.sblexArraytoString(idArray, options.labelFunction);
				var listItems = $.map(idArray, function(item, i) {
					return {
						label : labelArray[i],
						value : item,
						input : request.term
					};
				});
				
				selector.data("dataArray", listItems);
				response(listItems);
				if(selector.autocomplete("widget").height() > 300) {
					selector.autocomplete("widget").addClass("ui-autocomplete-tall");
				}
				$("#autocomplete_header").remove();	
				
				$("<li id='autocomplete_header' />")
				.localeKey("autocomplete_header")
				.css("font-weight", "bold").css("font-size", 10)
				.prependTo(selector.autocomplete("widget"));
				
				selector.preloader("hide");
			});
				
			
			selector.data("promise", promise);
		},
		search: function() {
			selector.preloader("show");
		},
		minLength: 1,
		select: function( event, ui ) {
			event.preventDefault();
			var selectedItem = ui.item.value;
			$.log("autocomplete select", selectedItem, ui.item.value, ui, event);
			
			$.proxy(options.select, selector)(selectedItem);
		},
		close : function(event) {
			return false;
		},
		focus : function() {
			return false;
		}
	});
	return selector;
};

var SimpleSearch = {
	Extends : view.BaseSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
		$("#similar_lemgrams").css("background-color", settings.primaryColor);
		var self = this;
		$("#simple_text").keyup($.proxy(this.onSimpleChange, this));
		this.onSimpleChange();
		$("#similar_lemgrams").hide();
		
		$("#simple_text").bind("keydown.autocomplete", function(event) {
			var keyCode = $.ui.keyCode;
			if(!self.isVisible() || $("#ui-active-menuitem").length !== 0) return;
				
			switch(event.keyCode) {
			case keyCode.ENTER:
				self.onSubmit();
				break;
			}
		})
		.korp_autocomplete({
			type : "lem",
			select : $.proxy(this.selectLemgram, this)
		});
		
		$("#prefixChk, #suffixChk").click(function() {
			if($("#simple_text").attr("placeholder") && $("#simple_text").text() == "" ) {
				self.enable();
			}
		});
		
	},
	
	isSearchPrefix : function() {
		return $("#prefixChk").is(":checked");
	},
	isSearchSuffix : function() {
		return $("#suffixChk").is(":checked");
	},
	
	makeLemgramSelect : function() {
		var self = this;
		var promise = $("#simple_text").data("promise") 
		|| lemgramProxy.sblexSearch($("#simple_text").val(), "lem"); 
		
		promise.done(function(lemgramArray) {
			$("#lemgram_select").prev("label").andSelf().remove();
			if(lemgramArray.length == 0) return;
			lemgramArray.sort(view.lemgramSort);
			lemgramArray = $.map(lemgramArray, function(item) {
				return {label : util.lemgramToString(item), value : item};
			});
			
			var select = self.buildLemgramSelect(lemgramArray)
			.appendTo("#korp-simple")
			.addClass("lemgram_select")
			.prepend(
				$("<option>").localeKey("none_selected")
			)
			.bind("change", function() {
				if(this.selectedIndex != 0) {
					self.selectLemgram($(this).val());
				}
				$(this).prev("label").andSelf().remove();
			});
			
			select.get(0).selectedIndex = 0;
			
			var label = $("<label />", {"for" : "lemgram_select"})
			.html($.format("<i>%s</i> <span rel='localize[autocomplete_header]'>%s</span>", [$("#simple_text").val(), util.getLocaleString("autocomplete_header")]))
			.css("margin-right", 8);
			select.before( label );
		});
	},
	
	onSubmit : function(event) {
		this.parent(event);
		if($("#simple_text").val() != "")
			util.searchHash("word", $("#simple_text").val());
		else if($("#simple_text").attr("placeholder") != null)
			this.selectLemgram($("#simple_text").data("lemgram"));
	},
	
	selectLemgram : function(lemgram) {
		this.refreshSearch();
		util.searchHash("lemgram", lemgram);
	},
	
	buildLemgramSelect : function(lemgrams, labelLocalKey) {
		$("#lemgram_select").prev("label").andSelf().remove();
		var optionElems = $.map(lemgrams, function(item) {
			return $.format("<option value='%(value)s'>%(label)s</option>", item);
		});
		return $("<select id='lemgram_select' />").html(optionElems.join(""));
	},
	
	renderSimilarHeader : function(selectedItem, data) {
		$.log("renderSimilarHeader");
		var self = this;
		
		$("#similar_lemgrams").empty().append("<div id='similar_header' />");
		$("<p/>")
		.localeKey("similar_header")
		.css("float", "left")
		.appendTo("#similar_header");
		
		var lemgrams = $( "#simple_text" ).data("dataArray");
		if(lemgrams != null && lemgrams.length ) {
			this.buildLemgramSelect(lemgrams).appendTo("#similar_header")
			.css("float", "right")
			.change(function(){
				self.selectLemgram($(this).val());
			})
			.val(selectedItem);
			$( "#simple_text" ).data("dataArray", null);
		}
		$("<div name='wrapper' style='clear : both;' />").appendTo("#similar_header");
		
		// wordlist
		function makeLinks(array) {
			return $($.map(array, function(item, i){
				var match = util.splitLemgram(item);
				return $.format("<a href='javascript:' data-lemgram='%s'>%s</a>", [item, match[0]]);
			}).join(" "))
			.click(function() {
				simpleSearch.selectLemgram($(this).data("lemgram"));
			});
		}
		
		makeLinks(data.slice(0,30)).appendTo("#similar_lemgrams");
		var breakDiv = $("<div style='clear : both;float: none;' />").appendTo("#similar_lemgrams");
		
		
		$("#show_more").remove();
		
		var div = $("#similar_lemgrams").show().height("auto").slideUp(0);
		
		var restOfData = data.slice(30);
		if(restOfData.length) {
			div.after(
				$("<div id='show_more' />")
				.css("background-color", settings.primaryColor)
				.append($("<a href='javascript:' />").localeKey("show_more"))
				.click(function() {
					$(this).remove();
					var h = $("#similar_lemgrams").outerHeight();
					
					makeLinks(restOfData).appendTo("#similar_lemgrams");
					breakDiv.appendTo("#similar_lemgrams");
					$("#similar_lemgrams").height("auto");
					var newH = $("#similar_lemgrams").outerHeight();
					$("#similar_lemgrams").height(h);
					
					$("#similar_lemgrams").animate({height : newH}, "fast");
				})
			);
		}
		div.slideDown("fast");
	},
	
	onSimpleChange : function(event) {
		if(event && event.keyCode == 27) { //escape
			$.log("key", event.keyCode);
			return;
		}
		
		
		var currentText = $("#simple_text").val();
		currentText = $.trim(currentText, '"');
		var val;
		if(util.isLemgramId(currentText)) { // if the input is a lemgram, do semantic search.
			val = $.format('[(lex contains "%s")]', currentText);
		} else if(this.isSearchPrefix() || this.isSearchSuffix()) {
			var prefix = this.isSearchSuffix() ? ".*" : "";
			var suffix = this.isSearchPrefix() ? ".*" : "";
			val = $.format('[(word = "%s%s%s")]', [prefix, regescape(currentText), suffix]) ;
		}
		else {
			var wordArray = currentText.split(" ");
			var cqp = $.map(wordArray, function(item, i){
				return '[(word = "' + regescape(item) + '")]';
			});
			val = cqp.join(" ");
		}
		$("#cqp_string").val(val);
		if(currentText != "") {
			this.enable();
		} else {
			this.disable();
		}
	},
	
	resetView : function() {
		$("#similar_lemgrams").empty().height("auto");
		$("#show_more").remove();
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
		this.disable();
		return this;
	}
	
};


var ExtendedSearch = {
	Extends : view.BaseSearch,
	initialize : function(mainDivId) {
		this.parent(mainDivId);
		var self = this;
		$("#korp-extended").keyup(function(event) {
			if(event.keyCode == "13") {
				self.onSubmit();
			}
			return false;
		});
		
	},
	
	onentry : function() {
	},
	
	onSubmit : function(event) {
		this.parent(event);
		if(this.$main.find(".query_token").length > 1 || this.$main.find(".query_arg").length > 1) {
			var query = advancedSearch.updateCQP();
			util.searchHash("cqp", query);
		} else {
			var $select = this.$main.find("select.arg_type");
			switch($select.val()) {
//			case "saldo":
//				break;
			case "lex":
				var searchType = $select.val() == "lex" ? "lemgram"  : $select.val();
				util.searchHash(searchType, $select.next().data("value"));
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
	
	insertRow : function() {
	    var row = $('<div/>').addClass("query_row")
	    .appendTo($("#query_table"));

	    var remove_row_button = mkRemoveButton().addClass("remove_row")
	    .click(function(){
	    	removeRow(this);
		});

	    var insert_token_button = mkInsertButton().addClass("insert_token")
	    .click(function(){
	    	insertToken(this);
		});
	    
	    var operators = row.siblings().length ? settings.operators : settings.first_operators;
	    
	    row.append(remove_row_button, insert_token_button);
	    
	    insert_token_button.click();
	    didToggleRow();
	},
	
	didSelectArgtype : function() {
		var self = this;
		// change input widget
		var oldVal = $(this).siblings(".arg_value:input[type=text]").val() || "";
		$(this).siblings(".arg_value").remove();
		
		var data = $(this).find(":selected").data("dataProvider");
		$.log("didSelectArgtype ", data);
		var arg_value = null;
		switch(data.displayType) {
		case "select":
			arg_value = $("<select />");
			$.each(data.dataset, function(key, value) {
				$("<option />").localeKey(value).val(key).appendTo(arg_value);
			});
			break;
		case "autocomplete":
			$.log("displayType autocomplete");
			var type, labelFunc, sortFunc;
			if(data.label == "lemgram") {
				type = "lem";
				labelFunc = util.lemgramToString;
				sortFunc = view.lemgramSort;
			} else {
				type = "saldo";
				labelFunc = util.saldoToString;
				sortFunc = view.saldoSort;
			}
			arg_value = $("<input type='text'/>").korp_autocomplete({
				labelFunction : labelFunc,
				sortFunction : sortFunc,
				type : type, 
				select : function(lemgram) {
					$.log("extended lemgram", lemgram, $(this));
					$(this).data("value", lemgram);
					$(this).attr("placeholder", labelFunc(lemgram, true).replace(/<\/?[^>]+>/gi, '')).val("").blur().placeholder();
				}
			})
			.change(function(event) {
				$.log("value null");
				$(this).attr("placeholder", null)
				.data("value", null)
				.placeholder();
			}).blur(function() {
				var self = this;
				setTimeout(function() {
					$.log("blur");
					//if($(this).autocomplete("widget").is(":visible")) return;
					if(util.isLemgramId($(self).val()) || $(self).data("value") != null)
						$(self).removeClass("invalid_input");
					else {
						$(self).addClass("invalid_input")
						.attr("placeholder", null)
						.data("value", null)
						.placeholder();
					}
					advancedSearch.updateCQP();
				}, 100);
			});
			break;
		case "date":
			break;
		default:
			arg_value = $("<input type='text'/>");
			break;
		} 
		
		if($(this).val() == "anyword") {
			arg_value.css("visibility", "hidden");
		}
		
		arg_value.addClass("arg_value")
	    .change(didChangeArgvalue);
		$(this).after(arg_value);
		if(oldVal != null && oldVal.length)
			arg_value.val(oldVal);
		
		advancedSearch.updateCQP();
	},
	
	insertArg : function(token) {
		$.log("insertArg");
		var self = this;
	    var token = $(token).closest(".query_token").children("tbody");
	    var row = $("<tr/>").addClass("query_arg").appendTo(token);
	    
	    var arg_select = this.makeSelect();
	    
	    var arg_value = $("<input type='text'/>").addClass("arg_value")
	    .change(function(){
    		didChangeArgvalue();
		});
	    
	    var remove = mkRemoveButton().addClass("remove_arg")
	        .click(function(){
	        	if(row.is(":last-child"))
	        		row.prev().find(".insert_arg").show();
	        	removeArg(this);
	    	});

	    var insert = mkInsertButton().addClass("insert_arg")
	    .click(function() {
	    	self.insertArg(this);
	    	$(this).hide();
	    });
	    
	    var closeBtn = $("<span />", {"class" : "ui-icon ui-icon-circle-close btn-icon"})
	    .click(function() {
	    	$(this).closest("table").remove();
	    	advancedSearch.updateCQP();
	    	
	    	if($(".query_token").length == 1) {
	    		$(".query_token .btn-icon:first").css("visibility", "hidden");
	    	} else {
	    		$(".query_token .btn-icon:first").css("visibility", "visible");
	    	}
	    });
	    
	    
	    var leftCol = $("<div />").append(remove).css("display", "inline-block").css("vertical-align", "top");
	    var rightCol = $("<div />").append(arg_select, arg_value)
	    .css("display", "inline-block")
	    .css("margin-left", 5);
	    
	    if($.browser.msie && $.browser.version.slice(0, 1) == "7") { // IE7 :(
	    	// let's patch it up! (maybe I shouldn't have used inline-block)
	    	leftCol.add(rightCol).css("display", "inline");
	    	rightCol.find("input").css("float", "right");
	    	closeBtn.css("right", "-235").css("top", "-55");
	    }
	    
	    var wrapper = $("<div />").append($("<span/>").localeKey("and"), insert);
	    
	    row.append(
	        $("<td/>").append(leftCol, rightCol, closeBtn, wrapper)
	    );
	    
	    if(row.is(":first-child")) {
	    	remove.css("visibility", "hidden");
	    }
	    
		if(!row.is(":first-child") ) {
			closeBtn.css("visibility", "hidden");
		}
		
		if($(".query_token").length == 1) {
			closeBtn.css("visibility", "hidden");
		}
		else {
			$(".query_token .btn-icon:first").css("visibility", "visible");
		}
	    
	    didToggleToken(row);
	    $(".query_row").sortable({
	    	items : ".query_token"
	    		
	    });
	},
	
	refreshSelects : function() {
		var self = this;
		$(".arg_type").each(function() {
			var i = $(this).find(":selected").index();
			var before = $(this).find(":selected").val();
			var newSelect = self.makeSelect();
			newSelect.get(0).selectedIndex = i;
			$(this).replaceWith(newSelect);
			if(before != newSelect.val()) {
				newSelect.get(0).selectedIndex = 0;
				newSelect.trigger("change");
			}
		});
	},
	
	makeSelect : function() {
		var arg_select = $("<select/>").addClass("arg_type")
	    .change(extendedSearch.didSelectArgtype);

		var groups = $.extend({}, settings.arg_groups, {
			"word_attr" : getCurrentAttributes(),
			"sentence_attr" : getStructAttrs()
			});
		
		$.each(groups, function(lbl, group) {
			if($.isEmptyObject(group)) {
				return;
			}
			var optgroup = $("<optgroup/>", {label : util.getLocaleString(lbl).toLowerCase(), "data-locale-string" : lbl}).appendTo(arg_select);
			$.each(group, function(key, val) {
				if(val.displayType == "hidden")
					return;
				var labelKey = val.label || val;
				
				var option = $('<option/>',{rel : $.format("localize[%s]", labelKey)})
				.val(key).text(util.getLocaleString(labelKey) || "")
				.appendTo(optgroup)
				.data("dataProvider", val);
				
//				if(val.disabled === true) {
//					option.attr("disabled", "disabled");
//				}
			});
			
		});
		
		return arg_select;
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
		
	    var query = "";
	    var nr_lines = 2;
	    var main_corpus_lang = "";
	    $(".query_row").each(function(){
	        query += cqpRow(this);
	    });
	    $.log("updateCQP", query, nr_lines, main_corpus_lang,$("#cqp_string"));
	    $("#cqp_string").val(query).attr("rows", nr_lines);
	    $("#corpus_id").val(main_corpus_lang);
	    return query;
	},
	
	onSubmit : function(event) {
		this.parent(event);
		util.searchHash("cqp", $("#cqp_string").val());
	}

};


view.SimpleSearch = new Class(SimpleSearch);
view.ExtendedSearch = new Class(ExtendedSearch);
view.AdvancedSearch = new Class(AdvancedSearch);
delete SimpleSearch;
delete ExtendedSearch;
delete AdvancedSearch;