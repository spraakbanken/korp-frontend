var view = {};

//**************
// Search view objects
//**************


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
$.fn.korp_autocomplete = function(selectItemCallback) {
	var selector = $(this);
	selector.preloader({
		timeout: 500,
		position: {
			my: "right center",
			at: "right center",
			offset: "-1 2",
			collision: "none"
		}
	})
	.autocomplete({
		html : true,
		source: function( request, response ) {
			
			var promise = $.ajax({
				url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + request.term,
				success : function(lemArray) {
					$.log("autocomplete success");
					lemArray.sort(function(first, second){
						var match1 = util.splitLemgram(first);
						var match2 = util.splitLemgram(second);
						if(match1[0] == match2[0])
							return parseInt(match1[2]) - parseInt(match2[2]); 
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
					
					selector.data("dataArray", listItems);
					response(listItems);
					if($( ".ui-autocomplete" ).height() > 300) {
						$( ".ui-autocomplete" ).addClass("ui-autocomplete-tall");
					}
					$("#autocomplete_header").remove();	
					$(".ui-autocomplete")
					.prepend("<li id='autocomplete_header' rel='localize[autocomplete_header]'/>")
					.find("li").first().text(util.getLocaleString("autocomplete_header")).css("font-weight", "bold").css("font-size", 10);
					
					selector.preloader("hide");
				}
				
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
			
			$.proxy(selectItemCallback, selector)(selectedItem);
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
		.korp_autocomplete($.proxy(this.selectLemgram, this));
		
	},
	
	makeLemgramSelect : function() {
		var self = this;
		var promise = $("#simple_text").data("promise") 
		|| 
		$.ajax({
			url: "http://spraakbanken.gu.se/ws/saldo-ws/flem/json/" + $("#simple_text").val()
		});
		
		$.when(promise).then(function(lemgramArray) {
			lemgramArray = $.map(lemgramArray, function(item) {
				return {label : util.lemgramToString(item), value : item};
			});
			
			var select = self.buildLemgramSelect(lemgramArray)
			.appendTo("#korp-simple")
			.addClass("lemgram_select")
			.prepend(
				$("<option>", {rel : "localize[none_selected]"}).html(util.getLocaleString("none_selected"))
			)
			.bind("change", function() {
				if(this.selectedIndex != 0) {
					self.selectLemgram($(this).val());
				}
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
		util.searchHash("word", $("#simple_text").val());
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
		$("<p rel='localize[similar_header]' />").html(util.getLocaleString("similar_header"))
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
		$($.map(data, function(item, i){
			var match = util.splitLemgram(item);
			return $.format("<a href='javascript:void(0)' data-lemgram='%s'>%s</a>", [item, match[0]]);
		}).join(" "))
		.click(function() {
			simpleSearch.selectLemgram($(this).data("lemgram"));
		})
		.appendTo("#similar_lemgrams");
		$("<div name='wrapper' style='clear : both;float: none;' />").appendTo("#similar_lemgrams");
		
		$("#similar_lemgrams").show();
	},
	
	onSimpleChange : function(event) {
		if(event && event.keyCode == 27) { //escape
			$.log("key", event.keyCode);
//			$("#simple_text").preloader("hide");
			return;
		}
		
		var val;
		if(util.isLemgramId($("#simple_text").val())) { // if the input is a lemgram, do semantic search.
			val = $.format('[(lex contains "%s")]', $("#simple_text").val());
		} else {
			var valArray = $("#simple_text").val().split(" ");
			var cqp = $.map(valArray, function(item, i){
				return '[(word = "' + item + '")]';
			});
			val = cqp.join(" ");
		}
		$("#cqp_string").val(val);
		if($("#simple_text").val() != "") {
			this.enable();
		} else {
			this.disable();
		}
	},
	
	resetView : function() {
		$("#similar_lemgrams").empty();
		return this;
	},
	
	setPlaceholder : function(str) {
		$("#simple_text").attr("placeholder", str)
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
			case "saldo":
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
		var arg_value;
		switch(data.displayType) {
		case "select":
			arg_value = $("<select />");
			$.each(data.dataset, function(key, value) {
				$("<option />", {value : key, rel : $.format("localize[%s]", value)}).text(util.getLocaleString(value)).appendTo(arg_value);
			});
			break;
		case "autocomplete":
			$.log("displayType autocomplete");
			arg_value = $("<input type='text'/>").korp_autocomplete(function(lemgram) {
				$.log("extended lemgram", lemgram, $(this));
				$(this).data("value", lemgram);
				$(this).attr("placeholder", util.lemgramToString(lemgram, true).replace(/<\/?[^>]+>/gi, '')).val("").blur().placeholder();
				$(this).val("");
			})
			.change(function(event) {
				$.log("value null");
				$(this).attr("placeholder", null)
				.data("value", null);
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
						.data("value", null);
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
	    
	    var wrapper = $("<div />").append($("<span rel='localize[and]'>and</span>"), insert);
	    
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