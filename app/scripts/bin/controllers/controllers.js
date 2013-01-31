(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', []);

  korpApp.controller("kwicCtrl", function($scope) {
    var findMatchSentence, massageData, punctArray, s;
    s = $scope;
    punctArray = [",", ".", ";", ":", "!", "?", "..."];
    massageData = function(sentenceArray) {
      var corpus, corpus_aligned, currentStruct, end, i, j, matchSentenceEnd, matchSentenceStart, newSent, output, prevCorpus, sentence, start, tokens, wd, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
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
          sentence.corpus = sentence.corpus.split("|")[0].toLowerCase();
        } else {
          sentence.corpus = sentence.corpus.toLowerCase();
        }
        if (prevCorpus !== sentence.corpus) {
          corpus = settings.corpora[sentence.corpus];
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
        prevCorpus = sentence.corpus;
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
    s.selectRight = function(sentence) {
      var from, len;
      if (!sentence.match) {
        return;
      }
      from = sentence.match.end;
      len = sentence.tokens.length;
      return sentence.tokens.slice(from, len);
    };
    return s.wordClick = function(event, obj, sent) {
      var aux, i, l, paragraph, sent_start, word;
      event.stopPropagation();
      word = $(event.target);
      $.sm.send("word.select");
      $("#sidebar").sidebar("updateContent", sent.structs, obj, sent.corpus.toLowerCase(), sent.tokens);
      if (!(obj.dephead != null)) {
        s.selectionManager.select(word, null);
        return;
      }
      i = Number(obj.dephead);
      paragraph = word.closest(".sentence").find(".word");
      sent_start = 0;
      if (word.is(".open_sentence")) {
        sent_start = paragraph.index(word);
      } else {
        l = paragraph.filter(function(__, item) {
          return $(item).is(word) || $(item).is(".open_sentence");
        });
        sent_start = paragraph.index(l.eq(l.index(word) - 1));
      }
      aux = $(paragraph.get(sent_start + i - 1));
      return s.selectionManager.select(word, aux);
    };
  });

  korpApp.directive('kwicWord', function() {
    return {
      replace: true,
      template: "<span class=\"word\" ng-class=\"getClassObj(wd)\"\nng-click=\"wordClick($event, wd, sentence)\" >{{wd.word}} </span>",
      link: function(scope, element) {
        return scope.getClassObj = function(wd) {
          var output, struct, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
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
          return output;
        };
      }
    };
  });

}).call(this);
