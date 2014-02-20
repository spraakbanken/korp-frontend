(function() {
  var korpApp,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  korpApp = angular.module("korpApp");

  korpApp.controller("resultTabCtrl", function($scope) {
    var s;
    s = $scope;
    s.selectTab = function(i) {
      c.log("selectTab", i);
      return s.$broadcast("tabselect", i);
    };
    return s.$watch("getSelected()", function(val) {
      c.log("val", val);
      return s.$root.result_tab = val;
    });
  });

  korpApp.controller("resultContainerCtrl", function($scope, searches) {
    return $scope.searches = searches;
  });

  korpApp.controller("kwicCtrl", function($scope) {
    var findMatchSentence, massageData, punctArray, s;
    c.log("kwicCtrl init", $scope.$parent);
    s = $scope;
    s.$on("tabselect", function($event) {
      return c.log("tabselect", arguments);
    });
    s.onexit = function() {
      c.log("onexit");
      return s.$root.sidebar_visible = false;
    };
    punctArray = [",", ".", ";", ":", "!", "?", "..."];
    s.hitspictureClick = function(pageNumber) {
      return s.instance.handlePaginationClick(pageNumber, null, true);
    };
    massageData = function(sentenceArray) {
      var corpus, corpus_aligned, currentStruct, end, i, id, j, linkCorpusId, mainCorpusId, matchSentenceEnd, matchSentenceStart, newSent, output, prevCorpus, sentence, start, tokens, wd, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
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
    c.log("selectionManager");
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

  korpApp.controller("StatsResultCtrl", function($scope, utils, $location, backend, searches, $rootScope) {
    var s;
    s = $scope;
    return s.onGraphShow = function(data) {
      c.log("show graph!", arguments);
      return $rootScope.graphTabs.push(data);
    };
  });

  korpApp.controller("graphCtrl", function($scope) {
    return $scope.$parent.active = true;
  });

  korpApp.controller("compareCtrl", function($scope, $rootScope) {
    var s;
    s = $scope;
    s.loading = true;
    return s.promise.then(function(_arg) {
      var attributes, cl, cmp1, cmp2, cmps, data, op, pairs, reduce, _ref, _ref1;
      data = _arg[0], cmp1 = _arg[1], cmp2 = _arg[2], reduce = _arg[3];
      s.loading = false;
      pairs = _.pairs(data.loglike);
      s.tables = _.groupBy(pairs, function(_arg1) {
        var val, word;
        word = _arg1[0], val = _arg1[1];
        if (val > 0) {
          return "positive";
        } else {
          return "negative";
        }
      });
      s.tables.negative = _.map(s.tables.negative, function(_arg1) {
        var val, word;
        word = _arg1[0], val = _arg1[1];
        return [word, val, data.set1[word]];
      });
      s.tables.positive = _.map(s.tables.positive, function(_arg1) {
        var val, word;
        word = _arg1[0], val = _arg1[1];
        return [word, val, data.set2[word]];
      });
      s.tables.positive = _.sortBy(s.tables.positive, function(tuple) {
        return tuple[1] * -1;
      });
      s.tables.negative = _.sortBy(s.tables.negative, function(tuple) {
        return (Math.abs(tuple[1])) * -1;
      });
      s.reduce = reduce;
      cl = settings.corpusListing.subsetFactory([].concat(cmp1.corpora, cmp2.corpora));
      c.log("_.extend {}, cl.getCurrentAttributes(), cl.getStructAttrs()", reduce, _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs()));
      attributes = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs());
      s.stringify = ((_ref = attributes[_.str.strip(reduce, "_.")]) != null ? _ref.stringify : void 0) || angular.identity;
      s.max = _.max(pairs, function(_arg1) {
        var val, word;
        word = _arg1[0], val = _arg1[1];
        return Math.abs(val);
      });
      s.cmp1 = cmp1;
      s.cmp2 = cmp2;
      op = ((_ref1 = attributes[_.str.strip(reduce, "_.")]) != null ? _ref1.type : void 0) === "set" ? "contains" : "=";
      cmps = [cmp1, cmp2];
      return s.rowClick = function(triple, cmp_index) {
        var cmp, cqpobj, opts;
        c.log("triple", triple);
        cmp = cmps[cmp_index];
        _.extend(cmp, {
          command: "query"
        });
        cmp.corpus = _.invoke(cmp.corpora, "toUpperCase");
        cqpobj = CQP.parse(cmp.cqp);
        cqpobj[0].and_block.push(CQP.parse("[" + reduce + " " + op + " '" + triple[0] + "']")[0].and_block[0]);
        cmp.cqp = CQP.stringify(cqpobj);
        opts = {
          start: 0,
          end: 24,
          ajaxParams: cmp
        };
        return $rootScope.kwicTabs.push(opts);
      };
    });
  });

}).call(this);
