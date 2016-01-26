(function() {
  var korpApp,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  korpApp = angular.module("korpApp");

  korpApp.controller("SearchCtrl", function($scope, $location, utils, searches) {
    $scope.visibleTabs = [true, true, true, true];
    $scope.extendedTmpl = "views/extended_tmpl.html";
    searches.langDef.resolve();
    $scope.isCompareSelected = false;
    $scope.$watch((function() {
      return $location.search().search_tab;
    }), function(val) {
      return $scope.isCompareSelected = val === 3;
    });
    $scope.$watch((function() {
      return $location.search().word_pic;
    }), function(val) {
      return $scope.word_pic = Boolean(val);
    });
    $scope.$watch("word_pic", function(val) {
      return $location.search("word_pic", Boolean(val) || null);
    });
    $scope.$watch((function() {
      return $location.search().show_map;
    }), function(val) {
      return $scope.show_map = Boolean(val);
    });
    $scope.$watch("show_map", function(val) {
      return $location.search("show_map", Boolean(val) || null);
    });
    $scope.settings = settings;
    $scope.showStats = function() {
      return settings.statistics !== false;
    };
    if (!$location.search().stats_reduce) {
      $location.search('stats_reduce', "word");
    }
    $scope.$on("corpuschooserchange", function() {
      $scope.statCurrentAttrs = settings.corpusListing.getStatsAttributeGroups();
      return $scope.statSelectedAttrs = $location.search().stats_reduce.split(',');
    });
    return $scope.$watch('statSelectedAttrs', (function(selected) {
      if (selected && selected.length > 0) {
        return $location.search('stats_reduce', $scope.statSelectedAttrs.join(','));
      }
    }), true);
  });

  korpApp.controller("SimpleCtrl", function($scope, utils, $location, backend, $rootScope, searches, compareSearches, $modal) {
    var modalInstance, s;
    s = $scope;
    s.$on("popover_submit", function(event, name) {
      var cqp;
      cqp = s.instance.getCQP();
      return compareSearches.saveSearch({
        label: name || cqp,
        cqp: cqp,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    s.stringifyRelatedHeader = function(wd) {
      return wd.replace(/_/g, " ");
    };
    s.stringifyRelated = function(wd) {
      return util.saldoToString(wd);
    };
    modalInstance = null;
    s.clickRelated = function(wd) {
      if (modalInstance != null) {
        modalInstance.close();
      }
      c.log("modalInstance", modalInstance);
      $scope.$root.searchtabs()[1].select();
      s.$root.$broadcast("extended_set", "[saldo contains '" + wd + "']");
      return $location.search("search", "cqp|" + ("[saldo contains '" + wd + "']"));
    };
    s.relatedDefault = 3;
    s.clickX = function() {
      return modalInstance.dismiss();
    };
    s.showAllRelated = function() {
      return modalInstance = $modal.open({
        template: "<div class=\"modal-header\">\n    <h3 class=\"modal-title\">{{'similar_header' | loc:lang}} (SWE-FN)</h3>\n    <span ng-click=\"clickX()\" class=\"close-x\">×</span>\n</div>\n<div class=\"modal-body\">\n    <div ng-repeat=\"obj in relatedObj\" class=\"col\"><a target=\"_blank\" ng-href=\"http://spraakbanken.gu.se/karp/#?lexicon=swefn&amp;search=extended||and|sense|equals|swefn--{{obj.label}}\" class=\"header\">{{stringifyRelatedHeader(obj.label)}}</a>\n      <div class=\"list_wrapper\">\n          <ul>\n            <li ng-repeat=\"wd in obj.words\"> <a ng-click=\"clickRelated(wd)\" class=\"link\">{{stringifyRelated(wd) + \" \"}}</a></li>\n          </ul>\n      </div>\n    </div>\n</div>",
        scope: s,
        size: 'lg',
        windowClass: "related"
      });
    };
    s.searches = searches;
    s.$watch("searches.activeSearch", (function(_this) {
      return function(search) {
        var cqp, page;
        c.log("search", search);
        if (!search) {
          return;
        }
        page = Number($location.search().page) || 0;
        s.relatedObj = null;
        if (search.type === "word") {
          $("#simple_text input").val(search.val);
          s.simple_text = search.val;
          cqp = simpleSearch.getCQP(search.val);
          c.log("simple search cqp", cqp);
          if (search.pageOnly) {
            searches.kwicRequest(cqp, true);
            return;
          } else {
            searches.kwicSearch(cqp);
          }
          if (settings.wordpicture !== false && s.word_pic && indexOf.call(search.val, " ") < 0) {
            return lemgramResults.makeRequest(search.val, "word");
          } else {
            return lemgramResults.resetView();
          }
        } else if (search.type === "lemgram") {
          s.placeholder = search.val;
          s.simple_text = "";
          s.model = search.val;
          cqp = simpleSearch.getCQP();
          backend.relatedWordSearch(search.val).then(function(data) {
            return s.relatedObj = data;
          });
          if (s.word_pic) {
            return searches.lemgramSearch(search.val, s.prefix, s.suffix, search.pageOnly);
          } else {
            return searches.kwicSearch(cqp, search.pageOnly);
          }
        } else {
          s.placeholder = null;
          s.simple_text = "";
          return typeof lemgramResults !== "undefined" && lemgramResults !== null ? lemgramResults.resetView() : void 0;
        }
      };
    })(this));
    s.lemgramToString = function(lemgram) {
      if (!lemgram) {
        return;
      }
      return util.lemgramToString(lemgram).replace(/<.*?>/g, "");
    };
    utils.setupHash(s, [
      {
        key: "prefix"
      }, {
        key: "suffix"
      }, {
        key: "isCaseInsensitive"
      }
    ]);
    return $scope.$on("btn_submit", function() {
      return $location.search("within", null);
    });
  });

  korpApp.controller("ExtendedSearch", function($scope, utils, $location, backend, $rootScope, searches, compareSearches, $timeout) {
    var s;
    s = $scope;
    s.$on("popover_submit", function(event, name) {
      return compareSearches.saveSearch({
        label: name || $rootScope.extendedCQP,
        cqp: $rootScope.extendedCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    s.searches = searches;
    s.$on("btn_submit", function() {
      c.log("extended submit");
      $location.search("search", null);
      $location.search("page", null);
      return $timeout(function() {
        var ref, within;
        $location.search("search", "cqp");
        if (ref = s.within, indexOf.call(_.keys(settings.defaultWithin), ref) < 0) {
          within = s.within;
        }
        return $location.search("within", within);
      }, 0);
    });
    s.$on("extended_set", function($event, val) {
      c.log("extended_set", val);
      return s.cqp = val;
    });
    if ($location.search().cqp) {
      s.cqp = $location.search().cqp;
    }
    s.$watch("cqp", function(val) {
      var e;
      c.log("cqp change", val);
      if (!val) {
        return;
      }
      try {
        $rootScope.extendedCQP = CQP.expandOperators(val);
      } catch (_error) {
        e = _error;
        c.log("cqp parse error:", e);
      }
      return $location.search("cqp", val);
    });
    s.withins = [];
    s.getWithins = function() {
      var output, union;
      union = settings.corpusListing.getWithinKeys();
      output = _.map(union, function(item) {
        return {
          value: item
        };
      });
      return output;
    };
    return s.$on("corpuschooserchange", function() {
      var ref;
      s.withins = s.getWithins();
      return s.within = (ref = s.withins[0]) != null ? ref.value : void 0;
    });
  });

  korpApp.controller("ExtendedToken", function($scope, utils, $location) {
    var cqp, onCorpusChange, s, toggleBound;
    s = $scope;
    c.log("ExtendedToken", s);
    cqp = '[]';
    s.valfilter = utils.valfilter;
    s.setDefault = function(or_obj) {
      var opts;
      opts = s.getOpts(or_obj.type);
      if (!opts) {
        or_obj.op = "is";
      } else {
        or_obj.op = _.values(opts)[0][1];
      }
      return or_obj.val = "";
    };
    s.getOpts = _.memoize(function(type) {
      var confObj, ref;
      if (!(type in s.typeMapping)) {
        return;
      }
      confObj = (ref = s.typeMapping) != null ? ref[type] : void 0;
      if (!confObj) {
        c.log("confObj missing", type, s.typeMapping);
        return;
      }
      confObj = _.extend({}, (confObj != null ? confObj.opts : void 0) || settings.defaultOptions);
      if (confObj.type === "set") {
        confObj.is = "contains";
      }
      return _.pairs(confObj);
    });
    onCorpusChange = function(event, selected) {
      var lang, ref, ref1;
      c.log("onCorpusChange", selected, s.l);
      lang = (ref = s.$parent.$parent) != null ? (ref1 = ref.l) != null ? ref1.lang : void 0 : void 0;
      s.types = settings.corpusListing.getAttributeGroups(lang);
      s.typeMapping = _.object(_.map(s.types, function(item) {
        if (item.isStructAttr) {
          return ["_." + item.value, item];
        } else {
          return [item.value, item];
        }
      }));
      return c.log("typeMapping", s.typeMapping);
    };
    s.$on("corpuschooserchange", onCorpusChange);
    onCorpusChange();
    s.removeOr = function(token, and_array, i) {
      if (and_array.length > 1) {
        return and_array.splice(i, 1);
      } else if (token.and_block.length > 1) {
        return token.and_block.splice(_.indexOf(token.and_block, and_array), 1);
      }
    };
    s.addAnd = function(token) {
      return token.and_block.push(s.addOr([]));
    };
    toggleBound = function(token, bnd) {
      var boundObj, ref, ref1;
      if (!((ref = token.bound) != null ? ref[bnd] : void 0)) {
        boundObj = {};
        boundObj[bnd] = true;
        return token.bound = _.extend(token.bound || {}, boundObj);
      } else {
        return (ref1 = token.bound) != null ? delete ref1[bnd] : void 0;
      }
    };
    s.toggleStart = function(token) {
      return toggleBound(token, "lbound");
    };
    s.toggleEnd = function(token) {
      return toggleBound(token, "rbound");
    };
    s.toggleRepeat = function(token) {
      if (!token.repeat) {
        return token.repeat = [1, 1];
      } else {
        return delete token.repeat;
      }
    };
    s.getTokenCqp = function() {
      if (!s.token.cqp) {
        return "";
      }
      return s.token.cqp.match(/\[(.*)]/)[1];
    };
    return s.onInsertMousedown = function(event) {
      return event.stopPropagation();
    };
  });

  korpApp.controller("AdvancedCtrl", function($scope, compareSearches, $location, $timeout) {
    var expr, ref, ref1, type;
    expr = "";
    if ($location.search().search) {
      ref1 = (ref = $location.search().search) != null ? ref.split("|") : void 0, type = ref1[0], expr = 2 <= ref1.length ? slice.call(ref1, 1) : [];
      expr = expr.join("|");
    }
    if (type === "cqp") {
      $scope.cqp = expr || "[]";
    } else {
      $scope.cqp = "[]";
    }
    $scope.$watch(function() {
      return typeof simpleSearch !== "undefined" && simpleSearch !== null ? simpleSearch.getCQP() : void 0;
    }, function(val) {
      return $scope.simpleCQP = val;
    });
    $scope.$on("popover_submit", function(event, name) {
      return compareSearches.saveSearch({
        label: name || $rootScope.extendedCQP,
        cqp: $scope.cqp,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    return $scope.$on("btn_submit", function() {
      c.log("advanced cqp", $scope.cqp);
      $location.search("search", null);
      $location.search("page", null);
      $location.search("within", null);
      return $timeout(function() {
        return $location.search("search", "cqp|" + $scope.cqp);
      }, 0);
    });
  });

  korpApp.filter("mapper", function() {
    return function(item, f) {
      return f(item);
    };
  });

  korpApp.controller("CompareSearchCtrl", function($scope, utils, $location, backend, $rootScope, compareSearches) {
    var s;
    s = $scope;
    s.valfilter = utils.valfilter;
    s.savedSearches = compareSearches.savedSearches;
    s.$watch("savedSearches.length", function() {
      var listing;
      s.cmp1 = compareSearches.savedSearches[0];
      s.cmp2 = compareSearches.savedSearches[1];
      if (!(s.cmp1 && s.cmp2)) {
        return;
      }
      listing = settings.corpusListing.subsetFactory(_.uniq([].concat(s.cmp1.corpora, s.cmp2.corpora)));
      return s.currentAttrs = listing.getAttributeGroups();
    });
    s.reduce = 'word';
    s.sendCompare = function() {
      return $rootScope.compareTabs.push(backend.requestCompare(s.cmp1, s.cmp2, [s.reduce]));
    };
    return s.deleteCompares = function() {
      return compareSearches.flush();
    };
  });

  korpApp.filter("loc", function($rootScope) {
    return function(translationKey, lang) {
      return util.getLocaleString(translationKey, lang);
    };
  });

}).call(this);
