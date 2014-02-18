(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', ["watchFighters", "ui.bootstrap.dropdownToggle", "ui.bootstrap.tabs", "template/tabs/tabset.html", "template/tabs/tab.html", "template/tabs/tabset-titles.html", "ui.bootstrap.modal", "template/modal/backdrop.html", "template/modal/window.html", "ui.bootstrap.typeahead", "template/typeahead/typeahead.html", "template/typeahead/typeahead-popup.html", "angularSpinner"]);

  korpApp.run(function($rootScope, $location, $route, $routeParams, utils) {
    var corpus, s;
    s = $rootScope;
    s.lang = "sv";
    corpus = search()["corpus"];
    if (corpus) {
      settings.corpusListing.select(corpus.split(","));
    }
    s.activeCQP = "[]";
    s.search = function() {
      return $location.search.apply($location, arguments);
    };
    s.searchDef = $.Deferred();
    s.onSearchLoad = function() {
      return s.searchDef.resolve();
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
    return $rootScope.compareTabs = [];
  });

  korpApp.controller("kwicCtrl", function($scope) {
    var findMatchSentence, massageData, punctArray, s;
    c.log("kwicCtrl init");
    s = $scope;
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
    s.setKwicData = function(data) {
      return s.kwic = massageData(data.kwic);
    };
    s.selectionManager = new util.SelectionManager();
    s.selectLeft = function(sentence) {
      if (!sentence.match) {
        return;
      }
      return sentence.tokens.slice(0, sentence.match.start);
    };
    s.selectMatch = function(sentence) {
      var from;
      if (!sentence.match) {
        return;
      }
      from = sentence.match.start;
      return sentence.tokens.slice(from, sentence.match.end);
    };
    return s.selectRight = function(sentence) {
      var from, len;
      if (!sentence.match) {
        return;
      }
      from = sentence.match.end;
      len = sentence.tokens.length;
      return sentence.tokens.slice(from, len);
    };
  });

  korpApp.controller("compareCtrl", function($scope) {
    var s;
    s = $scope;
    s.$parent.loading = true;
    return s.promise.then(function(data) {
      s.$parent.loading = false;
      s.tables = _.groupBy(_.pairs(data.loglike), function(_arg) {
        var val, word;
        word = _arg[0], val = _arg[1];
        if (val > 0) {
          return "positive";
        } else {
          return "negative";
        }
      });
      s.tables.positive = _.sortBy(s.tables.positive, function(tuple) {
        return tuple[1];
      });
      return s.tables.negative = _.sortBy(s.tables.negative, function(tuple) {
        return Math.abs(tuple[1]);
      });
    });
  });

  korpApp.controller("TokenList", function($scope, $location, $rootScope) {
    var cqp, error, output, s, token, tokenObj, _i, _j, _len, _len1, _ref, _ref1;
    s = $scope;
    cqp = '[msd = "" | word = "value2" & lex contains "ge..vb.1"] []{1,2}';
    s.data = [];
    try {
      s.data = CQP.parse(cqp);
      c.log("s.data", s.data);
    } catch (_error) {
      error = _error;
      output = [];
      _ref = cqp.split("[");
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
    if ($location.search().cqp) {
      s.data = CQP.parse(decodeURIComponent($location.search().cqp));
    } else {
      s.data = CQP.parse(cqp);
    }
    _ref1 = s.data;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      token = _ref1[_j];
      if (!("and_block" in token)) {
        token.and_block = CQP.parse('[word = ""]')[0].and_block;
      }
    }
    s.$watch('getCQPString()', function() {
      var cqpstr;
      cqpstr = CQP.stringify(s.data);
      return $rootScope.activeCQP = cqpstr;
    });
    s.getCQPString = function() {
      return (CQP.stringify(s.data)) || "";
    };
    s.addToken = function() {
      return s.data.push(JSON.parse(JSON.stringify(s.data.slice(0)[0])));
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

  korpApp.controller("ExtendedToken", function($scope, utils, $location) {
    var s;
    s = $scope;
    s.valfilter = utils.valfilter;
    s.setDefault = function(or_obj) {
      or_obj.op = _.values(s.getOpts(or_obj.type))[0];
      return or_obj.val = "";
    };
    s.getOpts = function(type) {
      var _ref;
      return ((_ref = s.typeMapping) != null ? _ref[type].opts : void 0) || settings.defaultOptions;
    };
    s.$on("corpuschooserchange", function(selected) {
      s.types = utils.getAttributeGroups(settings.corpusListing);
      return s.typeMapping = _.object(_.map(s.types, function(item) {
        return [item.value, item];
      }));
    });
    s.addOr = function(and_array) {
      and_array.push({
        type: "word",
        op: "=",
        val: ""
      });
      return and_array;
    };
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

  korpApp.controller("SimpleCtrl", function($scope, utils, $location, backend, $rootScope, searches) {
    var s;
    s = $scope;
    c.log("SimpleCtrl");
    s.$on("popover_submit", function(event, name) {
      return $rootScope.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.stringifySelected()
      });
    });
    s.searches = searches;
    s.$watch("searches.activeSearch", function(search) {
      if (!search) {
        return;
      }
      c.log("searches.activeSearch", search);
      if (search.type === "word") {
        s.placeholder = null;
        return s.simple_text = search.val;
      } else if (search.type === "lemgram") {
        s.placeholder = search.val;
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

  korpApp.controller("ExtendedSearch", function($scope, utils, $location, backend, $rootScope) {
    var s;
    s = $scope;
    return s.$on("popover_submit", function(event, name) {
      return $rootScope.saveSearch({
        label: name || $rootScope.activeCQP,
        cqp: $rootScope.activeCQP,
        corpora: settings.corpusListing.getSelectedCorpora()
      });
    });
  });

  korpApp.controller("CompareSearchCtrl", function($scope, utils, $location, backend, $rootScope) {
    var cl, s;
    s = $scope;
    cl = settings.corpusListing;
    s.valfilter = utils.valfilter;
    $rootScope.saveSearch({
      label: "första",
      cqp: "[pos='NN']",
      corpora: ["ROMI"]
    });
    $rootScope.saveSearch({
      label: "andra",
      cqp: "[pos='NN']",
      corpora: ["ROMII"]
    });
    s.cmp1 = $rootScope.savedSearches[0];
    s.cmp2 = $rootScope.savedSearches[1];
    s.reduce = 'word';
    s.getAttrs = function() {
      var listing;
      listing = cl.subsetFactory(_.uniq([].concat(s.cmp1.corpora, s.cmp2.corpora)));
      return utils.getAttributeGroups(listing);
    };
    return s.sendCompare = function() {
      return $rootScope.compareTabs.push(backend.requestCompare(s.cmp1.corpora.join(","), s.cmp1.cqp, s.cmp2.corpora.join(","), s.cmp2.cqp, s.reduce));
    };
  });

  korpApp.filter("loc", function($rootScope) {
    return function(translationKey) {
      return util.getLocaleString(translationKey);
    };
  });

}).call(this);
