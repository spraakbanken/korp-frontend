(function($) {

	$.arrayToHTMLList = function(array, listType) {
		listType = listType || "ul";
		var lis = $.map(array, function(item) {
			return $.format("<li>%s</li>", item);
		}).join("\n");
		if(lis.length)
			return $($.format("<%s/>", listType)).append(lis);
		else 
			return $($.format("<i rel='localize[empty]' style='color : grey'>%s</i>", util.getLocaleString("empty")));
	};

	$.objToArray = function(obj) {
		var output = [];
		$.each(obj, function(k, v) {
			output.push([ k, v ]);
		});
		return output;
	};
	
	$.keys = function(obj) {
		var output = [];
		$.each(obj, function(key, item) {
			output.push(key);
		});
		return output;
	};

	$.objMap = function(obj, f) {
		var output = {};
		$.each(obj, function(k, v) {
			var pair = f(k, v);
			return output[pair[0]] = pair[1];
		});
		return output;
	};

	$.fn.vAlign = function() {
		return this.each(function(i) {
			var ah = $(this).height();
			var ph = $(this).parent().height();
			var mh = Math.ceil((ph - ah) / 2);
			$(this).css('padding-top', mh);
		});
	};

	$.fn.outerHTML = function() {
		return $(this).clone().wrap('<div></div>').parent().html();
	};

	$.fn.svgpreloader = function() {

		$(this)
				.each(
						function() {
							var r = Raphael(this, 20, 20), sectorsCount = 12, color = "#000", width = 15, r1 = 2, r2 = 4, cx = 10, cy = 10,

							sectors = [], opacity = [], beta = 2 * Math.PI
									/ sectorsCount,

							pathParams = {
								stroke : color,
								"stroke-width" : width,
								"stroke-linecap" : "round"
							};
							for ( var i = 0; i < sectorsCount; i++) {
								var alpha = beta * i - Math.PI / 2, cos = Math
										.cos(alpha), sin = Math.sin(alpha);
								opacity[i] = 1 / sectorsCount * i;
								sectors[i] = r.path(pathParams)// .attr("stroke",
								// Raphael.getColor())
								.moveTo(cx + r1 * cos, cy + r1 * sin).lineTo(
										cx + r2 * cos, cy + r2 * sin);
							}
							(function ticker() {
								opacity.unshift(opacity.pop());
								for ( var i = 0; i < sectorsCount; i++) {
									sectors[i].attr("opacity", opacity[i]);
								}
								r.safari();
								setTimeout(ticker, 1000 / sectorsCount);
							})();
						});
	};

})(jQuery);

/*
 * jQuery UI Autocomplete HTML Extension
 * 
 * Copyright 2010, Scott González (http://scottgonzalez.com) Dual licensed under
 * the MIT or GPL Version 2 licenses.
 * 
 * http://github.com/scottgonzalez/jquery-ui-extensions
 */
(function($) {

	var proto = $.ui.autocomplete.prototype, initSource = proto._initSource;

	function filter(array, term) {
		var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
		return $.grep(array, function(value) {
			return matcher.test($("<div>").html(
					value.label || value.value || value).text());
		});
	}

	$.extend(proto, {
		_initSource : function() {
			if (this.options.html && $.isArray(this.options.source)) {
				this.source = function(request, response) {
					response(filter(this.options.source, request.term));
				};
			} else {
				initSource.call(this);
			}
		},

		_renderItem : function(ul, item) {
			return $("<li></li>").data("item.autocomplete", item).append(
					$("<a></a>")[this.options.html ? "html" : "text"]
							(item.label)).appendTo(ul);
		}
	});

})(jQuery);


jQuery.reduce = function(array, fn) {
	var acc;
	var build = function(i, x) {
		acc = i === 0 ? x : fn(acc, x);
	};
	$.each(array, build);
	return acc;
};

jQuery.all = function(array) {
	return jQuery.reduce (array, function(a1, a2) {
		return Boolean(a1) && Boolean(a2);
	});
};

jQuery.any = function(array) {
	return jQuery.reduce (array, function(a1, a2) {
		return Boolean(a1) || Boolean(a2);
	});
};

jQuery.fn.hoverIcon = function(icon) {
	this.hover(function(){
		$("<span style='display : inline-block; margin-bottom : -4px;' class='ui-icon'/>")
		.addClass(icon)
		.appendTo($(this));
		
	}, function() {
		$(".ui-icon").remove();
	});
	return this;
};

jQuery.fn.highlight = function(command) {
	if(command == "abort") {
		$("#highlight").data("abort", true);
		return this;
	}
		
	if($("#highlight:visible").length)
		return this;
	function show(what) {
		what.fadeTo(700, 1, function() {
			hide($(this));
		});
	}
	
	function hide(what) {
		what.fadeTo(700, 0.3, function() {
			if(!$(this).data("abort")) {
				show($(this));
			}
			else {
				$(this).removeData("abort");
				$("._clone").remove();
				$("#highlight").remove();
			}
		});
	}
	
	$("#highlight").remove();
	var hl = $("<div id='highlight' />")
	.css("position", "absolute")
	.css("z-index", 1000)
	.css("opacity", 0)
	.appendTo("body");
//	.fadeTo(400, 1, function() {
//		$(this).fadeOut(400, function() {
//			$("._clone").remove();
//		});
//	});
	show(hl);
	var n = 0;
	this.each(function(i, item) {
		var pos = $(item).position();
		$("<div />").append(
			$(item).clone()
		)
		.css("position", "absolute")
		.css("top", pos.top)
		.css("left", pos.left)
		.css("z-index", 1001 + n)
		.addClass("_clone")
		.appendTo($(item).parent());
		
		var offset = 6;
		hl.css("left", $(item).offset().left - offset)
		.css("top", $(item).offset().top - offset)
		.width($(this).outerWidth() + offset*2)
		.height($(this).outerHeight() + offset*2);
		
		n++;
	});
	return this;
};

$.fn.localeKey = function(key) {
	this.each(function() {
		$(this).attr("rel", $.format("localize[%s]", key)).html(util.getLocaleString(key));
	});
	return this;
};


$._oldtrim = $.trim;
$.trim = function(string, char) {
	if(char == null) return $._oldtrim(string);
	return string.replace(new RegExp($.format("(^%s+)|(%s+$)", [char, char]), "g"), "");
};
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
$.ui.tabs.subclass = $.ui.widget.subclass;
$.ui.tabs.subclass("ui.korptabs", {
	
	_create : function() {
		var self = this;
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
		
	},
	
	_tabify : function(init) {
		this._super(init);
		this.redrawTabs();
	},
	
	redrawTabs : function() {
		$(".custom_tab").css("margin-left", "auto");
		$(".custom_tab:first").css("margin-left", 8);
	},
	
	addTab : function( url , label , index) {
		this.add(url, label, index);
		this.element.find("li:last").addClass("custom_tab")
	    .append('<a class="tabClose" href="#"><span class="ui-icon ui-icon-circle-close"></span></a>');
		this.redrawTabs();
	},
	
	enableAll : function() {
		var self = this;
		$.each(".custom_tab", function(i, elem) {
			self.enable(i);
		});
	}
	
});