(function() {
  var korpApp,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  korpApp = angular.module("korpApp");

  korpApp.controller("SearchCtrl", function($scope, $location, utils, searches) {
    $scope.visibleTabs = [true, true, true, true];
    $scope.extendedTmpl = "views/extended_tmpl.html";
    searches.langDef.resolve();
    $scope.isCompareSelected = false;
    $scope.settings = settings;
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
    return $scope.showStats = function() {
      return settings.statistics !== false;
    };
  });

  korpApp.config(function($tooltipProvider) {
    return $tooltipProvider.options({
      appendToBody: true
    });
  });

  korpApp.controller("SimpleCtrl", function($scope, utils, $location, backend, $rootScope, searches, compareSearches) {
    var s;
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
    s.clickRelated = function(wd) {
      return $location.search("search", "cqp|" + ("[saldo contains '" + wd + "']"));
    };
    s.relatedDefault = 4;
    s.relatedLimit = s.relatedDefault;
    s.searches = searches;
    s.$watch("searches.activeSearch", (function(_this) {
      return function(search) {
        var cqp, page;
        if (!search) {
          return;
        }
        c.log("searches.activeSearch", search);
        page = $rootScope.search()["page"] || 0;
        s.relatedObj = null;
        if (search.type === "word") {
          s.placeholder = null;
          s.simple_text = search.val;
          cqp = simpleSearch.getCQP(search.val);
          c.log("simple search cqp", cqp);
          searches.kwicSearch(cqp, page);
          if (settings.wordpicture !== false && s.word_pic && __indexOf.call(search.val, " ") < 0) {
            return lemgramResults.makeRequest(search.val, "word");
          } else {
            return lemgramResults.resetView();
          }
        } else if (search.type === "lemgram") {
          s.placeholder = search.val;
          s.simple_text = "";
          cqp = "[lex contains '" + search.val + "']";
          backend.relatedWordSearch(search.val).then(function(data) {
            return s.relatedObj = data;
          });
          if (s.word_pic) {
            return searches.lemgramSearch(lemgram, s.prefix, s.suffix, page);
          } else {
            return searches.kwicSearch(cqp, page);
          }
        } else {
          s.placeholder = null;
          s.simple_text = "";
          return lemgramResults.resetView();
        }
      };
    })(this));
    s.lemgramToString = function(lemgram) {
      if (!lemgram) {
        return;
      }
      return util.lemgramToString(lemgram).replace(/<.*?>/g, "");
    };
    return utils.setupHash(s, [
      {
        key: "prefix"
      }, {
        key: "suffix"
      }, {
        key: "isCaseInsensitive"
      }
    ]);
  });

  korpApp.controller("ExtendedSearch", function($scope, utils, $location, backend, $rootScope, searches, compareSearches, $timeout) {
    var s;
    s = $scope;
    s.within = "sentence";
    s.$on("popover_submit", function(event, name) {
      return compareSearches.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    s.searches = searches;
    s.$on("btn_submit", function() {
      c.log("extended submit");
      $location.search("search", null);
      $location.search("page", null);
      return $timeout(function() {
        var within, _ref;
        if (_ref = s.within, __indexOf.call(_.keys(settings.defaultWithin), _ref) < 0) {
          within = s.within;
        }
        $location.search("within", within || null);
        return $location.search("search", "cqp");
      }, 0);
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
        $rootScope.activeCQP = CQP.expandOperators(val);
      } catch (_error) {
        e = _error;
        c.log("cqp parse error:", e);
      }
      return $location.search("cqp", val);
    });
    s.withins = [];
    s.getWithins = function() {
      var intersect, obj, output, union, _i, _len, _ref;
      intersect = settings.corpusListing.getAttrIntersection("within");
      union = settings.corpusListing.getAttrUnion("within");
      output = _.map(union, function(item) {
        return {
          value: item
        };
      });
      if (union.length > intersect.length) {
        for (_i = 0, _len = output.length; _i < _len; _i++) {
          obj = output[_i];
          if (_ref = obj.value, __indexOf.call(intersect, _ref) < 0) {
            obj.partial = true;
          } else {
            obj.partial = false;
          }
        }
      }
      return output;
    };
    return s.$on("corpuschooserchange", function() {
      return s.withins = s.getWithins();
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
    s.getOpts = function(type) {
      var confObj, optObj, _ref;
      confObj = (_ref = s.typeMapping) != null ? _ref[type] : void 0;
      if (!confObj) {
        c.log("confObj missing", type, s.typeMapping);
        return;
      }
      optObj = _.extend({}, (confObj != null ? confObj.opts : void 0) || settings.defaultOptions);
      if (confObj.type === "set") {
        optObj.is = "contains";
      }
      return _.pairs(optObj);
    };
    onCorpusChange = function(event, selected) {
      var lang, _ref, _ref1;
      c.log("onCorpusChange", selected, s.l);
      lang = (_ref = s.$parent.$parent) != null ? (_ref1 = _ref.l) != null ? _ref1.lang : void 0 : void 0;
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
      var boundObj, _ref, _ref1;
      if (!((_ref = token.bound) != null ? _ref[bnd] : void 0)) {
        boundObj = {};
        boundObj[bnd] = true;
        return token.bound = _.extend(token.bound || {}, boundObj);
      } else {
        return (_ref1 = token.bound) != null ? delete _ref1[bnd] : void 0;
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
    var expr, type, _ref, _ref1;
    expr = "";
    if ($location.search().search) {
      _ref1 = (_ref = $location.search().search) != null ? _ref.split("|") : void 0, type = _ref1[0], expr = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
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
        label: name || $rootScope.activeCQP,
        cqp: $scope.cqp,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    return $scope.$on("btn_submit", function() {
      c.log("advanced cqp", $scope.cqp);
      $location.search("search", null);
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
      s.cmp1 = compareSearches.savedSearches[0];
      return s.cmp2 = compareSearches.savedSearches[1];
    });
    s.reduce = 'word';
    s.getAttrs = function() {
      var listing;
      if (!(s.cmp1 && s.cmp2)) {
        return;
      }
      listing = settings.corpusListing.subsetFactory(_.uniq([].concat(s.cmp1.corpora, s.cmp2.corpora)));
      return listing.getAttributeGroups();
    };
    s.sendCompare = function() {
      return $rootScope.compareTabs.push(backend.requestCompare(s.cmp1, s.cmp2, s.reduce));
    };
    return s.deleteCompares = function() {
      return compareSearches.flush();
    };
  });

  korpApp.filter("loc", function($rootScope) {
    return function(translationKey) {
      return util.getLocaleString(translationKey);
    };
  });

}).call(this);

//# sourceMappingURL=search_controllers.js.map
