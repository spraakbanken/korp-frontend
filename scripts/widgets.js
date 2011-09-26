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
		return;
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
			.done(function(idArray, textstatus, xhr) {
				$.log("sblex done", textstatus, xhr, xhr.status);
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
			})
			.fail(function() {
				$.log("sblex fail", arguments);
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
			$.log("autocomplete select", options.select, selectedItem, ui.item.value, ui, event);
			
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

var KorpTabs = {
	_create : function() {
//		this._super( "_create");
//		$.ui.tabs.prototype._create.call(this);
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
//		this._super( "_tabify", init );
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
	
	enableAll : function() {
		var self = this;
		$.each(".custom_tab", function(i, elem) {
			self.enable(i);
		});
	},
	
	getCurrentInstance : function() {
//		var ret = this.lis.filter(".ui-tabs-active").data("instance") || null; //for jquery ui 1.9
		var ret = this.lis.filter(".ui-tabs-selected").data("instance") || null;
		$.log("getCurrentInstance", this.lis, ret);
		return ret;
	}
	
};
//$.widget( "ui.korptabs", $.ui.tabs, KorpTabs);
$.ui.tabs.subclass = $.ui.widget.subclass;
$.ui.tabs.subclass("ui.korptabs", KorpTabs);

var Sidebar = {
	options : {},
	_init : function() {
	},
	
	updateContent : function(sentenceData, wordData, corpus) {
		this.element.html('<div id="selected_sentence" /><div id="selected_word" />');
		
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
		
		this.applyEllipse();
		
//		this.element.find(".defaultSetItem").click(function() {
//			var type = $(this).closest("ul").data("type");
//			advancedSearch.setCQP($.format("[_.post_%s contains '%s']", [type, $(this).text()]) );
//			advancedSearch.onSubmit();
//		});
	},
	
	applyEllipse : function() {
		var oldDisplay = this.element.css("display");
		this.element.css("display", "block");
		var totalWidth = this.element.width();
		this.element.find(".sidebar_url")
		.css("white-space", "nowrap")
		// ellipse for too long links of type=url
		.each(function() {
			while($(this).width() > totalWidth) {
				var oldtext = $(this).text(); 
				var a = $.trim(oldtext, "/").replace("...", "").split("/");
				var domain = a.slice(2,3);
				var midsection = a.slice(3).join("/");
				
					
				midsection = "..." + midsection.slice(2);
				
				$(this).text(["http:/"].concat(domain, midsection).join("/"));
				
				if(midsection == "...") {
					break;
				}
			}
		});
		this.element.css("display", oldDisplay);
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
	
	refreshContent : function(mode) {
		var self = this;
		if(mode == "lemgramWarning") {
			return $.Deferred(function( dfd ){
				self.element.load("parse_warning.html", function() {
					util.localize();
					self.element.addClass("ui-state-highlight").removeClass("kwic_sidebar");
					dfd.resolve();
				});
			}).promise();
			 
		} else {
			this.element.removeClass("ui-state-highlight").addClass("kwic_sidebar");
			var instance = $('#result-container').korptabs('getCurrentInstance');
			if(instance && instance.selectionManager.selected)
				instance.selectionManager.selected.click();
			
		}
	},
	
	updatePlacement : function() {
		var max = Math.round($("#columns").position().top);
		if($(window).scrollTop() < max) {
			this.element.css("top", "");
			this.element.css("position", "absolute");
		}
		else if($("#left-column").height() > $("#sidebar").height()){
			this.element.css("top", 8);
			this.element.css("position", "fixed");
		}
	},
	
	show : function(mode) {
//		$.sm.send("sidebar.show.start");
		var self = this;
		// make sure that both hide animation and content load is done before showing
		$.when(this.element).pipe(function() {
			return self.refreshContent(mode);
		}).done(function() {
			self.element.show("slide", {direction : "right"});
//			self.element.animate({
//				right : 0
//			});
			$("#left-column").animate({
				right : 273
			}, null, null, function() {
				$.sm.send("sidebar.show.end");
			});
		});      
	}, 
	hide : function() {
//		$.sm.send("sidebar.hide.start");
		if($("#left-column").css("right") == "8px") return;
		var self = this;
		self.element.hide("slide", {direction : "right"});
//		self.element.animate({
//			right : -273
//		});
		$("#left-column").animate({
			right : 8
		}, null, null, function() {
			$.sm.send("sidebar.hide.end");
		});
	}
};


var ExtendedToken = {
	options : {},
	_init : function() {
		var self = this;
		this.table = this.element;
		
        this.element.find(".ui-icon-circle-close") //close icon
        .click(function() {
        	$.log("close");
        	self.element.remove();
        	self._trigger("close");
        });
        this.element.find(".insert_arg").click(function() {
    		self.insertArg(true);
	    });
        
        this.insertArg();
        
        this.element.find("button").button({
        	icons: {
                primary: "ui-icon-gear"
        	},
        	text : false
        }).click(function() {
        	$(this).next().toggle("slide", {direction : 'right'}, function() {
        		self._trigger("change");
        	});
        	
        }).next().hide().find("input").change(function() {
        	self._trigger("change");
        });
        
//        $("<ul>").append($("<li>").localeKey("repeat")).insertBefore(gear);
        
	},
	
	insertArg : function(animate) {
		$.log("insertArg");
		var self = this;
		
	    
		var arg = $("#argTmpl").tmpl()
		.find(".or_container").append(this.insertOr()).end()
	    .find(".insert_or").click(function() {
	    	self.insertOr().appendTo($(this).closest(".query_arg").find(".or_container")).hide().slideDown();
	    	self._trigger("change");
	    }).end()
	    .appendTo(this.element.find(".args"))
	    .before($("<span>", {"class" : "and"}).localeKey("and").hide().fadeIn());
		
		if(animate)
			arg.hide().slideDown("fast");
		
		self._trigger("change");
	},
	
	insertOr : function() {
		var self = this;
		var arg_select = this.makeSelect();

		var arg_value = $("<input type='text'/>").addClass("arg_value")
		.change(function(){
			self._trigger("change");
		});
		
		
		return $("#orTmpl").tmpl().find(".right_col").append(arg_select, arg_value).end()
		.find(".remove_arg")
	    .click(function(){
	    	var arg = $(this).closest(".or_arg"); 
	    	if(arg.siblings(".or_arg").length == 0) {
	    		
	    		arg.closest(".query_arg").slideUp("fast",function() {
	    			$(this).remove();
	    			self._trigger("change");
	    		}).prev().remove(); //.prev().fadeOut();
	    	} else {
	    		arg.slideUp(function() {
	    			$(this).remove();
	    			self._trigger("change");
	    		});
	    	}
	    }).end();
	},
	
	
	makeSelect : function() {
		var arg_select = $("<select/>").addClass("arg_type")
		.change($.proxy(this.onArgTypeChange, this));

		var groups = $.extend({}, settings.arg_groups, {
			"word_attr" : getCurrentAttributes(),
			"sentence_attr" : getStructAttrs()
			});
		
		$.each(groups, function(lbl, group) {
			if($.isEmptyObject(group)) {
				return;
			}
			var optgroup = $("<optgroup/>", {label : util.getLocaleString(lbl).toLowerCase(), "data-locale-string" : lbl})
			.appendTo(arg_select);
			$.each(group, function(key, val) {
				if(val.displayType == "hidden")
					return;
				
				$('<option/>',{rel : $.format("localize[%s]", val.label)})
				.val(key).text(util.getLocaleString(val.label) || "")
				.appendTo(optgroup)
				.data("dataProvider", val);

			});
		});
		
		var arg_opts = this.makeOptsSelect(settings.defaultOptions);
		$.log("arg_opts", arg_opts);
		
		return $("<div>", {"class" : "arg_selects"}).append(arg_select, arg_opts);
	},
	
	makeOptsSelect : function(groups) {
		var self = this;
		if($.isEmptyObject(groups)) return $("<span>", {"class" : "arg_opts"});
		return $("<select>", {"class" : "arg_opts"}).append(
				$.map(groups, function(key, value) {
					return $("<option>", {value : key}).localeKey(key).get(0);
				})
		).change(function() {
			self._trigger("change");
		});
	},
	
	refresh : function() {
		var self = this;
		this.table.find(".arg_selects").each(function() {
			var oldVal = $(this).find(".arg_type").val();
			var optVal = $(this).find(".arg_opts").val();
			var newSelects = self.makeSelect(); 
			$(this).replaceWith(newSelects);
			newSelects.find(".arg_type").val(oldVal).trigger("change");
			newSelects.find(".arg_opts").val(optVal);
		});
	},
	
	onArgTypeChange : function(event) {
		// change input widget
		var self = this;
		var target = $(event.currentTarget);
		var oldVal = target.parent().siblings(".arg_value:input[type=text]").val() || "";
		var oldOptVal = target.next().val();
		
		var data = target.find(":selected").data("dataProvider");
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
			if(data.label == "saldo") {
				type = "saldo";
				labelFunc = util.saldoToString;
				sortFunc = view.saldoSort;
			} else {
				type = "lem";
				labelFunc = util.lemgramToString;
				sortFunc = view.lemgramSort;
			}
			arg_value = $("<input type='text'/>").korp_autocomplete({
				labelFunction : labelFunc,
				sortFunction : sortFunc,
				type : type, 
				select : function(lemgram) {
					$.log("extended lemgram", lemgram, $(this));
					$(this).data("value", data.label == "baseform" ? lemgram.split(".")[0] : lemgram);
					$(this).attr("placeholder", labelFunc(lemgram, true).replace(/<\/?[^>]+>/gi, '')).val("").blur().placeholder();
				}
			})
			.change(function(event) {
				$.log("value null");
				$(this).attr("placeholder", null)
				.data("value", null)
				.placeholder();
			}).blur(function() {
				var input = this;
				setTimeout(function() {
					$.log("blur");
					//if($(this).autocomplete("widget").is(":visible")) return;
					if(util.isLemgramId($(input).val()) || $(input).data("value") != null)
						$(input).removeClass("invalid_input");
					else {
						$(input).addClass("invalid_input")
						.attr("placeholder", null)
						.data("value", null)
						.placeholder();
					}
					self._trigger("change");
				}, 100);
			});
			break;
		case "date":
			// at some point, fix this.
		default:
			arg_value = $("<input type='text'/>");
			break;
		} 
		
		if(target.val() == "anyword") {
			arg_value.css("visibility", "hidden");
		}
		
		arg_value.addClass("arg_value")
	    .change(function() {
	    	self._trigger("change");
	    });
		
		target.parent().siblings(".arg_value").replaceWith(arg_value);
		target.next().replaceWith(this.makeOptsSelect(data.opts || settings.defaultOptions));
		target.next().val(oldOptVal);
		
		if(oldVal != null && oldVal.length)
			arg_value.val(oldVal);
		
		this._trigger("change");
	},
	
	getOrCQP : function(andSection) {
		var self = this;
	    var query = {token: []};

	    var args = {};
	    andSection.find(".or_arg").each(function(){
	        var type = $(this).find(".arg_type").val();
	        var data = $(this).find(".arg_type :selected").data("dataProvider");
	        var value = $(this).find(".arg_value").val();
	        var opt = $(this).find(".arg_opts").val();
	        
	        if(data.displayType == "autocomplete") {
	        	value = null;
	        }
	        if (!args[type]) { 
	        	args[type] = []; 
	    	}
	        args[type].push({
	        	data : data, 
	        	value : value || $(this).find(".arg_value").data("value") || "",
	        	opt : opt
        	});
	    });
	    
	    $.each(args, function(type, valueArray) {
	    	var inner_query = [];
	    	
//	    	if(settings.outer_args[type] != null) {
//	    		settings.outer_args[type](query, $.map(args[type], function(item) {
//	            	return item.value;
//	            }));
//	    		return; //TODO: what is this?
//	    	} 
	    	$.each(valueArray, function(i, obj) {
	    		function defaultArgsFunc(s, op) {
	    			var operator = obj.data.type == "set" ? "contains" : "=";
	    			var not_operator = obj.data.type == "set" ? "not contains" : "!=";
	    			var prefix = obj.data.isStructAttr != null ? "_." : "";
	    			var formatter = op == "matches" ? function(arg) {return arg;} : regescape;
	    			var value = formatter(s);
	    			op = {
	    					"is" : [operator, "", value, ""],
	    					"is_not" : [not_operator, "", value, ""],
	    					"starts_with" : ["=", "", value, ".*"],
	    					"ends_with" : ["=", ".*", value, ""],
	    					"matches" : ["=", "", value, ""]
	    				}[op];
	    			
	    			return $.format('%s%s %s "%s%s%s"', [prefix, type].concat(op));
	    		};
	    		var argFunc = settings.inner_args[type] ||  defaultArgsFunc; 
	    		inner_query.push(argFunc(obj.value, obj.opt || settings.defaultOptions));
	    	});
	    	if (inner_query.length) {
	    		query.token.push(inner_query.join(" | "));
	    	}
	    	
	    });
	    var tokens = $.grep(query.token, Boolean);
	    $.log("tokens", query);
	    var output = "";
	    if(tokens.length < 2)
	    	output = tokens.join(" | ");
	    else
	    	output = "(" + tokens.join(" | ") + ")";
	    return output;
	},
	
	getCQP : function() {
		var self = this;
		
		var output = this.element.find(".query_arg").map(function() {
			return self.getOrCQP($(this)); 
		}).get().join(" & ");
		
		var min_max = this.element.find(".repeat:visible input").map(function() {
			return $(this).val();
		}).get();
		var suffix = "";
		if(min_max.length) {
			min_max[0] = Number(min_max[0]) || 0;
			min_max[1] = Number(min_max[1]) || "";
			suffix = $.format("{%s}", min_max.join(", "));
		}
		
		return $.format("[%s]%s", [output, suffix]); 
	}
};
$.widget("ui.sidebar", Sidebar);
$.widget("ui.extendedToken", ExtendedToken);