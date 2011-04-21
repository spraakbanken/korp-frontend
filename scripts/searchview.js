var view = {};

//**************
// Search view objects
//**************

var SimpleSearch = {
	initialize : function() {
		this.prevLemgramRequest = null;
		this._enabled = true;
		var self = this;
		$("#simple_text").keyup($.proxy(this.onSimpleChange, this));
		this.onSimpleChange();
		$("#similar_lemgrams").hide();
		
		
		$("#simple_text").autocomplete({
			html : true,
			source: function( request, response ) {
				$.ajax({
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
	//		change : function() {
	//			$.log("change");
	//		},
			select: function( event, ui ) {
				event.preventDefault();
				var selectedItem = ui.item.value;
				$.log("autocomplete select", selectedItem, ui.item.value, ui, event);
				
				self.selectLemgram(selectedItem);
			},
			focus : function() {
				return false;
			}
		});
	},
	
	selectLemgram : function(lemgram) {
		var self = this;
		var corpus = getSelectedCorpora();
		$("#similar_lemgrams").show();
		this.renderSimilarHeader(lemgram);
		$("#result-container").tabs("option", "disabled", []);
		$.ajax({
			url: settings.cgi_script,
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
					var match = util.splitLemgram(item);
					return $.format("<a href='javascript:void(0)' data-lemgram='%s'>%s</a>", [item, match[0]]);
				}).join(" "))
				.click(function() {
					self.selectLemgram($(this).data("lemgram"));
				})
				.appendTo("#similar_lemgrams");
				$("<div name='wrapper' style='clear : both;float: none;' />").appendTo("#similar_lemgrams");
			}
		});
	
		statsProxy.makeRequest(lemgram);
		var cqp = lemgramProxy.lemgramSearch(lemgram);
		$("#cqp_string").val(cqp);
		$("#simple_text").val("");
	},
	renderSimilarHeader : function(selectedItem) {
		$.log("renderSimilarHeader");
		var self = this;
		$("#similar_lemgrams").empty().append("<div id='similar_header' />");
		$("<p rel='localize[similar_header]' />").html(util.getLocaleString("similar_header"))
		.css("float", "left")
		.appendTo("#similar_header");
		
		var data = $( "#simple_text" ).data("dataArray");
		if(data != null && data.length ) {
			var optionElems = $.map($( "#simple_text" ).data("dataArray"), function(item) {
				return $.format("<option value='%(value)s'>%(label)s</option>", item);
			});
//				if(optionElems.length) {
//					
//				}
			$("<select id='lemgram_select' />").appendTo("#similar_header")
			.css("float", "right")
			.html(optionElems.join(""))
			.change(function(){
				self.selectLemgram($(this).val());
			})
			.val(selectedItem);
			$( "#simple_text" ).data("dataArray", null);
		}
		$("<div name='wrapper' style='clear : both;' />").appendTo("#similar_header");
	},
	
	onSimpleChange : function() {
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
	},
	
	isVisible : function() {
		return $("#korp-simple").is(":visible");
	},
	
	isEnabled : function() {
		return this._enabled;
	},
	enable : function() {
		this._enabled = true;
		$("#sendBtn").attr("disabled", "");
	},
	disable : function() {
		this._enabled = false;
		$("#sendBtn").attr("disabled", "disabled");
	}
};



var ExtendedSearch = {
	initialize : function() {
		$("#korp-extended").keyup(function(event) {
			if(event.keyCode == "13") {
				$("#sendBtn").click();
			}
			return false;
		});
	}
};


view.ExtendedSearch = new Class(ExtendedSearch);
view.SimpleSearch = new Class(SimpleSearch);
delete SimpleSearch;
delete ExtendedSearch;