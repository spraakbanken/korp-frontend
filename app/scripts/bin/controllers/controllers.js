(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', ["watchFighters", "ui.bootstrap.dropdownToggle", "ui.bootstrap.tabs", "template/tabs/tabset.html", "template/tabs/tab.html", "template/tabs/tabset-titles.html", "ui.bootstrap.modal", "ui.bootstrap.typeahead", "template/typeahead/typeahead.html", "template/typeahead/typeahead-popup.html"]);

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
      return cqpstr = CQP.stringify(s.data);
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

  korpApp.controller("ExtendedToken", function($scope, $location) {
    var s, word;
    s = $scope;
    s.valfilter = function(attrobj) {
      if (attrobj.isStructAttr) {
        return "_." + attrobj.value;
      } else {
        return attrobj.value;
      }
    };
    word = {
      group: "word",
      value: "word",
      label: "word"
    };
    s.setDefault = function(or_obj) {
      or_obj.op = _.values(s.getOpts(or_obj.type))[0];
      return or_obj.val = "";
    };
    s.getOpts = function(type) {
      var _ref;
      return ((_ref = s.typeMapping) != null ? _ref[type].opts : void 0) || settings.defaultOptions;
    };
    s.$on("corpuschooserchange", function(selected) {
      var attrs, key, obj, sent_attrs;
      attrs = (function() {
        var _ref, _results;
        _ref = settings.corpusListing.getCurrentAttributes();
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
        _ref = settings.corpusListing.getStructAttrs();
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
      s.types = [word].concat(attrs, sent_attrs);
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
              $location.search(obj.key, val != null ? val : null);
              return typeof obj.post_change === "function" ? obj.post_change(val) : void 0;
            };
          })(obj)));
        }
        return _results;
      }
    };
  });

  korpApp.controller("ResultsTabCtrl", function($scope, util, $location) {
    var s;
    return s = $scope;
  });

  korpApp.controller("SearchPaneCtrl", function($scope, util, $location) {
    var s;
    s = $scope;
    s.search_tab = parseInt($location.search()["search_tab"]) || 0;
    c.log("search_tab init", s.search_tab);
    s.getSelected = function() {
      var i, p, _i, _len, _ref, _ref1;
      if (!((_ref = s.tabs) != null ? _ref.length : void 0)) {
        return s.search_tab;
      }
      _ref1 = s.tabs;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        p = _ref1[i];
        if (p.active) {
          return i;
        }
      }
    };
    s.setSelected = function(index) {
      var p, _i, _len, _ref;
      _ref = s.tabs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        p.active = false;
      }
      if (s.tabs[index]) {
        return s.tabs[index].active = true;
      }
    };
    return util.setupHash(s, [
      {
        expr: "getSelected()",
        val_out: function(val) {
          c.log("val out", val);
          return val;
        },
        val_in: function(val) {
          c.log("val_in", typeof val);
          s.setSelected(parseInt(val));
          return parseInt(val);
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

  korpApp.directive("tokenValue", function($compile, $controller) {
    var defaultTmpl;
    defaultTmpl = "<input ng-model='model'>";
    return {
      scope: {
        tokenValue: "=",
        model: "=ngModel"
      },
      template: "<div class=\"arg_value\">{{tokenValue.label}}</div>",
      link: function(scope, elem, attr, ngModelCtrl) {
        return scope.$watch("tokenValue", function(valueObj) {
          var locals, tmplElem;
          c.log("watch value", valueObj);
          if (!valueObj) {
            return;
          }
          if (valueObj.controller) {
            locals = {
              $scope: _.extend(scope, valueObj)
            };
            $controller(valueObj.controller, locals);
          }
          tmplElem = $compile(valueObj.extended_template || defaultTmpl)(scope);
          return elem.html(tmplElem);
        });
      }
    };
  });

  korpApp.directive("korpAutocomplete", function() {
    return {
      scope: {
        model: "=",
        stringify: "=",
        sorter: "=",
        type: "@"
      },
      link: function(scope, elem, attr) {
        var arg_value, setVal;
        c.log("scope.model", scope.model, scope.type);
        setVal = function(lemgram) {
          return $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, "")).val("").blur().placeholder();
        };
        if (scope.model) {
          setVal(scope.model);
        }
        return arg_value = elem.korp_autocomplete({
          labelFunction: scope.stringify,
          sortFunction: scope.sorter,
          type: scope.type,
          select: function(lemgram) {
            c.log("extended lemgram", lemgram, $(this));
            setVal(lemgram);
            return scope.$apply(function() {
              if (scope.type === "baseform") {
                return scope.model = lemgram.split(".")[0];
              } else {
                return scope.model = lemgram;
              }
            });
          },
          "sw-forms": true
        }).blur(function() {
          var input;
          input = this;
          return setTimeout((function() {
            c.log("blur");
            if (($(input).val().length && !util.isLemgramId($(input).val())) || $(input).data("value") === null) {
              return $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder();
            } else {
              return $(input).removeClass("invalid_input");
            }
          }), 100);
        });
      }
    };
  });

  korpApp.directive("slider", function() {
    return {
      template: "",
      link: function() {
        var all_years, end, from, slider, start, to;
        all_years = _(settings.corpusListing.selected).pluck("time").map(_.pairs).flatten(true).filter(function(tuple) {
          return tuple[0] && tuple[1];
        }).map(_.compose(Number, _.head)).value();
        start = Math.min.apply(Math, all_years);
        end = Math.max.apply(Math, all_years);
        arg_value.data("value", [start, end]);
        from = $("<input type='text' class='from'>").val(start);
        to = $("<input type='text' class='to'>").val(end);
        slider = $("<div />").slider({
          range: true,
          min: start,
          max: end,
          values: [start, end],
          slide: function(event, ui) {
            from.val(ui.values[0]);
            return to.val(ui.values[1]);
          },
          change: function(event, ui) {
            $(this).data("value", ui.values);
            arg_value.data("value", ui.values);
            return self._trigger("change");
          }
        });
        from.add(to).keyup(function() {
          return self._trigger("change");
        });
        return arg_value.append(slider, from, to);
      }
    };
  });

  korpApp.directive("constr", function($window) {
    return {
      link: function(scope, elem, attr) {
        var instance;
        return instance = new $window.view[attr.constr](elem);
      }
    };
  });

}).call(this);
