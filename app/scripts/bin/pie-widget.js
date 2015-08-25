(function() {
  var pie_widget;

  pie_widget = {
    options: {
      container_id: "",
      data_items: "",
      diameter: 300,
      sort_desc: true,
      offset_x: 0,
      offset_y: 0
    },
    shapes: [],
    canvas: null,
    _create: function() {
      return this.shapes = this.initDiagram(this.options.data_items);
    },
    resizeDiagram: function(newDiameter) {
      if (newDiameter >= 150) {
        $(this.container_id).width(newDiameter + 60);
        $(this.container_id).height(newDiameter + 60);
        this.options.diameter = newDiameter;
        return this.newData(this.options.data_items, false);
      }
    },
    newData: function(data_items) {
      this.canvas.remove();
      this.options.data_items = data_items;
      return this.shapes = this.initDiagram(data_items);
    },
    _constructSVGPath: function(highlight, circleTrack, continueArc, offsetX, offsetY, radius, part) {
      var degree, endDegree, lineToArcX, lineToArcY, newX, newY, radians, str, x2, y2;
      str = "M" + (offsetX + radius) + "," + (offsetY + radius);
      if (part === 1.0) {
        str += "\nm -" + radius + ", 0\n";
        str += "a " + radius + "," + radius + " 0 1,0 " + radius * 2 + ",0";
        str += "a " + radius + "," + radius + " 0 1,0 -" + radius * 2 + ",0";
        str += " Z";
        return str;
      } else {
        radians = (part + circleTrack["accumulatedArc"]) * 2 * Math.PI;
        str += " L";
        if (continueArc) {
          lineToArcX = circleTrack["lastArcX"];
          lineToArcY = circleTrack["lastArcY"];
        } else {
          lineToArcX = offsetX + radius;
          lineToArcY = offsetY;
        }
        if (highlight) {
          degree = Math.acos((lineToArcY - offsetY - radius) / radius);
          if (lineToArcX - offsetX - radius < 0) {
            newX = (radius * 1.1) * Math.sin(degree);
            newY = (radius * 1.1) * Math.cos(degree);
          } else {
            newX = -(radius * 1.1) * Math.sin(degree);
            newY = (radius * 1.1) * Math.cos(degree);
          }
          lineToArcX = offsetX + radius - newX;
          lineToArcY = offsetY + radius + newY;
        }
        str += lineToArcX + "," + lineToArcY;
        if (highlight) {
          str += " A" + radius * 1.1 + "," + radius * 1.1;
        } else {
          str += " A" + radius + "," + radius;
        }
        str += " 0 ";
        if (part > 0.5) {
          str += "1";
        } else {
          str += "0";
        }
        str += ",1 ";
        x2 = offsetX + radius + Math.sin(radians) * radius;
        y2 = offsetY + radius - Math.cos(radians) * radius;
        if (!highlight) {
          circleTrack["lastArcX"] = x2;
          circleTrack["lastArcY"] = y2;
        }
        if (highlight) {
          endDegree = Math.acos((y2 - offsetY - radius) / radius);
          if (x2 < offsetX + radius) {
            x2 = offsetX + radius - (radius * 1.1) * Math.sin(endDegree);
            y2 = offsetX + radius + (radius * 1.1) * Math.cos(endDegree);
          } else {
            x2 = offsetX + radius + (radius * 1.1) * Math.sin(endDegree);
            y2 = offsetX + radius + (radius * 1.1) * Math.cos(endDegree);
          }
        }
        str += x2 + "," + y2;
        if (!highlight) {
          if (continueArc) {
            circleTrack["accumulatedArc"] += part;
          } else {
            circleTrack["accumulatedArc"] = part;
          }
        }
        str += " Z";
        return str;
      }
    },
    _makeSVGPie: function(pieparts, radius) {
      var SVGArcObjects, bufferPieTrack, first, fvalue, mouseEnter, mouseExit, newPiece, newPieceDOMNode, nowthis, origPath, partOfTotal, pieTrack, r, _i, _len;
      nowthis = this;
      mouseEnter = function(event) {
        var callback;
        this.attr({
          opacity: 0.7,
          cursor: "move"
        });
        nowthis._highlight(this);
        callback = nowthis.options.enteredArc;
        if ($.isFunction(callback)) {
          return callback(nowthis.eventArc(this));
        }
      };
      mouseExit = function(event) {
        var callback;
        nowthis._deHighlight(this);
        callback = nowthis.options.exitedArc;
        if ($.isFunction(callback)) {
          return callback(nowthis.eventArc(this));
        }
      };
      r = Raphael(this.options.container_id);
      this.canvas = r;
      pieTrack = [];
      pieTrack["accumulatedArc"] = 0;
      pieTrack["lastArcX"] = 0;
      pieTrack["lastArcY"] = 0;
      SVGArcObjects = [];
      first = true;
      for (_i = 0, _len = pieparts.length; _i < _len; _i++) {
        fvalue = pieparts[_i];
        partOfTotal = fvalue["share"];
        if (partOfTotal !== 0) {
          bufferPieTrack = [];
          bufferPieTrack["accumulatedArc"] = pieTrack["accumulatedArc"];
          bufferPieTrack["lastArcX"] = pieTrack["lastArcX"];
          bufferPieTrack["lastArcY"] = pieTrack["lastArcY"];
          origPath = nowthis._constructSVGPath(false, pieTrack, !first, 30, 30, radius, partOfTotal);
          newPiece = r.path(origPath);
          newPieceDOMNode = newPiece.node;
          newPieceDOMNode["continue"] = !first;
          newPieceDOMNode["offsetX"] = 30;
          newPieceDOMNode["offsetY"] = 30;
          newPieceDOMNode["radius"] = radius;
          newPieceDOMNode["shape_id"] = fvalue["shape_id"];
          newPieceDOMNode["caption"] = fvalue["caption"];
          newPieceDOMNode["part"] = partOfTotal;
          newPieceDOMNode["track"] = bufferPieTrack;
          newPieceDOMNode["origpath"] = origPath;
          $(newPieceDOMNode).tooltip({
            delay: 80,
            bodyHandler: function() {
              return this.caption || "";
            }
          });
          newPiece.mouseover(mouseEnter);
          newPiece.mouseout(mouseExit);
          newPiece.click(function(event) {
            var callback;
            callback = nowthis.options.clickedArc;
            if ($.isFunction(callback)) {
              return callback(nowthis.eventArc(this));
            }
          });
          newPiece.attr({
            fill: fvalue["color"]
          });
          newPiece.attr({
            stroke: "white"
          });
          newPiece.attr({
            opacity: 0.7
          });
          newPiece.attr({
            "stroke-linejoin": "miter"
          });
          SVGArcObjects.push(newPiece);
          if (first) {
            first = false;
          }
        }
      }
      return SVGArcObjects;
    },
    _sortDataDescending: function(indata) {
      var sortedData;
      sortedData = indata.slice(0);
      return sortedData.sort(function(a, b) {
        return b["value"] - a["value"];
      });
    },
    initDiagram: function(indata) {
      var acc, colorCount, defaultOptions, fvalue, itemCaption, itemID, piePieceDefinitions, relative, sortedData, total, _i, _j, _len, _len1;
      defaultOptions = {
        colors: ["90-#C0C7E0-#D0D7F0:50-#D0D7F0", "90-#E7C1D4-#F7D1E4:50-#F7D1E4", "90-#DDECC5-#EDFCD5:50-#EDFCD5", "90-#EFE3C8-#FFF3D8:50-#FFF3D8", "90-#BADED8-#CAEEE8:50-#CAEEE8", "90-#EFCDC8-#FFDDD8:50-#FFDDD8"]
      };
      sortedData = this.options.sort_desc ? this._sortDataDescending(indata) : indata;
      total = 0;
      for (_i = 0, _len = sortedData.length; _i < _len; _i++) {
        fvalue = sortedData[_i];
        total += fvalue["value"];
      }
      piePieceDefinitions = [];
      acc = 0;
      colorCount = 0;
      for (_j = 0, _len1 = sortedData.length; _j < _len1; _j++) {
        fvalue = sortedData[_j];
        relative = fvalue["value"] / total;
        acc += fvalue["value"];
        itemID = fvalue["shape_id"];
        itemCaption = fvalue["caption"];
        piePieceDefinitions.push({
          share: relative,
          color: defaultOptions["colors"][colorCount],
          shape_id: itemID,
          caption: itemCaption
        });
        colorCount = (colorCount + 1) % defaultOptions["colors"].length;
      }
      return this._makeSVGPie(piePieceDefinitions, this.options.diameter * 0.5);
    },
    _highlight: function(item) {
      var n, newpath;
      n = item.node;
      newpath = this._constructSVGPath(true, n["track"], n["continue"], n["offsetX"], n["offsetY"], n["radius"], n["part"]);
      return item.attr({
        path: newpath
      });
    },
    _deHighlight: function(item) {
      var n;
      n = item.node;
      return item.animate({
        path: n["origpath"]
      }, 400, "elastic");
    },
    highlightArc: function(itemID) {
      var n, shape;
      for (shape in this.shapes) {
        n = this.shapes[shape].node;
        if ((n != null ? n.shape_id : void 0) === itemID) {
          this._highlight(this.shapes[shape]);
          return true;
        }
      }
    },
    deHighlightArc: function(itemID) {
      var n, shape;
      for (shape in this.shapes) {
        n = this.shapes[shape].node;
        if ((n != null ? n.shape_id : void 0) === itemID) {
          this._deHighlight(this.shapes[shape]);
          return true;
        }
      }
    },
    eventArc: function(item) {
      return item.node["shape_id"];
    }
  };

  $.widget("hp.pie_widget", pie_widget);

}).call(this);

//# sourceMappingURL=pie-widget.js.map
