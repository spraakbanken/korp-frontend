require.def("lib/scxml/util/xml/ie",
function(){

	return {
		parseFromString : function(str){
			var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(str); 
			
			return xmlDoc;
		},
		serializeToString : function(d){
			return d.xml;
		},
		parseFromPath : function(){
			new Error("No implementation for parseFromPath.")
		}
	}
})
