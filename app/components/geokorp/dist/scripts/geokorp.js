(function() {
  'use strict';
  var c,
    __hasProp = {}.hasOwnProperty;

  c = console;

  angular.module('sbMap', ['sbMapTemplate']).factory('places', [
    '$q', '$http', function($q, $http) {
      var Places;
      Places = (function() {
        function Places() {
          this.places = null;
        }

        Places.prototype.getLocationData = function() {
          var def;
          def = $q.defer();
          if (!this.places) {
            $http.get('components/geokorp/dist/data/places.json').then((function(_this) {
              return function(response) {
                _this.places = {
                  data: response.data
                };
                return def.resolve(_this.places);
              };
            })(this))["catch"]((function(_this) {
              return function() {
                def.reject();
                return c.log("failed to get place data for sb map");
              };
            })(this));
          } else {
            def.resolve(this.places);
          }
          return def.promise;
        };

        return Places;

      })();
      return new Places();
    }
  ]).factory('nameMapper', [
    '$q', '$http', function($q, $http) {
      var NameMapper;
      NameMapper = (function() {
        function NameMapper() {
          this.mapper = null;
        }

        NameMapper.prototype.getNameMapper = function() {
          var def;
          def = $q.defer();
          if (!this.mapper) {
            $http.get('components/geokorp/dist/data/name_mapping.json').then(function(response) {
              return def.resolve({
                data: response.data
              });
            })["catch"](function() {
              c.log("failed to get name mapper for sb map");
              return def.reject();
            });
          } else {
            def.resolve(this.mapper);
          }
          return def.promise;
        };

        return NameMapper;

      })();
      return new NameMapper();
    }
  ]).factory('markers', [
    '$rootScope', '$q', '$http', 'places', 'nameMapper', function($rootScope, $q, $http, places, nameMapper) {
      var icon;
      icon = {
        type: 'div',
        iconSize: [5, 5],
        html: '<span class="dot"></span>',
        popupAnchor: [0, 0]
      };
      return function(nameData) {
        var deferred;
        deferred = $q.defer();
        $q.all([places.getLocationData(), nameMapper.getNameMapper()]).then(function(_arg) {
          var locs, mappedLocations, mappedName, markers, name, nameLow, nameMapperResponse, names, placeResponse, usedNames, _fn, _i, _len;
          placeResponse = _arg[0], nameMapperResponse = _arg[1];
          names = _.keys(nameData);
          usedNames = [];
          markers = {};
          mappedLocations = {};
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            mappedName = null;
            nameLow = name.toLowerCase();
            if (nameMapperResponse.data.hasOwnProperty(nameLow)) {
              mappedName = nameMapperResponse.data[nameLow];
            } else if (placeResponse.data.hasOwnProperty(nameLow)) {
              mappedName = nameLow;
            }
            if (mappedName) {
              locs = mappedLocations[mappedName];
              if (!locs) {
                locs = {};
              }
              locs[name] = nameData[name];
              mappedLocations[mappedName] = locs;
            }
          }
          _fn = function(name, locs) {
            var id, lat, lng, _ref;
            _ref = placeResponse.data[name], lat = _ref[0], lng = _ref[1];
            id = name.replace(/-/g, "");
            return markers[id] = {
              icon: icon,
              lat: lat,
              lng: lng,
              names: locs
            };
          };
          for (name in mappedLocations) {
            if (!__hasProp.call(mappedLocations, name)) continue;
            locs = mappedLocations[name];
            _fn(name, locs);
          }
          return deferred.resolve(markers);
        });
        return deferred.promise;
      };
    }
  ]).directive('sbMap', [
    '$compile', '$timeout', '$rootScope', function($compile, $timeout, $rootScope) {
      var link;
      link = function(scope, element, attrs) {
        var baseLayers, createCircleMarker, createClusterIcon, createFeatureLayer, createMarkerCluster, createMarkerIcon, createMultiMarkerIcon, map, mergeMarkers, mouseOut, mouseOver, openStreetMap, shouldZooomToBounds, stamenWaterColor, updateMarkerSizes, updateMarkers;
        scope.useClustering = angular.isDefined(scope.useClustering) ? scope.useClustering : true;
        scope.oldMap = angular.isDefined(scope.oldMap) ? scope.oldMap : false;
        scope.showMap = false;
        scope.hoverTemplate = "<div class=\"hover-info\">\n   <div ng-if=\"showLabel\" class=\"swatch\" style=\"background-color: {{color}}\"></div><div ng-if=\"showLabel\" style=\"display: inline; font-weight: bold; font-size: 15px\">{{label}}</div>\n   <div><span>{{ 'map_name' | loc }}: </span> <span>{{point.name}}</span></div>\n   <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{point.abs}}</span></div>\n   <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{point.rel | number:2}}</span></div>\n</div>";
        map = angular.element(element.find(".map-container"));
        scope.map = L.map(map[0], {
          minZoom: 1,
          maxZoom: 13
        }).setView([51.505, -0.09], 13);
        scope.selectedMarkers = [];
        scope.$on("update_map", function() {
          return $timeout((function() {
            return scope.map.invalidateSize();
          }), 0);
        });
        stamenWaterColor = L.tileLayer.provider("Stamen.Watercolor");
        openStreetMap = L.tileLayer.provider("OpenStreetMap");
        createCircleMarker = function(color, diameter, borderRadius) {
          return L.divIcon({
            html: '<div class="geokorp-marker" style="border-radius:' + borderRadius + 'px;height:' + diameter + 'px;background-color:' + color + '"></div>',
            iconSize: new L.Point(diameter, diameter)
          });
        };
        createMarkerIcon = function(color, cluster) {
          return createCircleMarker(color, 10, cluster ? 1 : 5);
        };
        createMultiMarkerIcon = function(markerData) {
          var center, circle, color, diameter, elements, grid, gridSize, height, id, idx, marker, markerClass, neg, row, something, stop, width, x, xOp, y, yOp, _i, _j;
          elements = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = markerData.length; _i < _len; _i++) {
              marker = markerData[_i];
              color = marker.color;
              diameter = ((marker.point.rel / scope.maxRel) * 40) + 10;
              _results.push([diameter, '<div class="geokorp-multi-marker" style="border-radius:' + diameter + 'px;height:' + diameter + 'px;width:' + diameter + 'px;background-color:' + color + '"></div>']);
            }
            return _results;
          })();
          elements.sort(function(element1, element2) {
            return element1[0] - element2[0];
          });
          gridSize = (Math.ceil(Math.sqrt(elements.length))) + 1;
          gridSize = gridSize % 2 === 0 ? gridSize + 1 : gridSize;
          center = Math.floor(gridSize / 2);
          grid = (function() {
            var _i, _ref, _results;
            _results = [];
            for (x = _i = 0, _ref = gridSize - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
              _results.push([]);
            }
            return _results;
          })();
          id = function(x) {
            return x;
          };
          neg = function(x) {
            return -x;
          };
          for (idx = _i = 0; 0 <= center ? _i <= center : _i >= center; idx = 0 <= center ? ++_i : --_i) {
            x = -1;
            y = -1;
            xOp = neg;
            yOp = neg;
            stop = idx === 0 ? 0 : idx * 4 - 1;
            for (something = _j = 0; 0 <= stop ? _j <= stop : _j >= stop; something = 0 <= stop ? ++_j : --_j) {
              if (x === -1) {
                x = center + idx;
              } else {
                x = x + xOp(1);
              }
              if (y === -1) {
                y = center;
              } else {
                y = y + yOp(1);
              }
              if (x === center - idx) {
                xOp = id;
              }
              if (y === center - idx) {
                yOp = id;
              }
              if (x === center + idx) {
                xOp = neg;
              }
              if (y === center + idx) {
                yOp = neg;
              }
              circle = elements.pop();
              if (circle) {
                grid[y][x] = circle;
              } else {
                break;
              }
            }
          }
          grid = _.filter(grid, function(row) {
            return row.length > 0;
          });
          grid = _.map(grid, function(row) {
            return row = _.filter(row, function(elem) {
              return elem;
            });
          });
          height = 0;
          width = 0;
          center = Math.floor(grid.length / 2);
          grid = (function() {
            var _k, _len, _results;
            _results = [];
            for (idx = _k = 0, _len = grid.length; _k < _len; idx = ++_k) {
              row = grid[idx];
              height = height + _.reduce(row, (function(memo, val) {
                if (val[0] > memo) {
                  return val[0];
                } else {
                  return memo;
                }
              }), 0);
              if (idx < center) {
                markerClass = 'marker-bottom';
              }
              if (idx === center) {
                width = _.reduce(grid[center], (function(memo, val) {
                  return memo + val[0];
                }), 0);
                markerClass = 'marker-middle';
              }
              if (idx > center) {
                markerClass = 'marker-top';
              }
              _results.push('<div class="' + markerClass + '" style="text-align: center;line-height: 0;">' + _.map(row, function(elem) {
                return elem[1];
              }).join('') + '</div>');
            }
            return _results;
          })();
          return L.divIcon({
            html: grid.join(''),
            iconSize: new L.Point(width, height)
          });
        };
        createClusterIcon = function(clusterGroups, restColor) {
          var allGroups, visibleGroups;
          allGroups = _.keys(clusterGroups);
          visibleGroups = allGroups.sort(function(group1, group2) {
            return clusterGroups[group1].order - clusterGroups[group2].order;
          });
          if (allGroups.length > 4) {
            visibleGroups = visibleGroups.splice(0, 3);
            visibleGroups.push(restColor);
          }
          return function(cluster) {
            var child, color, diameter, divWidth, elements, group, groupSize, rel, sizes, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
            sizes = {};
            for (_i = 0, _len = visibleGroups.length; _i < _len; _i++) {
              group = visibleGroups[_i];
              sizes[group] = 0;
            }
            _ref = cluster.getAllChildMarkers();
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              child = _ref[_j];
              color = child.markerData.color;
              if (!(color in sizes)) {
                color = restColor;
              }
              rel = child.markerData.point.rel;
              sizes[color] = sizes[color] + rel;
            }
            if (allGroups.length === 1) {
              color = _.keys(sizes)[0];
              groupSize = sizes[color];
              diameter = ((groupSize / scope.maxRel) * 45) + 5;
              return createCircleMarker(color, diameter, diameter);
            } else {
              elements = "";
              _ref1 = _.keys(sizes);
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                color = _ref1[_k];
                groupSize = sizes[color];
                divWidth = ((groupSize / scope.maxRel) * 45) + 5;
                elements = elements + '<div class="cluster-geokorp-marker" style="height:' + divWidth + 'px;background-color:' + color + '"></div>';
              }
              return L.divIcon({
                html: '<div class="cluster-geokorp-marker-group">' + elements + '</div>',
                iconSize: new L.Point(40, 50)
              });
            }
          };
        };
        shouldZooomToBounds = function(cluster) {
          var boundsZoom, childCluster, childClusters, newClusters, zoom, _i, _len;
          childClusters = cluster._childClusters.slice();
          map = cluster._group._map;
          boundsZoom = map.getBoundsZoom(cluster._bounds);
          zoom = cluster._zoom + 1;
          while (childClusters.length > 0 && boundsZoom > zoom) {
            zoom = zoom + 1;
            newClusters = [];
            for (_i = 0, _len = childClusters.length; _i < _len; _i++) {
              childCluster = childClusters[_i];
              newClusters = newClusters.concat(childCluster._childClusters);
            }
            childClusters = newClusters;
          }
          return childClusters.length > 1;
        };
        updateMarkerSizes = function() {
          var bounds;
          bounds = scope.map.getBounds();
          scope.maxRel = 0;
          if (scope.useClustering && scope.markerCluster) {
            scope.map.eachLayer(function(layer) {
              var child, color, rel, sumRel, sumRels, _i, _j, _len, _len1, _ref, _ref1, _results;
              if (layer.getChildCount) {
                sumRels = {};
                _ref = layer.getAllChildMarkers();
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  child = _ref[_i];
                  color = child.markerData.color;
                  if (!sumRels[color]) {
                    sumRels[color] = 0;
                  }
                  sumRels[color] = sumRels[color] + child.markerData.point.rel;
                }
                _ref1 = _.values(sumRels);
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  sumRel = _ref1[_j];
                  if (sumRel > scope.maxRel) {
                    _results.push(scope.maxRel = sumRel);
                  } else {
                    _results.push(void 0);
                  }
                }
                return _results;
              } else if (layer.markerData) {
                rel = layer.markerData.point.rel;
                if (rel > scope.maxRel) {
                  return scope.maxRel = rel;
                }
              }
            });
            return scope.markerCluster.refreshClusters();
          }
        };
        createFeatureLayer = function() {
          var featureLayer;
          featureLayer = L.featureGroup();
          featureLayer.on('click', function(e) {
            if (e.layer.markerData instanceof Array) {
              scope.selectedMarkers = e.layer.markerData;
            } else {
              scope.selectedMarkers = [e.layer.markerData];
            }
            return mouseOver(scope.selectedMarkers);
          });
          featureLayer.on('mouseover', function(e) {
            if (e.layer.markerData instanceof Array) {
              return mouseOver(e.layer.markerData);
            } else {
              return mouseOver([e.layer.markerData]);
            }
          });
          featureLayer.on('mouseout', function(e) {
            if (scope.selectedMarkers.length > 0) {
              return mouseOver(scope.selectedMarkers);
            } else {
              return mouseOut();
            }
          });
          return featureLayer;
        };
        createMarkerCluster = function(clusterGroups, restColor) {
          var markerCluster;
          markerCluster = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            maxClusterRadius: 40,
            zoomToBoundsOnClick: false,
            iconCreateFunction: createClusterIcon(clusterGroups, restColor)
          });
          markerCluster.on('clustermouseover', function(e) {
            return mouseOver(_.map(e.layer.getAllChildMarkers(), function(layer) {
              return layer.markerData;
            }));
          });
          markerCluster.on('clustermouseout', function(e) {
            if (scope.selectedMarkers.length > 0) {
              return mouseOver(scope.selectedMarkers);
            } else {
              return mouseOut();
            }
          });
          markerCluster.on('clusterclick', function(e) {
            scope.selectedMarkers = _.map(e.layer.getAllChildMarkers(), function(layer) {
              return layer.markerData;
            });
            mouseOver(scope.selectedMarkers);
            if (shouldZooomToBounds(e.layer)) {
              return e.layer.zoomToBounds();
            }
          });
          markerCluster.on('click', function(e) {
            scope.selectedMarkers = [e.layer.markerData];
            return mouseOver(scope.selectedMarkers);
          });
          markerCluster.on('mouseover', function(e) {
            return mouseOver([e.layer.markerData]);
          });
          markerCluster.on('mouseout', function(e) {
            if (scope.selectedMarkers.length > 0) {
              return mouseOver(scope.selectedMarkers);
            } else {
              return mouseOut();
            }
          });
          markerCluster.on('animationend', function(e) {
            return updateMarkerSizes();
          });
          return markerCluster;
        };
        mouseOver = function(markerData) {
          return $timeout((function() {
            return scope.$apply(function() {
              var compiled, content, hoverInfoElem, marker, markerDiv, msgScope, name, oldMap, selectedMarkers, _fn, _i, _len;
              content = [];
              oldMap = false;
              if (markerData[0].names) {
                oldMap = true;
                selectedMarkers = (function() {
                  var _i, _len, _ref, _results;
                  _ref = _.keys(markerData[0].names);
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    name = _ref[_i];
                    _results.push({
                      color: markerData[0].color,
                      searchCqp: markerData[0].searchCqp,
                      point: {
                        name: name,
                        abs: markerData[0].names[name].abs_occurrences,
                        rel: markerData[0].names[name].rel_occurrences
                      }
                    });
                  }
                  return _results;
                })();
              } else {
                markerData.sort(function(markerData1, markerData2) {
                  return markerData2.point.rel - markerData1.point.rel;
                });
                selectedMarkers = markerData;
              }
              _fn = function(marker) {
                return markerDiv.bind('click', function() {
                  return scope.markerCallback(marker);
                });
              };
              for (_i = 0, _len = selectedMarkers.length; _i < _len; _i++) {
                marker = selectedMarkers[_i];
                msgScope = $rootScope.$new(true);
                msgScope.showLabel = !oldMap;
                msgScope.point = marker.point;
                msgScope.label = marker.label;
                msgScope.color = marker.color;
                compiled = $compile(scope.hoverTemplate);
                markerDiv = compiled(msgScope);
                _fn(marker);
                content.push(markerDiv);
              }
              hoverInfoElem = angular.element(element.find(".hover-info-container"));
              hoverInfoElem.empty();
              hoverInfoElem.append(content);
              hoverInfoElem[0].scrollTop = 0;
              hoverInfoElem.css('opacity', '1');
              return hoverInfoElem.css('display', 'block');
            });
          }), 0);
        };
        mouseOut = function() {
          var hoverInfoElem;
          hoverInfoElem = angular.element(element.find(".hover-info-container"));
          hoverInfoElem.css('opacity', '0');
          return hoverInfoElem.css('display', 'none');
        };
        scope.showHoverInfo = false;
        scope.map.on('click', function(e) {
          scope.selectedMarkers = [];
          return mouseOut();
        });
        scope.$watchCollection("selectedGroups", function(selectedGroups) {
          return updateMarkers();
        });
        scope.$watch('useClustering', function(newVal, oldVal) {
          if (newVal === !oldVal) {
            return updateMarkers();
          }
        });
        updateMarkers = function() {
          var clusterGroups, color, group, groupData, marker, markerData, markerGroup, markerGroupId, marker_id, markers, selectedGroups, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
          selectedGroups = scope.selectedGroups;
          markers = scope.markers;
          if (scope.markerCluster) {
            scope.map.removeLayer(scope.markerCluster);
          }
          if (scope.featureLayer) {
            scope.map.removeLayer(scope.featureLayer);
          }
          if (scope.useClustering) {
            clusterGroups = {};
            for (_i = 0, _len = selectedGroups.length; _i < _len; _i++) {
              group = selectedGroups[_i];
              groupData = markers[group];
              clusterGroups[groupData.color] = {
                order: groupData.order
              };
            }
            scope.markerCluster = createMarkerCluster(clusterGroups, scope.restColor);
            scope.map.addLayer(scope.markerCluster);
          } else {
            scope.featureLayer = createFeatureLayer();
            scope.map.addLayer(scope.featureLayer);
          }
          if (scope.useClustering || scope.oldMap) {
            for (_j = 0, _len1 = selectedGroups.length; _j < _len1; _j++) {
              markerGroupId = selectedGroups[_j];
              markerGroup = markers[markerGroupId];
              color = markerGroup.color;
              scope.maxRel = 0;
              _ref = _.keys(markerGroup.markers);
              for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
                marker_id = _ref[_k];
                markerData = markerGroup.markers[marker_id];
                markerData.color = color;
                marker = L.marker([markerData.lat, markerData.lng], {
                  icon: createMarkerIcon(color, !scope.oldMap && selectedGroups.length !== 1)
                });
                marker.markerData = markerData;
                if (scope.useClustering) {
                  scope.markerCluster.addLayer(marker);
                } else {
                  scope.featureLayer.addLayer(marker);
                }
              }
            }
          } else {
            markers = (function() {
              var _l, _len3, _results;
              _results = [];
              for (_l = 0, _len3 = selectedGroups.length; _l < _len3; _l++) {
                markerGroupId = selectedGroups[_l];
                _results.push(markers[markerGroupId]);
              }
              return _results;
            })();
            _ref1 = mergeMarkers(_.values(markers));
            for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
              markerData = _ref1[_l];
              marker = L.marker([markerData.lat, markerData.lng], {
                icon: createMultiMarkerIcon(markerData.markerData)
              });
              marker.markerData = markerData.markerData;
              scope.featureLayer.addLayer(marker);
            }
          }
          return updateMarkerSizes();
        };
        mergeMarkers = function(markerLists) {
          var val;
          scope.maxRel = 0;
          val = _.reduce(markerLists, (function(memo, val) {
            var latLng, markerData, markerId, _ref;
            _ref = val.markers;
            for (markerId in _ref) {
              markerData = _ref[markerId];
              markerData.color = val.color;
              latLng = markerData.lat + ',' + markerData.lng;
              if (markerData.point.rel > scope.maxRel) {
                scope.maxRel = markerData.point.rel;
              }
              if (latLng in memo) {
                memo[latLng].markerData.push(markerData);
              } else {
                memo[latLng] = {
                  markerData: [markerData]
                };
                memo[latLng].lat = markerData.lat;
                memo[latLng].lng = markerData.lng;
              }
            }
            return memo;
          }), {});
          return _.values(val);
        };
        if (scope.baseLayer === "Stamen Watercolor") {
          stamenWaterColor.addTo(scope.map);
        } else {
          openStreetMap.addTo(scope.map);
        }
        baseLayers = {
          "Stamen Watercolor": stamenWaterColor,
          "OpenStreetMap": openStreetMap
        };
        L.control.layers(baseLayers, null, {
          position: "bottomleft"
        }).addTo(scope.map);
        scope.map.setView([scope.center.lat, scope.center.lng], scope.center.zoom);
        return scope.showMap = true;
      };
      return {
        restrict: 'E',
        scope: {
          markers: '=sbMarkers',
          center: '=sbCenter',
          baseLayer: '=sbBaseLayer',
          markerCallback: '=sbMarkerCallback',
          selectedGroups: '=sbSelectedGroups',
          useClustering: '=?sbUseClustering',
          restColor: '=?sbRestColor',
          oldMap: '=?sbOldMap'
        },
        link: link,
        templateUrl: 'template/sb_map.html'
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=sb_map.js.map
