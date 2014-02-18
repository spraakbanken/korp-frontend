(function() {
  window.korpApp = angular.module('korpApp', ["watchFighters", 'ui.bootstrap', "template/tabs/tabset.html", "template/tabs/tab.html", "template/modal/backdrop.html", "template/modal/window.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html", "angularSpinner", "uiSlider", "ui.sortable"]);

  korpApp.run(function($rootScope, $location, utils, searches) {
    var isInit, s;
    s = $rootScope;
    s.lang = "sv";
    s.word_selected = null;
    s.sidebar_visible = false;
    s.activeCQP = "[]";
    s.search = function() {
      return $location.search.apply($location, arguments);
    };
    s._loc = $location;
    s.$watch("_loc.search()", function() {
      c.log("loc.search() change", $location.search());
      return _.defer(function() {
        return typeof window.onHashChange === "function" ? window.onHashChange() : void 0;
      });
    });
    $rootScope.kwicTabs = [];
    $rootScope.compareTabs = [];
    $rootScope.graphTabs = [];
    isInit = true;
    s.$on("corpuschooserchange", function(event, corpora) {
      var enableSearch, nonprotected;
      c.log("corpuschooserchange", corpora);
      settings.corpusListing.select(corpora);
      nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id");
      c.log("corpus change", corpora.length, _.intersection(corpora, nonprotected).length, nonprotected.length);
      if (corpora.length && _.intersection(corpora, nonprotected).length !== nonprotected.length) {
        $location.search("corpus", corpora.join(","));
      } else {
        $location.search("corpus", null);
      }
      if (corpora.length) {
        view.updateReduceSelect();
        view.updateContextSelect("within");
      }
      enableSearch = !!corpora.length;
      view.enableSearch(enableSearch);
      return isInit = false;
    });
    return searches.infoDef.then(function() {
      var corp_array, corpus, processed_corp_array;
      corpus = $location.search().corpus;
      if (corpus) {
        corp_array = corpus.split(",");
        processed_corp_array = [];
        settings.corpusListing.select(corp_array);
        $.each(corp_array, function(key, val) {
          return processed_corp_array = [].concat(processed_corp_array, getAllCorporaInFolders(settings.corporafolders, val));
        });
        corpusChooserInstance.corpusChooser("selectItems", processed_corp_array);
        return $("#select_corpus").val(corpus);
      }
    });
  });

  korpApp.controller("SearchCtrl", function($scope) {
    c.log("searchctrl original", $scope);
    $scope.visibleTabs = [true, true, true, true];
    return $scope.extendedTmpl = "views/extended_tmpl.html";
  });

  korpApp.controller("SimpleCtrl", function($scope, utils, $location, backend, $rootScope, searches, compareSearches) {
    var s;
    s = $scope;
    c.log("SimpleCtrl");
    s.$on("popover_submit", function(event, name) {
      return compareSearches.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    s.searches = searches;
    s.$watch("searches.activeSearch", function(search) {
      var cqp, page;
      if (!search) {
        return;
      }
      c.log("searches.activeSearch", search);
      if (search.type === "word") {
        s.placeholder = null;
        s.simple_text = search.val;
        cqp = simpleSearch.getCQP(search.val);
        c.log("simple search cqp", cqp);
        page = $rootScope.search()["page"] || 0;
        searches.kwicSearch(cqp, page);
        lemgramResults.showPreloader();
        return lemgramProxy.makeRequest(search.val, "word", $.proxy(lemgramResults.onProgress, lemgramResults));
      } else if (search.type === "lemgram") {
        s.placeholder = search.val;
        return s.simple_text = "";
      } else {
        s.placeholder = null;
        return s.simple_text = "";
      }
    });
    return s.lemgramToString = function(lemgram) {
      if (!lemgram) {
        return;
      }
      return util.lemgramToString(lemgram).replace(/<.*?>/g, "");
    };
  });

  korpApp.controller("ExtendedSearch", function($scope, utils, $location, backend, $rootScope, searches, compareSearches) {
    var s;
    s = $scope;
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
      return $location.search("search", "cqp");
    });
    if ($location.search().cqp) {
      s.cqp = $location.search().cqp;
    }
    return s.$watch("cqp", function(val) {
      c.log("cqp change", val);
      $rootScope.activeCQP = val;
      return $location.search("cqp", val);
    });
  });

  korpApp.controller("ExtendedToken", function($scope, utils, $location) {
    var cqp, onCorpusChange, s, toggleBound;
    s = $scope;
    c.log("ExtendedToken", s);
    cqp = '[]';
    s.valfilter = utils.valfilter;
    s.setDefault = function(or_obj) {
      or_obj.op = _.values(s.getOpts(or_obj.type))[0][1];
      return or_obj.val = "";
    };
    s.getOpts = function(type) {
      var optObj, _ref, _ref1;
      optObj = ((_ref = s.typeMapping) != null ? (_ref1 = _ref[type]) != null ? _ref1.opts : void 0 : void 0) || settings.defaultOptions;
      return _.pairs(optObj);
    };
    onCorpusChange = function(event, selected) {
      c.log("onCorpusChange", selected);
      s.types = utils.getAttributeGroups(settings.corpusListing);
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
      } else {
        return token.and_block.splice(_.indexOf(and_array, 1));
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
    return s.$on("change_case", function(event, val) {
      return c.log("change_case", val, s);
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
    compareSearches.saveSearch({
      label: "frihet",
      cqp: "[lex contains 'frihet..nn.1']",
      corpora: ["VIVILL"]
    });
    compareSearches.saveSearch({
      label: "jämlikhet",
      cqp: "[lex contains 'jämlikhet..nn.1']",
      corpora: ["VIVILL"]
    });
    s.savedSearches = compareSearches.savedSearches;
    s.cmp1 = compareSearches.savedSearches[0];
    s.cmp2 = compareSearches.savedSearches[1];
    s.reduce = 'word';
    s.getAttrs = function() {
      var listing;
      if (!s.cmp1) {
        return;
      }
      listing = settings.corpusListing.subsetFactory(_.uniq([].concat(s.cmp1.corpora, s.cmp2.corpora)));
      return utils.getAttributeGroups(listing);
    };
    return s.sendCompare = function() {
      return $rootScope.compareTabs.push(backend.requestCompare(s.cmp1, s.cmp2, s.reduce));
    };
  });

  korpApp.filter("loc", function($rootScope) {
    return function(translationKey) {
      return util.getLocaleString(translationKey);
    };
  });

}).call(this);
