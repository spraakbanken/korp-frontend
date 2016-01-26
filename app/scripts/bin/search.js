(function() {
  var BaseSearch,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.view = {};

  view.lemgramSort = function(first, second) {
    var match1, match2;
    match1 = util.splitLemgram(first);
    match2 = util.splitLemgram(second);
    if (match1.form === match2.form) {
      return parseInt(match1.index) - parseInt(match2.index);
    }
    return first.length - second.length;
  };

  view.saldoSort = function(first, second) {
    var match1, match2;
    match1 = util.splitSaldo(first);
    match2 = util.splitSaldo(second);
    if (match1[1] === match2[1]) {
      return parseInt(match1[2]) - parseInt(match2[2]);
    }
    return first.length - second.length;
  };

  view.updateSearchHistory = function(value, href) {
    var clear, filterParam, opts, placeholder, ref, searchLocations, searches;
    filterParam = function(url) {
      return $.grep($.param.fragment(url).split("&"), function(item) {
        return item.split("=")[0] === "search" || item.split("=")[0] === "corpus";
      }).join("&");
    };
    $("#search_history").empty();
    searches = $.jStorage.get("searches") || [];
    searchLocations = $.map(searches, function(item) {
      return filterParam(item.location);
    });
    if ((value != null) && (ref = filterParam(href), indexOf.call(searchLocations, ref) < 0)) {
      searches.splice(0, 0, {
        label: value,
        location: href
      });
      $.jStorage.set("searches", searches);
    }
    if (!searches.length) {
      return;
    }
    opts = $.map(searches, function(item) {
      var output;
      output = $("<option />", {
        value: item.location
      }).text(item.label).get(0);
      return output;
    });
    placeholder = $("<option>").localeKey("search_history").get(0);
    clear = $("<option class='clear'>").localeKey("search_history_clear");
    return $("#search_history").html(opts).prepend(clear).prepend(placeholder);
  };

  view.enableSearch = function(bool) {};

  view.initSearchOptions = function() {
    var selects;
    selects = $("#search_options > div:first select").customSelect();
    $("#search_options select").each(function() {
      var state;
      state = search()[$(this).data("history")];
      if (state) {
        return $(this).val(state).change();
      } else {
        return $(this).prop("selectedIndex", 0).change();
      }
    });
    return $("#search_options").css("background-color", settings.primaryLight).change(function(event, isInit) {
      var state, target;
      target = $(event.target);
      if (!target.data("history")) {
        return;
      }
      state = {};
      state[target.data("history")] = target.val();
      if (target.prop("selectedIndex") !== 0) {
        search(state);
      } else {
        if (search()[target.data("history")]) {
          search(target.data("history"), null);
        }
      }
      if (isInit === true) {
        return search("search", null);
      }
    });
  };

  BaseSearch = (function() {
    function BaseSearch(mainDivId, scope) {
      this.s = scope;
      this.$main = $(mainDivId);
      this.$main.find("#sendBtn:submit").click($.proxy(this.onSubmit, this));
      this._enabled = true;
    }

    BaseSearch.prototype.refreshSearch = function() {
      search("search", null);
      return $(window).trigger("hashchange");
    };

    BaseSearch.prototype.onSubmit = function() {
      return this.refreshSearch();
    };

    BaseSearch.prototype.isVisible = function() {
      return this.$main.is(":visible");
    };

    BaseSearch.prototype.isEnabled = function() {
      return this._enabled;
    };

    BaseSearch.prototype.enableSubmit = function() {
      this._enabled = true;
      return this.$main.find("#sendBtn").attr("disabled", false);
    };

    BaseSearch.prototype.disableSubmit = function() {
      this._enabled = false;
      return this.$main.find("#sendBtn").attr("disabled", "disabled");
    };

    return BaseSearch;

  })();

  view.SimpleSearch = (function(superClass) {
    extend(SimpleSearch, superClass);

    function SimpleSearch(mainDivId, _mainDiv, scope) {
      SimpleSearch.__super__.constructor.call(this, mainDivId, scope);
      $("#similar_lemgrams").css("background-color", settings.primaryColor);
      $("#simple_text").keyup((function(_this) {
        return function(event) {
          return _this.s.$apply(function() {
            return _this.onSimpleChange(event);
          });
        };
      })(this));
      $("#similar_lemgrams").hide();
      this.savedSelect = null;
      this.lemgramProxy = new model.LemgramProxy();
      this.s.autocSettings = {
        enableLemgramSuggestion: settings.autocomplete
      };
      $("#prefixChk, #suffixChk, #caseChk").click((function(_this) {
        return function() {
          if ($("#simple_text").attr("placeholder") && $("#simple_text").text() === "") {
            return _this.enableSubmit();
          } else {
            return _this.onSimpleChange();
          }
        };
      })(this));
    }

    SimpleSearch.prototype.isSearchPrefix = function() {
      return $("#prefixChk").is(":checked");
    };

    SimpleSearch.prototype.isSearchSuffix = function() {
      return $("#suffixChk").is(":checked");
    };

    SimpleSearch.prototype.onSubmit = function() {
      var wordInput;
      SimpleSearch.__super__.onSubmit.call(this);
      wordInput = this.getWordInput();
      if (wordInput !== "") {
        return util.searchHash("word", wordInput);
      } else {
        if (this.s.model) {
          return this.selectLemgram(this.s.model);
        }
      }
    };

    SimpleSearch.prototype.getWordInput = function() {
      if (settings.autocomplete) {
        return $("#simple_text > div > div > .autocomplete_searchbox").val();
      } else {
        return $("#simple_text > div > div > .standard_searchbox").val();
      }
    };

    SimpleSearch.prototype.selectLemgram = function(lemgram) {
      if ($("#search-tab").data("cover") != null) {
        return;
      }
      this.refreshSearch();
      return util.searchHash("lemgram", lemgram);
    };

    SimpleSearch.prototype.buildLemgramSelect = function(lemgrams) {
      var optionElems;
      $("#lemgram_select").prev("label").andSelf().remove();
      optionElems = $.map(lemgrams, function(item) {
        return $("<option>", {
          value: item.value
        }).html(item.label).get(0);
      });
      return $("<select id='lemgram_select' />").html(optionElems).data("dataprovider", lemgrams);
    };

    SimpleSearch.prototype.getCQP = function(word) {
      var cqp, currentText, lemgram, query, suffix, val, wordArray;
      currentText = $.trim(word || this.getWordInput() || "", '"');
      suffix = ($("#caseChk").is(":checked") ? " %c" : "");
      if (util.isLemgramId(currentText)) {
        val = "[lex contains \"" + currentText + "\"]";
      } else if (this.s.placeholder) {
        lemgram = regescape(this.s.placeholder);
        val = "[lex contains '" + lemgram + "'";
        if (this.isSearchPrefix()) {
          val += " | prefix contains '" + lemgram + "' ";
        }
        if (this.isSearchSuffix()) {
          val += " | suffix contains '" + lemgram + "'";
        }
        val += "]";
      } else if (this.isSearchPrefix() || this.isSearchSuffix()) {
        query = [];
        this.isSearchPrefix() && query.push("%s.*");
        this.isSearchSuffix() && query.push(".*%s");
        val = $.map(currentText.split(" "), function(wd) {
          return "[" + $.map(query, function(q) {
            q = $.format(q, wd);
            return $.format("word = \"%s\"%s", [q, suffix]);
          }).join(" | ") + "]";
        }).join(" ");
      } else {
        wordArray = currentText.split(" ");
        cqp = $.map(wordArray, function(item, i) {
          return $.format("[word = \"%s\"%s]", [regescape(item), suffix]);
        });
        val = cqp.join(" ");
      }
      return val;
    };

    SimpleSearch.prototype.onSimpleChange = function(event) {
      $("#simple_text").data("promise", null);
      if (event && event.keyCode === 27) {
        c.log("key", event.keyCode);
        return;
      }
      if (event && event.keyCode !== 13) {
        return this.s.placeholder = null;
      }
    };

    SimpleSearch.prototype.resetView = function() {
      $("#similar_lemgrams").empty().height("auto");
      $("#show_more").remove();
      this.s.placeholder = null;
      return this;
    };

    SimpleSearch.prototype.clear = function() {
      $("#simple_text").val("").get(0).blur();
      return this;
    };

    return SimpleSearch;

  })(BaseSearch);

}).call(this);
