(function($) {

	$.arrayToHTMLList = function(array, listType) {
		listType = listType || "ul";
		var lis = $.map(array, function(item) {
			return $.format("<li>%s</li>", item);
		}).join("\n");
		return $($.format("<%s/>", listType)).append(lis);
	};

	$.objToArray = function(obj) {
		var output = [];
		$.each(obj, function(k, v) {
			output.push([ k, v ]);
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
			$(this).css('margin-top', mh);
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

// Read a page's GET URL variables and return them as an associative array.
$.extend({
	getUrlVars : function() {
		var vars = [], hash;
		var href = window.location.href.split("#")[0];
		var hashes = href.slice(href.indexOf('?') + 1).split('&');
		for ( var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar : function(name) {
		return $.getUrlVars()[name];
	}
});

$.extend({
	URLEncode : function(c) {
		var o = '';
		var x = 0;
		c = c.toString();
		var r = /(^[a-zA-Z0-9_.]*)/;
		while (x < c.length) {
			var m = r.exec(c.substr(x));
			if (m != null && m.length > 1 && m[1] != '') {
				o += m[1];
				x += m[1].length;
			} else {
				if (c[x] == ' ')
					o += '+';
				else {
					var d = c.charCodeAt(x);
					var h = d.toString(16);
					o += '%' + (h.length < 2 ? '0' : '') + h.toUpperCase();
				}
				x++;
			}
		}
		return o;
	},
	URLDecode : function(s) {
		var o = s;
		var binVal, t;
		var r = /(%[^%]{2})/;
		while ((m = r.exec(o)) != null && m.length > 1 && m[1] != '') {
			b = parseInt(m[1].substr(1), 16);
			t = String.fromCharCode(b);
			o = o.replace(m[1], t);
		}
		return o;
	}
});

/**
 * jQuery xml plugin Converts XML node(s) to string
 * 
 * Copyright (c) 2009 Radim Svoboda Dual licensed under the MIT
 * (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * 
 * @author Radim Svoboda, user Zzzzzz
 * @version 1.0.0
 */

/**
 * Converts XML node(s) to string using web-browser features. Similar to .html()
 * with HTML nodes This method is READ-ONLY.
 * 
 * @param all
 *            set to TRUE (1,"all",etc.) process all elements, otherwise process
 *            content of the first matched element
 * 
 * @return string obtained from XML node(s)
 */
jQuery.fn.xml = function(all) {

	// result to return
	var s = "";

	// Anything to process ?
	if (this.length)

		// "object" with nodes to convert to string
		(((typeof all != 'undefined') && all) ?
		// all the nodes
		this :
		// content of the first matched element
		jQuery(this[0]).contents())
		// convert node(s) to string
		.each(function() {
			s += window.ActiveXObject ? // == IE browser ?
			// for IE
			this.xml :
			// for other browsers
			(new XMLSerializer()).serializeToString(this);
		});

	return s;

};

jQuery.reduce = function(array, fn) {
	var acc;
	var build = function(i, x) {
		acc = i === 0 ? x : fn(acc, x);
	};
	$.each(array, build);
	return acc;
};

