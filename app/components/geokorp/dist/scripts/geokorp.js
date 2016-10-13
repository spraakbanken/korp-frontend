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
            $http.get('components/geokorp/dist/data/places.json').success((function(_this) {
              return function(data) {
                _this.places = {
                  data: data
                };
                return def.resolve(_this.places);
              };
            })(this)).error((function(_this) {
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
            $http.get('components/geokorp/dist/data/name_mapping.json').success(function(data) {
              return def.resolve({
                data: data
              });
            }).error(function() {
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
        var baseLayers, createClusterIcon, createMarkerCluster, createMarkerIcon, map, mouseOut, mouseOver, openStreetMap, shouldZooomToBounds, stamenWaterColor;
        scope.useClustering = angular.isDefined(scope.useClustering) ? scope.useClustering : true;
        scope.showMap = false;
        scope.hoverTemplate = "<div class=\"hover-info\">\n   <div ng-if=\"showLabel\" class=\"swatch\" style=\"background-color: {{color}}\"></div><div ng-if=\"showLabel\" style=\"display: inline; font-weight: bold; font-size: 15px\">{{label}}</div>\n   <div><span>{{ 'map_name' | loc }}: </span> <span>{{point.name}}</span></div>\n   <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{point.abs}}</span></div>\n   <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{point.rel | number:2}}</span></div>\n</div>";
        map = angular.element(element.find(".map-container"));
        scope.map = L.map(map[0], {
          minZoom: 1,
          maxZoom: 13
        }).setView([51.505, -0.09], 13);
        scope.selectedMarkers = [];
        stamenWaterColor = L.tileLayer.provider("Stamen.Watercolor");
        openStreetMap = L.tileLayer.provider("OpenStreetMap");
        createMarkerIcon = function(color) {
          return L.divIcon({
            html: '<div class="geokorp-marker" style="background-color:' + color + '"></div>',
            iconSize: new L.Point(10, 10)
          });
        };
        createClusterIcon = function(clusterGroups) {
          return function(cluster) {
            var child, color, elements, res, _i, _j, _len, _len1, _ref, _ref1;
            elements = {};
            _ref = cluster.getAllChildMarkers();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              color = child.markerData.color;
              if (!elements[color]) {
                elements[color] = [];
              }
              elements[color].push('<div class="geokorp-marker" style="display: table-cell;background-color:' + color + '"></div>');
            }
            res = [];
            _ref1 = _.values(elements);
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              elements = _ref1[_j];
              res.push('<div style="display: table-row">' + elements.join(" ") + '</div>');
            }
            return L.divIcon({
              html: '<div style="display: table">' + res.join(" ") + '</div>',
              iconSize: new L.Point(50, 50)
            });
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
        createMarkerCluster = function(clusterGroups) {
          var markerCluster;
          markerCluster = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            maxClusterRadius: 40,
            zoomToBoundsOnClick: false,
            iconCreateFunction: createClusterIcon(clusterGroups)
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
          return markerCluster;
        };
        mouseOver = function(markerData) {
          return $timeout((function() {
            return scope.$apply(function() {
              var compiled, content, hoverInfoElem, marker, markerDiv, msgScope, name, selectedMarkers, sortedMarkerData, _fn, _i, _len;
              content = [];
              if (scope.useClustering) {
                sortedMarkerData = markerData.sort(function(markerData1, markerData2) {
                  return markerData2.point.rel - markerData1.point.rel;
                });
                selectedMarkers = markerData;
              } else {
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
              }
              _fn = function(marker) {
                return markerDiv.bind('click', function() {
                  return scope.markerCallback(marker);
                });
              };
              for (_i = 0, _len = selectedMarkers.length; _i < _len; _i++) {
                marker = selectedMarkers[_i];
                msgScope = $rootScope.$new(true);
                msgScope.showLabel = scope.useClustering;
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
              return hoverInfoElem.css('opacity', '1');
            });
          }), 0);
        };
        mouseOut = function() {
          var hoverInfoElem;
          hoverInfoElem = angular.element(element.find(".hover-info-container"));
          return hoverInfoElem.css('opacity', '0');
        };
        scope.map.on('click', function(e) {
          scope.selectedMarkers = [];
          return mouseOut();
        });
        scope.$watchCollection("selectedGroups", function(selectedGroups) {
          var clusterGroups, color, marker, markerData, markerGroup, markerGroupId, marker_id, markers, _i, _len, _results;
          markers = scope.markers;
          if (scope.markerCluster) {
            scope.map.removeLayer(scope.markerCluster);
          } else if (scope.featureLayer) {
            scope.map.removeLayer(scope.featureLayer);
          }
          if (scope.useClustering) {
            clusterGroups = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = selectedGroups.length; _i < _len; _i++) {
                markerGroupId = selectedGroups[_i];
                markerGroup = markers[markerGroupId];
                _results.push([markerGroup.color, markerGroup.totalRelative]);
              }
              return _results;
            })();
            scope.markerCluster = createMarkerCluster(clusterGroups);
            scope.map.addLayer(scope.markerCluster);
          } else {
            scope.featureLayer = L.featureGroup();
            scope.map.addLayer(scope.featureLayer);
            scope.featureLayer.on('click', function(e) {
              scope.selectedMarkers = [e.layer.markerData];
              return mouseOver(scope.selectedMarkers);
            });
            scope.featureLayer.on('mouseover', function(e) {
              return mouseOver([e.layer.markerData]);
            });
            scope.featureLayer.on('mouseout', function(e) {
              if (scope.selectedMarkers.length > 0) {
                return mouseOver(scope.selectedMarkers);
              } else {
                return mouseOut();
              }
            });
          }
          _results = [];
          for (_i = 0, _len = selectedGroups.length; _i < _len; _i++) {
            markerGroupId = selectedGroups[_i];
            markerGroup = markers[markerGroupId];
            color = markerGroup.color;
            _results.push((function() {
              var _j, _len1, _ref, _results1;
              _ref = _.keys(markerGroup.markers);
              _results1 = [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                marker_id = _ref[_j];
                markerData = markerGroup.markers[marker_id];
                markerData.color = color;
                marker = L.marker([markerData.lat, markerData.lng], {
                  icon: createMarkerIcon(color)
                });
                marker.markerData = markerData;
                if (scope.useClustering) {
                  _results1.push(scope.markerCluster.addLayer(marker));
                } else {
                  _results1.push(scope.featureLayer.addLayer(marker));
                }
              }
              return _results1;
            })());
          }
          return _results;
        });
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
          useClustering: '=?sbUseClustering'
        },
        link: link,
        templateUrl: 'template/sb_map.html'
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=sb_map.js.map
