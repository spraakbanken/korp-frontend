require.def("src/javascript/scxml/cgf/util/svg",
function(){

	var scxmlJsNS = "http://commons.apache.org/scxml-js";
	var svgNS = "http://www.w3.org/2000/svg";
	var scxmlNS = "http://www.w3.org/2005/07/scxml";
	var xlinkNS = "http://www.w3.org/1999/xlink";

	function getBoundingBoxInArbitrarySpace(element,mat){
		var svgRoot = element.ownerSVGElement;
		var bbox = element.getBBox();

		var cPt1 =  svgRoot.createSVGPoint();
		cPt1.x = bbox.x;
		cPt1.y = bbox.y;
		cPt1 = cPt1.matrixTransform(mat);
			
	   // repeat for other corner points and the new bbox is
	   // simply the minX/minY  to maxX/maxY of the four points.
		var cPt2 = svgRoot.createSVGPoint();
		cPt2.x = bbox.x + bbox.width;
		cPt2.y = bbox.y;
		cPt2 = cPt2.matrixTransform(mat);
		
		var cPt3 = svgRoot.createSVGPoint();
		cPt3.x = bbox.x;
		cPt3.y = bbox.y + bbox.height;
		cPt3 = cPt3.matrixTransform(mat);

		var cPt4 = svgRoot.createSVGPoint();
		cPt4.x = bbox.x + bbox.width;
		cPt4.y = bbox.y + bbox.height;
		cPt4 = cPt4.matrixTransform(mat);
		
		var points = [cPt1,cPt2,cPt3,cPt4]
		
		//find minX,minY,maxX,maxY
		var minX=1000000000000
		var minY=1000000000000
		var maxX=0
		var maxY=0
		for(i=0;i<points.length;i++)
		{
			if (points[i].x < minX)
			{
				minX = points[i].x
			}
			if (points[i].y < minY)
			{
				minY = points[i].y
			}
			if (points[i].x > maxX)
			{
				maxX = points[i].x
			}
			if (points[i].y > maxY)
			{
				maxY = points[i].y
			}
		}

		//instantiate new object that is like an SVGRect
		var newBBox = {"x":minX,"y":minY,"width":maxX-minX,"height":maxY-minY}
		return newBBox;	
	}	

	function getBBoxInCanvasSpace(element){
		return getBoundingBoxInArbitrarySpace(element,element.getTransformToElement(element.ownerSVGElement));
	}

	function getBBoxInElementSpace(element,spaceElement){
		return getBoundingBoxInArbitrarySpace(element,element.getTransformToElement(spaceElement));
	}

	function getCenter(element){
		var bbox = element.getBBox();
		return  [bbox.x + bbox.width/2, bbox.y+bbox.height/2];
	}

	function getCenterInCanvasSpace(element){
		var bbox = getBBoxInCanvasSpace(element);
		return  [bbox.x + bbox.width/2, bbox.y+bbox.height/2];
	}


	function getCenterInElementSpace(element,spaceElement){
		var bbox = getBBoxInElementSpace(element,spaceElement);
		return  [bbox.x + bbox.width/2, bbox.y+bbox.height/2];
	}

	function translate(rawNode,dx,dy){
		var tl = rawNode.transform.baseVal;
		var t = tl.numberOfItems ? tl.getItem(0) : rawNode.ownerSVGElement.createSVGTransform();
		var m = t.matrix;
		var newM = rawNode.ownerSVGElement.createSVGMatrix().translate(dx,dy).multiply(m);
		t.setMatrix(newM);
		tl.initialize(t);
		return newM;
	}

	function translateTo(e,x,y){
		// Convenience method: Moves this entity to the new location 
		var bbox = e.getBBox();
		var curX = bbox.x, curY = bbox.y;
		var dx = x - curX;
		var dy = y - curY; 
		translate(e, {dx:dx, dy:dy});
	}

	//this code borrowed from jquery
	var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
	var rclass = /[\n\t]/g,
		rspace = /\s+/,
		rreturn = /\r/g,
		rspecialurl = /href|src|style/,
		rtype = /(button|input)/i,
		rfocusable = /(button|input|object|select|textarea)/i,
		rclickable = /^(a|area)$/i,
		rradiocheck = /radio|checkbox/;


	function trim(text){
		return (text || "").replace( rtrim, "" );
	}

	function addClass( elem, value ) {
		if ( value && typeof value === "string" ) {
			var classNames = (value || "").split( rspace );

			if ( elem.nodeType === 1 ) {
				if ( !elem.className.baseVal ) {
					elem.className.baseVal = value;

				} else {
					var className = " " + elem.className.baseVal + " ", setClass = elem.className.baseVal;
					for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
						if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
							setClass += " " + classNames[c];
						}
					}
					elem.className.baseVal = trim( setClass );
				}
			}
		}

		return elem;
	}

	function removeClass(elem, value ) {
		if ( (value && typeof value === "string") || value === undefined ) {
			var classNames = (value || "").split(rspace);

			if ( elem.nodeType === 1 && elem.className.baseVal ) {
				if ( value ) {
					var className = (" " + elem.className.baseVal + " ").replace(rclass, " ");
					for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
						className = className.replace(" " + classNames[c] + " ", " ");
					}
					elem.className.baseVal = trim( className );

				} else {
					elem.className.baseVal = "";
				}
			}
		}

		return elem;
	}

	return {
		SVG_NS: svgNS , 
		SCXML_NS : scxmlNS , 
		SCXML_JS_NS : scxmlJsNS , 
		XLINK_NS : xlinkNS,

		translate : translate,
		translateTo : translateTo,
		getBBoxInCanvasSpace : getBBoxInCanvasSpace,
		getBBoxInElementSpace : getBBoxInElementSpace,

		addClass: addClass,
		removeClass : removeClass
	}
})
