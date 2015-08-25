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

	$.fn.vAlign = function(useMargin) {
		var cssType = useMargin ? "margin" : "padding";
		return this.each(function(i) {
			var ah = $(this).height();
			var ph = $(this).parent().height();
			var mh = Math.ceil((ph - ah) / 2);
			$(this).css(cssType + '-top', mh);
		});
	};

	$.fn.outerHTML = function() {
		return $(this).clone().wrap('<div></div>').parent().html();
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


//jQuery.reduce = function(array, fn) {
//	var acc;
//	var build = function(i, x) {
//		acc = i === 0 ? x : fn(acc, x);
//	};
//	$.each(array, build);
//	return acc;
//};

/**
 * Copyright (c) Mozilla Foundation http://www.mozilla.org/
 * This code is available under the terms of the MIT License
 */
jQuery.reduce = function(array, fun /*, initial*/) {

    var len = array.length >>> 0;
    if (typeof fun != "function") {
        throw new TypeError();
    }

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
        throw new TypeError();

    var i = 0;
    if (arguments.length >= 3) {
        var rv = arguments[2];
    }
    else {
        do {
            if (i in array) {
                var rv = array[i++];
                break;
            }

            // if array contains no values, no initial value to return
            if (++i >= len) {
                throw new TypeError();
            }
        }
        while (true);
    }

    for (; i < len; i++) {
        if (i in array) {
            rv = fun.call(null, rv, array[i], i, array);
        }
    }

    return rv;
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
		$(this).find(".ui-icon").remove();
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

// for filtering objects
$.grepObj = function(array, callback, invert) {
	var output = {};
	$.each(array, function(key, value) {
		if(!!callback(value, key))
			output[key] = value;
	});
	return output;

};
// filters the object keys in the keys array from obj.
$.exclude = function(obj, keys) {
	return $.grepObj(obj, function(value, key) {
		return $.inArray(key, keys) == -1;
	});
};

$.onScrollOut = function(upOpts, downOpts) {
	if(typeof upOpts == "string") {
		if($.onScrollOut.prevScrollFunction)
			$(window).unbind("scroll", $.onScrollOut.prevScrollFunction);
		return;
	}
	var activePoint = upOpts.point;

	// for unbinding purposes
	$.onScrollOut.prevScrollFunction = function() {
		var screenTop = $(window).scrollTop();
		var screenBottom = screenTop + $(window).height();

		var upPointInWindow = upOpts.point > screenTop && upOpts.point < screenBottom;
		var downPointInWindow = downOpts.point > screenTop && downOpts.point < screenBottom;

//		c.log("scroll", upPointInWindow, downPointInWindow, screenTop, upOpts.point);
		if(upPointInWindow && downPointInWindow) {
			activePoint = upOpts.point;
		} else if(activePoint != upOpts.point && upPointInWindow) {
			activePoint = upOpts.point;
			upOpts.callback();
		} else if(activePoint != downOpts.point && downPointInWindow) {
			activePoint = downOpts.point;
			downOpts.callback();
		}

	};
	$(window).scroll($.onScrollOut.prevScrollFunction);
};

$.fn.cover = function() {

	this.each(function() {
		if($(this).data("cover") != null) return;
		var pos = $(this).position();
		var cover = $("<div />").css({
			position : "absolute",
			top : pos.top,
			left : pos.left,
			height : $(this).outerHeight(),
			width : $(this).outerWidth()
		}).appendTo("body");
		$(this).data("cover", cover);
	});
	return this;
};
$.fn.uncover = function() {
	this.each(function() {
		($(this).data("cover") || $()).remove();
		$(this).data("cover", null);
	});
	return this;
};

$.fn.quickLocalize = function() {
	util.localize(this.selector);
	return this;
};

jQuery.sortedEach = function(obj, eachFunc, sortFunc) {
	var keys = $.keys(obj);

	if(sortFunc) keys.sort(sortFunc);
	else keys.sort();

	$.each(keys, function(i, key) {
		return eachFunc(key, obj[key]);
	});

};
jQuery.fn.customSelect = function() {
    
	this.change(function() {
		$("option", this).each(function() {
			$(this).text($(this).val());
			$(this).data("locPrefix", null);
		});

//		var prefix = $(this).find("option:disabled").text() + ": ";
		var selected = $(this).find("option:selected");

		selected.data("locPrefix", $(this).data("prefix"));
		selected.data("locSuffix", $(this).data("suffix"));
		$(this).localize();
//		if($(this).find("option:not([rel])").length)
//			selected.text(util.getLocaleString($(this).data("prefix")) + ": " + selected.text());
        

	});
	return this;
};


/*!
 * jQuery ajaxProgress Plugin v0.5.0
 * Requires jQuery v1.5.0 or later
 *
 * http://www.kpozin.net/ajaxprogress
 *
 * (c) 2011, Konstantin Pozin
 * Licensed under MIT license.
 */
(function($) {

    // Test whether onprogress is supported
    var support = $.support.ajaxProgress = ("onprogress" in $.ajaxSettings.xhr());

    // If it's not supported, we can't do anything
    if (!support) {
        return;
    }

    var NAMESPACE = ".ajaxprogress";

    // Create global "ajaxProgress" event
    $.fn.ajaxProgress = function (f) {
        return this.bind("ajaxProgress", f);
    };

    // Hold on to a reference to the jqXHR object so that we can pass it to the progress callback.
    // Namespacing the handler with ".ajaxprogress"
    $("html").bind("ajaxSend" + NAMESPACE, function(event, jqXHR, ajaxOptions) {
        ajaxOptions.__jqXHR = jqXHR;
    });

    /**
     * @param {XMLHttpRequestProgressEvent} evt
     * @param {Object} options jQuery AJAX options
     */
    function handleOnProgress(evt, options) {

        // Trigger the global event.
        // function handler(jqEvent, progressEvent, jqXHR) {}
        if (options.global) {
            $.event.trigger("ajaxProgress", [evt, options.__jqXHR]);
        }

        // Trigger the local event.
        // function handler(jqXHR, progressEvent)
        if (typeof options.progress === "function") {
            options.progress(options.__jqXHR, evt);
        }
    }


    // We'll work with the original factory method just in case
    var makeOriginalXhr = $.ajaxSettings.xhr.bind($.ajaxSettings);

    // Options to be passed into $.ajaxSetup;
    var newOptions = {};

    // Wrap the XMLHttpRequest factory method
    newOptions.xhr = function () {

        // Reference to the extended options object
        var s = this;

        var newXhr = makeOriginalXhr();
        if (newXhr) {
            newXhr.addEventListener("progress", function(evt) {
                handleOnProgress(evt, s);
            });
        }
        return newXhr;
    };

    $.ajaxSetup(newOptions);

})(jQuery);



var Subclass = function(parent, childConstr, childProto){
  var ctor = function(){};
  ctor.prototype = parent.prototype;
  childConstr.prototype = new ctor;
  childConstr.prototype.constructor = childConstr;
  _.extend(childConstr.prototype, childProto);
  return childConstr;
};
