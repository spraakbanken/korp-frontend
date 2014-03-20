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
      getAttributeGroups: function(corpusListing) {
        var attrs, common, common_keys, key, obj, sent_attrs, word;
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
        common_keys = _.compact(_.flatten(_.map(corpusListing.selected, function(corp) {
          return _.keys(corp.common_attributes);
        })));
        common = _.pick.apply(_, [settings.common_struct_types].concat(__slice.call(common_keys)));
        sent_attrs = (function() {
          var _ref, _results;
          _ref = _.extend({}, common, corpusListing.getStructAttrs());
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
        sent_attrs = _.sortBy(sent_attrs, function(item) {
          return util.getLocaleString(item.label);
        });
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
          method: "GET"
        };
        xhr = $http(conf);
        xhr.success(function(data) {
          return def.resolve([data, cmpObj1, cmpObj2, reduce], xhr);
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
        var def, timedef;
        this.activeSearch = null;
        def = $q.defer();
        timedef = $q.defer();
        this.infoDef = def.promise;
        this.timeDef = timedef.promise;
        this.getInfoData().then(function() {
          def.resolve();
          return initTimeGraph(timedef);
        });
      }

      Searches.prototype.kwicRequest = function(cqp, page) {
        var getSortParams, isReading, kwicCallback, kwicopts;
        kwicResults.showPreloader();
        isReading = search().reading;
        kwicCallback = kwicResults.renderResult;
        getSortParams = function() {
          var rnd, sort;
          sort = search().sort;
          if (sort === "random") {
            if (search().random_seed) {
              rnd = search().random_seed;
            } else {
              rnd = Math.ceil(Math.random() * 10000000);
              search({
                random_seed: rnd
              });
            }
            return {
              sort: sort,
              random_seed: rnd
            };
          }
          return {
            sort: sort
          };
        };
        kwicopts = {
          ajaxParams: getSortParams()
        };
        if (isReading || currentMode === "parallel") {
          kwicopts.ajaxParams.context = settings.corpusListing.getContextQueryString();
        }
        if (cqp) {
          kwicopts.ajaxParams.cqp = cqp;
        }
        return kwicProxy.makeRequest(kwicopts, page, $.proxy(kwicResults.onProgress, kwicResults), null, $.proxy(kwicCallback, kwicResults));
      };

      Searches.prototype.kwicSearch = function(cqp, page) {
        this.kwicRequest(cqp, page);
        return typeof statsProxy !== "undefined" && statsProxy !== null ? statsProxy.makeRequest(cqp, $.proxy(statsResults.onProgress, statsResults)) : void 0;
      };

      Searches.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix, page) {
        var cqp, type;
        cqp = new model.LemgramProxy().lemgramSearch(lemgram, searchPrefix, searchSuffix);
        if (typeof statsProxy !== "undefined" && statsProxy !== null) {
          statsProxy.makeRequest(cqp, $.proxy(statsResults.onProgress, statsResults));
        }
        this.kwicRequest(cqp, page);
        if (settings.wordpicture === false) {
          return;
        }
        searchProxy.relatedWordSearch(lemgram);
        c.log("lemgramSearch", lemgram);
        lemgramResults.showPreloader();
        return type = lemgramProxy.makeRequest(lemgram, "lemgram", $.proxy(lemgramResults.onProgress, lemgramResults));
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
      c.log("page", page);
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
    });
    return searches;
  });

  korpApp.service("compareSearches", CompareSearches = (function() {
    function CompareSearches() {
      if (currentMode !== "default") {
        this.key = 'saved_searches_' + currentMode;
      } else {
        this.key = "saved_searches";
      }
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
