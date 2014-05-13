(function() {
  var BaseResults, newDataInGraph,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  BaseResults = (function() {
    function BaseResults(resultSelector, tabSelector, scope) {
      this.s = scope;
      this.$tab = $(tabSelector);
      this.$result = $(resultSelector);
      this.index = this.$tab.index();
      this.optionWidget = $("#search_options");
      this.num_result = this.$result.find(".num-result");
      this.$result.add(this.$tab).addClass("not_loading");
    }

    BaseResults.prototype.onProgress = function(progressObj) {
      var _this = this;
      this.num_result.html(util.prettyNumbers(progressObj["total_results"]));
      return safeApply(this.s, function() {
        return _this.s.$parent.progress = Math.round(progressObj["stats"]);
      });
    };

    BaseResults.prototype.renderResult = function(data) {
      var _this = this;
      this.$result.find(".error_msg").remove();
      if (this.$result.is(":visible")) {
        util.setJsonLink(this.proxy.prevRequest);
      }
      if (data.ERROR) {
        this.resultError(data);
        return false;
      } else {
        return safeApply(this.s, function() {
          return _this.hasData = true;
        });
      }
    };

    BaseResults.prototype.resultError = function(data) {
      c.error("json fetch error: ", data);
      this.hidePreloader();
      this.resetView();
      $('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">').append("<img class='korp_fail' src='img/korp_fail.svg'>").add($("<div class='fail_text' />").localeKey("fail_text")).addClass("inline_block").prependTo(this.$result).wrapAll("<div class='error_msg'>");
      return util.setJsonLink(this.proxy.prevRequest);
    };

    BaseResults.prototype.showPreloader = function() {
      return this.s.$parent.loading = true;
    };

    BaseResults.prototype.hidePreloader = function() {
      return this.s.$parent.loading = false;
    };

    BaseResults.prototype.resetView = function() {
      this.hasData = false;
      return this.$result.find(".error_msg").remove();
    };

    BaseResults.prototype.countCorpora = function() {
      var _ref;
      return (_ref = this.proxy.prevParams) != null ? _ref.corpus.split(",").length : void 0;
    };

    return BaseResults;

  })();

  view.KWICResults = (function(_super) {
    __extends(KWICResults, _super);

    function KWICResults(tabSelector, resultSelector, scope) {
      var self,
        _this = this;
      self = this;
      this.prevCQP = null;
      KWICResults.__super__.constructor.call(this, tabSelector, resultSelector, scope);
      window.kwicProxy = new model.KWICProxy();
      this.proxy = kwicProxy;
      this.readingProxy = new model.KWICProxy();
      this.current_page = search().page || 0;
      this.s = scope;
      this.s.setupReadingHash();
      this.selectionManager = scope.selectionManager;
      this.$result.click(function() {
        if (!_this.selectionManager.hasSelected()) {
          return;
        }
        _this.selectionManager.deselect();
        return safeApply(_this.s.$root, function(s) {
          return s.$root.word_selected = null;
        });
      });
      $(document).keydown($.proxy(this.onKeydown, this));
      this.$result.on("click", ".word", function(event) {
        var aux, i, l, obj, paragraph, sent, sent_start, word;
        scope = $(event.currentTarget).scope();
        obj = scope.wd;
        sent = scope.sentence;
        event.stopPropagation();
        word = $(event.target);
        if ($("#sidebar").data().korpSidebar != null) {
          $("#sidebar").sidebar("updateContent", sent.structs, obj, sent.corpus.toLowerCase(), sent.tokens);
        }
        if (obj.dephead == null) {
          scope.selectionManager.select(word, null);
          safeApply(_this.s.$root, function(s) {
            return s.$root.word_selected = word;
          });
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
        scope.selectionManager.select(word, aux);
        return safeApply(_this.s.$root, function(s) {
          return s.$root.word_selected = word;
        });
      });
    }

    KWICResults.prototype.resetView = function() {
      return KWICResults.__super__.resetView.call(this);
    };

    KWICResults.prototype.getProxy = function() {
      return this.proxy;
    };

    KWICResults.prototype.isReadingMode = function() {
      return this.s.reading_mode;
    };

    KWICResults.prototype.onentry = function() {
      var _this = this;
      c.log("onentry kwic");
      this.s.$root.sidebar_visible = true;
      this.$result.find(".token_selected").click();
      _.defer(function() {
        return _this.centerScrollbar();
      });
    };

    KWICResults.prototype.onexit = function() {
      c.log("onexit kwic");
      this.s.$root.sidebar_visible = false;
    };

    KWICResults.prototype.onKeydown = function(event) {
      var isSpecialKeyDown, next;
      isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey;
      if (isSpecialKeyDown || $("input, textarea, select").is(":focus") || !this.$result.is(":visible")) {
        return;
      }
      switch (event.which) {
        case 78:
          this.$result.find(".pager-wrapper .next").click();
          return false;
        case 70:
          this.$result.find(".pager-wrapper .prev").click();
          return false;
      }
      if (!this.selectionManager.hasSelected()) {
        return;
      }
      switch (event.which) {
        case 38:
          next = this.selectUp();
          break;
        case 39:
          next = this.selectNext();
          break;
        case 37:
          next = this.selectPrev();
          break;
        case 40:
          next = this.selectDown();
      }
      if (next) {
        this.scrollToShowWord($(next));
      }
      return false;
    };

    KWICResults.prototype.getPageInterval = function(page) {
      var items_per_page, output;
      items_per_page = Number(this.optionWidget.find(".num_hits").val());
      output = {};
      output.start = (page || 0) * items_per_page;
      output.end = (output.start + items_per_page) - 1;
      return output;
    };

    KWICResults.prototype.renderCompleteResult = function(data) {
      var _this = this;
      c.log("renderCompleteResult", data);
      this.current_page = search().page || 0;
      safeApply(this.s, function() {
        return _this.hidePreloader();
      });
      if (!data.hits) {
        c.log("no kwic results");
        this.showNoResults();
        return;
      }
      this.$result.removeClass("zero_results");
      this.$result.find(".num-result").html(util.prettyNumbers(data.hits));
      this.renderHitsPicture(data);
      return this.buildPager(data.hits);
    };

    KWICResults.prototype.renderResult = function(data) {
      var firstWord, isReading, linked, mainrow, offset, resultError, scrollLeft, _i, _len, _ref,
        _this = this;
      c.log("data", data);
      resultError = KWICResults.__super__.renderResult.call(this, data);
      if (resultError === false) {
        return;
      }
      if (!data.kwic) {
        data.kwic = [];
      }
      c.log("corpus_results");
      isReading = this.isReadingMode();
      this.s.$apply(function($scope) {
        c.log("apply kwic search data", data);
        if (isReading) {
          $scope.setContextData(data);
          _this.selectionManager.deselect();
          return _this.s.$root.word_selected = null;
        } else {
          return $scope.setKwicData(data);
        }
      });
      if (currentMode === "parallel" && !isReading) {
        scrollLeft = $(".table_scrollarea", this.$result).scrollLeft() || 0;
        _ref = $(".linked_sentence");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          linked = _ref[_i];
          mainrow = $(linked).prev();
          firstWord = mainrow.find(".left .word:first");
          if (!firstWord.length) {
            firstWord = mainrow.find(".match .word:first");
          }
          offset = (firstWord.position().left + scrollLeft) - 25;
          $(linked).find(".lnk").css("padding-left", Math.round(offset));
        }
      }
      this.$result.localize();
      this.centerScrollbar();
      if (!this.s.$root.word_selected && !isReading) {
        return this.$result.find(".match").children().first().click();
      }
    };

    KWICResults.prototype.showNoResults = function() {
      this.$result.find(".pager-wrapper").empty();
      this.hidePreloader();
      this.$result.find(".num-result").html(0);
      this.$result.addClass("zero_results").click();
      return this.$result.find(".hits_picture").html("");
    };

    KWICResults.prototype.renderHitsPicture = function(data) {
      var index, items,
        _this = this;
      items = _.map(data.corpus_order, function(obj) {
        return {
          "rid": obj,
          "rtitle": settings.corpusListing.getTitle(obj.toLowerCase()),
          "relative": data.corpus_hits[obj] / data.hits,
          "abs": data.corpus_hits[obj]
        };
      });
      items = _.filter(items, function(item) {
        return item.abs > 0;
      });
      index = 0;
      _.each(items, function(obj) {
        obj.page = Math.floor(index / _this.proxy.prevMisc.hitsPerPage);
        return index += obj.abs;
      });
      return this.s.$apply(function($scope) {
        return $scope.hitsPictureData = items;
      });
    };

    KWICResults.prototype.scrollToShowWord = function(word) {
      var area, newX, newY, offset, wordLeft, wordTop;
      if (!word.length) {
        return;
      }
      offset = 200;
      wordTop = word.offset().top;
      newY = window.scrollY;
      if (wordTop > $(window).height() + window.scrollY) {
        newY += offset;
      } else {
        if (wordTop < window.scrollY) {
          newY -= offset;
        }
      }
      $("html, body").stop(true, true).animate({
        scrollTop: newY
      });
      wordLeft = word.offset().left;
      area = this.$result.find(".table_scrollarea");
      newX = Number(area.scrollLeft());
      if (wordLeft > (area.offset().left + area.width())) {
        newX += offset;
      } else {
        if (wordLeft < area.offset().left) {
          newX -= offset;
        }
      }
      return area.stop(true, true).animate({
        scrollLeft: newX
      });
    };

    KWICResults.prototype.buildPager = function(number_of_hits) {
      var items_per_page;
      items_per_page = this.optionWidget.find(".num_hits").val();
      $.onScrollOut("unbind");
      this.$result.find(".pager-wrapper").unbind().empty();
      if (number_of_hits > items_per_page) {
        this.$result.find(".pager-wrapper").pagination(number_of_hits, {
          items_per_page: items_per_page,
          callback: $.proxy(this.handlePaginationClick, this),
          next_text: util.getLocaleString("next"),
          prev_text: util.getLocaleString("prev"),
          link_to: "javascript:void(0)",
          num_edge_entries: 2,
          ellipse_text: "..",
          current_page: this.current_page || 0
        });
        this.$result.find(".next").attr("rel", "localize[next]");
        return this.$result.find(".prev").attr("rel", "localize[prev]");
      }
    };

    KWICResults.prototype.handlePaginationClick = function(new_page_index, pagination_container, force_click) {
      var isReading, kwicCallback, page, self;
      page = search().page || 0;
      c.log("handlePaginationClick", new_page_index, page);
      self = this;
      if (new_page_index !== page || !!force_click) {
        isReading = this.isReadingMode();
        kwicCallback = this.renderResult;
        this.getProxy().makeRequest(this.buildQueryOptions(), new_page_index, (function(progressObj) {
          return self.$tab.find(".tab_progress").css("width", Math.round(progressObj["stats"]).toString() + "%");
        }), (function(data) {
          return self.buildPager(data.hits);
        }), $.proxy(kwicCallback, this));
        safeApply(this.s, function() {
          return search({
            page: new_page_index
          });
        });
        this.current_page = new_page_index;
      }
      return false;
    };

    KWICResults.prototype.buildQueryOptions = function(cqp) {
      var getSortParams, opts;
      c.log("buildQueryOptions", cqp);
      opts = {};
      getSortParams = function() {
        var rnd, sort;
        sort = search().sort;
        if (!sort) {
          return {};
        }
        if (sort === "random") {
          if (search().random_seed) {
            rnd = search().random_seed;
          } else {
            rnd = Math.ceil(Math.random() * 10000000);
            search({
              random_seed: rnd
            });
          }
          return {
            sort: sort,
            random_seed: rnd
          };
        }
        return {
          sort: sort
        };
      };
      opts.ajaxParams = {
        command: "query",
        cqp: cqp || this.proxy.prevCQP,
        queryData: this.proxy.queryData ? this.proxy.queryData : void 0,
        context: this.isReadingMode() || currentMode === "parallel" ? settings.corpusListing.getContextQueryString() : void 0,
        within: search().within ? settings.corpusListing.getWithinQueryString() : void 0
      };
      _.extend(opts.ajaxParams, getSortParams());
      return opts;
    };

    KWICResults.prototype.makeRequest = function(page_num, cqp) {
      var isReading, kwicCallback,
        _this = this;
      this.showPreloader();
      isReading = this.isReadingMode();
      safeApply(this.s, function() {
        if (isReading) {
          return _this.s.setContextData({
            kwic: []
          });
        } else {
          return _this.s.setKwicData({
            kwic: []
          });
        }
      });
      kwicCallback = $.proxy(this.renderResult, this);
      return this.getProxy().makeRequest(this.buildQueryOptions(cqp), page_num, (isReading ? $.noop : $.proxy(this.onProgress, this)), $.proxy(this.renderCompleteResult, this), kwicCallback);
    };

    KWICResults.prototype.setPage = function(page) {
      return this.$result.find(".pager-wrapper").trigger("setPage", [page]);
    };

    KWICResults.prototype.centerScrollbar = function() {
      var area, m, match, sidebarWidth;
      m = this.$result.find(".match:first");
      if (!m.length) {
        return;
      }
      area = this.$result.find(".table_scrollarea").scrollLeft(0);
      match = m.first().position().left + m.width() / 2;
      sidebarWidth = $("#sidebar").outerWidth() || 0;
      area.stop(true, true).scrollLeft(match - ($("body").innerWidth() - sidebarWidth) / 2);
    };

    KWICResults.prototype.getCurrentRow = function() {
      var tr;
      tr = this.$result.find(".token_selected").closest("tr");
      if (this.$result.find(".token_selected").parent().is("td")) {
        return tr.find("td > .word");
      } else {
        return tr.find("div > .word");
      }
    };

    KWICResults.prototype.selectNext = function() {
      var i, next;
      if (!this.isReadingMode()) {
        i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0));
        next = this.getCurrentRow().get(i + 1);
        if (next == null) {
          return;
        }
        $(next).click();
      } else {
        next = this.$result.find(".token_selected").next().click();
      }
      return next;
    };

    KWICResults.prototype.selectPrev = function() {
      var i, prev;
      if (!this.isReadingMode()) {
        i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0));
        if (i === 0) {
          return;
        }
        prev = this.getCurrentRow().get(i - 1);
        $(prev).click();
      } else {
        prev = this.$result.find(".token_selected").prev().click();
      }
      return prev;
    };

    KWICResults.prototype.selectUp = function() {
      var current, def, prevMatch, searchwords;
      current = this.selectionManager.selected;
      if (!this.isReadingMode()) {
        prevMatch = this.getWordAt(current.offset().left + current.width() / 2, current.closest("tr").prevAll(".not_corpus_info").first());
        prevMatch.click();
      } else {
        searchwords = current.prevAll(".word").get().concat(current.closest(".not_corpus_info").prevAll(".not_corpus_info").first().find(".word").get().reverse());
        def = current.parent().prev().find(".word:last");
        prevMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click();
      }
      return prevMatch;
    };

    KWICResults.prototype.selectDown = function() {
      var current, def, nextMatch, searchwords;
      current = this.selectionManager.selected;
      if (!this.isReadingMode()) {
        nextMatch = this.getWordAt(current.offset().left + current.width() / 2, current.closest("tr").nextAll(".not_corpus_info").first());
        nextMatch.click();
      } else {
        searchwords = current.nextAll(".word").add(current.closest(".not_corpus_info").nextAll(".not_corpus_info").first().find(".word"));
        def = current.parent().next().find(".word:first");
        nextMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, searchwords, def).click();
      }
      return nextMatch;
    };

    KWICResults.prototype.getFirstAtCoor = function(xCoor, wds, default_word) {
      var output;
      output = null;
      wds.each(function(i, item) {
        var thisLeft, thisRight;
        thisLeft = $(this).offset().left;
        thisRight = $(this).offset().left + $(this).width();
        if (xCoor > thisLeft && xCoor < thisRight) {
          output = $(this);
          return false;
        }
      });
      return output || default_word;
    };

    KWICResults.prototype.getWordAt = function(xCoor, $row) {
      var output;
      output = $();
      $row.find(".word").each(function() {
        var thisLeft, thisRight;
        output = $(this);
        thisLeft = $(this).offset().left;
        thisRight = $(this).offset().left + $(this).width();
        if ((xCoor > thisLeft && xCoor < thisRight) || thisLeft > xCoor) {
          return false;
        }
      });
      return output;
    };

    return KWICResults;

  })(BaseResults);

  view.ExampleResults = (function(_super) {
    __extends(ExampleResults, _super);

    function ExampleResults(tabSelector, resultSelector, scope) {
      ExampleResults.__super__.constructor.call(this, tabSelector, resultSelector, scope);
      this.proxy = new model.KWICProxy();
      this.s.setupReadingWatch();
      if (this.s.$parent.queryParams) {
        this.makeRequest();
        this.onentry();
      }
      this.current_page = 0;
    }

    ExampleResults.prototype.makeRequest = function() {
      var items_per_page, opts, prev, progress,
        _this = this;
      c.log("ExampleResults.makeRequest()", this.current_page);
      items_per_page = parseInt(this.optionWidget.find(".num_hits").val());
      opts = this.s.$parent.queryParams;
      this.resetView();
      opts.ajaxParams.incremental = opts.ajaxParams.command === "query";
      opts.ajaxParams.start = this.current_page * items_per_page;
      opts.ajaxParams.end = opts.ajaxParams.start + items_per_page;
      prev = _.pick(this.proxy.prevParams, "cqp", "command", "corpus", "head", "rel", "source", "dep", "depextra");
      _.extend(opts.ajaxParams, prev);
      $.extend(opts, {
        success: function(data) {
          c.log("ExampleResults success", data, opts);
          _this.renderResult(data, opts.cqp);
          _this.renderCompleteResult(data);
          safeApply(_this.s, function() {
            return _this.hidePreloader();
          });
          util.setJsonLink(_this.proxy.prevRequest);
          return _this.$result.find(".num-result").html(util.prettyNumbers(data.hits));
        },
        error: function() {
          return safeApply(_this.s, function() {
            return _this.hidePreloader();
          });
        }
      });
      this.showPreloader();
      progress = opts.command === "query" ? $.proxy(this.onProgress, this) : $.noop;
      return this.proxy.makeRequest(opts, null, $.noop, $.noop, progress);
    };

    ExampleResults.prototype.handlePaginationClick = function(new_page_index, pagination_container, force_click) {
      this.current_page = new_page_index;
      this.makeRequest();
      return false;
    };

    return ExampleResults;

  })(view.KWICResults);

  view.LemgramResults = (function(_super) {
    __extends(LemgramResults, _super);

    function LemgramResults(tabSelector, resultSelector, scope) {
      var self;
      self = this;
      LemgramResults.__super__.constructor.call(this, tabSelector, resultSelector, scope);
      this.s = scope;
      this.resultDeferred = $.Deferred();
      this.proxy = new model.LemgramProxy();
      window.lemgramProxy = this.proxy;
      this.$result.find("#wordclassChk").change(function() {
        if ($(this).is(":checked")) {
          return $(".lemgram_result .wordclass_suffix", self.$result).show();
        } else {
          return $(".lemgram_result .wordclass_suffix", self.$result).hide();
        }
      });
    }

    LemgramResults.prototype.resetView = function() {
      LemgramResults.__super__.resetView.call(this);
      return $(".content_target", this.$result).empty();
    };

    LemgramResults.prototype.makeRequest = function(word, type) {
      var def,
        _this = this;
      this.showPreloader();
      def = this.proxy.makeRequest(word, type, function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.onProgress.apply(_this, args);
      });
      return def.fail(function(jqXHR, status, errorThrown) {
        var _this = this;
        c.log("def fail", status);
        if (status === "abort") {
          return safeApply(lemgramResults.s, function() {
            return lemgramResults.hidePreloader();
          });
        }
      });
    };

    LemgramResults.prototype.renderResult = function(data, query) {
      var resultError,
        _this = this;
      c.log("lemgram renderResult", data, query);
      $(".content_target", this.$result).empty();
      resultError = LemgramResults.__super__.renderResult.call(this, data);
      safeApply(this.s, function() {
        _this.hidePreloader();
        return _this.s.$parent.progress = 100;
      });
      if (resultError === false) {
        return;
      }
      if (!data.relations) {
        safeApply(this.s, function() {});
        return this.resultDeferred.reject();
      } else if (util.isLemgramId(query)) {
        this.renderTables(query, data.relations);
        return this.resultDeferred.resolve();
      } else {
        this.renderWordTables(query, data.relations);
        return this.resultDeferred.resolve();
      }
    };

    LemgramResults.prototype.renderHeader = function(wordClass, isLemgram) {
      wordClass = (_.invert(settings.wordpictureTagset))[wordClass.toLowerCase()];
      return $(".tableContainer:last .lemgram_section").each(function(i) {
        var $parent;
        $parent = $(this).find(".lemgram_help");
        return $(this).find(".lemgram_result").each(function(j) {
          var cell, classes, confObj, label;
          confObj = settings.wordPictureConf[wordClass][i][j];
          if (confObj !== "_") {
            if (!$(this).find("table").length) {
              return;
            }
            if (confObj.alt_label) {
              label = confObj.alt_label;
            } else {
              label = "rel_" + $(this).data("rel");
            }
            cell = $("<span />", {
              "class": "lemgram_header_item"
            }).localeKey(label).addClass(confObj.css_class || "").appendTo($parent);
            return $(this).addClass(confObj.css_class).css("border-color", $(this).css("background-color"));
          } else {
            label = $(this).data("word") || $(this).tmplItem().lemgram;
            classes = "hit";
            if (isLemgram) {
              classes += " lemgram";
            }
            return $("<span class='" + classes + "'><b>" + label + "</b></span>").appendTo($parent);
          }
        });
      }).append("<div style='clear:both;'/>");
    };

    LemgramResults.prototype.renderWordTables = function(word, data) {
      var self, tagsetTrans, unique_words, wordlist,
        _this = this;
      self = this;
      wordlist = $.map(data, function(item) {
        var output;
        output = [];
        if (item.head.split("_")[0] === word) {
          output.push([item.head, item.headpos.toLowerCase()]);
        }
        if (item.dep.split("_")[0] === word) {
          output.push([item.dep, item.deppos.toLowerCase()]);
        }
        return output;
      });
      unique_words = _.uniq(wordlist, function(_arg) {
        var pos, word;
        word = _arg[0], pos = _arg[1];
        return word + pos;
      });
      tagsetTrans = _.invert(settings.wordpictureTagset);
      unique_words = _.filter(unique_words, function(_arg) {
        var currentWd, pos;
        currentWd = _arg[0], pos = _arg[1];
        return settings.wordPictureConf[tagsetTrans[pos]] != null;
      });
      if (!unique_words.length) {
        this.showNoResults();
        return;
      }
      $.each(unique_words, function(i, _arg) {
        var content, currentWd, pos;
        currentWd = _arg[0], pos = _arg[1];
        self.drawTable(currentWd, pos, data);
        self.renderHeader(pos, false);
        content = "" + currentWd + " (<span rel=\"localize[pos]\">" + (util.getLocaleString(pos)) + "</span>)";
        return $(".tableContainer:last").prepend($("<div>", {
          "class": "header"
        }).html(content)).find(".hit .wordclass_suffix").hide();
      });
      $(".lemgram_result .wordclass_suffix").hide();
      return this.hidePreloader();
    };

    LemgramResults.prototype.renderTables = function(lemgram, data) {
      var wordClass;
      if (data[0].head === lemgram) {
        wordClass = data[0].headpos;
      } else {
        wordClass = data[0].deppos;
      }
      this.drawTable(lemgram, wordClass, data);
      $(".lemgram_result .wordclass_suffix").hide();
      this.renderHeader(wordClass, true);
      return this.hidePreloader();
    };

    LemgramResults.prototype.drawTable = function(token, wordClass, data) {
      var container, getRelType, inArray, orderArrays, tagsetTrans,
        _this = this;
      inArray = function(rel, orderList) {
        var i, type;
        i = _.findIndex(orderList, function(item) {
          return (item.field_reverse || false) === (rel.field_reverse || false) && item.rel === rel.rel;
        });
        type = (rel.field_reverse ? "head" : "dep");
        return {
          i: i,
          type: type
        };
      };
      tagsetTrans = _.invert(settings.wordpictureTagset);
      getRelType = function(item) {
        return {
          rel: tagsetTrans[item.rel.toLowerCase()],
          field_reverse: item.dep === token
        };
      };
      wordClass = (_.invert(settings.wordpictureTagset))[wordClass.toLowerCase()];
      if (settings.wordPictureConf[wordClass] == null) {
        return;
      }
      orderArrays = [[], [], []];
      $.each(data, function(index, item) {
        return $.each(settings.wordPictureConf[wordClass] || [], function(i, rel_type_list) {
          var list, rel, ret;
          list = orderArrays[i];
          rel = getRelType(item);
          if (!rel) {
            return;
          }
          ret = inArray(rel, rel_type_list);
          if (ret.i === -1) {
            return;
          }
          if (!list[ret.i]) {
            list[ret.i] = [];
          }
          item.show_rel = ret.type;
          return list[ret.i].push(item);
        });
      });
      $.each(orderArrays, function(i, unsortedList) {
        var toIndex;
        $.each(unsortedList, function(_, list) {
          if (list) {
            return list.sort(function(first, second) {
              return second.mi - first.mi;
            });
          }
        });
        if (settings.wordPictureConf[wordClass][i] && unsortedList.length) {
          toIndex = $.inArray("_", settings.wordPictureConf[wordClass][i]);
          if (util.isLemgramId(token)) {
            unsortedList.splice(toIndex, 0, {
              word: token.split("..")[0].replace(/_/g, " ")
            });
          } else {
            unsortedList.splice(toIndex, 0, {
              word: util.lemgramToString(token)
            });
          }
        }
        return unsortedList = $.grep(unsortedList, function(item, index) {
          return Boolean(item);
        });
      });
      container = $("<div>", {
        "class": "tableContainer radialBkg"
      }).appendTo(".content_target", this.$result);
      c.log("orderArrays", orderArrays);
      $("#lemgramResultsTmpl").tmpl(orderArrays, {
        lemgram: token
      }).find(".example_link").append($("<span>").addClass("ui-icon ui-icon-document")).css("cursor", "pointer").click(function(event) {
        return _this.onClickExample(event);
      }).end().appendTo(container);
      return $("td:nth-child(2)", this.$result).each(function() {
        var $siblings, hasHomograph, label, prefix, siblingLemgrams;
        $siblings = $(this).parent().siblings().find("td:nth-child(2)");
        siblingLemgrams = $.map($siblings, function(item) {
          return $(item).data("lemgram").slice(0, -1);
        });
        hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) !== -1;
        prefix = ($(this).data("depextra").length ? $(this).data("depextra") + " " : "");
        data = $(this).tmplItem().data;
        if (!data.dep) {
          label = "&mdash;";
        } else {
          label = util.lemgramToString($(this).data("lemgram"), hasHomograph);
        }
        return $(this).html(prefix + label);
      });
    };

    LemgramResults.prototype.onClickExample = function(event) {
      var $target, data, opts, self;
      self = this;
      $target = $(event.currentTarget);
      c.log("onClickExample", $target);
      data = $target.parent().tmplItem().data;
      opts = {};
      opts.ajaxParams = {
        start: 0,
        end: 24,
        command: "relations_sentences",
        source: data.source.join(","),
        corpus: null,
        head: data.head,
        dep: data.dep,
        rel: data.rel,
        depextra: data.depextra,
        corpus: data.corpus
      };
      return this.s.$root.kwicTabs.push(opts);
    };

    LemgramResults.prototype.showWarning = function() {
      var hasWarned;
      hasWarned = !!$.jStorage.get("lemgram_warning");
      if (!hasWarned) {
        $.jStorage.set("lemgram_warning", true);
        $("#sidebar").sidebar("show", "lemgramWarning");
        return self.timeout = setTimeout(function() {
          return $("#sidebar").sidebar("hide");
        }, 5000);
      }
    };

    LemgramResults.prototype.onentry = function() {
      return this.resultDeferred.done(this.showWarning);
    };

    LemgramResults.prototype.onexit = function() {
      clearTimeout(self.timeout);
      return $("#sidebar").sidebar("hide");
    };

    LemgramResults.prototype.showNoResults = function() {
      this.hidePreloader();
      return this.$result.find(".content_target").html($("<i />").localeKey("no_lemgram_results"));
    };

    LemgramResults.prototype.hideWordclass = function() {
      return $("td:first-child", this.$result).each(function() {
        return $(this).html($.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" ")));
      });
    };

    return LemgramResults;

  })(BaseResults);

  newDataInGraph = function(dataName, horizontalDiagram) {
    var corpusArray, dataItems, locstring, relHitsString, stats2Instance, statsSwitchInstance, topheader, wordArray;
    c.log("dataName, horizontalDiagram", dataName, horizontalDiagram);
    dataItems = [];
    wordArray = [];
    corpusArray = [];
    statsResults["lastDataName"] = dataName;
    if (horizontalDiagram) {
      $.each(statsResults.savedData["corpora"], function(corpus, obj) {
        var freq, totfreq;
        if (dataName === "SIGMA_ALL") {
          totfreq = 0;
          $.each(obj["relative"], function(wordform, freq) {
            var numFreq;
            numFreq = parseFloat(freq);
            if (numFreq) {
              return totfreq += numFreq;
            }
          });
          return dataItems.push({
            value: totfreq,
            caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString()),
            shape_id: "sigma_all"
          });
        } else {
          freq = parseFloat(obj["relative"][dataName]);
          if (freq) {
            return dataItems.push({
              value: freq,
              caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString()),
              shape_id: dataName
            });
          } else {
            return dataItems.push({
              value: 0,
              caption: "",
              shape_id: dataName
            });
          }
        }
      });
      $("#dialog").remove();
      if (dataName === "SIGMA_ALL") {
        topheader = util.getLocaleString("statstable_hitsheader_lemgram");
        locstring = "statstable_hitsheader_lemgram";
      } else {
        topheader = util.getLocaleString("statstable_hitsheader") + ("<i>" + dataName + "</i>");
        locstring = "statstable_hitsheader";
      }
      relHitsString = util.getLocaleString("statstable_relfigures_hits");
      $("<div id='dialog' title='" + topheader + "' />").appendTo("body").append("<br/><div id=\"statistics_switch\" style=\"text-align:center\">\n    <a href=\"javascript:\" rel=\"localize[statstable_relfigures]\" data-mode=\"relative\">Relativa frekvenser</a>\n    <a href=\"javascript:\" rel=\"localize[statstable_absfigures]\" data-mode=\"absolute\">Absoluta frekvenser</a>\n</div>\n<div id=\"chartFrame\" style=\"height:380\"></div>\n<p id=\"hitsDescription\" style=\"text-align:center\" rel=\"localize[statstable_absfigures_hits]\">" + relHitsString + "</p>").dialog({
        width: 400,
        height: 500,
        resize: function() {
          $("#chartFrame").css("height", $("#chartFrame").parent().width() - 20);
          return stats2Instance.pie_widget("resizeDiagram", $(this).width() - 60);
        },
        resizeStop: function(event, ui) {
          var h, w;
          w = $(this).dialog("option", "width");
          h = $(this).dialog("option", "height");
          if (this.width * 1.25 > this.height) {
            $(this).dialog("option", "height", w * 1.25);
          } else {
            $(this).dialog("option", "width", h * 0.80);
          }
          return stats2Instance.pie_widget("resizeDiagram", $(this).width() - 60);
        }
      }).css("opacity", 0).parent().find(".ui-dialog-title").localeKey("statstable_hitsheader_lemgram");
      $("#dialog").fadeTo(400, 1);
      $("#dialog").find("a").blur();
      stats2Instance = $("#chartFrame").pie_widget({
        container_id: "chartFrame",
        data_items: dataItems
      });
      return statsSwitchInstance = $("#statistics_switch").radioList({
        change: function() {
          var loc, typestring;
          typestring = statsSwitchInstance.radioList("getSelected").attr("data-mode");
          dataItems = new Array();
          dataName = statsResults["lastDataName"];
          $.each(statsResults.savedData["corpora"], function(corpus, obj) {
            var freq, totfreq;
            if (dataName === "SIGMA_ALL") {
              totfreq = 0;
              $.each(obj[typestring], function(wordform, freq) {
                var numFreq;
                if (typestring === "absolute") {
                  numFreq = parseInt(freq);
                } else {
                  numFreq = parseFloat(freq);
                }
                if (numFreq) {
                  return totfreq += numFreq;
                }
              });
              return dataItems.push({
                value: totfreq,
                caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString(), false),
                shape_id: "sigma_all"
              });
            } else {
              if (typestring === "absolute") {
                freq = parseInt(obj[typestring][dataName]);
              } else {
                freq = parseFloat(obj[typestring][dataName]);
              }
              if (freq) {
                return dataItems.push({
                  value: freq,
                  caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString(), false),
                  shape_id: dataName
                });
              } else {
                return dataItems.push({
                  value: 0,
                  caption: "",
                  shape_id: dataName
                });
              }
            }
          });
          stats2Instance.pie_widget("newData", dataItems);
          if (typestring === "absolute") {
            loc = "statstable_absfigures_hits";
          } else {
            loc = "statstable_absfigures_hits";
          }
          return $("#hitsDescription").localeKey(loc);
        },
        selected: "relative"
      });
    }
  };

  view.StatsResults = (function(_super) {
    __extends(StatsResults, _super);

    function StatsResults(resultSelector, tabSelector, scope) {
      var paper, self,
        _this = this;
      StatsResults.__super__.constructor.call(this, resultSelector, tabSelector, scope);
      c.log("StatsResults constr", self = this);
      this.gridData = null;
      this.proxy = new model.StatsProxy();
      window.statsProxy = this.proxy;
      this.$result.on("click", ".arcDiagramPicture", function(event) {
        var parts;
        parts = $(event.currentTarget).attr("id").split("__");
        if (parts[1] !== "Σ") {
          return newDataInGraph(parts[1], true);
        } else {
          return newDataInGraph("SIGMA_ALL", true);
        }
      });
      this.$result.on("click", ".slick-cell.l1.r1 .link", function() {
        var opts, query;
        query = $(this).data("query");
        opts = {};
        opts.ajaxParams = {
          start: 0,
          end: 24,
          command: "query",
          corpus: $(this).data("corpora").join(",").toUpperCase(),
          cqp: decodeURIComponent(query)
        };
        return safeApply(scope.$root, function() {
          return scope.$root.kwicTabs.push(opts);
        });
      });
      $(window).resize(_.debounce(function() {
        var h, nRows, _ref, _ref1, _ref2;
        $("#myGrid:visible").width($(window).width() - 40);
        nRows = ((_ref = _this.gridData) != null ? _ref.length : void 0) || 2;
        h = (nRows * 2) + 4;
        h = Math.min(h, 40);
        $("#myGrid:visible").height("" + h + ".1em");
        if ((_ref1 = _this.grid) != null) {
          _ref1.resizeCanvas();
        }
        return (_ref2 = _this.grid) != null ? _ref2.autosizeColumns() : void 0;
      }, 100));
      $("#exportButton").unbind("click");
      $("#exportButton").click(function() {
        var cl, corp, dataDelimiter, fmt, header, output, row, selType, selVal, total, val, values, wd, _i, _len, _ref;
        selVal = $("#kindOfData option:selected").val();
        selType = $("#kindOfFormat option:selected").val();
        dataDelimiter = ";";
        if (selType === "TSV") {
          dataDelimiter = "%09";
        }
        cl = settings.corpusListing.subsetFactory(_.keys(_this.savedData.corpora));
        header = [util.getLocaleString("stats_hit"), util.getLocaleString("stats_total")];
        header = header.concat(_.pluck(cl.corpora, "title"));
        fmt = function(what) {
          return util.formatDecimalString(what.toString(), false, true, true);
        };
        total = ["Σ", fmt(_this.savedData.total.sums[selVal])];
        total = total.concat((function() {
          var _i, _len, _ref, _results;
          _ref = _.pluck(cl.corpora, "id");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            corp = _ref[_i];
            _results.push(fmt(this.savedData.corpora[corp.toUpperCase()].sums[selVal]));
          }
          return _results;
        }).call(_this));
        output = [header, total];
        _ref = _this.savedWordArray;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          wd = _ref[_i];
          row = [wd, fmt(_this.savedData.total[selVal][wd])];
          values = (function() {
            var _j, _len1, _ref1, _results;
            _ref1 = _.pluck(cl.corpora, "id");
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              corp = _ref1[_j];
              val = this.savedData.corpora[corp.toUpperCase()][selVal][wd];
              if (val) {
                _results.push(val = fmt(val));
              } else {
                _results.push(val = "0");
              }
            }
            return _results;
          }).call(_this);
          output.push(row.concat(values));
        }
        output = _.invoke(output, "join", dataDelimiter);
        output = output.join(escape(String.fromCharCode(0x0D) + String.fromCharCode(0x0A)));
        if (selType === "TSV") {
          return window.open("data:text/tsv;charset=utf-8," + output);
        } else {
          return window.open("data:text/csv;charset=utf-8," + output);
        }
      });
      if ($("html.msie7,html.msie8").length) {
        $("#showGraph").hide();
        return;
      }
      $("#showGraph").on("click", function() {
        var attrs, cell, chk, cl, cqp, isStructAttr, labelMapping, mainCQP, op, params, prefix, reduceVal, showTotal, subExprs, val, _i, _len, _ref, _ref1;
        if ($("#showGraph").is(".disabled")) {
          return;
        }
        params = _this.proxy.prevParams;
        cl = settings.corpusListing.subsetFactory(params.corpus.split(","));
        reduceVal = params.groupby;
        isStructAttr = reduceVal in cl.getStructAttrs();
        subExprs = [];
        labelMapping = {};
        showTotal = false;
        mainCQP = params.cqp;
        prefix = isStructAttr ? "_." : "";
        attrs = _.extend({}, cl.getCurrentAttributes(settings.reduce_word_attribute_selector), cl.getStructAttrs(settings.reduce_word_attribute_selector));
        op = ((_ref = attrs[reduceVal]) != null ? _ref.type : void 0) === "set" ? "contains" : "=";
        _ref1 = _this.$result.find(".slick-cell-checkboxsel :checked");
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          chk = _ref1[_i];
          cell = $(chk).parent();
          if (cell.is(".slick-row:nth-child(1) .slick-cell-checkboxsel")) {
            showTotal = true;
            continue;
          }
          val = _this.gridData[cell.parent().index()].hit_value;
          cqp = "[" + (prefix + reduceVal) + " " + op + " '" + (regescape(val)) + "']";
          subExprs.push(cqp);
          labelMapping[cqp] = cell.next().text();
        }
        return _this.s.$apply(function() {
          return _this.s.onGraphShow({
            cqp: mainCQP,
            subcqps: subExprs,
            labelMapping: labelMapping,
            showTotal: showTotal,
            corpusListing: cl
          });
        });
      });
      paper = new Raphael($(".graph_btn_icon", this.$result).get(0), 33, 24);
      paper.path("M3.625,25.062c-0.539-0.115-0.885-0.646-0.77-1.187l0,0L6.51,6.584l2.267,9.259l1.923-5.188l3.581,3.741l3.883-13.103l2.934,11.734l1.96-1.509l5.271,11.74c0.226,0.504,0,1.095-0.505,1.321l0,0c-0.505,0.227-1.096,0-1.322-0.504l0,0l-4.23-9.428l-2.374,1.826l-1.896-7.596l-2.783,9.393l-3.754-3.924L8.386,22.66l-1.731-7.083l-1.843,8.711c-0.101,0.472-0.515,0.794-0.979,0.794l0,0C3.765,25.083,3.695,25.076,3.625,25.062L3.625,25.062z").attr({
        fill: "#666",
        stroke: "none",
        transform: "s0.6"
      });
    }

    StatsResults.prototype.renderResult = function(columns, data) {
      var checkboxSelector, grid, refreshHeaders, resultError, sortCol,
        _this = this;
      refreshHeaders = function() {
        $(".slick-header-column:nth(2)").click().click();
        return $(".slick-column-name:nth(1),.slick-column-name:nth(2)").not("[rel^=localize]").each(function() {
          return $(this).localeKey($(this).text());
        });
      };
      this.resetView();
      this.gridData = data;
      resultError = StatsResults.__super__.renderResult.call(this, data);
      if (resultError === false) {
        return;
      }
      c.log("renderresults");
      if (data[0].total_value.absolute === 0) {
        this.showNoResults();
        return;
      }
      checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "slick-cell-checkboxsel"
      });
      columns = [checkboxSelector.getColumnDefinition()].concat(columns);
      $("#myGrid").width($(document).width());
      grid = new Slick.Grid($("#myGrid"), data, columns, {
        enableCellNavigation: false,
        enableColumnReorder: true
      });
      grid.setSelectionModel(new Slick.RowSelectionModel({
        selectActiveRow: false
      }));
      grid.registerPlugin(checkboxSelector);
      this.grid = grid;
      this.grid.autosizeColumns();
      $("#myGrid").width("100%");
      sortCol = columns[2];
      grid.onSort.subscribe(function(e, args) {
        sortCol = args.sortCol;
        data.sort(function(a, b) {
          var ret, x, y;
          if (sortCol.field === "hit_value") {
            x = a[sortCol.field];
            y = b[sortCol.field];
          } else {
            x = a[sortCol.field].absolute || 0;
            y = b[sortCol.field].absolute || 0;
          }
          ret = (x === y ? 0 : (x > y ? 1 : -1));
          if (!args.sortAsc) {
            ret *= -1;
          }
          return ret;
        });
        grid.setData(data);
        grid.updateRowCount();
        return grid.render();
      });
      grid.onHeaderCellRendered.subscribe(function(e, args) {
        return refreshHeaders();
      });
      refreshHeaders();
      $(".slick-row:first input", this.$result).click();
      $(window).trigger("resize");
      $.when(timeDeferred).then(function() {
        return safeApply(_this.s, function() {
          return _this.updateGraphBtnState();
        });
      });
      return safeApply(this.s, function() {
        return _this.hidePreloader();
      });
    };

    StatsResults.prototype.updateGraphBtnState = function() {
      var cl;
      this.s.graphEnabled = true;
      cl = settings.corpusListing.subsetFactory(this.proxy.prevParams.corpus.split(","));
      if (!(_.compact(cl.getTimeInterval())).length) {
        return this.s.graphEnabled = false;
      }
    };

    StatsResults.prototype.onentry = function() {
      $(window).trigger("resize");
    };

    StatsResults.prototype.onexit = function() {};

    StatsResults.prototype.resetView = function() {
      StatsResults.__super__.resetView.call(this);
      $("myGrid").empty();
      return $("#exportStatsSection").show();
    };

    StatsResults.prototype.showNoResults = function() {
      var _this = this;
      c.log("showNoResults", this.$result);
      safeApply(this.s, function() {
        return _this.hidePreloader();
      });
      this.$result.prepend($("<i/ class='error_msg'>").localeKey("no_stats_results"));
      return $("#exportStatsSection").hide();
    };

    return StatsResults;

  })(BaseResults);

  view.GraphResults = (function(_super) {
    __extends(GraphResults, _super);

    function GraphResults(tabSelector, resultSelector, scope) {
      var _this = this;
      GraphResults.__super__.constructor.call(this, tabSelector, resultSelector, scope);
      this.zoom = "year";
      this.granularity = this.zoom[0];
      this.proxy = new model.GraphProxy();
      this.makeRequest(this.s.data.cqp, this.s.data.subcqps, this.s.data.corpusListing, this.s.data.labelMapping, this.s.data.showTotal);
      $(".chart", this.$result).on("click", function(event) {
        var cqp, end, m, opts, start, target, timecqp, val;
        target = $(".chart", _this.$result);
        val = $(".detail .x_label > span", target).data("val");
        cqp = $(".detail .item.active > span", target).data("cqp");
        c.log("chart click", cqp, target);
        if (cqp) {
          m = moment(val * 1000);
          start = m.format("YYYYMMDD");
          end = m.add(1, "year").subtract(1, "day").format("YYYYMMDD");
          timecqp = "(int(_.text_datefrom) >= " + start + " & int(_.text_dateto) <= " + end + ")";
          cqp = "[(" + (decodeURIComponent(cqp).slice(1, -1)) + ") & " + timecqp + "]";
          opts = {};
          opts.ajaxParams = {
            start: 0,
            end: 24,
            command: "query",
            corpus: _this.s.data.corpusListing.stringifySelected(),
            cqp: cqp
          };
          return safeApply(_this.s.$root, function() {
            return _this.s.$root.kwicTabs.push(opts);
          });
        }
      });
    }

    GraphResults.prototype.onentry = function() {};

    GraphResults.prototype.onexit = function() {};

    GraphResults.prototype.parseDate = function(granularity, time) {
      var day, month, year, _ref;
      _ref = [null, 0, 1], year = _ref[0], month = _ref[1], day = _ref[2];
      switch (granularity) {
        case "y":
          year = time;
          break;
        case "m":
          year = time.slice(0, 4);
          month = time.slice(4, 6);
          break;
        case "d":
          year = time.slice(0, 4);
          month = time.slice(4, 6);
          day = time.slice(6, 8);
      }
      return moment([Number(year), Number(month), Number(day)]);
    };

    GraphResults.prototype.fillMissingDate = function(data) {
      var dateArray, diff, duration, i, lastYVal, max, maybeCurrent, min, momentMapping, n_diff, newMoment, newMoments, _i;
      dateArray = _.pluck(data, "x");
      min = _.min(dateArray, function(mom) {
        return mom.toDate();
      });
      max = _.max(dateArray, function(mom) {
        return mom.toDate();
      });
      duration = (function() {
        switch (this.granularity) {
          case "y":
            duration = moment.duration({
              year: 1
            });
            return diff = "year";
          case "m":
            duration = moment.duration({
              month: 1
            });
            return diff = "month";
          case "d":
            duration = moment.duration({
              day: 1
            });
            return diff = "day";
        }
      }).call(this);
      n_diff = moment(max).diff(min, diff);
      momentMapping = _.object(_.map(data, function(item) {
        return [moment(item.x).unix(), item.y];
      }));
      newMoments = [];
      for (i = _i = 0; 0 <= n_diff ? _i <= n_diff : _i >= n_diff; i = 0 <= n_diff ? ++_i : --_i) {
        newMoment = moment(min).add(diff, i);
        maybeCurrent = momentMapping[newMoment.unix()];
        if (typeof maybeCurrent !== 'undefined') {
          lastYVal = maybeCurrent;
        } else {
          newMoments.push({
            x: newMoment,
            y: lastYVal
          });
        }
      }
      return [].concat(data, newMoments);
    };

    GraphResults.prototype.getSeriesData = function(data) {
      var first, firstVal, hasFirstValue, hasLastValue, last, lastVal, mom, output, tuple, x, y, _i, _len, _ref;
      delete data[""];
      _ref = settings.corpusListing.getTimeInterval(), first = _ref[0], last = _ref[1];
      firstVal = this.parseDate("y", first);
      lastVal = this.parseDate("y", last.toString());
      hasFirstValue = false;
      hasLastValue = false;
      output = (function() {
        var _i, _len, _ref1, _ref2, _results;
        _ref1 = _.pairs(data);
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          _ref2 = _ref1[_i], x = _ref2[0], y = _ref2[1];
          mom = this.parseDate(this.granularity, x);
          if (mom.isSame(firstVal)) {
            hasFirstValue = true;
          }
          if (mom.isSame(lastVal)) {
            hasLastValue = true;
          }
          _results.push({
            x: mom,
            y: y
          });
        }
        return _results;
      }).call(this);
      if (!hasFirstValue) {
        output.push({
          x: firstVal,
          y: 0
        });
      }
      output = this.fillMissingDate(output);
      output = output.sort(function(a, b) {
        return a.x.unix() - b.x.unix();
      });
      output.splice(output.length - 1, 1);
      for (_i = 0, _len = output.length; _i < _len; _i++) {
        tuple = output[_i];
        tuple.x = tuple.x.unix();
      }
      return output;
    };

    GraphResults.prototype.hideNthTick = function(graphDiv) {
      return $(".x_tick:visible", graphDiv).hide().filter(function(n) {
        return n % 2 === 0;
      }).show();
    };

    GraphResults.prototype.updateTicks = function() {
      var firstTick, margin, secondTick, ticks;
      ticks = $(".chart .title:visible", this.$result);
      firstTick = ticks.eq(0);
      secondTick = ticks.eq(1);
      margin = 5;
      if (!firstTick.length || !secondTick.length) {
        return;
      }
      if (firstTick.offset().left + firstTick.width() + margin > secondTick.offset().left) {
        this.hideNthTick($(".chart", this.$result));
        return this.updateTicks();
      }
    };

    GraphResults.prototype.getNonTime = function() {
      var non_time, sizelist, totalsize;
      non_time = _.reduce(_.pluck(settings.corpusListing.selected, "non_time"), (function(a, b) {
        return (a || 0) + (b || 0);
      }), 0);
      sizelist = _.map(settings.corpusListing.selected, function(item) {
        return Number(item.info.Size);
      });
      totalsize = _.reduce(sizelist, function(a, b) {
        return a + b;
      });
      return (non_time / totalsize) * 100;
    };

    GraphResults.prototype.getEmptyIntervals = function(data) {
      var breaker, i, interval, intervals, item;
      intervals = [];
      i = 0;
      while (i < data.length) {
        item = data[i];
        if (item.y === null) {
          interval = [_.clone(item)];
          breaker = true;
          while (breaker) {
            i++;
            item = data[i];
            if ((item != null ? item.y : void 0) === null) {
              interval.push(_.clone(item));
            } else {
              intervals.push(interval);
              breaker = false;
            }
          }
        }
        i++;
      }
      return intervals;
    };

    GraphResults.prototype.drawIntervals = function(graph, intervals) {
      var from, list, max, min, offset, to, unitSpan, unitWidth, _i, _len, _ref, _results;
      if (!$(".zoom_slider", this.$result).is(".ui-slider")) {
        return;
      }
      _ref = $('.zoom_slider', this.$result).slider("values"), from = _ref[0], to = _ref[1];
      unitSpan = moment.unix(to).diff(moment.unix(from), this.zoom);
      unitWidth = graph.width / unitSpan;
      $(".empty_area", this.$result).remove();
      _results = [];
      for (_i = 0, _len = intervals.length; _i < _len; _i++) {
        list = intervals[_i];
        max = _.max(list, "x");
        min = _.min(list, "x");
        from = Math.round(graph.x(min.x));
        to = Math.round(graph.x(max.x));
        offset = 8;
        _results.push($("<div>", {
          "class": "empty_area"
        }).css({
          left: from - unitWidth / 2,
          width: (to - from) + unitWidth
        }).appendTo(graph.element));
      }
      return _results;
    };

    GraphResults.prototype.makeRequest = function(cqp, subcqps, corpora, labelMapping, showTotal) {
      var _this = this;
      c.log("makeRequest", cqp, subcqps, corpora, labelMapping, showTotal);
      this.s.loading = true;
      this.showPreloader();
      return this.proxy.makeRequest(cqp, subcqps, corpora.stringifySelected()).progress(function(data) {
        return _this.onProgress(data);
      }).fail(function(data) {
        c.log("graph crash");
        _this.resultError(data);
        return _this.s.loading = false;
      }).done(function(data) {
        var color, emptyIntervals, first, graph, hoverDetail, item, last, legend, nontime, old_ceil, old_render, old_tickOffsets, palette, s, series, shelving, slider, time, timeunit, toDate, yAxis, _i, _len, _ref;
        c.log("data", data);
        if (data.ERROR) {
          _this.resultError(data);
          return;
        }
        nontime = _this.getNonTime();
        if (nontime) {
          $(".non_time", _this.$result).text(nontime.toFixed(2) + "%").parent().localize();
        } else {
          $(".non_time_div").hide();
        }
        if (_.isArray(data.combined)) {
          palette = new Rickshaw.Color.Palette("colorwheel");
          series = (function() {
            var _i, _len, _ref, _results;
            _ref = data.combined;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              color = palette.color();
              _results.push({
                data: this.getSeriesData(item.relative),
                color: color,
                name: item.cqp ? labelMapping[item.cqp] : "&Sigma;",
                cqp: item.cqp || cqp,
                abs_data: this.getSeriesData(item.absolute)
              });
            }
            return _results;
          }).call(_this);
        } else {
          series = [
            {
              data: _this.getSeriesData(data.combined.relative),
              color: 'steelblue',
              name: "&Sigma;",
              cqp: cqp,
              abs_data: _this.getSeriesData(data.combined.absolute)
            }
          ];
        }
        Rickshaw.Series.zeroFill(series);
        window.data = series[0].data;
        emptyIntervals = _this.getEmptyIntervals(series[0].data);
        _this.s.hasEmptyIntervals = emptyIntervals.length;
        for (_i = 0, _len = series.length; _i < _len; _i++) {
          s = series[_i];
          s.data = _.filter(s.data, function(item) {
            return item.y !== null;
          });
        }
        graph = new Rickshaw.Graph({
          element: $(".chart", _this.$result).get(0),
          renderer: 'line',
          interpolation: "linear",
          series: series,
          padding: {
            top: 0.1,
            right: 0.01
          }
        });
        graph.render();
        window._graph = graph;
        _this.drawIntervals(graph, emptyIntervals);
        $(window).on("resize", _.throttle(function() {
          if (_this.$result.is(":visible")) {
            graph.setSize();
            return graph.render();
          }
        }, 200));
        $(".form_switch", _this.$result).buttonset().change(function(event, ui) {
          var cls, target, val, _j, _len1, _ref;
          target = event.currentTarget;
          val = $(":checked", target).val();
          _ref = _this.$result.attr("class").split(" ");
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            cls = _ref[_j];
            if (cls.match(/^form-/)) {
              _this.$result.removeClass(cls);
            }
          }
          _this.$result.addClass("form-" + val);
          $(".smoothing_switch", _this.$result).button("enable");
          if (val === "bar") {
            if ($(".legend .line", _this.$result).length > 1) {
              $(".legend li:last:not(.disabled) .action", _this.$result).click();
              if (_.all(_.map($(".legend .line", _this.$result), function(item) {
                return $(item).is(".disabled");
              }))) {
                $(".legend li:first .action", _this.$result).click();
              }
            }
            $(".smoothing_switch:checked", _this.$result).click();
            $(".smoothing_switch", _this.$result).button("disable");
          }
          graph.setRenderer(val);
          return graph.render();
        });
        $(".smoothing_label .ui-button-text", _this.$result).localeKey("smoothing");
        $(".form_switch .ui-button:first .ui-button-text", _this.$result).localeKey("line");
        $(".form_switch .ui-button:last .ui-button-text", _this.$result).localeKey("bar");
        legend = new Rickshaw.Graph.Legend({
          element: $(".legend", _this.$result).get(0),
          graph: graph
        });
        shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
          graph: graph,
          legend: legend
        });
        if (!showTotal && $(".legend .line", _this.$result).length > 1) {
          $(".legend .line:last .action", _this.$result).click();
        }
        hoverDetail = new Rickshaw.Graph.HoverDetail({
          graph: graph,
          xFormatter: function(x) {
            var d, out, output;
            d = new Date(x * 1000);
            output = ["<span rel='localize[year]'>" + (util.getLocaleString('year')) + "</span>: <span class='currently'>" + (d.getFullYear()) + "</span>", "<span rel='localize[month]'>" + (util.getLocaleString('month')) + "</span>: <span class='currently'>" + (d.getMonth()) + "</span>", "<span rel='localize[day]'>" + (util.getLocaleString('day')) + "</span>: <span class='currently'>" + (d.getDay()) + "</span>"];
            out = (function() {
              switch (this.granularity) {
                case "y":
                  return output[0];
                case "m":
                  return output.slice(0, 2).join("\n");
                case "d":
                  return output.join("\n");
              }
            }).call(_this);
            return "<span data-val='" + x + "'>" + out + "</span>";
          },
          yFormatter: function(y) {
            var val;
            val = util.formatDecimalString(y.toFixed(2), false, true, true);
            return ("<br><span rel='localize[rel_hits_short]'>" + (util.getLocaleString('rel_hits_short')) + "</span> ") + val;
          },
          formatter: _.debounce(function(series, x, y, formattedX, formattedY, d) {
            var abs_y, i, rel;
            i = _.indexOf(_.pluck(series.abs_data, "x"), x, true);
            abs_y = series.abs_data[i].y;
            rel = series.name + ':&nbsp;' + formattedY;
            return "<span data-cqp=\"" + (encodeURIComponent(series.cqp)) + "\">\n    " + rel + "\n    <br>\n    " + (util.getLocaleString('abs_hits_short')) + ": " + abs_y + "\n</span>";
          }, 100)
        });
        _ref = settings.corpusListing.getTimeInterval(), first = _ref[0], last = _ref[1];
        timeunit = last - first > 100 ? "decade" : _this.zoom;
        toDate = function(sec) {
          return moment(sec * 1000).toDate();
        };
        time = new Rickshaw.Fixtures.Time();
        old_ceil = time.ceil;
        time.ceil = function(time, unit) {
          var mom, out;
          if (unit.name === "decade") {
            out = Math.ceil(time / unit.seconds) * unit.seconds;
            mom = moment(out * 1000);
            if (mom.date() === 31) {
              mom.add("day", 1);
            }
            return mom.unix();
          } else {
            return old_ceil(time, unit);
          }
        };
        window.xAxis = new Rickshaw.Graph.Axis.Time({
          graph: graph,
          timeUnit: time.unit(timeunit)
        });
        slider = new Rickshaw.Graph.RangeSlider({
          graph: graph,
          element: $('.zoom_slider', _this.$result)
        });
        old_render = xAxis.render;
        xAxis.render = function() {
          old_render.call(xAxis);
          _this.updateTicks();
          return _this.drawIntervals(graph, emptyIntervals);
        };
        old_tickOffsets = xAxis.tickOffsets;
        xAxis.tickOffsets = function() {
          var count, domain, i, offsets, runningTick, tickValue, unit, _j;
          domain = xAxis.graph.x.domain();
          unit = xAxis.fixedTimeUnit || xAxis.appropriateTimeUnit();
          count = Math.ceil((domain[1] - domain[0]) / unit.seconds);
          runningTick = domain[0];
          offsets = [];
          for (i = _j = 0; 0 <= count ? _j < count : _j > count; i = 0 <= count ? ++_j : --_j) {
            tickValue = time.ceil(runningTick, unit);
            runningTick = tickValue + unit.seconds / 2;
            offsets.push({
              value: tickValue,
              unit: unit,
              _date: moment(tickValue * 1000).toDate()
            });
          }
          return offsets;
        };
        xAxis.render();
        yAxis = new Rickshaw.Graph.Axis.Y({
          graph: graph
        });
        yAxis.render();
        _this.hidePreloader();
        return safeApply(_this.s, function() {
          return _this.s.loading = false;
        });
      });
    };

    return GraphResults;

  })(BaseResults);

}).call(this);

/*
//@ sourceMappingURL=results.js.map
*/