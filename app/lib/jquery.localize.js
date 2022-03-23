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
		// var lang = $("body").scope() ? $("body").scope().lang || "sv" : "sv";
		var lang = locationSearch().lang || settings["default_language"];
		var data = loc_data[lang];
		this.find("[rel^=localize]").each(function(i, elem) {
			var elem = $(elem);
			var key = elem.attr("rel").match(/localize\[(.*?)\]/)[1];
			var value = valueForKey(key, data) || key;
			var prefix = valueForKey($(this).data("locPrefix"), data) || "";
			var suffix = valueForKey($(this).data("locSuffix"), data) || "";
			if(prefix) prefix += ": "; 
			value = prefix + value + suffix;
			
			if (elem.is('input')) {
				elem.val(value);
			} else if (elem.is('optgroup')) {
				elem.attr("label", value);
			} else if(elem.is("button")) {
				elem.attr("title", value);
			} else if (elem.is('a') && elem.attr('title') && ! elem.text()) {
			    elem.attr('title', value);
			}
			else {
				if(elem.is("option[data-loc-title]")) {
					elem.attr("title", valueForKey(elem.data("locTitle"), data));
				}
				elem.html(value);
			}
		});
		if($.localize.options && $.localize.options.callback) {
			$.proxy($.localize.options.callback, this)();
		}
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
