(function() {
  var CompareSearches, korpApp,
    __slice = [].slice;

  korpApp = angular.module("korpApp");

  korpApp.factory("utils", function($location) {
    return {
      valfilter: function(attrobj) {
        if (attrobj.isStructAttr) {
          return "_." + attrobj.value;
        } else {
          return attrobj.value;
        }
      },
      setupHash: function(scope, config) {
        var obj, onWatch, watch, _i, _len, _results;
        onWatch = function() {
          var obj, val, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = config.length; _i < _len; _i++) {
            obj = config[_i];
            val = $location.search()[obj.key];
            if (!val) {
              if (obj["default"] != null) {
                val = obj["default"];
              } else {
                continue;
              }
            }
            val = (obj.val_in || _.identity)(val);
            if ("scope_name" in obj) {
              _results.push(scope[obj.scope_name] = val);
            } else if ("scope_func" in obj) {
              _results.push(scope[obj.scope_func](val));
            } else {
              _results.push(scope[obj.key] = val);
            }
          }
          return _results;
        };
        onWatch();
        scope.$watch((function() {
          return $location.search();
        }), function() {
          return onWatch();
        });
        _results = [];
        for (_i = 0, _len = config.length; _i < _len; _i++) {
          obj = config[_i];
          watch = obj.expr || obj.scope_name || obj.key;
          _results.push(scope.$watch(watch, (function(obj, watch) {
            return function(val) {
              val = (obj.val_out || _.identity)(val);
              if (val === obj["default"]) {
                val = null;
              }
              $location.search(obj.key, val || null);
              return typeof obj.post_change === "function" ? obj.post_change(val) : void 0;
            };
          })(obj, watch)));
        }
        return _results;
      }
    };
  });

  korpApp.factory("debounce", function($timeout) {
    return function(func, wait, options) {
      var args, delayed, inited, leading, result, thisArg, timeoutDeferred, trailing;
      args = null;
      inited = null;
      result = null;
      thisArg = null;
      timeoutDeferred = null;
      trailing = true;
      delayed = function() {
        inited = timeoutDeferred = null;
        if (trailing) {
          return result = func.apply(thisArg, args);
        }
      };
      if (options === true) {
        leading = true;
        trailing = false;
      } else if (options && angular.isObject(options)) {
        leading = options.leading;
        trailing = ("trailing" in options ? options.trailing : trailing);
      }
      return function() {
        args = arguments;
        thisArg = this;
        $timeout.cancel(timeoutDeferred);
        if (!inited && leading) {
          inited = true;
          result = func.apply(thisArg, args);
        } else {
          timeoutDeferred = $timeout(delayed, wait);
        }
        return result;
      };
    };
  });

  korpApp.factory('backend', function($http, $q, utils) {
    return {
      requestCompare: function(cmpObj1, cmpObj2, reduce) {
        var conf, def, params, xhr;
        def = $q.defer();
        params = {
          command: "loglike",
          groupby: reduce.replace(/^_\./, ""),
          set1_corpus: cmpObj1.corpora.join(",").toUpperCase(),
          set1_cqp: cmpObj1.cqp,
          set2_corpus: cmpObj2.corpora.join(",").toUpperCase(),
          set2_cqp: cmpObj2.cqp,
          max: 50
        };
        conf = {
          url: settings.cgi_script,
          params: params,
          method: "GET",
          headers: {}
        };
        _.extend(conf.headers, model.getAuthorizationHeader());
        xhr = $http(conf);
        xhr.success(function(data) {
          return def.resolve([data, cmpObj1, cmpObj2, reduce], xhr);
        });
        return def.promise;
      },
      relatedWordSearch: function(lemgram) {
        var def, req;
        def = $q.defer();
        req = $http({
          url: "http://spraakbanken.gu.se/ws/karp-sok",
          method: "GET",
          params: {
            cql: "lemgram==/pivot/saldo " + lemgram,
            resource: "swefn",
            "mini-entries": true,
            info: "lu",
            format: "json"
          }
        }).success(function(data) {
          var e, eNodes, output;
          if (angular.isArray(data.div)) {
            eNodes = data.div[0].e;
          } else {
            eNodes = data.div.e;
          }
          if (!angular.isArray(eNodes)) {
            eNodes = [eNodes];
          }
          output = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = eNodes.length; _i < _len; _i++) {
              e = eNodes[_i];
              _results.push({
                label: e.s.replace("swefn--", ""),
                words: _.pluck(e.info.info.feat, "val")
              });
            }
            return _results;
          })();
          return def.resolve(output);
        });
        return def.promise;
      }
    };
  });

  korpApp.factory('searches', function(utils, $location, $rootScope, $http, $q) {
    var Searches, searches;
    Searches = (function() {
      function Searches() {
        var def, timedef;
        this.activeSearch = null;
        def = $q.defer();
        timedef = $q.defer();
        this.infoDef = def.promise;
        this.timeDef = timedef.promise;
        this.langDef = $q.defer();
        this.getInfoData().then(function() {
          def.resolve();
          return initTimeGraph(timedef);
        });
      }

      Searches.prototype.kwicRequest = function(cqp, page) {
        c.log("kwicRequest", page, cqp);
        return kwicResults.makeRequest(page, cqp);
      };

      Searches.prototype.kwicSearch = function(cqp, page) {
        this.kwicRequest(cqp, page);
        return statsResults.makeRequest(cqp);
      };

      Searches.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix, page) {
        var cqp;
        cqp = new model.LemgramProxy().lemgramSearch(lemgram, searchPrefix, searchSuffix);
        statsResults.makeRequest(cqp);
        this.kwicRequest(cqp, page);
        if (settings.wordpicture === false) {
          return;
        }
        return lemgramResults.makeRequest(lemgram, "lemgram");
      };

      Searches.prototype.getMode = function() {
        var def, mode;
        def = $q.defer();
        mode = $.deparam.querystring().mode;
        if ((mode != null) && mode !== "default") {
          $.getScript("modes/" + mode + "_mode.js").done(function() {
            return $rootScope.$apply(function() {
              return def.resolve();
            });
          }).fail(function(args, msg, e) {
            return $rootScope.$apply(function() {
              return def.reject();
            });
          });
        } else {
          def.resolve();
        }
        return def.promise;
      };

      Searches.prototype.getInfoData = function() {
        var def;
        def = $q.defer();
        $http({
          method: "GET",
          url: settings.cgi_script,
          params: {
            command: "info",
            corpus: _(settings.corpusListing.corpora).pluck("id").invoke("toUpperCase").join(",")
          }
        }).success(function(data) {
          var corpus, _i, _len, _ref;
          c.log("data", data);
          _ref = settings.corpusListing.corpora;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            corpus = _ref[_i];
            corpus["info"] = data["corpora"][corpus.id.toUpperCase()]["info"];
          }
          c.log("loadCorpora");
          util.loadCorpora();
          return def.resolve();
        });
        return def.promise;
      };

      return Searches;

    })();
    searches = new Searches();
    $rootScope.$watch("_loc.search().search", (function(_this) {
      return function() {
        var page, searchExpr, type, value, _ref;
        c.log("searches service watch", $location.search().search);
        searchExpr = $location.search().search;
        if (!searchExpr) {
          return;
        }
        _ref = searchExpr != null ? searchExpr.split("|") : void 0, type = _ref[0], value = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
        value = value.join("|");
        page = $rootScope.search()["page"] || 0;
        c.log("page", page);
        view.updateSearchHistory(value, $location.absUrl());
        return $q.all([searches.infoDef, searches.langDef.promise]).then(function() {
          switch (type) {
            case "word":
              return searches.activeSearch = {
                type: type,
                val: value
              };
            case "lemgram":
              return searches.activeSearch = {
                type: type,
                val: value
              };
            case "saldo":
              return extendedSearch.setOneToken("saldo", value);
            case "cqp":
              c.log("cqp search", value);
              if (!value) {
                value = CQP.expandOperators($location.search().cqp);
              }
              searches.activeSearch = {
                type: type,
                val: value
              };
              return searches.kwicSearch(value, page);
          }
        });
      };
    })(this));
    return searches;
  });

  korpApp.service("compareSearches", CompareSearches = (function() {
    function CompareSearches() {
      if (currentMode !== "default") {
        this.key = 'saved_searches_' + currentMode;
      } else {
        this.key = "saved_searches";
      }
      c.log("key", this.key);
      this.savedSearches = ($.jStorage.get(this.key)) || [];
    }

    CompareSearches.prototype.saveSearch = function(searchObj) {
      this.savedSearches.push(searchObj);
      return $.jStorage.set(this.key, this.savedSearches);
    };

    CompareSearches.prototype.flush = function() {
      var _ref;
      [].splice.apply(this.savedSearches, [0, 9e9].concat(_ref = [])), _ref;
      return $.jStorage.set(this.key, this.savedSearches);
    };

    return CompareSearches;

  })());

}).call(this);

//# sourceMappingURL=services.js.map
