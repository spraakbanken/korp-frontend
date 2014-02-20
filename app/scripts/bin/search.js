(function() {
  var BaseSearch,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

  view.updateSearchHistory = function(value) {
    var filterParam, opts, placeholder, searchLocations, searches, _ref;
    filterParam = function(url) {
      return $.grep($.param.fragment(url).split("&"), function(item) {
        return item.split("=")[0] === "search" || item.split("=")[0] === "corpus";
      }).join("&");
    };
    searches = $.jStorage.get("searches") || [];
    searchLocations = $.map(searches, function(item) {
      return filterParam(item.location);
    });
    if ((value != null) && (_ref = filterParam(location.href), __indexOf.call(searchLocations, _ref) < 0)) {
      searches.splice(0, 0, {
        label: value,
        location: location.href
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
    return $("#search_history").html([placeholder].concat(opts));
  };

  view.enableSearch = function(bool) {
    if (bool) {
      return $("#search-tab").tabs("enable").removeClass("ui-state-disabled").uncover();
    } else {
      return $("#search-tab").tabs("disable").addClass("ui-state-disabled").cover();
    }
  };

  view.initSearchOptions = function() {
    var selects;
    selects = $("#search_options > div:first select").customSelect();
    view.updateReduceSelect();
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
      simpleSearch.enableSubmit();
      target = $(event.target);
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

  view.updateContextSelect = function(withinOrContext) {
    var intersect, opts, union;
    intersect = settings.corpusListing.getAttrIntersection(withinOrContext);
    union = settings.corpusListing.getAttrUnion(withinOrContext);
    opts = $("." + withinOrContext + "_select option");
    opts.data("locSuffix", null).attr("disabled", null).removeClass("limited");
    if (union.length > intersect.length) {
      opts.each(function() {
        if ($.inArray($(this).attr("value"), intersect) === -1) {
          return $(this).addClass("limited").data("locSuffix", "asterix");
        }
      });
    } else if (union.length === 1 && intersect.length === 1) {
      opts.each(function() {
        if ($.inArray($(this).attr("value"), intersect) !== -1) {
          return $(this).attr("disabled", null);
        } else {
          return $(this).attr("disabled", "disabled").parent().val("sentence").change();
        }
      });
    }
    return $("." + withinOrContext + "_select").localize();
  };

  view.updateReduceSelect = function() {
    var cl, groups, prevVal, select, sentence_attr, word_attr;
    cl = settings.corpusListing;
    if ((settings.reduce_word_attribute_selector || "union") === "union") {
      word_attr = cl.getCurrentAttributes();
    } else if (settings.reduce_word_attribute_selector === "intersection") {
      word_attr = cl.getCurrentAttributesIntersection();
    }
    if ((settings.reduce_struct_attribute_selector || "union") === "union") {
      sentence_attr = cl.getStructAttrs();
    } else if (settings.reduce_struct_attribute_selector === "intersection") {
      sentence_attr = cl.getStructAttrsIntersection();
    }
    groups = $.extend({
      word: {
        word: {
          label: "word"
        },
        word_insensitive: {
          label: "word_insensitive"
        }
      }
    }, {
      word_attr: word_attr,
      sentence_attr: $.grepObj(sentence_attr, function(val, key) {
        if (val.displayType === "date_interval") {
          return false;
        }
        return true;
      })
    });
    prevVal = $("#reduceSelect select").val();
    select = util.makeAttrSelect(groups);
    $("#reduceSelect").html(select);
    c.log("updateReduceSelect", groups, select);
    select.attr("data-history", "stats_reduce").attr("data-prefix", "reduce_text").customSelect();
    if (prevVal) {
      select.val(prevVal);
      select.trigger("change");
    }
    return select;
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

  view.SimpleSearch = (function(_super) {
    __extends(SimpleSearch, _super);

    function SimpleSearch(mainDivId, _mainDiv, scope) {
      var textinput,
        _this = this;
      SimpleSearch.__super__.constructor.call(this, mainDivId, scope);
      $("#similar_lemgrams").css("background-color", settings.primaryColor);
      $("#simple_text").change(function() {
        return _this.s.$apply(function() {
          return _this.onSimpleChange();
        });
      });
      $("#similar_lemgrams").hide();
      this.savedSelect = null;
      this.lemgramProxy = new model.LemgramProxy();
      textinput = $("#simple_text");
      if (settings.autocomplete) {
        textinput.korp_autocomplete({
          type: "lem",
          select: function(lemgram) {
            return _this.s.$apply(function() {
              _this.s.placeholder = lemgram;
              return _this.s.simple_text = "";
            });
          },
          middleware: function(request, idArray) {
            var dfd;
            dfd = $.Deferred();
            _this.lemgramProxy.lemgramCount(idArray, _this.isSearchPrefix(), _this.isSearchSuffix()).done(function(freqs) {
              var has_morphs, labelArray, listItems;
              delete freqs["time"];
              if (currentMode === "law") {
                idArray = _.filter(idArray, function(item) {
                  return item in freqs;
                });
              }
              has_morphs = settings.corpusListing.getMorphology().split("|").length > 1;
              if (has_morphs) {
                idArray.sort(function(a, b) {
                  var first, second;
                  first = (a.split("--").length > 1 ? a.split("--")[0] : "saldom");
                  second = (b.split("--").length > 1 ? b.split("--")[0] : "saldom");
                  if (first === second) {
                    return (freqs[b] || 0) - (freqs[a] || 0);
                  }
                  return second < first;
                });
              } else {
                idArray.sort(function(first, second) {
                  return (freqs[second] || 0) - (freqs[first] || 0);
                });
              }
              labelArray = util.sblexArraytoString(idArray, util.lemgramToString);
              listItems = $.map(idArray, function(item, i) {
                var out;
                out = {
                  label: labelArray[i],
                  value: item,
                  input: request.term,
                  enabled: item in freqs
                };
                if (has_morphs) {
                  out["category"] = (item.split("--").length > 1 ? item.split("--")[0] : "saldom");
                }
                return out;
              });
              return dfd.resolve(listItems);
            }).fail(function() {
              c.log("reject");
              dfd.reject();
              return textinput.preloader("hide");
            });
            return dfd.promise();
          },
          "sw-forms": false
        });
      }
      $("#prefixChk, #suffixChk, #caseChk").click(function() {
        if ($("#simple_text").attr("placeholder") && $("#simple_text").text() === "") {
          return _this.enableSubmit();
        } else {
          return _this.onSimpleChange();
        }
      });
      $("#keyboard").click(function() {
        c.log("click", arguments);
        return $("#char_table").toggle("slide", {
          direction: "up"
        }, "fast");
      });
      $("#char_table td").click(function() {
        return $("#simple_text").val($("#simple_text").val() + $(this).text());
      });
    }

    SimpleSearch.prototype.isSearchPrefix = function() {
      return $("#prefixChk").is(":checked");
    };

    SimpleSearch.prototype.isSearchSuffix = function() {
      return $("#suffixChk").is(":checked");
    };

    SimpleSearch.prototype.makeLemgramSelect = function(lemgram) {
      var promise, self,
        _this = this;
      self = this;
      promise = $("#simple_text").data("promise") || this.lemgramProxy.karpSearch(lemgram || $("#simple_text").val(), false);
      return promise.done(function(lemgramArray) {
        var label, select;
        $("#lemgram_select").prev("label").andSelf().remove();
        _this.savedSelect = null;
        if (lemgramArray.length === 0) {
          return;
        }
        lemgramArray.sort(view.lemgramSort);
        lemgramArray = $.map(lemgramArray, function(item) {
          return {
            label: util.lemgramToString(item, true),
            value: item
          };
        });
        select = _this.buildLemgramSelect(lemgramArray).appendTo("#korp-simple").addClass("lemgram_select").prepend($("<option>").localeKey("none_selected")).change(function() {
          if (self.selectedIndex !== 0) {
            self.savedSelect = lemgramArray;
            self.selectLemgram($(this).val());
          }
          return $(this).prev("label").andSelf().remove();
        });
        label = $("<label />", {
          "for": "lemgram_select"
        }).html("<i>" + ($("#simple_text").val()) + "</i> <span rel='localize[autocomplete_header]'>" + (util.getLocaleString("autocomplete_header")) + "</span>").css("margin-right", 8);
        return select.before(label);
      });
    };

    SimpleSearch.prototype.onSubmit = function() {
      SimpleSearch.__super__.onSubmit.call(this);
      c.log("onSubmit");
      $("#simple_text.ui-autocomplete-input").korp_autocomplete("abort");
      if ($("#simple_text").val() !== "") {
        return util.searchHash("word", $("#simple_text").val());
      } else {
        return this.selectLemgram(this.s.placeholder);
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

    SimpleSearch.prototype.renderSimilarHeader = function(selectedItem, data) {
      var count, div, index, isSliced, lemgrams, list, self, sliced;
      c.log("renderSimilarHeader");
      self = this;
      $("#similar_lemgrams").empty().append("<div id='similar_header' />");
      $("<p/>").localeKey("similar_header").css("float", "left").appendTo("#similar_header");
      lemgrams = this.savedSelect || $("#simple_text").data("dataArray");
      this.savedSelect = null;
      if ((lemgrams != null) && lemgrams.length) {
        this.buildLemgramSelect(lemgrams).appendTo("#similar_header").css("float", "right").change(function() {
          self.savedSelect = lemgrams;
          return self.selectLemgram($(this).val());
        }).val(selectedItem);
        $("#simple_text").data("dataArray", null);
      }
      $("<div name='wrapper' style='clear : both;' />").appendTo("#similar_header");
      data = $.grep(data, function(item) {
        return !!item.rel.length;
      });
      count = 0;
      index = 0;
      sliced = $.extend(true, [], data);
      isSliced = false;
      $.each(sliced, function(i, item) {
        index = i;
        if (count + item.rel.length > 30) {
          item.rel = item.rel.slice(0, 30 - count);
          isSliced = true;
          return false;
        }
        return count += item.rel.length;
      });
      list = $("<ul />").appendTo("#similar_lemgrams");
      $("#similarTmpl").tmpl(sliced.slice(0, index + 1)).appendTo(list).find("a").click(function() {
        return self.selectLemgram($(this).data("lemgram"));
      });
      $("#show_more").remove();
      div = $("#similar_lemgrams").show().height("auto").slideUp(0);
      if (isSliced) {
        div.after($("<div id='show_more' />").css("background-color", settings.primaryColor).append($("<a href='javascript:' />").localeKey("show_more")).click(function() {
          var h, newH;
          $(this).remove();
          h = $("#similar_lemgrams").outerHeight();
          list.html($("#similarTmpl").tmpl(data)).find("a").click(function() {
            return self.selectLemgram($(this).data("lemgram"));
          });
          $("#similar_lemgrams").height("auto");
          newH = $("#similar_lemgrams").outerHeight();
          $("#similar_lemgrams").height(h);
          return $("#similar_lemgrams").animate({
            height: newH
          }, "fast");
        }));
      }
      return div.slideDown("fast");
    };

    SimpleSearch.prototype.removeSimilarHeader = function() {
      return $("#similar_lemgrams").slideUp(function() {
        return $(this).empty();
      });
    };

    SimpleSearch.prototype.getCQP = function(word) {
      var cqp, currentText, lemgram, query, suffix, val, wordArray;
      currentText = $.trim(word || $("#simple_text").val() || "", '"');
      suffix = ($("#caseChk").is(":checked") ? " %c" : "");
      if (util.isLemgramId(currentText)) {
        val = "[lex contains \"" + currentText + "\"]";
      } else if (this.s.placeholder) {
        lemgram = regescape(this.s.placeholder);
        val = "[lex contains '" + lemgram + "'";
        if (this.isSearchPrefix()) {
          val += " | prefix contains " + lemgram + " ";
        }
        if (this.isSearchSuffix()) {
          val += " | suffix contains " + lemgram;
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
      var val;
      c.log("onSimpleChange");
      $("#simple_text").data("promise", null);
      if (event && event.keyCode === 27) {
        c.log("key", event.keyCode);
        return;
      }
      return val = this.getCQP();
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
