(function() {
  korpApp.factory("utils", function($location) {
    return {
      valfilter: function(attrobj) {
        if (attrobj.isStructAttr) {
          return "_." + attrobj.value;
        } else {
          return attrobj.value;
        }
      },
      getAttributeGroups: function(corpusListing) {
        var attrs, key, obj, sent_attrs, word;
        word = {
          group: "word",
          value: "word",
          label: "word"
        };
        attrs = (function() {
          var _ref, _results;
          _ref = corpusListing.getCurrentAttributes();
          _results = [];
          for (key in _ref) {
            obj = _ref[key];
            if (obj.displayType !== "hidden") {
              _results.push(_.extend({
                group: "word_attr",
                value: key
              }, obj));
            }
          }
          return _results;
        })();
        sent_attrs = (function() {
          var _ref, _results;
          _ref = corpusListing.getStructAttrs();
          _results = [];
          for (key in _ref) {
            obj = _ref[key];
            if (obj.displayType !== "hidden") {
              _results.push(_.extend({
                group: "sentence_attr",
                value: key
              }, obj));
            }
          }
          return _results;
        })();
        return [word].concat(attrs, sent_attrs);
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
              if (obj["default"]) {
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
        scope.loc = $location;
        scope.$watch('loc.search()', function() {
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

  korpApp.factory('backend', function($http, $q, utils) {
    return {
      requestCompare: function(cmpObj1, cmpObj2, reduce) {
        var def, params;
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
        $http({
          url: settings.cgi_script,
          params: params,
          method: "GET"
        }).success(function(data) {
          return def.resolve([data, cmpObj1, cmpObj2]);
        });
        return def.promise;
      }
    };
  });

  korpApp.factory('searches', function(utils, $location, $rootScope, $http, $q) {
    var Searches, searches,
      _this = this;
    Searches = (function() {
      function Searches() {
        this.activeSearch = null;
        this.infoDef = this.getInfoData();
      }

      Searches.prototype.kwicRequest = function(cqp, page) {
        var isReading, kwicCallback, kwicopts, rnd;
        kwicResults.showPreloader();
        isReading = kwicResults.$result.is(".reading_mode");
        kwicCallback = kwicResults.renderResult;
        kwicopts = {
          sort: $.bbq.getState("sort")
        };
        if (kwicopts["sort"] === "random") {
          rnd = void 0;
          if (_event.data.isInit && $.bbq.getState("random_seed")) {
            rnd = $.bbq.getState("random_seed");
          } else {
            rnd = Math.ceil(Math.random() * 10000000);
            search({
              random_seed: rnd
            });
          }
          kwicopts["random_seed"] = rnd;
        }
        if (isReading || currentMode === "parallel") {
          kwicopts.context = settings.corpusListing.getContextQueryString();
        }
        if (cqp) {
          kwicopts.cqp = cqp;
        }
        return kwicProxy.makeRequest(kwicopts, page, $.proxy(kwicResults.onProgress, kwicResults), null, $.proxy(kwicCallback, kwicResults));
      };

      Searches.prototype.kwicSearch = function(cqp, page) {
        this.kwicRequest(cqp, page);
        return statsProxy.makeRequest(cqp, $.proxy(statsResults.onProgress, statsResults));
      };

      Searches.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix, page) {
        var cqp, type;
        c.log("lemgramSearch", lemgram);
        lemgramResults.showPreloader();
        type = lemgramProxy.makeRequest(lemgram, "lemgram", $.proxy(lemgramResults.onProgress, lemgramResults));
        searchProxy.relatedWordSearch(lemgram);
        cqp = lemgramProxy.lemgramSearch(lemgram, searchPrefix, searchSuffix);
        statsProxy.makeRequest(cqp, $.proxy(statsResults.onProgress, statsResults));
        return this.kwicRequest(cqp, page);
      };

      Searches.prototype.getInfoData = function() {
        var def;
        def = $q.defer();
        return $http({
          method: "GET",
          url: settings.cgi_script,
          params: {
            command: "info",
            corpus: _(settings.corpusListing.corpora).pluck("id").invoke("toUpperCase").join(",")
          }
        }).success(function(data) {
          var corpus, _i, _len, _ref;
          _ref = settings.corpusListing.corpora;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            corpus = _ref[_i];
            corpus["info"] = data["corpora"][corpus.id.toUpperCase()]["info"];
          }
          c.log("loadCorpora");
          loadCorpora();
          return def.resolve();
        });
        return def.promise;
      };

      return Searches;

    })();
    searches = new Searches();
    $rootScope.$watch("_loc.search().search", function() {
      var page, searchExpr, type, value, _ref;
      c.log("watch", $location.search().search);
      searchExpr = $location.search().search;
      if (!searchExpr) {
        return;
      }
      _ref = searchExpr != null ? searchExpr.split("|") : void 0, type = _ref[0], value = _ref[1];
      page = $rootScope.search()["page"] || 0;
      view.updateSearchHistory(value);
      return searches.infoDef.then(function() {
        switch (type) {
          case "word":
            return searches.activeSearch = {
              type: type,
              val: value
            };
          case "lemgram":
            searches.activeSearch = {
              type: type,
              val: value
            };
            return searches.lemgramSearch(value, null, null, page);
          case "saldo":
            return extendedSearch.setOneToken("saldo", value);
          case "cqp":
            c.log("cqp search");
            if (!value) {
              value = $location.search().cqp;
            }
            searches.activeSearch = {
              type: type,
              val: value
            };
            return searches.kwicSearch(value, page);
        }
      });
    });
    return searches;
  });

}).call(this);
