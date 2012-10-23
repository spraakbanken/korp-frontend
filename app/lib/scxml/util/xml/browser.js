require.def("lib/scxml/util/xml/browser",
function(){

	return {
		parseFromString : (function(){
			 var parser = new DOMParser();  
			return function(str){
				var doc = parser.parseFromString(str,"text/xml");
				return doc;
			}		
		})(),
		serializeToString : (function(){
			var s = new XMLSerializer();  
			return function(d){
				str = s.serializeToString(d);  
				return str;
			}
		})(),
		parseFromPath : function(){
			//I think this would use DocumentBuilderFactory
			new Error("No implementation for parseFromPath.");
		}
	}
})
