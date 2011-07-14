$.widget("ui.radioList", {
	options : {change : $.noop, separator : "|", selected : 0},
	_init : function() {
		var self = this;
		$.each(this.element, function() {
			
			$(this).children().wrap("<li />")
			.click(function() {
				if(!$(this).is(".radioList_selected")) {
					self.select($(this).parent().index());
					$.proxy(self.options.change, this)();
				}
			})
			.parent().prepend(
						$("<span>").text(self.options.separator)
					).wrapAll("<ul class='inline_list' />");
			
		});
		this.element.find(".inline_list span:first").remove();
		this.select(this.options.selected);
	},
	
	select : function(index) {
		this.options.selected = index;
		this.element.find(".radioList_selected").removeClass("radioList_selected");
		this.element.find($.format("a:nth(%s)", String(index))).addClass("radioList_selected");
		return this.element;
	},
	getSelected: function() {
		return this.element.find(".radioList_selected");
	}
	
	
	
});

$.fn.korp_autocomplete = function(options) {
	var selector = $(this);
	
	if(typeof options === "string" && options == "abort") {
		lemgramProxy.abort();
		selector.preloader("hide");
	}
	
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

$.ui.tabs.subclass = $.ui.widget.subclass;
$.ui.tabs.subclass("ui.korptabs", {
	
	_create : function() {
		var self = this;
		this.n = 0;
		this.urlPattern = "#custom-tab-";
		$(".tabClose").live("click", function() {
			if(!$(this).parent().is(".ui-state-disabled")) {
				var index = self.lis.index($(this).parent());
	            if (index > -1) {
	                // call _trigger to see if remove is allowed
	                if (false === self._trigger("closableClick", null, self._ui( $(self.lis[index]).find( "a" )[ 0 ], self.panels[index] ))) return;
	
	                // remove this tab
	                self.remove(index);
	            }
	
	            // don't follow the link
	            return false;
			}
				
		});
		
		this.lis.first().data("instance", kwicResults);
	},
	
	_tabify : function(init) {
		this._super(init);
		this.redrawTabs();
	},
	
	redrawTabs : function() {
		$(".custom_tab").css("margin-left", "auto");
		$(".custom_tab:first").css("margin-left", 8);
	},
	
	addTab : function(klass) {
		var url = this.urlPattern + this.n;
		this.add(url, util.getLocaleString("example"));
		var li = this.element.find("li:last"); 
		this.redrawTabs();
		var instance = new klass(li, url);
		
		li.data("instance", instance);
		this.n++;
		li.find("a").trigger("mouseup");
		return instance;
	},
	
	remove : function(index) {
		this._super(index);
	},
	
	enableAll : function() {
		var self = this;
		$.each(".custom_tab", function(i, elem) {
			self.enable(i);
		});
	},
	
	getCurrentInstance : function() {
		$.log("getCurrentInstance", this.lis);
		return this.lis.filter(".ui-tabs-selected").data("instance") || null; 
	}
	
});


$.widget("ui.sidebar", {
	options : {},
	_init : function() {
	},
	
	updateContent : function(sentenceData, wordData, corpus) {
		$("#selected_word").empty();
		$("#selected_sentence").empty();
		var corpusObj = settings.corpora[corpus.toLowerCase()];
		$("<div />").html(
				$.format("<h4 rel='localize[corpus]'>%s</h4> <p>%s</p>", [util.getLocaleString("corpus"), corpusObj.title]))
				.prependTo("#selected_sentence");
		
		if(!$.isEmptyObject(corpusObj.struct_attributes)) {
			$("#sidebarTmpl")
			.tmpl([sentenceData], {"header" : "sentence", "corpusAttributes" : corpusObj.struct_attributes})
//			.find(".exturl").hoverIcon("ui-icon-extlink")
			.appendTo("#selected_sentence");
		}
		
		if($("#sidebarTmpl").length > 0)
			$("#sidebarTmpl")
			.tmpl([wordData], {"header" : "word", "corpusAttributes" : corpusObj.attributes, parseLemma : this._parseLemma})
			.appendTo("#selected_word");
		else
			$.error("sidebartemplate broken");
		
		this._sidebarSaldoFormat();
		//$("[data-lang=" + $.defaultLanguage.split("-")[0] + "]").click();
	},
	
	_parseLemma : function(attr) {
		var seq = [];
		if(attr != null) {
			seq = $.map(attr.split("|"), function(item) {
				return item.split(":")[0];
			});
		}
		seq = $.grep(seq, function(itm) {
			return itm && itm.length;
		});
		return $.arrayToHTMLList(seq).outerHTML();
	},
	
	_sidebarSaldoFormat : function() {
		$("#sidebar_lex, #sidebar_prefix, #sidebar_suffix").each(function() {
			var idArray = $.grep($(this).text().split("|"), function(itm) {
				return itm && itm.length;  
			}).sort();
				
			var labelArray = util.sblexArraytoString(idArray);
			$(this)
			.html($.arrayToHTMLList(labelArray))
			.find("li")
			.wrap("<a href='javascript:void(0)' />")
			.click(function() {
				var split = util.splitLemgram(idArray[$(this).parent().index()]);
				var id = $.format("%s..%s.%s", split); //split[0] + ".." + split[1] + "." + split[2];
				$.log("sidebar click", split, idArray, $(this).parent().index(), $(this).data("lemgram"));
				simpleSearch.selectLemgram(id);
			})
			.hoverIcon("ui-icon-search");
			
		});
		var $saldo = $("#sidebar_saldo"); 
		var saldoidArray = $.grep($saldo.text().split("|"), function(itm) {
			return itm && itm.length;  
		}).sort();
		var saldolabelArray = util.sblexArraytoString(saldoidArray, util.saldoToString);

		$saldo.html($.arrayToHTMLList(saldolabelArray))
		.find("li")
		.each(function(i, item){
			var id = saldoidArray[i].match(util.saldoRegExp).slice(1,3).join("..");
			$(item).wrap($.format("<a href='http://spraakbanken.gu.se/sblex/%s' target='_blank' />", id));
		})
		.hoverIcon("ui-icon-extlink");
	},
	
	refreshContent : function() {
		var instance = $('#result-container').korptabs('getCurrentInstance');
	    if(instance && instance.selectionManager.selected)
	        instance.selectionManager.selected.click();
	},
	
	updatePlacement : function(animate) {
		var top;
		var max = Math.round($("#columns").position().top);
		if($(window).scrollTop() < max) {
			this.element.css("top", "");
		}
		else {
			top = $(window).scrollTop() + 8;
			this.element.stop(true, true).animate({top : top}, animate ? "fast" : 0);
		}
	},
	
	show : function() {
		var self = this;
		$.when(this.element).done(function() {
			self.refreshContent();
			var speed = 400;
			self.element.show("slide", {direction : "right"}, speed);
			$("#left-column").animate({
				right : 273
			}, speed, null, function() {
				$.sm.send("sidebar.show");
			});
		});
	}, 
	hide : function() {
		if(this.element.css("right") == 273) return;
		var self = this;
		var speed = 400;
		self.element.hide("slide", {direction : "right"}, speed);
		$("#left-column").animate({
			right : 8
		}, speed, null, function() {
			$.sm.send("sidebar.hide");
		});
	}
});


$.widget("ui.extendedtoken", {
	options : {},
	_init : function() {
		
	},
	
	
});
