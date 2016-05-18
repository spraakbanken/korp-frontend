(function() {
  'use strict';
  var c,
    __hasProp = {}.hasOwnProperty;

  c = console;

  angular.module('sbMap', ['leaflet-directive', 'sbMapTemplate']).factory('places', [
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
            var id, lat, lng, s, _ref;
            _ref = placeResponse.data[name], lat = _ref[0], lng = _ref[1];
            s = $rootScope.$new(true);
            s.names = locs;
            id = name.replace(/-/g, "");
            markers[id] = {
              icon: icon,
              lat: lat,
              lng: lng
            };
            return markers[id].getMessageScope = function() {
              return s;
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
    '$compile', '$timeout', 'leafletData', 'leafletEvents', function($compile, $timeout, leafletData, leafletEvents) {
      var link;
      link = function(scope, element, attrs) {
        var osmLayer, stamenLayer;
        scope.$on('leafletDirectiveMarker.mouseover', function(event, marker) {
          var index, msgScope;
          index = marker.modelName;
          msgScope = scope.markers[index].getMessageScope();
          return $timeout((function() {
            return scope.$apply(function() {
              var compiled, content;
              compiled = $compile(scope.hoverTemplate);
              content = compiled(msgScope);
              angular.element('#hover-info').empty();
              angular.element('#hover-info').append(content);
              return angular.element('.hover-info').css('opacity', '1');
            });
          }), 0);
        });
        scope.$on('leafletDirectiveMarker.mouseout', function(event) {
          return angular.element('.hover-info').css('opacity', '0');
        });
        scope.showMap = false;
        angular.extend(scope, {
          layers: {
            baselayers: {},
            overlays: {
              clusterlayer: {
                name: "Real world data",
                type: "markercluster",
                visible: true,
                layerParams: {
                  showOnSelector: false,
                  spiderfyOnMaxZoom: false,
                  showCoverageOnHover: false,
                  maxClusterRadius: 40
                }
              }
            }
          },
          defaults: {
            controls: {
              layers: {
                visible: true,
                position: 'bottomleft',
                collapsed: true
              }
            }
          }
        });
        osmLayer = {
          name: 'OpenStreetMap',
          type: 'xyz',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        };
        stamenLayer = {
          name: 'Stamen Watercolor',
          type: 'xyz',
          url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
          layerOptions: {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
          }
        };
        if (scope.baseLayer === "Stamen Watercolor") {
          scope.layers.baselayers.watercolor = stamenLayer;
          scope.layers.baselayers.osm = osmLayer;
        } else {
          scope.layers.baselayers.osm = osmLayer;
          scope.layers.baselayers.watercolor = stamenLayer;
        }
        return scope.showMap = true;
      };
      return {
        restrict: 'E',
        scope: {
          markers: '=sbMarkers',
          center: '=sbCenter',
          hoverTemplate: '=sbHoverTemplate',
          baseLayer: '=sbBaseLayer'
        },
        link: link,
        templateUrl: 'template/sb_map.html'
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=sb_map.js.map
