
$.widget("ui.radioList", {
	options : {change : $.noop, separator : "|", selected : "default"},
	_init : function() {
		var self = this;
		$.each(this.element, function() {
			
			$(this).children().wrap("<li />")
			.click(function() {
				if(!$(this).is(".radioList_selected")) {
					self.select($(this).data("mode"));
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
	
	select : function(mode) {
		this.options.selected = mode;
		
		var target = this.element.find("a").filter(function() {
			return $(this).data("mode") == mode;
		});
		
		this.element.find(".radioList_selected").removeClass("radioList_selected");
		this.element.find(target).addClass("radioList_selected");
		return this.element;
	},
	getSelected: function() {
		return this.element.find(".radioList_selected");
	}
});


var ModeSelector = {
	options : {modes : []},
	_init : function() {
		var self = this;
		$.each(self.options.modes, function(i, item) {
			$("<a>", {"href" : "javascript:"}).localeKey(item.localekey).data("mode", item.mode)
			.appendTo(self.element);
		});
		$.ui.radioList.prototype._init.call(this);
	}
};
$.ui.radioList.subclass = $.ui.widget.subclass;
$.ui.radioList.subclass("ui.modeSelector", ModeSelector);

$.extend( $.ui.autocomplete.prototype, {
	_renderItem: function( ul, item) {
		var li = $("<li></li>").data("item.autocomplete", item).append(
				$("<a></a>")[this.options.html ? "html" : "text"]
						(item.label)).appendTo(ul);
		
		if(!item["enabled"]) {
			li.addClass("autocomplete-item-disabled");
		}
		return li;
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
		middleware : function(request, idArray) {
			var dfd = $.Deferred();
			
			idArray.sort(options.sortFunction || view.lemgramSort);
			
			var labelArray = util.sblexArraytoString(idArray, options.labelFunction);
			var listItems = $.map(idArray, function(item, i) {
				return {
					label : labelArray[i],
					value : item,
					input : request.term,
					enabled : true
				};
			});
			
			dfd.resolve(listItems);
			return dfd.promise();
		}
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
				idArray = $.unique(idArray);
				
				options.middleware(request, idArray).done(function(listItems) {
					
					
					
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
				
			})
			.fail(function() {
				c.log("sblex fail", arguments);
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
		this.add(url, "KWIC");
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
		c.log("getCurrentInstance", ret);
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
		var corpusObj = settings.corpora[corpus];
		$("<div />").html(
				$.format("<h4 rel='localize[corpus]'>%s</h4> <p>%s</p>", [util.getLocaleString("corpus"), corpusObj.title]))
				.prependTo("#selected_sentence");
		
		
		if(!$.isEmptyObject(corpusObj.attributes)) {
			$("#selected_word").append($.format('<h4 rel="localize[word_attr]">%s</h4>', [util.getLocaleString("word_attr")]));
			$("#sidebarTmpl")
			.tmpl([wordData], {"corpusAttributes" : corpusObj.attributes, parseLemma : this._parseLemma})
			.appendTo("#selected_word");
		}
		
		if(!$.isEmptyObject(corpusObj.struct_attributes)) {
			$("#selected_sentence").append($.format('<h4 rel="localize[sentence_attr]">%s</h4>', [util.getLocaleString("sentence_attr")]));
			$("#sidebarTmpl")
			.tmpl([sentenceData], {"corpusAttributes" : corpusObj.struct_attributes})
//			.find(".exturl").hoverIcon("ui-icon-extlink")
			.appendTo("#selected_sentence");
		}
		this._sidebarSaldoFormat();
		
		this.applyEllipse();
		
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
	
	_parseLemma : function(attr, tmplVal) {
		c.log("parseLemma", attr, tmplVal);
		var seq = [];
		if(attr != null) {
			seq = $.map(attr.split("|"), function(item) {
				var lemma = item.split(":")[0];
				if(tmplVal.pattern)
					return $.format(tmplVal.pattern, [lemma, lemma]);
				else 
					return lemma;
			});
		}
		seq = $.grep(seq, function(itm) {
			return itm && itm.length;
		});
		return $.arrayToHTMLList(seq).outerHTML();
	},
	
	_sidebarSaldoFormat : function() {
		$("#sidebar_lex, #sidebar_prefix, #sidebar_suffix, #sidebar_dalinlem, #sidebar_saldolem").each(function() {
			var idArray = $.grep($(this).text().split("|"), function(itm) {
				return itm && itm.length;  
			}).sort();
			var attr = $(this).attr("id").split("_")[1];
			var labelArray = util.sblexArraytoString(idArray);
			$(this)
			.html($.arrayToHTMLList(labelArray))
			.find("li")
			.wrap("<a href='javascript:void(0)' />")
			.click(function() {
				var split = util.splitLemgram(idArray[$(this).parent().index()]);
				var id = $.format("%s..%s.%s", split);
				c.log("sidebar click", split, idArray, $(this).parent().index(), $(this).data("lemgram"));
				if($.inArray(attr, ["dalinlem", "saldolem"]) != -1) {
					advancedSearch.setCQP($.format("[%s contains '%s']", [attr, id]));
					advancedSearch.onSubmit();
				}
				else
					simpleSearch.selectLemgram(id);
				
				
			})
			.hoverIcon("ui-icon-search");
			
		});
		var $saldo = $("#sidebar_saldo"); 
		var saldoidArray = $.grep($saldo.text().split("|"), function(itm) {
			return itm && itm.length;  
		}).sort(function(a, b) {
			 return  parseInt(a.split("..")[1]) - parseInt(b.split("..")[1]);
		});
		var saldolabelArray = util.sblexArraytoString(saldoidArray, util.saldoToString);

		$saldo.html($.arrayToHTMLList(saldolabelArray))
		.find("li")
		.each(function(i, item){
			var id = saldoidArray[i].match(util.saldoRegExp).slice(1,3).join("..");
			$(item).wrap($.format("<a href='http://spraakbanken.gu.se/karp/#search-tab=1&search=cql|(saldo+%3D+\"%s\")&lang=\%s' target='_blank' />",
					[id, $.bbq.getState("lang") || "sv"]));
		})
		.hoverIcon("ui-icon-extlink");
		
		
		// hacked in at the last minute
		
		
		var fsvbase = $("#sidebar_fsvbaseform"); 
		var labelArray = $.grep(fsvbase.text().split("|"), Boolean).sort();

		fsvbase.html($.arrayToHTMLList(labelArray))
		.find("li")
		.each(function(i, item){
			$(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=cql%7Cgf%7C%s" target="_blank" />', $(this).text()));
		})
		.hoverIcon("ui-icon-extlink");
		
		function getStringVal(str) {
			return _.reduce(_.invoke(_.invoke(str, "charCodeAt", 0), "toString"), function(a,b) {return a + b});
		}
		
		$("#sidebar_fsvlemgram,#sidebar_fsvvariants").each(function() {
			
			var saldoidArray = $.grep($(this).text().split("|"), function(itm) {
				return itm && itm.length;  
			}).sort(function(a, b) {
				var splita = util.splitLemgram(a);
				var splitb = util.splitLemgram(b);
				var strvala = getStringVal(splita[0]) + getStringVal(splita[1]) + splita[2]; 
				var strvalb = getStringVal(splitb[0]) + getStringVal(splitb[1]) + splitb[2]; 
								
				return parseInt(strvala) - parseInt(strvalb);
				
			});
			var saldolabelArray = util.sblexArraytoString(saldoidArray, util.lemgramToString);

			$(this).html($.arrayToHTMLList(saldolabelArray))
			.find("li")
			.each(function(i, item){
				$(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=lemgram%7Cfsvm:%s" target="_blank" />', saldoidArray[i] )); 
			})
			.hoverIcon("ui-icon-extlink");
			
			
			
			
			
//			var labelArray = $.grep($(this).text().split("|"), Boolean).sort();
//			
//			$(this).html($.arrayToHTMLList(labelArray))
//			.find("li")
//			.each(function(i, item){
//				var label = util.lemgramToString($(this).text());
//				$(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=lemgram%7C%s" target="_blank">%s</a>', 
//						[$(this).text().split("..")[0], label] ));
//			})
//			.hoverIcon("ui-icon-extlink");
			
		});
		
	},
	
	refreshContent : function(mode) {
		var self = this;
		if(mode == "lemgramWarning") {
			return $.Deferred(function( dfd ){
				self.element.load("markup/parse_warning.html", function() {
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
			this.element.removeClass("fixed");
		}
		else if($("#left-column").height() > $("#sidebar").height()){
			this.element.addClass("fixed");
		}
	},
	
	show : function(mode) {
		var self = this;
		// make sure that both hide animation and content load is done before showing
		$.when(this.element).pipe(function() {
			return self.refreshContent(mode);
		}).done(function() {
			self.element.show("slide", {direction : "right"});
			$("#left-column").animate({
				right : 265
			}, null, null, function() {
				$.sm.send("sidebar.show.end");
			});
		});      
	}, 
	hide : function() {
		if($("#left-column").css("right") == "0px") return;
		var self = this;
		self.element.hide("slide", {direction : "right"});
		$("#left-column").animate({
			right : 0
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
        	if($(this).css("opacity") === "0") return;
        	c.log("close");
        	self.element.remove();
        	self._trigger("close");
        });
        this.element.find(".insert_arg").click(function() {
    		self.insertArg(true);
	    });
        
        this.insertArg();
        var repeat = this.element.find(".repeat");
        this.element.find("button").button({
        	icons: {
                primary: "ui-icon-gear"
        	},
        	text : false
        }).click(function() {
        	if($("#opt_menu").is(":visible")) {
        		return;
        	}
        	$("#opt_menu").show().menu({
        	})
        	.one("click", function(evt) {
        		c.log("click", evt.target );
        		if(!$(evt.target).is("a")) return;
        		var item = $(evt.target).data("item");
        		self.element.toggleClass(item);
        		self._trigger("change");
        	})
        	.position({
        		my : "right top",
        		at : "right bottom",
        		of : this
        	});
        	$("body").one("click", function() {
        		$("#opt_menu").hide();
        	});
        	
        	return false;
        });
        this.element.find(".close_token .ui-icon").click(function() {
        	var item = $(this).closest(".close_token").data("item");
        	self.element.toggleClass(item);
        	self._trigger("change");
        });
        this.element.find(".repeat input").change(function() {
        	self._trigger("change");
        });
        
	},
	
//	toggleRange : function() {
//		if(repeat.filter(":animated").length) return; 
//		repeat.toggle("slide", {direction : 'right'}, function() {
//			self._trigger("change");
//		});
//		
//	},
	
	insertArg : function(animate) {
		c.log("insertArg");
		var self = this;
		
	    
		var arg = $("#argTmpl").tmpl()
		.find(".or_container").append(this.insertOr()).end()
	    .find(".insert_or").click(function() {
	    	var thisarg = $(this).closest(".query_arg").find(".or_container");
	    	var lastVal = thisarg.find(".arg_type:last").val();
	    	self.insertOr(true).appendTo($(this).closest(".query_arg").find(".or_container")).hide().slideDown();
	    	thisarg.find(".arg_type:last").val(lastVal).trigger("change");
	    	
	    	self._trigger("change");
	    }).end()
	    .appendTo(this.element.find(".args"))
	    .before($("<span>", {"class" : "and"}).localeKey("and").hide().fadeIn());
		util.localize(arg);
		if(animate)
			arg.hide().slideDown("fast");
		
		self._trigger("change");
	},
	
	insertOr : function(usePrev) {
		var self = this;
		var arg_select = this.makeSelect();
		
		var arg_value = this.makeWordArgValue();
		arg_value.attr("data-placeholder", "any_word_placeholder");
		var link_mod = $("<span class='val_mod sensitive'>").text("Aa")
		.click(function() {
			var btn = $(this);
			if($("#mod_menu").length) {
				$("#mod_menu").remove();
				return;
			}
			$("<ul id='mod_menu'>")
			.append($("<li />").append($("<a>").localeKey("case_sensitive").data("val", "sensitive")))
			.append($("<li />").append($("<a>").localeKey("case_insensitive").data("val", "insensitive")))
			.insertAfter(this)
			.menu({
			})
			.position({
				my : "right top",
				at : "right bottom",
				of : this
			})
			.find("a").click(function(event) {
				c.log("click", $(this).data("val"));
				btn.removeClass("sensitive insensitive")
				.addClass($(this).data("val"));
				self._trigger("change");
			});
			$("body").one("click", function() {
				$("#mod_menu").remove();
			});
			return false;
		});
		var orElem = $("#orTmpl").tmpl().find(".right_col")
		.append(arg_select, arg_value, link_mod).end()
		.find(".remove_arg")
	    .click(function() {
	    	if($(this).css("opacity") === "0") return;
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
		arg_value.keyup();
		return orElem;
	},
	
	
	makeSelect : function() {
		var arg_select = $("<select/>").addClass("arg_type")
		.change($.proxy(this.onArgTypeChange, this));
		
		var lang;
		if(currentMode == "parallel") 
			lang = this.element.closest(".lang_row,#query_table").find(".lang_select").val();
		var groups = $.extend({}, settings.arg_groups, {
			"word_attr" : settings.corpusListing.getCurrentAttributes(lang),
			"sentence_attr" : settings.corpusListing.getStructAttrs(lang)
			});
		
		$.each(groups, function(lbl, group) {
			if($.isEmptyObject(group)) {
				return;
			}
			var optgroup = $("<optgroup/>", {label : util.getLocaleString(lbl).toLowerCase(), "rel" : $.format("localize[%s]", lbl)})
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
		c.log("arg_opts", arg_opts);
		
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
		this.table.find(".or_arg").each(function() {
			var oldVal = $(this).find(".arg_type").val();
			var optVal = $(this).find(".arg_opts").val();
			var oldLower = $(this).find(".arg_value");
			var old_ph = oldLower.attr("placeholder");
			var old_data = oldLower.data("value");
//			c.log("refresh", oldLower.prop("placeholder"), oldLower.attr("placeholder"));
			var newSelects = self.makeSelect(); 
			$(this).find(".arg_selects").replaceWith(newSelects);
			newSelects.find(".arg_type")
			.val(oldVal)
			.change();
			newSelects.find(".arg_opts").val(optVal);
			
			if(oldLower.attr("placeholder")) {
				$(this).find(".arg_value")
				.data("value", old_data)
				.attr("placeholder", old_ph)
				.placeholder();
				
			} else {
				$(this).find(".arg_value")
				.val(oldLower.val());
			}
			
		});
	},
	
	makeWordArgValue : function() {
		var self = this;
		return $("<input type='text'/>")
		.addClass("arg_value")
		
		.keyup(function() {
			if($(this).val() == "") {
//				$(this).closest(".query_arg").addClass("word_empty");
				$(this).prev().find(".arg_opts").attr("disabled", "disabled");
			}
			else {
//				$(this).closest(".query_arg").removeClass("word_empty");
				$(this).prev().find(".arg_opts").attr("disabled", null);
			}
		})
		.change(function(){
			self._trigger("change");
		}).keyup();
		
	},
	
	onArgTypeChange : function(event) {
		// change input widget
		var self = this;
		var target = $(event.currentTarget);
		var oldVal = target.parent().siblings(".arg_value:input[type=text]").val() || "";
		var oldOptVal = target.next().val();
		
		var data = target.find(":selected").data("dataProvider");
		c.log("didSelectArgtype ", data);
		var arg_value = null;
		switch(data.displayType) {
		case "select":
			arg_value = $("<select />");
			
			function sorter(a, b) {
				if(data.localize === false) return a > b;
				var prefix = data.translationKey || "";
				return util.getLocaleString(prefix + a) >= util.getLocaleString(prefix + b) ? 1 : -1;
			}
			var keys;
			if($.isArray(data.dataset)) {
				keys = data.dataset;
			} else {
				keys = _.keys(data.dataset);
			}
			keys.sort(sorter);
			
			
			
			$.each(keys, function(_, key) {
				var opt = $("<option />")
				.val(regescape(key)).appendTo(arg_value);
				if(data.localize === false)
					opt.text(key);
				else
					opt.localeKey((data.translationKey || "") + data.dataset[key])
			});
			break;
		case "autocomplete":
			var type, labelFunc, sortFunc;
			if(data.label == "saldo") {
				type = "saldo";
				labelFunc = util.saldoToString;
				sortFunc = view.saldoSort;
				c.log("saldo");
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
					c.log("extended lemgram", lemgram, $(this));
					$(this).data("value", data.label == "baseform" ? lemgram.split(".")[0] : lemgram);
					$(this).attr("placeholder", labelFunc(lemgram, true).replace(/<\/?[^>]+>/gi, '')).val("").blur().placeholder();
				}
			})
			.change(function(event) {
				c.log("value null");
				$(this).attr("placeholder", null)
				.data("value", null)
				.placeholder();
			}).blur(function() {
				var input = this;
				setTimeout(function() {
					c.log("blur");
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
		case "date_interval":
			c.log(_.pluck(settings.corpusListing.selected, "time"));
			var all_years = _.chain(settings.corpusListing.selected)
				.pluck("time")
				.map(_.pairs)
				.flatten(true)
				.filter(function(tuple) {
					return tuple[0] && tuple[1];
				})
				.map(_.compose(Number, _.head))
				.value();
			
			c.log('all', all_years);
			var start = Math.min.apply(null, all_years);
			var end = Math.max.apply(null, all_years);
			
			arg_value = $("<div>");
			arg_value.data("value", [start, end]);
			var from = $("<input type='text' class='from'>").val(start);
			var to = $("<input type='text' class='to'>").val(end);
			
			var slider = $( "<div />" ).slider({
				range: true,
				min: start,
				max: end,
				values: [ start, end ],
				slide : function(event, ui) {
					from.val(ui.values[0]);
					to.val(ui.values[1]);
				},
				change : function(event, ui) {
					$(this).data("value", ui.values);
					arg_value.data("value", ui.values);
					self._trigger("change");
				}
			});
			from.add(to).keyup(function() {
				self._trigger("change");
				
			});
			arg_value.append(slider, from, to);
			break;
		default:
			arg_value = this.makeWordArgValue();
			if(data.label == "word")
				arg_value.attr("data-placeholder", "any_word_placeholder");
			util.localize(arg_value);
			break;
		} 
		
		
		target.parent().siblings(".arg_value").replaceWith(arg_value);
		var newSelect = this.makeOptsSelect(data.opts || settings.defaultOptions);
		target.next().replaceWith(newSelect);
		target.next().val(oldOptVal);
		
		if(oldVal != null && oldVal.length)
			arg_value.val(oldVal);
		
		switch(target.val()) {
		case "anyword":
			arg_value.replaceWith("<span class='arg_value'>");
			break;
		case "msd":
			$("#msd_popup").load("markup/msd.html", function() {
				
				$(this).find("a").click(function() {
					arg_value.val($(this).parent().data("value"));
					$("#msd_popup").dialog("close");
				});
			});
			
			$("<span class='ui-icon ui-icon-info' />")
			.click(function() {
				var w = $("html").width() * 0.6;
				var h = $("html").height();
				$("#msd_popup")
				.fadeIn("fast")
				.dialog({
					width : w,
					height : h,
					modal : true
				});
				$("#ui-dialog-title-msd_popup").localeKey("msd_long");
				
				$(".ui-widget-overlay").one("click", function(evt) {
					c.log("body click");
					$("#msd_popup").dialog("close");
				});
//				$("body")
			}).insertAfter(arg_value);
			
			arg_value.css("width", "93%");
			break;
		default:
			this.element.find(".ui-icon-info").remove();
		}
		
		arg_value.addClass("arg_value").keyup()
		.change(function() {
			self._trigger("change");
		});
		
		this._trigger("change");
	},
	
	getOrCQP : function(andSection) {
		var self = this;
//	    var query = {token: []};
		var output = "";
	    var args = {};
	    var annoVals = [];
	    andSection.find(".or_arg").each(function(){
	        var type = $(this).find(".arg_type").val();
	        var data = $(this).find(".arg_type :selected").data("dataProvider");
	        var value = $(this).find(".arg_value").val();
	        var opt = $(this).find(".arg_opts").val();
	        var case_sens = $(this).find(".val_mod.sensitive").length === 0 ? " %c" : "";
	        if(data.displayType == "autocomplete") {
	        	value = null;
	        }
	        if (!args[type]) { 
	        	args[type] = []; 
	    	}
	        args[type].push({
	        	data : data, 
	        	value : value || $(this).find(".arg_value").data("value") || "",
	        	opt : opt,
	        	case_sens : case_sens
        	});
	        if(currentMode == "law") {
	        	annoVals.push(getAnnotationRank(type));
	        }
	    });
	    var minAnno = Math.min.apply(null, annoVals);
	    
	    var inner_query = [];
	    $.sortedEach(args, function(type, valueArray) {
	    	
	    	$.each(valueArray, function(i, obj) {
	    		function defaultArgsFunc(s, op) {
	    			var operator = obj.data.type == "set" ? "contains" : "=";
	    			var not_operator = obj.data.type == "set" ? "not contains" : "!=";
	    			var prefix = obj.data.isStructAttr != null ? "_." : "";
	    			var formatter = op == "matches" || obj.data.displayType == "select" ? function(arg) {return arg;} : regescape;
	    			var value = formatter(s);
	    			function getOp(value) {
	    				return {
	    						"is" : [operator, "", value, ""],
	    						"is_not" : [not_operator, "", value, ""],
	    						"starts_with" : ["=", "", value, ".*"],
	    						"contains" : ["=", ".*", value, ".*"],
	    						"ends_with" : ["=", ".*", value, ""],
	    						"matches" : ["=", "", value, ""]
	    				}[op];
	    			}
	    			function stringify(value) {
	    				return $.format('%s%s %s "%s%s%s"%s', [prefix, type].concat(getOp(value), [obj.case_sens]));
	    			}
	    			
	    			if(currentMode == "law") {
	    				c.log('currentRank', getAnnotationRank(type));
	    				if(getAnnotationRank(type) > minAnno) {
	    					// TODO: continue here.
//	    					return $.format("(%s)", [stringify(value), stringify("")].join(" | "));
	    				}
	    			} 
    				return stringify(value);
	    			
	    			
	    		};
	    		var argFunc;
//	    		if(type == "word" && !obj.value) {
//	    			argFunc = function() {return "";};
//	    		}
//	    		else
    			argFunc = settings.getTransformFunc(type, obj.value, obj.opt) || defaultArgsFunc; 
	    		inner_query.push(argFunc(obj.value, obj.opt || settings.defaultOptions));
	    	});
	    	
	    }, function(a, b) { // sort function for key order
	    	return 1 - ($.inArray(a, settings.cqp_prio) - $.inArray(b, settings.cqp_prio)); 
	    });
	    
	    if (inner_query.length > 1) {
	    	output = "(" + inner_query.join(" | ") + ")";
	    } else {
	    	output = inner_query.join(" | ");
	    }
	    var bound = [];
	    if(this.element.is(".lbound_item")) bound.push("lbound(sentence)")
	    if(this.element.is(".rbound_item")) bound.push("rbound(sentence)")
	    var boundprefix = " & ";
	    if(output == "") boundprefix = "";
	    var boundStr = bound.length ? boundprefix + bound.join(" & ") : "";
	    return output + boundStr;
	},
	
	getCQP : function() {
		var self = this;
		
		var output = this.element.find(".query_arg").map(function() {
			return self.getOrCQP($(this)); 
		}).get();
		output = $.grep(output, Boolean);
		
		var min_max = this.element.find(".repeat:visible input").map(function() {
			return $(this).val();
		}).get();
		var suffix = "";
		if(min_max.length) {
			min_max[0] = Number(min_max[0]) || 0;
			min_max[1] = Number(min_max[1]) || "";
			suffix = $.format("{%s}", min_max.join(", "));
		}
		
		return "[" + output.join(" & ") + "]" + suffix; 
	}
};
$.widget("ui.sidebar", Sidebar);
$.widget("ui.extendedToken", ExtendedToken);
