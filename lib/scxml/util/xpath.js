require.def(
"src/javascript/scxml/cgf/util/xpath",
function(){

	var scxmlJsNS = "http://commons.apache.org/scxml-js";
	var svgNS = "http://www.w3.org/2000/svg";
	var scxmlNS = "http://www.w3.org/2005/07/scxml";
	var xlinkNS = "http://www.w3.org/1999/xlink";

	function nsResolver(prefix) {
		var ns = {
			svg: svgNS , 
			s: scxmlNS , 
			c: scxmlJsNS , 
			xlink: xlinkNS 
		};
		return ns[prefix] || null;
	}

	var xpathSnapshotResultToJsArray = require.isBrowser ? 
		function(nodes){
			var toReturn = [];
			
			for (var i = 0; i < nodes.snapshotLength; i++) {
				toReturn.push(nodes.snapshotItem(i));
			}
			return toReturn;
		} : 
		function(nodes){
			var toReturn = [];
			for (var i = 0; i < nodes.getLength(); i++) {
				toReturn.push(nodes.item(i));
			}
			return toReturn;
		};

	var query = require.isBrowser ? 
		function(xpath,contextNode){
			contextNode = contextNode || document.documentElement;
			return xpathSnapshotResultToJsArray(
				contextNode.ownerDocument.evaluate(xpath, contextNode, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null));
		} :
		(function(){
			var XPathFactory = javax.xml.xpath.XPathFactory,
				XPathConstants = javax.xml.xpath.XPathConstants;

			var namespaceContext = new javax.xml.namespace.NamespaceContext({
				    getNamespaceURI : function(prefix) {
					return nsResolver(prefix) || javax.xml.XMLConstants.NULL_NS_URI;
				    },

				    // This method isn't necessary for XPath processing.
				    getPrefix : function(uri) {
					throw new  javax.xml.UnsupportedOperationException();
				    },

				    // This method isn't necessary for XPath processing either.
				    getPrefixes : function(uri) {
					throw new javax.xml.UnsupportedOperationException();
				    }

			});

			var factory = XPathFactory.newInstance();

			var xpathExprCache = {};

			return function(xpath,contextNode){
				var xpathObj = factory.newXPath();

				xpathObj.setNamespaceContext(namespaceContext);

				//do a bit of caching of compiled expressions to improve performance
				var expr = xpathExprCache[xpath] || 
						(xpathExprCache[xpath] = xpathObj.compile(xpath)); 

				var result = expr.evaluate(contextNode, XPathConstants.NODESET);
				return xpathSnapshotResultToJsArray(result);
			};
		})()

	return {
		query : query,
		$q : query
	}
});
