(function( $ ){
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
			  output.push([k,v]);
		  
	  });
	  return output;
  };
  
  $.objMap = function(obj, f) {
	  var output = {};
	  $.each(obj, function(k, v) {
		  var pair = f(k,v);
		  return output[pair[0]] = pair[1]; 
	  });
	  return output;
  };
})( jQuery );

