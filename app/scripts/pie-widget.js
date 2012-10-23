/******

ACTS AS PIE DIAGRAM AS WELL AS BAR DIAGRAM, DEPENDING ON THE SPECIFIED OPTIONS

******/



var pie_widget = {
	options: {
		container_id : '',
		data_items : '',
		diameter : 300,
		sort_desc : false,
		diagram_type : 1,
		offset_x: 0,
		offset_y: 0,
		bar_width : 26,
		bar_spacing : 0,
		bar_silhouette : true,
		bar_horizontal : true,
		bar_show_captions : false
	},
	shapes: [],
	canvas: null,
	
	_create: function() {
		this.shapes = this.initDiagram(this.options.data_items, {"threshold":0.01}, this.options.diagram_type);
	},
	
	changeType: function(newType) {
		this.canvas.remove();
		this.initDiagram(this.options.data_items, {"threshold":0.01}, newType);
	},
	
	resizeDiagram: function(newDiameter) {
		if(newDiameter >= 150) {
			$(this.container_id).width(newDiameter + 60);
			$(this.container_id).height(newDiameter + 60);
			this.options.diameter = newDiameter;
			this.newData(this.options.data_items, false);
		}
	},
	
	setBarWidth: function(newWidth) {
		this.bar_width = newWidth;	
	},
	
	newData: function(data_items, updateOptions) {
		//$.each(arcs, function(key, fvalue) {
		//	fvalue.
		//});
		this.canvas.remove();
		//this.options.bar_horizontal = useHorizontal;
		if(updateOptions) {
			//this.options.concat(updateOptions);
		}
		this.options.data_items = data_items;
		this.shapes = this.initDiagram(data_items, {"threshold":0.01}, this.options.diagram_type);
	},
	
	
	_constructSVGPath: function (highlight, circleTrack, continueArc, offsetX, offsetY, radius, part) {
		// If highlight==true -> make piece stand out
		var str;
		str = "M" + (offsetX+radius) + "," + (offsetY+radius);
		var radians = (part+circleTrack["accumulatedArc"])*2*Math.PI;
		str += " L";
		var lineToArcX;
		var lineToArcY;
		if (continueArc) {
			lineToArcX = circleTrack["lastArcX"];
			lineToArcY = circleTrack["lastArcY"];
		} else {
			lineToArcX = offsetX+radius;
			lineToArcY = offsetY;
		}
		
		if (highlight) {
			//hypotenusan = Math.sqrt(Math.pow((lineToArcX-offsetX-radius),2)+Math.pow((lineToArcY-offsetY-radius),2));
			var degree = Math.acos((lineToArcY-offsetY-radius)/radius);
			if(lineToArcX-offsetX-radius < 0) {
				var newX = (radius*1.1)*Math.sin(degree);
				var newY = (radius*1.1)*Math.cos(degree);
			} else {
				newX = -(radius*1.1)*Math.sin(degree);
				newY = (radius*1.1)*Math.cos(degree);
			}
			lineToArcX = offsetX+radius-newX;
			lineToArcY = offsetY+radius+newY;
		}
		
		str += (lineToArcX) + "," + (lineToArcY);
		if (highlight) {
			str += " A" + radius*1.1 + "," + radius*1.1;
		} else {
			str += " A" + radius + "," + radius;
		}
		str += " 0 ";
		if (part > 0.5) // Makes the arc always go the long way instead of taking a shortcut
			str += "1";
		else
			str += "0";
		str += ",1 ";
		var x2 = offsetX+radius+Math.sin(radians)*radius;
		var y2 = offsetY+radius-Math.cos(radians)*radius;
		
		if(!highlight) {
			circleTrack["lastArcX"] = x2;
			circleTrack["lastArcY"] = y2;
			if(part == 1.0) { // This is a strange workaround to make 100% work (but looks a bit ugly)
				circleTrack["lastArcX"] = x2-0.001;
			}
		}
		
		if (highlight) {
			var endDegree = Math.acos((y2-offsetY-radius)/radius);
			if (x2 < offsetX+radius) {
				x2 = offsetX+radius-(radius*1.1)*Math.sin(endDegree);
				y2 = offsetX+radius+(radius*1.1)*Math.cos(endDegree);
			} else {
				x2 = offsetX+radius+(radius*1.1)*Math.sin(endDegree);
				y2 = offsetX+radius+(radius*1.1)*Math.cos(endDegree);	
			}
		}
		
		if(part == 1.0) { // This is a strange workaround to make 100% work (but looks a bit ugly)
			x2 = x2-0.001;
		}
		str += x2 + "," + y2;
		if(!highlight) {
			if (continueArc) {
				circleTrack["accumulatedArc"] += part;
			} else {
				circleTrack["accumulatedArc"] = part;
			}
		}
		str += " Z";
		return str;
	},
	
	_makeSVGBars: function (parts) {
		var nowthis = this;
		var r = Raphael(this.options.container_id);
		this.canvas = r;
		var offset = 0;
		var totheight = 200;
		var barObjects = new Array();
		var counter = 0;
		$.each(parts, function(key,fvalue) {
			//r.rect(0,0,nowthis.options.offset_x,nowthis.options.offset_y,0).attr({color: "#EEEEEE"});
			// Make silhouette
			if (nowthis.options.bar_silhouette) {
				var sx = counter*(nowthis.options.bar_width+nowthis.options.bar_spacing);
				var sy = 0;
				var sw = nowthis.options.bar_width;
				var sh = totheight;
				if (nowthis.options.bar_horizontal) {
					var silrect = r.rect(nowthis.options.offset_x, sx+nowthis.options.offset_y, sh, sw, 0);
				} else {
					silrect = r.rect(sx+nowthis.options.offset_x, sy+nowthis.options.offset_y, sw, sh, 0);
				}
				silrect.attr({fill: "#F8F8F8", "stroke-width": 1, stroke:"#EEEEEE"});
			}
			//if (nowthis.options.bar_horizontal) {
				
			//} else {
				var rx = counter*(nowthis.options.bar_width+nowthis.options.bar_spacing);
				var ry = totheight-fvalue["share"]*totheight;
				var rw = nowthis.options.bar_width;
				var rh = fvalue["share"]*totheight;
			//}
			if (nowthis.options.bar_horizontal) {
				var newrect = r.rect(nowthis.options.offset_x,rx+nowthis.options.offset_y,rh,rw,0);
			} else {
				newrect = r.rect(rx+nowthis.options.offset_x,ry+nowthis.options.offset_y,rw,rh,0);
			}
			newrect.attr({fill: fvalue["color"], stroke:"#EEEEEE"});
			//newrect.attr({"opacity": 0.7});
			newrect.attr({"stroke-width": 0});
			newrect.node["shape_id"] = fvalue["shape_id"];
			if (fvalue["caption"]) {
				if (nowthis.options.bar_show_captions) {
					r.text(totheight*0.5+nowthis.options.offset_x,rx+rw*0.5+nowthis.options.offset_y,fvalue["caption"]);
				}
				//newrect.attr({title: fvalue["caption"]});
				$(newrect.node).tooltip({
				delay : 80,
				bodyHandler : function() {
					if (fvalue["caption"])
						return fvalue["caption"] + ": " + util.formatDecimalString((fvalue["share"]*100).toFixed(1),false) + "%";
					else
						return "";
					}
				});
			}
			
			//var newtext = r.text(rx,ry,"Teststräng");
			//newtext.rotate(90);
			barObjects.push(newrect);
			counter++;
			
		});
		
		return barObjects;
	},
	
	_makeSVGPie: function (pieparts, radius) {
		
		var nowthis = this;
		
		/* var start = function () {					
		},
		move = function (dx, dy) {		
		},
		up = function () {
		}; */
		
		var mouseEnter = function(event) {
			this.attr({opacity: 0.7, cursor: "move"});
		    nowthis._highlight(this);
		    // Fire callback "enteredArc":
			var callback = nowthis.options.enteredArc;
			if ($.isFunction(callback)) callback(nowthis.eventArc(this));
		}
		
		var mouseExit = function(event) {
			nowthis._deHighlight(this);
			// Fire callback "exitedArc":
			var callback = nowthis.options.exitedArc;
			if ($.isFunction(callback)) callback(nowthis.eventArc(this));
		}
		
		
		var r = Raphael(this.options.container_id);
		this.canvas = r;
		var pieTrack = new Array();
		pieTrack["accumulatedArc"] = 0;
		pieTrack["lastArcX"] = 0;
		pieTrack["lastArcY"] = 0;
		var SVGArcObjects = new Array();
		var first = true;
		
		$.each(pieparts, function(key,fvalue) {
			var partOfTotal = fvalue["share"];
			var bufferPieTrack = new Array();
			bufferPieTrack["accumulatedArc"] = pieTrack["accumulatedArc"];
			bufferPieTrack["lastArcX"] = pieTrack["lastArcX"];
			bufferPieTrack["lastArcY"] = pieTrack["lastArcY"];
			var origPath = nowthis._constructSVGPath(false,pieTrack,!first,30,30,radius,partOfTotal)
			var newPiece = r.path(origPath);
			var newPieceDOMNode = newPiece.node;
			newPieceDOMNode["continue"] = !first;
			newPieceDOMNode["offsetX"] = 30;
			newPieceDOMNode["offsetY"] = 30;
			newPieceDOMNode["radius"] = radius;
			newPieceDOMNode["shape_id"] = fvalue["shape_id"];
			newPieceDOMNode["part"] = partOfTotal;
			newPieceDOMNode["track"] = bufferPieTrack;
			newPieceDOMNode["origpath"] = origPath;
			
			$(newPieceDOMNode).tooltip({
				delay : 80,
				bodyHandler : function() {
					if (fvalue["caption"])
						return fvalue["caption"];
					else
						return "";
				}
			});
			//newPiece.drag(move,start,up);
			newPiece.mouseover(mouseEnter);
			newPiece.mouseout(mouseExit);
			
			newPiece.click(function(event){
				// Fire callback "clickedArc":
				var callback = nowthis.options.clickedArc;
				if ($.isFunction(callback)) callback(nowthis.eventArc(this));
			});
			newPiece.attr({fill: fvalue["color"]});
			newPiece.attr({stroke: "white"});
			newPiece.attr({"opacity": 0.7});
			newPiece.attr({"stroke-linejoin": "miter"});
			/*if (fvalue["caption"])
				newPiece.attr({title: fvalue["caption"]}); */
			SVGArcObjects.push(newPiece);
			if(first)
				first = false;
		});
		
		return SVGArcObjects;
	},
	
	_sortDataDescending: function (indata) {
		var sortedData = indata.slice(0);
		return sortedData.sort(function (a, b) { return (b["value"] - a["value"]); });
		//return indata.slice(0);
	},
	 
	
	initDiagram: function (indata, options, diagramtype) {
		// Creates the diagram from the data in <<data>> formatting like <<options>>, returns array of the SVG arc objects
		// <<data>> is an array with "value","id" and "caption"
		// "value" is the numeric value of the item, "id" is to connect the SVG arc item to other stuff, and "caption" is to add tooltip etc.
		
		// Default colours for the arcs:
		var defaultOptions = new Array();
		defaultOptions["colors"] = new Array();
                defaultOptions["colors"].push("90-#C0C7E0-#D0D7F0:50-#D0D7F0");
                defaultOptions["colors"].push("90-#E7C1D4-#F7D1E4:50-#F7D1E4");
                defaultOptions["colors"].push("90-#DDECC5-#EDFCD5:50-#EDFCD5");
                defaultOptions["colors"].push("90-#EFE3C8-#FFF3D8:50-#FFF3D8");
                defaultOptions["colors"].push("90-#BADED8-#CAEEE8:50-#CAEEE8");
                defaultOptions["colors"].push("90-#EFCDC8-#FFDDD8:50-#FFDDD8");
		// First sort the data in descending order
		var sortedData;
		if (this.options.sort_desc) {
			sortedData = this._sortDataDescending(indata);
		} else {
			sortedData = indata;	
		}
		
		// Calculate the sum of the array
		var total = 0;
		$.each(sortedData, function(key, fvalue) { 
			total += fvalue["value"];
		});
		// Piece of cake!
		var piePieceDefinitions = new Array();
		var acc = 0;
		var colorCount = 0;
		$.each(sortedData, function(key,fvalue) {
			var relative;
			var end = false;
			var itemID = "";
			var itemCaption = "";
			relative = fvalue["value"]/total;
			//if(relative >= options["threshold"]) {
				acc += fvalue["value"];
				itemID = fvalue["shape_id"];
				itemCaption = fvalue["caption"];
			//} else { // Too small items are gathered into one single "other" arc
				//relative = (total-acc)/total;
				//itemCaption = "other";
				//end = true;
			//}
			piePieceDefinitions.push({"share":relative, "color":(defaultOptions["colors"][colorCount]), "shape_id":itemID, "caption":itemCaption});
			if(end)
				return false;
			colorCount = (colorCount+1) % defaultOptions["colors"].length;
		});
		if (diagramtype == 0) {
			return this._makeSVGPie(piePieceDefinitions, this.options.diameter*0.5);
		} else if (diagramtype == 1) {
			return this._makeSVGBars(piePieceDefinitions);
		}
	},
	
	_highlight: function (item) {
		var n = item.node;
		if (this.options.diagram_type == 0) {
			var newpath = this._constructSVGPath(true,n["track"],n["continue"],n["offsetX"],n["offsetY"],n["radius"],n["part"]);
			item.attr({path: newpath});
		} else if (this.options.diagram_type == 1) {
			// Bar Chart
			/*item.attr({stroke: "orange"});
			item.attr({"stroke-width": 3});*/
		}
	},
	
	_deHighlight: function (item) {
		var n = item.node;
		if (this.options.diagram_type == 0) {
			item.animate({path: n["origpath"]}, 400, "elastic");
		} else if (this.options.diagram_type == 1) {
			// Bar Chart
			/*item.attr({stroke: "black"});
			item.attr({"stroke-width": 0});*/
		}
	},
	
	highlightArc: function (itemID) {
		for (var shape in this.shapes) {
			var n = this.shapes[shape].node;
			if(n) {
				if(n["shape_id"]) {
					if(n["shape_id"] == itemID) {
						// Highlight the arc
						this._highlight(this.shapes[shape]);
						return true;
					}
				}
			}
		}
		// if not...take the "other" arc
		//this._highlight(this.shapes[shape.length]);
	},
	
	deHighlightArc: function (itemID) {
		for (var shape in this.shapes) {
			var n = this.shapes[shape].node;
			if(n) {
				if(n["shape_id"]) {
					if(n["shape_id"] == itemID) {
						// Highlight the arc
						this._deHighlight(this.shapes[shape]);
						return true;
					}
				}
			}
		}
		// if not...take the "other" arc
		//this._deHighlight(this.shapes[shape.length]);
	},
	
	eventArc: function(item) {
		// Return the clicked arc's ID
		return item.node["shape_id"];
	} /*,
	
	enteredArc: function(item) {
		// Return the entered arc's ID
		return item.node["shape_id"];
	},
	
	exitedArc: function(item) {
		// Return the exited arc's ID
		return item.node["shape_id"];
	} */
}

$.widget("hp.pie_widget", pie_widget); // create the widget