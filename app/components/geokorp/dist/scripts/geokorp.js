(function() {
  'use strict';
  var c,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  ]).factory('lbTitles', [
    '$q', '$http', function($q, $http) {
      var deferred, http, parseXML;
      parseXML = function(data) {
        var e, tmp, xml;
        xml = null;
        tmp = null;
        if (!data || typeof data !== "string") {
          return null;
        }
        try {
          if (window.DOMParser) {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
          } else {
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(data);
          }
        } catch (_error) {
          e = _error;
          xml = 'undefined';
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
          jQuery.error("Invalid XML: " + data);
        }
        return xml;
      };
      http = function(config) {
        var defaultConfig;
        defaultConfig = {
          method: "GET",
          params: {
            username: "app"
          },
          transformResponse: function(data, headers) {
            var output;
            output = parseXML(data);
            if ($("fel", output).length) {
              c.log("xml parse error:", $("fel", output).text());
            }
            return output;
          }
        };
        return $http(_.merge(defaultConfig, config));
      };
      deferred = $q.defer();
      http({
        url: "http://litteraturbanken.se/query/lb-anthology.xql?action=get-works",
        headers: {
          "accept": "application/xml"
        }
      }).then(function(response) {
        var author, authors, item, temp, tree, work_authors, work_id, work_short_title, works, _i, _j, _len, _len1, _ref, _ref1;
        tree = response.data;
        works = [];
        temp = [];
        _ref = jQuery(tree).find('item');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          work_id = item.getAttribute('lbworkid');
          work_short_title = item.getAttribute('shorttitle');
          authors = [];
          _ref1 = jQuery(item).find('author');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            author = _ref1[_j];
            authors.push(author.getAttribute("fullname"));
          }
          work_authors = authors.join(', ');
          if (__indexOf.call(temp, work_id) < 0) {
            temp.push(work_id);
            works.push({
              short_title: work_short_title,
              authors: work_authors
            });
          }
        }
        return deferred.resolve(works);
      });
      return deferred.promise;
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
  ]).factory("timeData", [
    "$http", "places", function($http, places) {
      var first, getSeriesData, last, yearToCity;
      yearToCity = {};
      first = 1611;
      last = 2015;
      getSeriesData = function(data) {
        var fillMissingDate, firstVal, hasFirstValue, hasLastValue, lastVal, mom, output, parseDate, tuple, x, y, _i, _len;
        delete data[""];
        parseDate = function(granularity, time) {
          var day, month, year, _ref;
          _ref = [null, 0, 1], year = _ref[0], month = _ref[1], day = _ref[2];
          switch (granularity) {
            case "y":
              year = time;
              break;
            case "m":
              year = time.slice(0, 4);
              month = time.slice(4, 6);
              break;
            case "d":
              year = time.slice(0, 4);
              month = time.slice(4, 6);
              day = time.slice(6, 8);
          }
          return moment([Number(year), Number(month), Number(day)]);
        };
        fillMissingDate = function(data) {
          var dateArray, diff, duration, i, lastYVal, max, maybeCurrent, min, momentMapping, n_diff, newMoment, newMoments, _i;
          dateArray = _.pluck(data, "x");
          min = _.min(dateArray, function(mom) {
            return mom.toDate();
          });
          max = _.max(dateArray, function(mom) {
            return mom.toDate();
          });
          duration = (function() {
            switch ("y") {
              case "y":
                duration = moment.duration({
                  year: 1
                });
                return diff = "year";
              case "m":
                duration = moment.duration({
                  month: 1
                });
                return diff = "month";
              case "d":
                duration = moment.duration({
                  day: 1
                });
                return diff = "day";
            }
          })();
          n_diff = moment(max).diff(min, diff);
          momentMapping = _.object(_.map(data, function(item) {
            return [moment(item.x).unix(), item.y];
          }));
          newMoments = [];
          for (i = _i = 0; 0 <= n_diff ? _i <= n_diff : _i >= n_diff; i = 0 <= n_diff ? ++_i : --_i) {
            newMoment = moment(min).add(diff, i);
            maybeCurrent = momentMapping[newMoment.unix()];
            if (typeof maybeCurrent !== 'undefined') {
              lastYVal = maybeCurrent;
            } else {
              newMoments.push({
                x: newMoment,
                y: lastYVal
              });
            }
          }
          return [].concat(data, newMoments);
        };
        firstVal = parseDate("y", first);
        lastVal = parseDate("y", last.toString());
        hasFirstValue = false;
        hasLastValue = false;
        output = (function() {
          var _i, _len, _ref, _ref1, _results;
          _ref = _.pairs(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _ref1 = _ref[_i], x = _ref1[0], y = _ref1[1];
            mom = parseDate("y", x);
            if (mom.isSame(firstVal)) {
              hasFirstValue = true;
            }
            if (mom.isSame(lastVal)) {
              hasLastValue = true;
            }
            _results.push({
              x: mom,
              y: y
            });
          }
          return _results;
        })();
        if (!hasFirstValue) {
          output.push({
            x: firstVal,
            y: 0
          });
        }
        output = fillMissingDate(output);
        output = output.sort(function(a, b) {
          return a.x.unix() - b.x.unix();
        });
        output.splice(output.length - 1, 1);
        for (_i = 0, _len = output.length; _i < _len; _i++) {
          tuple = output[_i];
          tuple.x = tuple.x.unix();
        }
        return output;
      };
      return function(markers) {
        var cqp, cqps, expr, i, params, tokenWrap, _i, _len;
        cqps = _.map(markers, function(name) {
          return "(word = \"" + name.message + "\")";
        });
        c.log(cqps);
        tokenWrap = function(expr) {
          return "[" + expr + "]";
        };
        cqp = tokenWrap(cqps.join(" | "));
        params = {
          command: "count_time",
          corpus: "LB",
          cqp: cqp
        };
        for (i = _i = 0, _len = cqps.length; _i < _len; i = ++_i) {
          expr = cqps[i];
          params["subcqp" + i] = tokenWrap(expr);
        }
        return $http({
          method: "GET",
          url: "http://spraakbanken.gu.se/ws/korp",
          params: params
        }).then(function(response) {
          var allData, combined;
          c.log("time response", response.data);
          combined = response.data.combined;
          delete combined[""];
          allData = [];
          places.then(function(placeResponse) {
            var city, item, lat, lng, name, series, val, year, _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = combined.length; _j < _len1; _j++) {
              item = combined[_j];
              series = getSeriesData(item.relative);
              name = item.cqp || "&Sigma;";
              if (name.match('"(.*?)"') === null) {
                continue;
              }
              city = name.match('"(.*?)"')[1];
              _results.push((function() {
                var _k, _len2, _ref, _results1;
                _results1 = [];
                for (_k = 0, _len2 = series.length; _k < _len2; _k++) {
                  val = series[_k];
                  if (val.y) {
                    year = moment.unix(val.x).year();
                    if (yearToCity[year] == null) {
                      yearToCity[year] = [];
                    }
                    _ref = placeResponse.data[city.toLowerCase()], lat = _ref[0], lng = _ref[1];
                    _results1.push(yearToCity[moment.unix(val.x).year()].push({
                      val: val.y,
                      name: city,
                      lat: lat,
                      lng: lng
                    }));
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              })());
            }
            return _results;
          });
          return yearToCity;
        });
      };
    }
  ]).filter('sbDateFilter', function() {
    return function(input, date, filterEnabled) {
      var key, marker, out;
      out = input || [];
      if (filterEnabled) {
        out = {};
        for (key in input) {
          marker = input[key];
          if (marker.date === date) {
            out[key] = marker;
          }
        }
      }
      return out;
    };
  }).directive('sbMap', [
    '$compile', '$timeout', 'leafletData', 'leafletEvents', function($compile, $timeout, leafletData, leafletEvents) {
      var link;
      link = function(scope, element, attrs) {
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
        scope.show_map = false;
        return leafletData.getMap().then(function(map) {
          var baseLayers, layerControl, osm, watercolor;
          watercolor = L.tileLayer.provider('Stamen.Watercolor');
          osm = L.tileLayer.provider('OpenStreetMap');
          if (scope.baseLayer === "Open Street Map") {
            osm.addTo(map);
          } else {
            watercolor.addTo(map);
          }
          baseLayers = {
            "Stamen Watercolor": watercolor,
            "Open Street Map": osm
          };
          layerControl = L.control.layers(baseLayers, null, {
            position: "bottomleft"
          });
          map.addControl(layerControl);
          map.on('baselayerchange', (function(_this) {
            return function(a) {
              return scope.baseLayer = a.name;
            };
          })(this));
          return scope.show_map = true;
        });
      };
      return {
        restrict: 'E',
        scope: {
          markers: '=sbMarkers',
          center: '=sbCenter',
          showTime: '=sbShowTime',
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
