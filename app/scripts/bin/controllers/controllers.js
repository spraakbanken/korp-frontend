(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  window.korpApp = angular.module('korpApp', []);

  korpApp.controller("kwicCtrl", function($scope) {
    var findMatchSentence, massageData, punctArray, s;
    s = $scope;
    punctArray = [",", ".", ";", ":", "!", "?", "..."];
    massageData = function(sentenceArray) {
      var currentStruct, prevCorpus;
      currentStruct = [];
      prevCorpus = "";
      return _.flatten(_.map(sentenceArray, function(sentence) {
        var corpus, end, i, matchSentenceEnd, matchSentenceStart, newSent, start, wd, _i, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        _ref = findMatchSentence(sentence), matchSentenceStart = _ref[0], matchSentenceEnd = _ref[1];
        _ref1 = sentence.match, start = _ref1.start, end = _ref1.end;
        for (i = _i = 0, _ref2 = sentence.tokens.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
          wd = sentence.tokens[i];
          if ((start <= i && i < end)) {
            _.extend(wd, {
              _match: true
            });
          }
          if ((matchSentenceStart < i && i < matchSentenceEnd)) {
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
        if (prevCorpus !== sentence.corpus) {
          corpus = settings.corpora[sentence.corpus.toLowerCase()];
          if (currentMode === "parallel") {
            corpus = settings.corpora[sentence.corpus.split("|")[0].toLowerCase()];
          }
          newSent = {
            newCorpus: corpus.title,
            noContext: _.keys(corpus.context).length === 1
          };
          prevCorpus = sentence.corpus;
          return [newSent, sentence];
        }
        prevCorpus = sentence.corpus;
        return sentence;
      }));
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
      c.log("click", obj, event);
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
