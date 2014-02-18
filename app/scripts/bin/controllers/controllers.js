(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', ["watchFighters", "ui.bootstrap.dropdownToggle", "ui.bootstrap.tabs", "template/tabs/pane.html", "template/tabs/tabs.html"]);

  korpApp.run(function($rootScope, $location, $route, $routeParams) {
    var s;
    s = $rootScope;
    s.lang = "sv";
    s.search = function() {
      return $location.search.apply($location, arguments);
    };
    s.searchDef = $.Deferred();
    s.onSearchLoad = function() {
      return s.searchDef.resolve();
    };
    s._loc = $location;
    return s.$watch("_loc.search()", function() {
      c.log("loc.search() change", $location.search());
      return _.defer(function() {
        return typeof window.onHashChange === "function" ? window.onHashChange() : void 0;
      });
    });
  });

  korpApp.controller("kwicCtrl", function($scope) {
    var findMatchSentence, massageData, punctArray, s;
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

  korpApp.directive('kwicWord', function() {
    return {
      replace: true,
      template: "<span class=\"word\" set-class=\"getClassObj(wd)\"\nset-text=\"wd.word + ' '\" ></span>",
      link: function(scope, element) {
        return scope.getClassObj = function(wd) {
          var output, struct, x, y, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          output = {
            reading_match: wd._match,
            punct: wd._punct,
            match_sentence: wd._matchSentence
          };
          _ref = wd._struct || [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            struct = _ref[_i];
            output["struct_" + struct] = true;
          }
          _ref1 = wd._open || [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            struct = _ref1[_j];
            output["open_" + struct] = true;
          }
          _ref2 = wd._close || [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            struct = _ref2[_k];
            output["close_" + struct] = true;
          }
          return ((function() {
            var _l, _len3, _ref3, _ref4, _results;
            _ref3 = _.pairs(output);
            _results = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              _ref4 = _ref3[_l], x = _ref4[0], y = _ref4[1];
              if (y) {
                _results.push(x);
              }
            }
            return _results;
          })()).join(" ");
        };
      }
    };
  });

  korpApp.controller("TokenList", function($scope, $location) {
    var cqp, output, s, token, tokenObj, _i, _len, _ref;
    s = $scope;
    cqp = '[word = "value" | word = "value2" & lex contains "ge..vb.1"] []{1,2}';
    s.data = [];
    try {
      s.data = CQP.parse(cqp);
    } catch (error) {
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
        } catch (error) {
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
      s.data = CQP.parse(decodeURI($location.search().cqp));
    } else {
      s.data = CQP.parse(cqp);
    }
    s.$watch('getCQPString()', function() {});
    s.getCQPString = function() {
      return (CQP.stringify(s.data)) || "";
    };
    s.addToken = function() {
      c.log(s.data.slice(0)[0]);
      return s.data.push(JSON.parse(JSON.stringify(s.data.slice(0)[0])));
    };
    return s.removeToken = function(i) {
      return s.data.splice(i, 1);
    };
  });

  korpApp.controller("ExtendedToken", function($scope, $location) {
    var s;
    s = $scope;
    s.types = "word,pos,msd,lemma,lex,saldo,dephead,deprel,ref,prefix,suffix,entity".split(",");
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
        return s.token.and_block.splice(s.$parent.$index, 1);
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

  korpApp.factory("util", function($location) {
    return {
      setupHash: function(scope, config) {
        var obj, watch, _i, _len, _results;
        scope.loc = $location;
        scope.$watch('loc.search()', function() {
          var obj, val, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = config.length; _i < _len; _i++) {
            obj = config[_i];
            val = $location.search()[obj.key];
            if (!val) {
              continue;
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
        });
        _results = [];
        for (_i = 0, _len = config.length; _i < _len; _i++) {
          obj = config[_i];
          watch = obj.expr || obj.scope_name || obj.key;
          _results.push(scope.$watch(watch || obj.key, (function(obj) {
            return function(val) {
              val = (obj.val_out || _.identity)(val);
              $location.search(obj.key, val || null);
              return typeof obj.post_change === "function" ? obj.post_change(val) : void 0;
            };
          })(obj)));
        }
        return _results;
      }
    };
  });

  korpApp.controller("SearchPaneCtrl", function($scope, util) {
    var s;
    s = $scope;
    s.search_tab = 0;
    s.getSelected = function() {
      var i, p, _i, _len, _ref;
      _ref = s.panes;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        p = _ref[i];
        if (p.selected) {
          return i;
        }
      }
    };
    s.setSelected = function(index) {
      var p, _i, _len, _ref;
      _ref = s.panes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        p.selected = false;
      }
      return s.panes[index].selected = true;
    };
    return util.setupHash(s, [
      {
        expr: "getSelected()",
        val_out: function(val) {
          return val;
        },
        val_in: function(val) {
          return s.setSelected(val);
        },
        key: "search_tab"
      }
    ]);
  });

  korpApp.filter("loc", function($rootScope) {
    return function(translationKey) {
      return util.getLocaleString(translationKey);
    };
  });

}).call(this);
