const { getLocData } = require("@/i18n/loc-data");
const { default: settings } = require("@/settings");
const { locationSearchGet } = require("@/angular-util");

(function($) {
	dl_cache = {}
	$.localize = function(cmd, o) {
		if(!$.localize.data)
			$.localize.data = {};
		if (cmd == "init") {
			// return 
			$.localize.options = o;
			var dfds = [];

			var lang = o.language;
			
			$.localize.data.lang = lang;
			if(!$.localize.data[lang])
				$.localize.data[lang] = {_all : {}};

			$.each(o.packages, function(i, pkg) {
				var file = pkg + "-" + lang + '.json';
				if (o.pathPrefix)
					file = o.pathPrefix + "/" + file;

				if(!dl_cache[pkg + lang])
					dl_cache[pkg + lang] = $.ajax({
						url : file,
						dataType : "json",
						cache : false,
						success : function(data) {
							$.localize.data[lang][pkg] = data;
							$.extend($.localize.data[lang]["_all"], data);
						}
					});

				dfds.push(dl_cache[pkg + lang]);


			});
			return $.when.apply($, dfds);
		} else if(cmd == "getLang") return $.localize.data.lang;

	};

	$.fn.localize = function() {
		//TODO: make this less slow.
        const lang = locationSearchGet("lang") || settings["default_language"];
        getLocData().then(locData => {
            this.find("[rel^=localize]").each(function (i, elem) {
                var elem = $(elem);
                var key = elem.attr("rel").match(/localize\[(.*?)\]/)[1];
                var value = valueForKey(key, locData[lang]) ?? key;
			
                if (elem.is('input')) {
                    elem.val(value);
                } else if (elem.is('optgroup')) {
                    elem.attr("label", value);
                } else if (elem.is("button")) {
                    elem.attr("title", value);
                } else if (elem.is('a') && elem.attr('title') && !elem.text()) {
                    elem.attr('title', value);
                }
                else {
                    if (elem.is("option[data-loc-title]")) {
                        elem.attr("title", valueForKey(elem.data("locTitle"), locData[lang]));
                    }
                    elem.html(value);
                }
            });
            if ($.localize.options && $.localize.options.callback) {
                $.proxy($.localize.options.callback, this)();
            }
        })
		return this;
	};

	function valueForKey(key, data) {
		if(key == null) return null;
		var keys = key.split(/\./);
		var value = data;
		while (keys.length > 0) {
			if (value) {
				value = value[keys.shift()];
			} else {
				return null;
			}
		}
		return value;
	}
})(jQuery);
