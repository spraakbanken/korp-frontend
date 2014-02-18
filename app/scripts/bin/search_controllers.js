(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', ["watchFighters", "ui.bootstrap.dropdownToggle", "ui.bootstrap.tabs", "template/tabs/tabset.html", "template/tabs/tab.html", "template/tabs/tabset-titles.html", "ui.bootstrap.modal", "template/modal/backdrop.html", "template/modal/window.html", "ui.bootstrap.typeahead", "template/typeahead/typeahead.html", "template/typeahead/typeahead-popup.html", "angularSpinner"]);

  korpApp.run(function($rootScope, $location, $route, $routeParams, utils, searches) {
    var isInit, s;
    s = $rootScope;
    s.lang = "sv";
    s.word_selected = null;
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
    $rootScope.savedSearches = [];
    $rootScope.saveSearch = function(searchObj) {
      return $rootScope.savedSearches.push(searchObj);
    };
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
      if (!isInit) {
        $location.search("search", null).replace();
      }
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

  korpApp.controller("SimpleCtrl", function($scope, utils, $location, backend, $rootScope, searches) {
    var findMatchSentence, massageData, punctArray, s;
    s = $scope;
    c.log("SimpleCtrl");
    s.$on("popover_submit", function(event, name) {
      return $rootScope.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    punctArray = [",", ".", ";", ":", "!", "?", "..."];
    massageData = function(sentenceArray) {
      var corpus, corpus_aligned, currentStruct, end, i, id, j, linkCorpusId, mainCorpusId, matchSentenceEnd, matchSentenceStart, newSent, output, prevCorpus, sentence, start, tokens, wd, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (!sentenceArray) {
        return;
      }
      currentStruct = [];
      prevCorpus = "";
      output = [];
      for (i = _i = 0, _len = sentenceArray.length; _i < _len; i = ++_i) {
        sentence = sentenceArray[i];
        _ref = findMatchSentence(sentence), matchSentenceStart = _ref[0], matchSentenceEnd = _ref[1];
        _ref1 = sentence.match, start = _ref1.start, end = _ref1.end;
        for (j = _j = 0, _ref2 = sentence.tokens.length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; j = 0 <= _ref2 ? ++_j : --_j) {
          wd = sentence.tokens[j];
          if ((start <= j && j < end)) {
            _.extend(wd, {
              _match: true
            });
          }
          if ((matchSentenceStart < j && j < matchSentenceEnd)) {
            _.extend(wd, {
              _matchSentence: true
            });
          }
          if (_ref3 = wd.word, __indexOf.call(punctArray, _ref3) >= 0) {
            _.extend(wd, {
              _punct: true
            });
          }
          if ((_ref4 = wd.structs) != null ? _ref4.open : void 0) {
            wd._open = wd.structs.open;
            currentStruct = [].concat(currentStruct, wd.structs.open);
          } else if ((_ref5 = wd.structs) != null ? _ref5.close : void 0) {
            wd._close = wd.structs.close;
            currentStruct = _.without.apply(_, [currentStruct].concat(__slice.call(wd.structs.close)));
          }
          if (currentStruct.length) {
            _.extend(wd, {
              _struct: currentStruct
            });
          }
        }
        if (currentMode === "parallel") {
          mainCorpusId = sentence.corpus.split("|")[0].toLowerCase();
          linkCorpusId = sentence.corpus.split("|")[1].toLowerCase();
        } else {
          mainCorpusId = sentence.corpus.toLowerCase();
        }
        id = linkCorpusId || mainCorpusId;
        if (prevCorpus !== id) {
          corpus = settings.corpora[id];
          newSent = {
            newCorpus: corpus.title,
            noContext: _.keys(corpus.context).length === 1
          };
          output.push(newSent);
        }
        if (i % 2 === 0) {
          sentence._color = settings.primaryColor;
        } else {
          sentence._color = settings.primaryLight;
        }
        sentence.corpus = mainCorpusId;
        output.push(sentence);
        if (sentence.aligned) {
          _ref6 = _.pairs(sentence.aligned)[0], corpus_aligned = _ref6[0], tokens = _ref6[1];
          output.push({
            tokens: tokens,
            isLinked: true,
            corpus: corpus_aligned,
            _color: sentence._color
          });
        }
        prevCorpus = id;
      }
      return output;
    };
    findMatchSentence = function(sentence) {
      var decr, end, incr, span, start, _ref, _ref1, _ref2;
      span = [];
      _ref = sentence.match, start = _ref.start, end = _ref.end;
      decr = start;
      incr = end;
      while (decr >= 0) {
        if (__indexOf.call(((_ref1 = sentence.tokens[decr--].structs) != null ? _ref1.open : void 0) || [], "sentence") >= 0) {
          span[0] = decr;
          break;
        }
      }
      while (incr < sentence.tokens.length) {
        if (__indexOf.call(((_ref2 = sentence.tokens[incr++].structs) != null ? _ref2.close : void 0) || [], "sentence") >= 0) {
          span[1] = incr;
          break;
        }
      }
      return span;
    };
    s.kwic = [];
    s.contextKwic = [];
    s.setContextData = function(data) {
      return s.contextKwic = massageData(data.kwic);
    };
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

  korpApp.controller("ExtendedSearch", function($scope, utils, $location, backend, $rootScope, searches) {
    var s;
    s = $scope;
    s.$on("popover_submit", function(event, name) {
      return $rootScope.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
    s.searches = searches;
    return s.$on("btn_submit", function() {
      c.log("extended submit");
      return $location.search("search", "cqp");
    });
  });

  korpApp.controller("ExtendedToken", function($scope, utils, $location) {
    var onCorpusChange, s;
    s = $scope;
    s.valfilter = utils.valfilter;
    s.setDefault = function(or_obj) {
      or_obj.op = _.values(s.getOpts(or_obj.type))[0];
      return or_obj.val = "";
    };
    s.getOpts = function(type) {
      var _ref, _ref1;
      return ((_ref = s.typeMapping) != null ? (_ref1 = _ref[type]) != null ? _ref1.opts : void 0 : void 0) || settings.defaultOptions;
    };
    onCorpusChange = function(event, selected) {
      c.log("onCorpusChange", selected);
      s.types = utils.getAttributeGroups(settings.corpusListing);
      return s.typeMapping = _.object(_.map(s.types, function(item) {
        return [item.value, item];
      }));
    };
    s.$on("corpuschooserchange", onCorpusChange);
    onCorpusChange();
    s.removeOr = function(and_array, i) {
      if (and_array.length > 1) {
        return and_array.splice(i, 1);
      } else {
        return s.token.and_block.splice(_.indexOf(and_array, 1));
      }
    };
    s.addAnd = function() {
      return s.token.and_block.push(s.addOr([]));
    };
    return s.getTokenCqp = function() {
      if (!s.token.cqp) {
        return "";
      }
      return s.token.cqp.match(/\[(.*)]/)[1];
    };
  });

  korpApp.controller("TokenList", function($scope, $location, $rootScope) {
    var error, output, s, token, tokenObj, _i, _j, _len, _len1, _ref, _ref1;
    s = $scope;
    s.cqp = '[]';
    s.data = [];
    try {
      s.data = CQP.parse(s.cqp);
      c.log("s.data", s.data);
    } catch (_error) {
      error = _error;
      output = [];
      _ref = s.cqp.split("[");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        token = _ref[_i];
        if (!token) {
          continue;
        }
        token = "[" + token;
        try {
          tokenObj = CQP.parse(token);
        } catch (_error) {
          error = _error;
          tokenObj = [
            {
              cqp: token
            }
          ];
        }
        output = output.concat(tokenObj);
      }
      s.data = output;
      c.log("crash", s.data);
    }
    _ref1 = s.data;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      token = _ref1[_j];
      if (!("and_block" in token)) {
        token.and_block = CQP.parse('[word = ""]')[0].and_block;
      }
    }
    if ($location.search().cqp) {
      s.data = CQP.parse($location.search().cqp);
    } else {
      s.data = CQP.parse(s.cqp);
    }
    s.$watch('getCQPString()', function(val) {
      var cqpstr;
      c.log("getCQPString", val);
      cqpstr = CQP.stringify(s.data);
      $rootScope.activeCQP = cqpstr;
      return $location.search("cqp", cqpstr);
    });
    s.getCQPString = function() {
      return (CQP.stringify(s.data)) || "";
    };
    s.addOr = function(and_array) {
      and_array.push({
        type: "word",
        op: "=",
        val: ""
      });
      return and_array;
    };
    s.addToken = function() {
      token = {
        and_block: [[]]
      };
      s.data.push(token);
      return s.addOr(token.and_block[0]);
    };
    return s.removeToken = function(i) {
      return s.data.splice(i, 1);
    };
  });

  korpApp.filter("mapper", function() {
    return function(item, f) {
      return f(item);
    };
  });

  korpApp.controller("CompareSearchCtrl", function($scope, utils, $location, backend, $rootScope) {
    var s;
    s = $scope;
    s.valfilter = utils.valfilter;
    $rootScope.saveSearch({
      label: "frihet",
      cqp: "[lex contains 'frihet..nn.1']",
      corpora: ["LB"]
    });
    $rootScope.saveSearch({
      label: "jämlikhet",
      cqp: "[lex contains 'jämlikhet..nn.1']",
      corpora: ["LB"]
    });
    s.cmp1 = $rootScope.savedSearches[0];
    s.cmp2 = $rootScope.savedSearches[1];
    s.reduce = 'word';
    s.getAttrs = function() {
      var listing;
      if (!s.cmp1) {
        return null;
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
