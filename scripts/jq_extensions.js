(function($) {
	
	$.arrayToHTMLList = function(array, listType) {
		listType = listType || "ul";
		var lis = $.map(array, function(item) {
			return $.format("<li>%s</li>", item);
		}).join("\n");
		return $($.format("<%s/>", listType)).append(lis);
	};
	
	$.objToArray = function(obj, shallow) {
		var output = [];
		$.each(obj, function(k, v) {
			//		  if(!shallow && $.isPlainObject(v))
			//			  output.push([k, $.objToArray(v, shallow)]);
			//		  else if(!shallow && $.isArray(v))
			//			  output.push([k, $.map(v, function(i, item) {
			//				  return $.objToArray(item, shallow);
			//			  })]);
			//		  else
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
		return this.each(function(i){
			var ah = $(this).height();
			var ph = $(this).parent().height();
			var mh = Math.ceil((ph-ah) / 2);
			$(this).css('margin-top', mh);
		});
	};
})(jQuery);
