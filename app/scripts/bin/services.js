(function() {
  var CompareSearches, korpApp,
    slice = [].slice;

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
        var i, len, obj, onWatch, results, watch;
        onWatch = function() {
          var i, len, obj, results, val;
          results = [];
          for (i = 0, len = config.length; i < len; i++) {
            obj = config[i];
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
              results.push(scope[obj.scope_name] = val);
            } else if ("scope_func" in obj) {
              results.push(scope[obj.scope_func](val));
            } else {
              results.push(scope[obj.key] = val);
            }
          }
          return results;
        };
        onWatch();
        scope.$watch((function() {
          return $location.search();
        }), function() {
          return onWatch();
        });
        results = [];
        for (i = 0, len = config.length; i < len; i++) {
          obj = config[i];
          watch = obj.expr || obj.scope_name || obj.key;
          results.push(scope.$watch(watch, (function(obj, watch) {
            return function(val) {
              val = (obj.val_out || _.identity)(val);
              if (val === obj["default"]) {
                val = null;
              }
              $location.search(obj.key, val || null);
              if (obj.key === "page") {
                c.log("post change", watch, val);
              }
              return typeof obj.post_change === "function" ? obj.post_change(val) : void 0;
            };
          })(obj, watch)));
        }
        return results;
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

  korpApp.factory('backend', function($http, $q, utils, lexicons) {
    return {
      requestCompare: function(cmpObj1, cmpObj2, reduce) {
        var conf, corpora1, corpora2, corpusListing, def, filterFun, params, rankedReduce, split, top, xhr;
        reduce = _.map(reduce, function(item) {
          return item.replace(/^_\./, "");
        });
        filterFun = function(item) {
          return settings.corpusListing.corpusHasAttrs(item, reduce);
        };
        corpora1 = _.filter(cmpObj1.corpora, filterFun);
        corpora2 = _.filter(cmpObj2.corpora, filterFun);
        corpusListing = settings.corpusListing.subsetFactory(cmpObj1.corpora);
        split = _.filter(reduce, function(r) {
          var ref;
          return ((ref = settings.corpusListing.getCurrentAttributes()[r]) != null ? ref.type : void 0) === "set";
        }).join(',');
        rankedReduce = _.filter(reduce, function(item) {
          var ref;
          return (ref = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[item]) != null ? ref.ranked : void 0;
        });
        top = _.map(rankedReduce, function(item) {
          return item + ":1";
        }).join(',');
        def = $q.defer();
        params = {
          command: "loglike",
          groupby: reduce.join(','),
          set1_corpus: corpora1.join(",").toUpperCase(),
          set1_cqp: cmpObj1.cqp,
          set2_corpus: corpora2.join(",").toUpperCase(),
          set2_cqp: cmpObj2.cqp,
          max: 50,
          split: split,
          top: top
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
          var groupAndSum, loglikeValues, max, objs, ref, ref1, tables;
          if (data.ERROR) {
            def.reject();
            return;
          }
          loglikeValues = data.loglike;
          objs = _.map(loglikeValues, function(value, key) {
            return {
              value: key,
              loglike: value
            };
          });
          tables = _.groupBy(objs, function(obj) {
            if (obj.loglike > 0) {
              obj.abs = data.set2[obj.value];
              return "positive";
            } else {
              obj.abs = data.set1[obj.value];
              return "negative";
            }
          });
          groupAndSum = function(table, currentMax) {
            var groups, res;
            groups = _.groupBy(table, function(obj) {
              return obj.value.replace(/(:.+?)(\/|$| )/g, "$2");
            });
            res = _.map(groups, function(value, key) {
              var abs, cqp, elems, loglike, tokenLists;
              tokenLists = _.map(key.split("/"), function(tokens) {
                return tokens.split(" ");
              });
              loglike = 0;
              abs = 0;
              cqp = [];
              elems = [];
              _.map(value, function(val) {
                abs += val.abs;
                loglike += val.loglike;
                return elems.push(val.value);
              });
              if (loglike > currentMax) {
                currentMax = loglike;
              }
              return {
                key: key,
                loglike: loglike,
                abs: abs,
                elems: elems,
                tokenLists: tokenLists
              };
            });
            return [res, currentMax];
          };
          ref = groupAndSum(tables.positive, 0), tables.positive = ref[0], max = ref[1];
          ref1 = groupAndSum(tables.negative, max), tables.negative = ref1[0], max = ref1[1];
          return def.resolve([tables, max, cmpObj1, cmpObj2, reduce], xhr);
        });
        return def.promise;
      },
      relatedWordSearch: function(lemgram) {
        return lexicons.relatedWordSearch(lemgram);
      },
      requestMapData: function(cqp, cqpExprs, within, attribute) {
        var conf, cqpSubExprs, def, params, xhr;
        cqpSubExprs = {};
        _.map(_.keys(cqpExprs), function(subCqp, idx) {
          return cqpSubExprs["subcqp" + idx] = subCqp;
        });
        def = $q.defer();
        params = {
          command: "count",
          groupby: attribute.label,
          cqp: cqp,
          corpus: attribute.corpora.join(","),
          incremental: $.support.ajaxProgress,
          split: attribute.label
        };
        _.extend(params, settings.corpusListing.getWithinParameters());
        _.extend(params, cqpSubExprs);
        conf = {
          url: settings.cgi_script,
          params: params,
          method: "GET",
          headers: {}
        };
        _.extend(conf.headers, model.getAuthorizationHeader());
        xhr = $http(conf);
        xhr.success(function(data) {
          var createResult, i, len, ref, result, subResult;
          createResult = function(subResult, cqp, label) {
            var points;
            points = [];
            _.map(_.keys(subResult.absolute), function(hit) {
              var countryCode, lat, lng, name, ref;
              if ((hit.startsWith("|")) || (hit.startsWith(" "))) {
                return;
              }
              ref = hit.split(";"), name = ref[0], countryCode = ref[1], lat = ref[2], lng = ref[3];
              return points.push({
                abs: subResult.absolute[hit],
                rel: subResult.relative[hit],
                name: name,
                countryCode: countryCode,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
              });
            });
            return {
              label: label,
              cqp: cqp,
              points: points
            };
          };
          if (_.isEmpty(cqpExprs)) {
            result = [createResult(data.total, cqp, "Σ")];
          } else {
            result = [];
            ref = data.total.slice(1, data.total.length);
            for (i = 0, len = ref.length; i < len; i++) {
              subResult = ref[i];
              result.push(createResult(subResult, subResult.cqp, cqpExprs[subResult.cqp]));
            }
          }
          if (data.ERROR) {
            def.reject();
            return;
          }
          return def.resolve([
            {
              corpora: attribute.corpora,
              cqp: cqp,
              within: within,
              data: result,
              attribute: attribute
            }
          ], xhr);
        });
        return def.promise;
      }
    };
  });

  korpApp.factory('nameEntitySearch', function($rootScope, $q) {
    var NameEntities;
    NameEntities = (function() {
      function NameEntities() {}

      NameEntities.prototype.request = function(cqp) {
        this.def = $q.defer();
        this.promise = this.def.promise;
        this.proxy = new model.NameProxy();
        $rootScope.$broadcast('map_data_available', cqp, settings.corpusListing.stringifySelected(true));
        return this.proxy.makeRequest(cqp, this.progressCallback).then((function(_this) {
          return function(data) {
            return _this.def.resolve(data);
          };
        })(this));
      };

      NameEntities.prototype.progressCallback = function(progress) {
        return $rootScope.$broadcast('map_progress', progress);
      };

      return NameEntities;

    })();
    return new NameEntities();
  });

  korpApp.factory('searches', function(utils, $location, $rootScope, $http, $q, nameEntitySearch) {
    var Searches, oldValues, searches;
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

      Searches.prototype.kwicRequest = function(cqp, isPaging) {
        c.log("kwicRequest", cqp);
        return kwicResults.makeRequest(cqp, isPaging);
      };

      Searches.prototype.kwicSearch = function(cqp, isPaging) {
        this.kwicRequest(cqp, isPaging);
        statsResults.makeRequest(cqp);
        return this.nameEntitySearch(cqp);
      };

      Searches.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix, isPaging) {
        var cqp;
        cqp = new model.LemgramProxy().lemgramSearch(lemgram, searchPrefix, searchSuffix);
        statsResults.makeRequest(cqp);
        this.kwicRequest(cqp, isPaging);
        this.nameEntitySearch(cqp);
        if (settings.wordpicture === false) {
          return;
        }
        return lemgramResults.makeRequest(lemgram, "lemgram");
      };

      Searches.prototype.nameEntitySearch = function(cqp) {
        if ($location.search().show_map != null) {
          return nameEntitySearch.request(cqp);
        }
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
          var attr, corpus, i, j, len, len1, privateStructAttrs, ref, ref1;
          ref = settings.corpusListing.corpora;
          for (i = 0, len = ref.length; i < len; i++) {
            corpus = ref[i];
            corpus["info"] = data["corpora"][corpus.id.toUpperCase()]["info"];
            privateStructAttrs = [];
            ref1 = data["corpora"][corpus.id.toUpperCase()].attrs.s;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              attr = ref1[j];
              if (attr.indexOf("__") !== -1) {
                privateStructAttrs.push(attr);
              }
            }
            corpus["private_struct_attributes"] = privateStructAttrs;
          }
          util.loadCorpora();
          return def.resolve();
        });
        return def.promise;
      };

      return Searches;

    })();
    searches = new Searches();
    oldValues = [];
    $rootScope.$watchGroup([
      (function() {
        return $location.search().search;
      }), "_loc.search().page"
    ], (function(_this) {
      return function(newValues) {
        var pageChanged, pageOnly, ref, searchChanged, searchExpr, type, value;
        c.log("searches service watch", $location.search().search);
        searchExpr = $location.search().search;
        if (!searchExpr) {
          return;
        }
        ref = searchExpr != null ? searchExpr.split("|") : void 0, type = ref[0], value = 2 <= ref.length ? slice.call(ref, 1) : [];
        value = value.join("|");
        newValues[1] = Number(newValues[1]) || 0;
        oldValues[1] = Number(oldValues[1]) || 0;
        if (_.isEqual(newValues, oldValues)) {
          pageChanged = false;
          searchChanged = true;
        } else {
          pageChanged = newValues[1] !== oldValues[1];
          searchChanged = newValues[0] !== oldValues[0];
        }
        pageOnly = pageChanged && !searchChanged;
        view.updateSearchHistory(value, $location.absUrl());
        return $q.all([searches.infoDef, searches.langDef.promise]).then(function() {
          switch (type) {
            case "word":
              searches.activeSearch = {
                type: type,
                val: value,
                page: newValues[1],
                pageOnly: pageOnly
              };
              break;
            case "lemgram":
              searches.activeSearch = {
                type: type,
                val: value,
                page: newValues[1],
                pageOnly: pageOnly
              };
              break;
            case "saldo":
              extendedSearch.setOneToken("saldo", value);
              break;
            case "cqp":
              if (!value) {
                value = $location.search().cqp;
              }
              searches.activeSearch = {
                type: type,
                val: value,
                page: newValues[1],
                pageOnly: pageOnly
              };
              searches.kwicSearch(value, pageOnly);
          }
          return oldValues = [].concat(newValues);
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
      var ref;
      [].splice.apply(this.savedSearches, [0, 9e9].concat(ref = [])), ref;
      return $.jStorage.set(this.key, this.savedSearches);
    };

    return CompareSearches;

  })());

  korpApp.factory("lexicons", function($q, $http) {
    var karpURL;
    karpURL = "https://ws.spraakbanken.gu.se/ws/karp/v1";
    return {
      getLemgrams: function(wf, resources, corporaIDs) {
        var args, deferred;
        deferred = $q.defer();
        args = {
          "q": wf,
          "resource": $.isArray(resources) ? resources.join(",") : resources
        };
        $http({
          method: "GET",
          url: karpURL + "/autocomplete",
          params: args
        }).success(function(data, status, headers, config) {
          var corpora, karpLemgrams, lemgram;
          if (data === null) {
            return deferred.resolve([]);
          } else {
            karpLemgrams = _.map(data.hits.hits, function(entry) {
              return entry._source.FormRepresentations[0].lemgram;
            });
            if (karpLemgrams.length === 0) {
              deferred.resolve([]);
              return;
            }
            lemgram = karpLemgrams.join(",");
            corpora = corporaIDs.join(",");
            return $http({
              method: 'POST',
              url: settings.cgi_script,
              data: "command=lemgram_count&lemgram=" + lemgram + "&count=lemgram&corpus=" + corpora,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
              }
            }).success((function(_this) {
              return function(data, status, headers, config) {
                var allLemgrams, count, i, klemgram, len;
                delete data.time;
                allLemgrams = [];
                for (lemgram in data) {
                  count = data[lemgram];
                  allLemgrams.push({
                    "lemgram": lemgram,
                    "count": count
                  });
                }
                for (i = 0, len = karpLemgrams.length; i < len; i++) {
                  klemgram = karpLemgrams[i];
                  if (!data[klemgram]) {
                    allLemgrams.push({
                      "lemgram": klemgram,
                      "count": 0
                    });
                  }
                }
                return deferred.resolve(allLemgrams);
              };
            })(this));
          }
        }).error(function(data, status, headers, config) {
          return deferred.resolve([]);
        });
        return deferred.promise;
      },
      getSenses: function(wf) {
        var args, deferred;
        deferred = $q.defer();
        args = {
          "cql": "wf==" + wf,
          "resurs": "saldom",
          "lemgram-ac": "true",
          "format": "json",
          "sw-forms": "false",
          "sms-forms": "false"
        };
        args = {
          "q": wf,
          "resource": "saldom"
        };
        $http({
          method: 'GET',
          url: karpURL + "/autocomplete",
          params: args
        }).success((function(_this) {
          return function(data, status, headers, config) {
            var karpLemgrams, senseargs;
            if (data === null) {
              return deferred.resolve([]);
            } else {
              karpLemgrams = _.map(data.hits.hits, function(entry) {
                return entry._source.FormRepresentations[0].lemgram;
              });
              if (karpLemgrams.length === 0) {
                deferred.resolve([]);
                return;
              }
              karpLemgrams = karpLemgrams.slice(0, 100);
              senseargs = {
                "q": "extended||and|lemgram|equals|" + (karpLemgrams.join('|')),
                "resource": "saldo",
                "show": "sense,primary",
                "size": 500
              };
              return $http({
                method: 'GET',
                url: karpURL + "/minientry",
                params: senseargs
              }).success(function(data, status, headers, config) {
                var senses;
                if (data.hits.total === 0) {
                  deferred.resolve([]);
                  return;
                }
                senses = _.map(data.hits.hits, function(entry) {
                  var ref;
                  return {
                    "sense": entry._source.Sense[0].senseid,
                    "desc": (ref = entry._source.Sense[0].SenseRelations) != null ? ref.primary : void 0
                  };
                });
                return deferred.resolve(senses);
              }).error(function(data, status, headers, config) {
                return deferred.resolve([]);
              });
            }
          };
        })(this)).error(function(data, status, headers, config) {
          return deferred.resolve([]);
        });
        return deferred.promise;
      },
      relatedWordSearch: function(lemgram) {
        var def, req;
        def = $q.defer();
        req = $http({
          url: karpURL + "/minientry",
          method: "GET",
          params: {
            q: "extended||and|lemgram|equals|" + lemgram,
            show: "sense",
            resource: "saldo"
          }
        }).success(function(data) {
          var http, senses;
          if (data.hits.total === 0) {
            def.resolve([]);
          } else {
            senses = _.map(data.hits.hits, function(entry) {
              return entry._source.Sense[0].senseid;
            });
            return http = $http({
              url: karpURL + "/minientry",
              method: "GET",
              params: {
                q: "extended||and|LU|equals|" + (senses.join('|')),
                show: "LU,sense",
                resource: "swefn"
              }
            }).success(function(data) {
              var eNodes;
              if (data.hits.total === 0) {
                def.resolve([]);
              } else {
                eNodes = _.map(data.hits.hits, function(entry) {
                  return {
                    "label": entry._source.Sense[0].senseid.replace("swefn--", ""),
                    "words": entry._source.Sense[0].LU
                  };
                });
                return def.resolve(eNodes);
              }
            });
          }
        });
        return def.promise;
      }
    };
  });

}).call(this);

//# sourceMappingURL=services.js.map
