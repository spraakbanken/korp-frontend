(function() {
  var ExampleCtrl, KwicCtrl, korpApp,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  korpApp = angular.module("korpApp");

  korpApp.controller("resultContainerCtrl", function($scope, searches, $location) {
    return $scope.searches = searches;
  });

  korpApp.controller("kwicCtrl", KwicCtrl = (function() {
    KwicCtrl.prototype.setupHash = function() {
      var _this = this;
      c.log("setupHash", this.scope.$id);
      return this.utils.setupHash(this.scope, [
        {
          key: "page",
          post_change: function() {
            c.log("post_change page hash", _this.scope.page);
            _this.scope.pageObj.pager = (_this.scope.page || 0) + 1;
            return c.log("@scope.pageObj.pager", _this.scope.pageObj.pager);
          },
          val_in: Number
        }
      ]);
    };

    KwicCtrl.prototype.initPage = function() {
      c.log("initPage", this.location.search().page);
      this.scope.pageObj = {
        pager: Number(this.location.search().page) + 1 || 1
      };
      return this.scope.page = this.scope.pageObj.pager - 1;
    };

    KwicCtrl.$inject = ['$scope', "utils", "$location"];

    function KwicCtrl(scope, utils, location) {
      var $location, $scope, findMatchSentence, massageData, punctArray, readingChange, s,
        _this = this;
      this.scope = scope;
      this.utils = utils;
      this.location = location;
      s = this.scope;
      $scope = this.scope;
      c.log("kwicCtrl init", $scope.$parent);
      $location = this.location;
      s.active = true;
      s.onexit = function() {
        c.log("onexit");
        return s.$root.sidebar_visible = false;
      };
      punctArray = [",", ".", ";", ":", "!", "?", "..."];
      this.initPage();
      s.$watch("pageObj.pager", function(val) {
        return c.log("pageobj watch", val);
      });
      s.pageChange = function($event, page) {
        c.log("pageChange", arguments);
        $event.stopPropagation();
        return s.page = page - 1;
      };
      this.setupHash();
      s.onPageInput = function($event, page, numPages) {
        if ($event.keyCode === 13) {
          if (page > numPages) {
            page = numPages;
          }
          s.pageObj.pager = page;
          return s.page = Number(page) - 1;
        }
      };
      readingChange = function() {
        var _ref;
        c.log("reading change");
        if ((_ref = s.instance) != null ? _ref.getProxy().pendingRequests.length : void 0) {
          window.pending = s.instance.getProxy().pendingRequests;
          return $.when.apply($, s.instance.getProxy().pendingRequests).then(function() {
            c.log("readingchange makeRequest");
            return s.instance.makeRequest();
          });
        }
      };
      s.setupReadingHash = function() {
        return _this.utils.setupHash(s, [
          {
            key: "reading_mode",
            post_change: function(isReading) {
              c.log("change reading mode", isReading);
              return readingChange();
            }
          }
        ]);
      };
      s.setupReadingWatch = _.once(function() {
        var init;
        c.log("setupReadingWatch");
        init = true;
        return s.$watch("reading_mode", function() {
          if (!init) {
            readingChange();
          }
          return init = false;
        });
      });
      s.toggleReading = function() {
        s.reading_mode = !s.reading_mode;
        return s.instance.centerScrollbar();
      };
      s.hitspictureClick = function(pageNumber) {
        c.log("pageNumber", pageNumber);
        return s.page = Number(pageNumber);
      };
      massageData = function(sentenceArray) {
        var corpus, corpus_aligned, currentStruct, end, i, id, isOpen, j, linkCorpusId, mainCorpusId, matchSentenceEnd, matchSentenceStart, newSent, output, prevCorpus, sentence, start, tokens, wd, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        currentStruct = [];
        prevCorpus = "";
        output = [];
        isOpen = false;
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
              isOpen = true;
            } else if (isOpen && ((_ref5 = wd.structs) != null ? _ref5.close : void 0)) {
              wd._close = wd.structs.close;
              currentStruct = _.without.apply(_, [currentStruct].concat(__slice.call(wd.structs.close)));
            }
            if (isOpen) {
              if (currentStruct.length) {
                _.extend(wd, {
                  _struct: currentStruct
                });
              }
            }
            if ((_ref6 = wd.structs) != null ? _ref6.close : void 0) {
              currentStruct = [];
              isOpen = false;
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
            _ref7 = _.pairs(sentence.aligned)[0], corpus_aligned = _ref7[0], tokens = _ref7[1];
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
      s.selectRight = function(sentence) {
        var from, len;
        if (!sentence.match) {
          return;
        }
        from = sentence.match.end;
        len = sentence.tokens.length;
        return sentence.tokens.slice(from, len);
      };
    }

    return KwicCtrl;

  })());

  korpApp.controller("ExampleCtrl", ExampleCtrl = (function(_super) {
    __extends(ExampleCtrl, _super);

    ExampleCtrl.$inject = ['$scope', "utils", "$location"];

    function ExampleCtrl(scope, utils, $location) {
      var s;
      this.scope = scope;
      ExampleCtrl.__super__.constructor.call(this, this.scope, utils, $location);
      s = this.scope;
      s.pageChange = function($event, page) {
        $event.stopPropagation();
        s.instance.current_page = page;
        return s.instance.makeRequest();
      };
    }

    ExampleCtrl.prototype.initPage = function() {
      this.scope.pageObj = {
        pager: 0
      };
      return this.scope.page = 0;
    };

    ExampleCtrl.prototype.setupHash = function() {};

    return ExampleCtrl;

  })(KwicCtrl));

  korpApp.controller("StatsResultCtrl", function($scope, utils, $location, backend, searches, $rootScope) {
    var s;
    s = $scope;
    return s.onGraphShow = function(data) {
      c.log("show graph!", arguments);
      return $rootScope.graphTabs.push(data);
    };
  });

  korpApp.controller("wordpicCtrl", function($scope, $location, utils, searches) {
    $scope.word_pic = $location.search().word_pic != null;
    $scope.$watch((function() {
      return $location.search().word_pic;
    }), function(val) {
      return $scope.word_pic = Boolean(val);
    });
    return $scope.activate = function() {
      var search;
      $location.search("word_pic", true);
      search = searches.activeSearch;
      return $scope.instance.makeRequest(search.val, search.type);
    };
  });

  korpApp.controller("graphCtrl", function($scope) {
    var s;
    s = $scope;
    s.active = true;
    s.mode = "line";
    s.isGraph = function() {
      var _ref;
      return (_ref = s.mode) === "line" || _ref === "bar";
    };
    return s.isTable = function() {
      return s.mode === "table";
    };
  });

  korpApp.controller("compareCtrl", function($scope, $rootScope) {
    var s;
    s = $scope;
    s.loading = true;
    s.active = true;
    return s.promise.then(function(_arg, xhr) {
      var attributes, cl, cmp1, cmp2, cmps, data, op, pairs, reduce, type, _ref, _ref1;
      data = _arg[0], cmp1 = _arg[1], cmp2 = _arg[2], reduce = _arg[3];
      s.loading = false;
      if (data.ERROR) {
        s.error = true;
        return;
      }
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
      attributes = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs());
      s.stringify = ((_ref = attributes[_.str.strip(reduce, "_.")]) != null ? _ref.stringify : void 0) || angular.identity;
      s.max = _.max(pairs, function(_arg1) {
        var val, word;
        word = _arg1[0], val = _arg1[1];
        return Math.abs(val);
      });
      s.cmp1 = cmp1;
      s.cmp2 = cmp2;
      type = (_ref1 = attributes[_.str.strip(reduce, "_.")]) != null ? _ref1.type : void 0;
      op = type === "set" ? "contains" : "=";
      cmps = [cmp1, cmp2];
      return s.rowClick = function(triple, cmp_index) {
        var cmp, cqpobj, cqps, opts, token, _i, _len, _ref2;
        cmp = cmps[cmp_index];
        c.log("triple", triple, cmp);
        cqps = [];
        _ref2 = triple[0].split(" ");
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          token = _ref2[_i];
          if (type === "set" && token === "|") {
            cqps.push("[ambiguity(" + reduce + ") = 0]");
          } else {
            cqps.push(CQP.fromObj({
              type: reduce,
              op: op,
              val: token
            }));
          }
        }
        cqpobj = CQP.concat.apply(CQP, cqps);
        cl = settings.corpusListing.subsetFactory(cmp.corpora);
        opts = {
          start: 0,
          end: 24,
          ajaxParams: {
            command: "query",
            cqp: cmp.cqp,
            cqp2: CQP.stringify(cqpobj),
            corpus: cl.stringifySelected(),
            show_struct: _.keys(cl.getStructAttrs()),
            expand_prequeries: false
          }
        };
        return $rootScope.kwicTabs.push(opts);
      };
    });
  });

  korpApp.controller("MapCtrl", function($scope, $rootScope, $location, $timeout, searches, nameEntitySearch, markers, nameMapper) {
    var fixData, getCqpExpr, s, updateMapData;
    s = $scope;
    s.loading = false;
    s.hasResult = false;
    s.aborted = false;
    $(document).keyup(function(event) {
      var _ref;
      if (event.keyCode === 27 && s.showMap && s.loading) {
        if ((_ref = s.proxy) != null) {
          _ref.abort();
        }
        return $timeout((function() {
          s.aborted = true;
          return s.loading = false;
        }), 0);
      }
    });
    s.$watch((function() {
      return $location.search().result_tab;
    }), function(val) {
      return $timeout((function() {
        return s.tabVisible = val === 1;
      }), 0);
    });
    s.showMap = $location.search().show_map != null;
    s.$watch((function() {
      return $location.search().show_map;
    }), function(val) {
      var currentCorpora, currentCqp, _ref, _ref1;
      if (val === s.showMap) {
        return;
      }
      s.showMap = Boolean(val);
      if (s.showMap) {
        currentCqp = getCqpExpr();
        currentCorpora = settings.corpusListing.stringifySelected(true);
        if (currentCqp !== ((_ref = s.lastSearch) != null ? _ref.cqp : void 0) || currentCorpora !== ((_ref1 = s.lastSearch) != null ? _ref1.corpora : void 0)) {
          return s.hasResult = false;
        }
      }
    });
    s.activate = function() {
      var cqpExpr;
      $location.search("show_map", true);
      s.showMap = true;
      cqpExpr = getCqpExpr();
      if (cqpExpr) {
        return nameEntitySearch.request(cqpExpr);
      }
    };
    getCqpExpr = function() {
      var cqpExpr, search;
      search = searches.activeSearch;
      cqpExpr = null;
      if (search) {
        if (search.type === "word" || search.type === "lemgram") {
          cqpExpr = simpleSearch.getCQP(search.val);
        } else {
          cqpExpr = search.val;
        }
      }
      return cqpExpr;
    };
    s.center = {
      lat: 62.99515845212052,
      lng: 16.69921875,
      zoom: 4
    };
    s.hoverTemplate = "<div class=\"hover-info\" ng-repeat=\"(name, values) in names\">\n   <div><span>{{ 'map_name' | loc }}: </span> <span>{{name}}</span></div>\n   <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{values.abs_occurrences}}</span></div>\n   <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{values.rel_occurrences}}</span></div>\n</div>";
    s.markers = {};
    s.numResults = 0;
    s.showTime = true;
    s.$on("map_progress", function(event, progress) {
      return s.progress = Math.round(progress["stats"]);
    });
    s.$on("map_data_available", function(event, cqp, corpora) {
      s.aborted = false;
      if (s.showMap) {
        s.proxy = nameEntitySearch.proxy;
        s.lastSearch = {
          cqp: cqp,
          corpora: corpora
        };
        s.loading = true;
        updateMapData();
        return s.hasResult = true;
      }
    });
    s.countCorpora = function() {
      var _ref;
      return (_ref = s.proxy.prevParams) != null ? _ref.corpus.split(",").length : void 0;
    };
    fixData = function(data) {
      var abs, fixedData, name, names, rel, _i, _len;
      fixedData = {};
      abs = data.total.absolute;
      rel = data.total.relative;
      names = _.keys(abs);
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        fixedData[name] = {
          rel_occurrences: Math.round((data.total.relative[name] + 0.00001) * 1000) / 1000,
          abs_occurrences: data.total.absolute[name]
        };
      }
      return fixedData;
    };
    return updateMapData = function() {
      return nameEntitySearch.promise.then(function(data) {
        var fixedData;
        if (data.count !== 0) {
          fixedData = fixData(data);
          return markers(fixedData).then(function(markers) {
            var key, value, _fn;
            _fn = function(key, value) {
              var html, msgScope, name;
              html = "";
              msgScope = value.getMessageScope();
              for (name in msgScope.names) {
                html += '<div class="link" ng-click="newKWICSearch(\'' + name + '\')">' + name + '</div>';
              }
              msgScope.newKWICSearch = function(query) {
                var cl, opts;
                cl = settings.corpusListing;
                opts = {
                  start: 0,
                  end: 24,
                  ajaxParams: {
                    command: "query",
                    cqp: getCqpExpr(),
                    cqp2: "[word='" + query + "' & pos='PM']",
                    corpus: cl.stringifySelected(),
                    show_struct: _.keys(cl.getStructAttrs()),
                    expand_prequeries: true
                  }
                };
                return $rootScope.kwicTabs.push(opts);
              };
              return markers[key]["message"] = html;
            };
            for (key in markers) {
              if (!__hasProp.call(markers, key)) continue;
              value = markers[key];
              _fn(key, value);
            }
            s.markers = markers;
            s.numResults = _.keys(markers).length;
            return s.loading = false;
          });
        } else {
          s.markers = {};
          s.numResults = 0;
          return s.loading = false;
        }
      });
    };
  });

}).call(this);
