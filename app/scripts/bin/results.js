(function() {
  var BaseResults, newDataInGraph,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BaseResults = (function() {
    function BaseResults(tabSelector, resultSelector) {
      this.$tab = $(tabSelector);
      this.$result = $(resultSelector);
      this.index = this.$tab.index();
      this.optionWidget = $("#search_options");
      this.num_result = this.$result.find(".num-result");
      this.$result.add(this.$tab).addClass("not_loading");
    }

    BaseResults.prototype.onProgress = function(progressObj) {
      var e;

      this.num_result.html(prettyNumbers(progressObj["total_results"]));
      if (!isNaN(progressObj["stats"])) {
        try {
          this.$result.find(".progress progress").attr("value", Math.round(progressObj["stats"]));
        } catch (_error) {
          e = _error;
          c.log("onprogress error", e);
        }
      }
      return this.$tab.find(".tab_progress").css("width", Math.round(progressObj["stats"]).toString() + "%");
    };

    BaseResults.prototype.renderResult = function(data) {
      var disabled, newDisabled,
        _this = this;

      this.$result.find(".error_msg").remove();
      c.log("renderResults", this.proxy);
      if (this.$result.is(":visible")) {
        util.setJsonLink(this.proxy.prevRequest);
      }
      disabled = $("#result-container").korptabs("option", "disabled");
      newDisabled = $.grep(disabled, function(item) {
        return item !== _this.index;
      });
      $("#result-container").korptabs("option", "disabled", newDisabled);
      if (data.ERROR) {
        this.resultError(data);
        return false;
      }
    };

    BaseResults.prototype.resultError = function(data) {
      c.log("json fetch error: ", data);
      this.hidePreloader();
      this.resetView();
      $('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">').append("<img class='korp_fail' src='img/korp_fail.svg'>").add($("<div class='fail_text' />").localeKey("fail_text")).addClass("inline_block").prependTo(this.$result).wrapAll("<div class='error_msg'>");
      return util.setJsonLink(this.proxy.prevRequest);
    };

    BaseResults.prototype.showPreloader = function() {
      this.$result.add(this.$tab).addClass("loading").removeClass("not_loading");
      this.$tab.find(".tab_progress").css("width", 0);
      return this.$result.find("progress").attr("value", 0);
    };

    BaseResults.prototype.hidePreloader = function() {
      return this.$result.add(this.$tab).removeClass("loading").addClass("not_loading");
    };

    BaseResults.prototype.resetView = function() {
      return this.$result.find(".error_msg").remove();
    };

    return BaseResults;

  })();

  view.KWICResults = (function(_super) {
    __extends(KWICResults, _super);

    function KWICResults(tabSelector, resultSelector) {
      var self,
        _this = this;

      self = this;
      this.prevCQP = null;
      KWICResults.__super__.constructor.call(this, tabSelector, resultSelector);
      this.initHTML = this.$result.html();
      this.proxy = kwicProxy;
      this.readingProxy = new model.KWICProxy();
      this.current_page = 0;
      this.selectionManager = getScope("kwicCtrl").selectionManager;
      this.$result.click(function() {
        if (!_this.selectionManager.hasSelected()) {
          return;
        }
        _this.selectionManager.deselect();
        return $.sm.send("word.deselect");
      });
      this.$result.find(".reading_btn").click(function() {
        var isReading;

        isReading = _this.$result.is(".reading_mode");
        if ($.bbq.getState("reading_mode")) {
          return $.bbq.removeState("reading_mode");
        } else {
          return $.bbq.pushState({
            reading_mode: true
          });
        }
      });
      if ($.bbq.getState("reading_mode")) {
        this.$result.addClass("reading_mode");
      }
      this.$result.on("click", ".word", function(event) {
        var aux, i, l, obj, paragraph, scope, sent, sent_start, word;

        scope = $(this).scope();
        obj = scope.wd;
        sent = scope.sentence;
        event.stopPropagation();
        word = $(event.target);
        $.sm.send("word.select");
        $("#sidebar").sidebar("updateContent", sent.structs, obj, sent.corpus.toLowerCase(), sent.tokens);
        if (obj.dephead == null) {
          scope.selectionManager.select(word, null);
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
        return scope.selectionManager.select(word, aux);
      });
    }

    KWICResults.prototype.resetView = function() {
      KWICResults.__super__.resetView.call(this);
      return this.$result.find(".pager-wrapper").empty();
    };

    KWICResults.prototype.getProxy = function() {
      if (this.$result.is(".reading_mode")) {
        return this.readingProxy;
      }
      return this.proxy;
    };

    KWICResults.prototype.onentry = function() {
      this.centerScrollbar();
      return $(document).keydown($.proxy(this.onKeydown, this));
    };

    KWICResults.prototype.onexit = function() {
      return $(document).unbind("keydown", this.onKeydown);
    };

    KWICResults.prototype.onKeydown = function(event) {
      var isSpecialKeyDown, next;

      isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey;
      if (isSpecialKeyDown || $("input[type=text], textarea").is(":focus")) {
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
      if (!data.hits) {
        c.log("no kwic results");
        this.showNoResults();
        return;
      }
      this.$result.removeClass("zero_results");
      this.$result.find(".num-result").html(prettyNumbers(data.hits));
      this.renderHitsPicture(data);
      this.buildPager(data.hits);
      return this.hidePreloader();
    };

    KWICResults.prototype.renderResult = function(data) {
      var firstWord, isReading, linked, mainrow, offset, resultError, scrollLeft, _i, _len, _ref;

      resultError = KWICResults.__super__.renderResult.call(this, data);
      if (resultError === false) {
        return;
      }
      c.log("corpus_results");
      isReading = this.$result.is(".reading_mode");
      this.$result.scope().$apply(function($scope) {
        if (isReading) {
          return $scope.setContextData(data);
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
      this.hidePreloader();
      this.$result.localize();
      this.centerScrollbar();
      return this.$result.find(".match").children().first().click();
    };

    KWICResults.prototype.showNoResults = function() {
      this.$result.find(".pager-wrapper").empty();
      this.hidePreloader();
      this.$result.find(".num-result").html(0);
      this.$result.addClass("zero_results").click();
      return this.$result.find(".hits_picture").html("");
    };

    KWICResults.prototype.renderHitsPicture = function(data) {
      var barcolors, ccounter, corpusOrderArray, hits_picture_html, self, totalhits, ua;

      self = this;
      if (settings.corpusListing.selected.length > 1) {
        totalhits = data["hits"];
        hits_picture_html = "<table class='hits_picture_table'><tr height='18px'>";
        barcolors = ["color_blue", "color_purple", "color_green", "color_yellow", "color_azure", "color_red"];
        ccounter = 0;
        corpusOrderArray = $.grep(data.corpus_order, function(corpus) {
          return data.corpus_hits[corpus] > 0;
        });
        $.each(corpusOrderArray, function(index, corp) {
          var color, hits;

          hits = data["corpus_hits"][corp];
          color = (index % 2 === 0 ? settings.primaryColor : settings.primaryLight);
          return hits_picture_html += "<td class=\"hits_picture_corp\" data=\"" + corp + "\"\nstyle=\"width:" + (hits / totalhits * 100) + "%;background-color : " + color + "\"></td>";
        });
        hits_picture_html += "</tr></table>";
        this.$result.find(".hits_picture").html(hits_picture_html);
        ua = navigator.userAgent;
        if (ua.match(/Android/i) || ua.match(/webOS/i) || ua.match(/iPhone/i) || ua.match(/iPod/i)) {
          this.$result.find(".hits_picture_table").css("opacity", "1");
        }
        this.$result.find(".hits_picture_corp").each(function() {
          var corpus_name;

          corpus_name = $(this).attr("data");
          return $(this).tooltip({
            delay: 0,
            bodyHandler: function() {
              var corpusObj, nHits;

              corpusObj = settings.corpora[corpus_name.toLowerCase()];
              if (currentMode === "parallel") {
                corpusObj = settings.corpora[corpus_name.split("|")[1].toLowerCase()];
              }
              nHits = prettyNumbers(data["corpus_hits"][corpus_name].toString());
              return "<img src=\"img/korp_icon.png\" style=\"vertical-align:middle\"/>\n<b>" + corpusObj["title"] + " (" + nHits + ") " + (util.getLocaleString("hitspicture_hits")) + ")</b>\n<br/><br/><i>" + (util.getLocaleString("hitspicture_gotocorpushits")) + "</i>";
            }
          });
        });
        return this.$result.find(".hits_picture_corp").click(function(event) {
          var firstHitPage, firstIndex, theCorpus;

          theCorpus = $(this).attr("data");
          firstIndex = 0;
          $.each(data["corpus_order"], function(index, corp) {
            if (corp === theCorpus) {
              return false;
            }
            return firstIndex += data["corpus_hits"][corp];
          });
          firstHitPage = Math.floor(firstIndex / $("#num_hits").val());
          self.handlePaginationClick(firstHitPage, null, true);
          return false;
        });
      } else {
        return this.$result.find(".hits_picture").html("");
      }
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

      c.log("buildPager", this.current_page);
      items_per_page = this.optionWidget.find(".num_hits").val();
      this.movePager("up");
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
      var isReading, kwicCallback, self;

      c.log("handlePaginationClick", new_page_index, this.current_page);
      self = this;
      if (new_page_index !== this.current_page || !!force_click) {
        isReading = this.$result.is(".reading_mode");
        kwicCallback = this.renderResult;
        this.showPreloader();
        this.current_page = new_page_index;
        this.getProxy().makeRequest(this.buildQueryOptions(), this.current_page, (function(progressObj) {
          if (!isNaN(progressObj["stats"])) {
            self.$result.find(".progress progress").attr("value", Math.round(progressObj["stats"]));
          }
          return self.$tab.find(".tab_progress").css("width", Math.round(progressObj["stats"]).toString() + "%");
        }), (function(data) {
          return self.buildPager(data.hits);
        }), $.proxy(kwicCallback, this));
        $.bbq.pushState({
          page: new_page_index
        });
      }
      return false;
    };

    KWICResults.prototype.buildQueryOptions = function() {
      var opts;

      opts = {};
      opts.cqp = this.proxy.prevCQP;
      opts.queryData = this.proxy.queryData;
      opts.sort = $(".sort_select").val();
      if (opts.sort === "random") {
        opts.random_seed = $.bbq.getState("random_seed");
      }
      if (this.$result.is(".reading_mode") || currentMode === "parallel") {
        opts.context = settings.corpusListing.getContextQueryString();
      }
      return opts;
    };

    KWICResults.prototype.makeRequest = function(page_num) {
      var isReading, kwicCallback;

      isReading = this.$result.is(".reading_mode");
      this.showPreloader();
      c.log("makeRequest", this.$result, this.$result.scope());
      this.$result.scope().$apply(function($scope) {
        c.log("apply", $scope, $scope.setContextData);
        if (isReading) {
          return $scope.setContextData({
            kwic: []
          });
        } else {
          return $scope.setKwicData({
            kwic: []
          });
        }
      });
      kwicCallback = $.proxy(this.renderResult, this);
      return this.proxy.makeRequest(this.buildQueryOptions(), page_num || this.current_page, (isReading ? $.noop : $.proxy(this.onProgress, this)), $.proxy(this.renderCompleteResult, this), kwicCallback);
    };

    KWICResults.prototype.setPage = function(page) {
      return this.$result.find(".pager-wrapper").trigger("setPage", [page]);
    };

    KWICResults.prototype.centerScrollbar = function() {
      var area, m, match, sidebarWidth;

      m = this.$result.find(".match:visible:first");
      if (!m.length) {
        return;
      }
      area = this.$result.find(".table_scrollarea").scrollLeft(0);
      match = m.first().position().left + m.width() / 2;
      sidebarWidth = $("#sidebar").outerWidth() || 0;
      return area.stop(true, true).scrollLeft(match - ($("body").innerWidth() - sidebarWidth) / 2);
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

      if (!this.$result.is(".reading_mode")) {
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

      if (!this.$result.is(".reading_mode")) {
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
      if (!this.$result.is(".reading_mode")) {
        prevMatch = this.getWordAt(current.offset().left + current.width() / 2, current.closest("tr").prevAll(".sentence").first());
        prevMatch.click();
      } else {
        searchwords = current.prevAll(".word").get().concat(current.closest(".sentence").prev().find(".word").get().reverse());
        def = current.parent().prev().find(".word:last");
        prevMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click();
      }
      return prevMatch;
    };

    KWICResults.prototype.selectDown = function() {
      var current, def, nextMatch, searchwords;

      current = this.selectionManager.selected;
      if (!this.$result.is(".reading_mode")) {
        nextMatch = this.getWordAt(current.offset().left + current.width() / 2, current.closest("tr").nextAll(".sentence").first());
        nextMatch.click();
      } else {
        searchwords = current.nextAll(".word").add(current.closest(".sentence").next().find(".word"));
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

    KWICResults.prototype.setupPagerMover = function() {
      var downOpts, pager, self, upOpts;

      self = this;
      pager = this.$result.find(".pager-wrapper");
      upOpts = {
        point: pager.offset().top + pager.height(),
        callback: function() {
          return self.movePager("up");
        }
      };
      self.movePager("down");
      downOpts = {
        point: pager.offset().top + pager.height(),
        callback: function() {
          return self.movePager("down");
        }
      };
      self.movePager("up");
      c.log("onscrollout", upOpts.point, downOpts.point);
      return $.onScrollOut(upOpts, downOpts);
    };

    KWICResults.prototype.movePager = function(dir) {
      var pager;

      pager = this.$result.find(".pager-wrapper");
      if (dir === "down") {
        return pager.data("prevPos", pager.prev()).appendTo(this.$result);
      } else {
        if (pager.data("prevPos")) {
          return pager.data("prevPos").after(pager);
        }
      }
    };

    return KWICResults;

  })(BaseResults);

  view.ExampleResults = (function(_super) {
    __extends(ExampleResults, _super);

    function ExampleResults(tabSelector, resultSelector) {
      ExampleResults.__super__.constructor.call(this, tabSelector, resultSelector);
      this.proxy = new model.ExamplesProxy();
      this.$result.find(".progress,.tab_progress").hide();
      this.$result.add(this.$tab).addClass("not_loading customtab");
      this.$result.removeClass("reading_mode");
    }

    ExampleResults.prototype.makeRequest = function(opts) {
      var _this = this;

      this.resetView();
      $.extend(opts, {
        success: function(data) {
          c.log("ExampleResults success", data, opts);
          _this.renderResult(data, opts.cqp);
          _this.renderCompleteResult(data);
          _this.hidePreloader();
          util.setJsonLink(_this.proxy.prevRequest);
          return _this.$result.find(".num-result").html(prettyNumbers(data.hits));
        },
        error: function() {
          return this.hidePreloader();
        },
        incremental: false
      });
      this.showPreloader();
      return this.proxy.makeRequest(opts, null, $.noop, $.noop, $.noop);
    };

    ExampleResults.prototype.onHpp = function() {
      this.handlePaginationClick(0, null, true);
      return false;
    };

    ExampleResults.prototype.handlePaginationClick = function(new_page_index, pagination_container, force_click) {
      var items_per_page, opts;

      c.log("handlePaginationClick", new_page_index, this.current_page);
      if (new_page_index !== this.current_page || !!force_click) {
        items_per_page = parseInt(this.optionWidget.find(".num_hits").val());
        opts = {};
        opts.cqp = this.proxy.prevCQP;
        opts.start = new_page_index * items_per_page;
        opts.end = opts.start + items_per_page;
        opts.sort = $(".sort_select").val();
        this.current_page = new_page_index;
        this.makeRequest(opts);
      }
      return false;
    };

    ExampleResults.prototype.onSortChange = function(event) {
      var opt;

      opt = $(event.currentTarget).find(":selected");
      c.log("sort", opt);
      if (opt.is(":first-child")) {
        return $.bbq.removeState("sort");
      } else {
        c.log("sort", opt.val());
        return this.handlePaginationClick(0, null, true);
      }
    };

    ExampleResults.prototype.showPreloader = function() {
      this.$result.add(this.$tab).addClass("loading").removeClass("not_loading");
      this.$tab.find(".spinner").remove();
      $("<div class='spinner' />").appendTo(this.$tab).spinner({
        innerRadius: 5,
        outerRadius: 7,
        dashes: 8,
        strokeWidth: 3
      });
      return this.$tab.find(".tabClose").hide();
    };

    ExampleResults.prototype.hidePreloader = function() {
      this.$result.add(this.$tab).addClass("not_loading").removeClass("loading");
      this.$tab.find(".spinner").remove();
      return this.$tab.find(".tabClose").show();
    };

    return ExampleResults;

  })(view.KWICResults);

  view.LemgramResults = (function(_super) {
    __extends(LemgramResults, _super);

    function LemgramResults(tabSelector, resultSelector) {
      var self;

      self = this;
      LemgramResults.__super__.constructor.call(this, tabSelector, resultSelector);
      this.resultDeferred = $.Deferred();
      this.proxy = lemgramProxy;
      this.order = {
        vb: ["SS_d,_,OBJ_d,ADV_d".split(",")],
        nn: ["PA_h,AT_d,_,ET_d".split(","), "_,SS_h".split(","), "OBJ_h,_".split(",")],
        av: [[], "_,AT_h".split(",")],
        jj: [[], "_,AT_h".split(",")],
        pp: [[], "_,PA_d".split(",")]
      };
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
      return $("#results-lemgram .content_target").empty();
    };

    LemgramResults.prototype.renderResult = function(data, query) {
      var resultError;

      resultError = LemgramResults.__super__.renderResult.call(this, data);
      this.resetView();
      if (resultError === false) {
        return;
      }
      if (!data.relations) {
        this.showNoResults();
        return this.resultDeferred.reject();
      } else if (util.isLemgramId(query)) {
        this.renderTables(query, data.relations);
        return this.resultDeferred.resolve();
      } else {
        this.renderWordTables(query, data.relations);
        return this.resultDeferred.resolve();
      }
    };

    LemgramResults.prototype.renderHeader = function(wordClass, sections) {
      var colorMapping;

      colorMapping = {
        SS: "color_blue",
        OBJ: "color_purple",
        ADV: "color_green",
        Head: "color_yellow",
        AT: "color_azure",
        ET: "color_red",
        PA: "color_green"
      };
      return $(".tableContainer:last .lemgram_section").each(function(i) {
        var $parent;

        $parent = $(this).find(".lemgram_help");
        return $(this).find(".lemgram_result").each(function() {
          var altLabel, cell, color;

          if ($(this).data("rel")) {
            color = colorMapping[$(this).data("rel")];
            cell = $("<span />", {
              "class": "lemgram_header_item"
            }).localeKey(i === 1 ? altLabel : "malt_" + $(this).data("rel")).addClass(color).appendTo($parent);
            if (i > 0) {
              altLabel = {
                av: "nn",
                jj: "nn",
                nn: "vb",
                pp: "nn"
              }[wordClass];
              c.log("altLabel", altLabel, wordClass);
              cell.localeKey(altLabel);
            }
            return $(this).addClass(color).css("border-color", $(this).css("background-color"));
          } else {
            return $($.format("<span class='hit'><b>%s</b></span>", $(this).data("word"))).appendTo($parent);
          }
        });
      }).append("<div style='clear:both;'/>");
    };

    LemgramResults.prototype.renderWordTables = function(word, data) {
      var self, unique_words, wordlist;

      self = this;
      wordlist = $.map(data, function(item) {
        var output;

        output = [];
        if (item.head.split("_")[0] === word) {
          output.push(item.head);
        }
        if (item.dep.split("_")[0] === word) {
          output.push(item.dep);
        }
        return output;
      });
      unique_words = [];
      $.each(wordlist, function(i, word) {
        if ($.inArray(word, unique_words) === -1) {
          return unique_words.push(word);
        }
      });
      $.each(unique_words, function(i, currentWd) {
        var getRelType, wordClass;

        getRelType = function(item) {
          if (item.dep === currentWd) {
            return item.rel + "_h";
          } else if (item.head === currentWd) {
            return item.rel + "_d";
          } else {
            return false;
          }
        };
        wordClass = currentWd.split("_")[1].toLowerCase();
        self.drawTable(currentWd, wordClass, data, getRelType);
        self.renderHeader(wordClass);
        return $(".tableContainer:last").prepend($("<div>", {
          "class": "header"
        }).html(util.lemgramToString(currentWd))).find(".hit .wordclass_suffix").hide();
      });
      $(".lemgram_result .wordclass_suffix").hide();
      return this.hidePreloader();
    };

    LemgramResults.prototype.renderTables = function(lemgram, data) {
      var getRelType, wordClass;

      getRelType = function(item) {
        if (item.dep === lemgram) {
          return item.rel + "_h";
        } else {
          return item.rel + "_d";
        }
      };
      wordClass = util.splitLemgram(lemgram).pos.slice(0, 2);
      this.drawTable(lemgram, wordClass, data, getRelType);
      $(".lemgram_result .wordclass_suffix").hide();
      this.renderHeader(wordClass);
      return this.hidePreloader();
    };

    LemgramResults.prototype.drawTable = function(token, wordClass, data, relTypeFunc) {
      var container, inArray, orderArrays, self;

      inArray = function(rel, orderList) {
        var i, type;

        i = $.inArray(rel, orderList);
        type = (rel.slice(-1) === "h" ? "head" : "dep");
        return {
          i: i,
          type: type
        };
      };
      self = this;
      c.log("drawTable", wordClass, this.order[wordClass]);
      if (this.order[wordClass] == null) {
        this.showNoResults();
        return;
      }
      orderArrays = [[], [], []];
      $.each(data, function(index, item) {
        return $.each(self.order[wordClass], function(i, rel_type_list) {
          var list, rel, ret;

          list = orderArrays[i];
          rel = relTypeFunc(item);
          if (rel === false) {
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
        if (self.order[wordClass][i] && unsortedList.length) {
          toIndex = $.inArray("_", self.order[wordClass][i]);
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
      }).appendTo("#results-lemgram .content_target");
      $("#lemgramResultsTmpl").tmpl(orderArrays, {
        lemgram: token
      }).find(".example_link").append($("<span>").addClass("ui-icon ui-icon-document")).css("cursor", "pointer").click($.proxy(self.onClickExample, self)).end().appendTo(container);
      return $("#results-lemgram td:nth-child(2)").each(function() {
        var $siblings, hasHomograph, label, prefix, siblingLemgrams;

        $siblings = $(this).parent().siblings().find("td:nth-child(2)");
        siblingLemgrams = $.map($siblings, function(item) {
          return $(item).data("lemgram").slice(0, -1);
        });
        hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) !== -1;
        prefix = ($(this).data("depextra").length ? $(this).data("depextra") + " " : "");
        label = ($(this).data("lemgram") !== "" ? util.lemgramToString($(this).data("lemgram"), hasHomograph) : "&mdash;");
        return $(this).html(prefix + label);
      });
    };

    LemgramResults.prototype.onClickExample = function(event) {
      var $target, data, instance, opts, self;

      self = this;
      $target = $(event.currentTarget);
      c.log("onClickExample", $target);
      data = $target.parent().tmplItem().data;
      instance = $("#result-container").korptabs("addTab", view.ExampleResults);
      opts = instance.getPageInterval();
      opts.ajaxParams = {
        head: data.head,
        dep: data.dep,
        rel: data.rel,
        depextra: data.depextra,
        corpus: data.corpus
      };
      util.localize(instance.$result);
      return instance.makeRequest(opts);
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
      c.log("lemgramResults.onentry", $.sm.getConfiguration());
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
      return $("#results-lemgram td:first-child").each(function() {
        return $(this).html($.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" ")));
      });
    };

    return LemgramResults;

  })(BaseResults);

  newDataInGraph = function(dataName, horizontalDiagram, targetDiv) {
    var corpusArray, dataItems, locstring, relHitsString, stats2Instance, statsSwitchInstance, topheader, wordArray;

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
      $("<div id='dialog' title='" + topheader + "' />").appendTo("#results-stats").append("<br/><div id=\"statistics_switch\" style=\"text-align:center\">\n    <a href=\"javascript:\" rel=\"localize[statstable_relfigures]\" data-mode=\"relative\">Relativa frekvenser</a>\n    <a href=\"javascript:\" rel=\"localize[statstable_absfigures]\" data-mode=\"absolute\">Absoluta frekvenser</a>\n</div>\n<div id=\"chartFrame\" style=\"height:380\"></div>\n<p id=\"hitsDescription\" style=\"text-align:center\" rel=\"localize[statstable_absfigures_hits]\">" + relHitsString + "</p>").dialog({
        width: 400,
        height: 500,
        resize: function() {
          $("#chartFrame").css("height", $("#chartFrame").parent().width() - 20);
          stats2Instance.pie_widget("resizeDiagram", $(this).width() - 60);
          return false;
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
        data_items: dataItems,
        bar_horizontal: false,
        diagram_type: 0
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

    function StatsResults(tabSelector, resultSelector) {
      var icon, paper, self,
        _this = this;

      StatsResults.__super__.constructor.call(this, tabSelector, resultSelector);
      self = this;
      this.gridData = null;
      this.proxy = statsProxy;
      this.$result.on("click", ".arcDiagramPicture", function() {
        var parts;

        parts = $(this).attr("id").split("__");
        if (parts[1] !== "Σ") {
          return newDataInGraph(parts[1], true);
        } else {
          return newDataInGraph("SIGMA_ALL", true);
        }
      });
      $(".slick-cell.l0.r0 .link").on("click", function() {
        var instance, query;

        c.log("word click", $(this).data("context"), $(this).data("corpora"));
        instance = $("#result-container").korptabs("addTab", view.ExampleResults);
        instance.proxy.command = "query";
        query = $(this).data("query");
        instance.makeRequest({
          corpora: $(this).data("corpora").join(","),
          cqp: decodeURIComponent(query)
        });
        return util.localize(instance.$result);
      });
      $(window).resize(function() {
        return self.resizeGrid();
      });
      $("#exportButton").unbind("click");
      $("#exportButton").click(function() {
        var dataDelimiter, output, selType, selVal;

        selVal = $("#kindOfData option:selected").val();
        selType = $("#kindOfFormat option:selected").val();
        dataDelimiter = ";";
        if (selType === "TSV") {
          dataDelimiter = "\t";
        }
        output = "corpus" + dataDelimiter;
        $.each(statsResults.savedWordArray, function(key, aword) {
          return output += aword + dataDelimiter;
        });
        output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
        $.each(statsResults.savedData["corpora"], function(key, acorpus) {
          output += settings.corpora[key.toLowerCase()]["title"] + dataDelimiter;
          $.each(statsResults.savedWordArray, function(wkey, aword) {
            var amount;

            amount = acorpus[selVal][aword];
            if (amount) {
              return output += util.formatDecimalString(amount.toString(), false, true) + dataDelimiter;
            } else {
              return output += "0" + dataDelimiter;
            }
          });
          return output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A);
        });
        if (selType === "TSV") {
          return window.open("data:text/tsv;charset=latin1," + escape(output));
        } else {
          return window.open("data:text/csv;charset=latin1," + escape(output));
        }
      });
      if ($("html.msie7,html.msie8").length) {
        $("#showGraph").hide();
        return;
      }
      icon = $("<span class='graph_btn_icon'>");
      $("#showGraph").button().addClass("ui-button-text-icon-primary").prepend(icon).click(function() {
        var cl, cqp, elem, instance, isStructAttr, labelMapping, mainCQP, params, prefix, reduceVal, showTotal, subExprs, val, _i, _len, _ref;

        instance = $("#result-container").korptabs("addTab", view.GraphResults, "Graph");
        params = _this.proxy.prevParams;
        cl = settings.corpusListing.subsetFactory(params.corpus.split(","));
        instance.corpora = cl;
        reduceVal = params.groupby;
        isStructAttr = __indexOf.call(cl.getStructAttrs(), reduceVal) >= 0;
        subExprs = [];
        labelMapping = {};
        showTotal = false;
        mainCQP = params.cqp;
        prefix = isStructAttr ? "_." : "";
        _ref = _this.$result.find(".slick-cell-checkboxsel.selected");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          elem = _ref[_i];
          if ($(elem).is(".slick-row:nth-child(1) .slick-cell-checkboxsel")) {
            showTotal = true;
            continue;
          }
          val = _this.gridData[$(elem).parent().index()].hit_value;
          cqp = "[" + (prefix + reduceVal) + " = '" + (regescape(val)) + "']";
          subExprs.push(cqp);
          labelMapping[cqp] = $(elem).next().text();
        }
        return instance.makeRequest(mainCQP, subExprs, labelMapping, showTotal);
      });
      $("#showGraph .ui-button-text", this.$result).localeKey("show_diagram");
      paper = new Raphael(icon.get(0), 33, 33);
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
      if (data[0].total_value.absolute === 0) {
        this.showNoResults();
        return;
      }
      checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "slick-cell-checkboxsel"
      });
      columns = [checkboxSelector.getColumnDefinition()].concat(columns);
      grid = new Slick.Grid($("#myGrid"), data, columns, {
        enableCellNavigation: false,
        enableColumnReorder: true
      });
      grid.setSelectionModel(new Slick.RowSelectionModel({
        selectActiveRow: false
      }));
      grid.registerPlugin(checkboxSelector);
      this.grid = grid;
      this.resizeGrid();
      sortCol = columns[2];
      window.data = data;
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
      $.when(timeDeferred).then(function() {
        var cl;

        $("#showGraph:visible").button("enable");
        cl = settings.corpusListing.subsetFactory(_this.proxy.prevParams.corpus.split(","));
        if ((_.filter(cl.getTimeInterval(), function(item) {
          return item != null;
        })).length < 2) {
          return $("#showGraph:visible").button("disable");
        }
      });
      return this.hidePreloader();
    };

    StatsResults.prototype.resizeGrid = function() {
      var parentWidth, tableWidth, widthArray;

      if (!this.grid) {
        return;
      }
      widthArray = $(".slick-header-column").map(function(item) {
        return $(this).width();
      });
      tableWidth = $.reduce(widthArray, function(a, b) {
        return a + b;
      }, 100);
      parentWidth = $("body").width() - 65;
      $("#myGrid").width(parentWidth);
      if (tableWidth < parentWidth) {
        this.grid.autosizeColumns();
      } else {
        if (!$(".c0").length) {
          setTimeout($.proxy(this.resizeHits, this), 1);
        } else {
          this.resizeHits();
        }
      }
      return $(".slick-column-name:nth(1),.slick-column-name:nth(2)").not("[rel^=localize]").each(function() {
        return $(this).localeKey($(this).text());
      });
    };

    StatsResults.prototype.resizeHits = function() {
      return this.setHitsWidth(this.getHitsWidth());
    };

    StatsResults.prototype.getHitsWidth = function() {
      var widthArray;

      widthArray = $(".c0").map(function() {
        return $(this).find(":nth-child(1)").outerWidth() + ($(this).find(":nth-child(2)").outerWidth() || 0);
      });
      if (!widthArray.length) {
        return 400;
      } else {
        return $.reduce(widthArray, Math.max);
      }
    };

    StatsResults.prototype.setHitsWidth = function(w) {
      var data;

      if (!this.grid) {
        return;
      }
      data = this.grid.getColumns();
      data[0].currentWidth = w;
      return this.grid.setColumns(data);
    };

    StatsResults.prototype.resetView = function() {
      StatsResults.__super__.resetView.call(this);
      return $("#exportStatsSection").show();
    };

    StatsResults.prototype.showNoResults = function() {
      this.hidePreloader();
      $("#results-stats").prepend($("<i/ class='error_msg'>").localeKey("no_stats_results"));
      return $("#exportStatsSection").hide();
    };

    return StatsResults;

  })(BaseResults);

  view.GraphResults = (function(_super) {
    __extends(GraphResults, _super);

    function GraphResults(tabSelector, resultSelector) {
      var n,
        _this = this;

      GraphResults.__super__.constructor.call(this, tabSelector, resultSelector);
      $(tabSelector).find(".ui-tabs-anchor").localeKey("graph");
      n = this.$result.index();
      $(resultSelector).html("<div class=\"graph_header\">\n    <div class=\"progress\">\n        <progress value=\"0\" max=\"100\"></progress>\n    </div>\n    <div class=\"controls\">\n        <div class=\"form_switch\">\n            <input id=\"formswitch" + n + "1\" type=\"radio\" name=\"form_switch\" value=\"line\" checked><label for=\"formswitch" + n + "1\">Linje</label>\n            <input id=\"formswitch" + n + "2\" type=\"radio\" name=\"form_switch\" value=\"bar\"><label for=\"formswitch" + n + "2\">Stapel</label>\n        </div>\n        <label for=\"smoothing_switch\" class=\"smoothing_label\" >Utjämna</label> <input type=\"checkbox\" id=\"smoothing_switch\" class=\"smoothing_switch\">\n        <div class=\"non_time_div\"><span rel=\"localize[non_time_before]\"></span><span class=\"non_time\"></span><span rel=\"localize[non_time_after]\"></div>\n    </div>\n    <div class=\"legend\"></div>\n    <div style=\"clear:both;\"></div>\n</div>\n<div class=\"chart\"></div>\n<div class=\"zoom_slider\"></div>");
      this.zoom = "year";
      this.granularity = this.zoom[0];
      this.corpora = null;
      this.proxy = new model.GraphProxy();
      $(".chart", this.$result).on("click", function(event) {
        var cqp, end, instance, m, start, target, timecqp, val;

        target = $(".chart", _this.$result);
        val = $(".detail .x_label > span", target).data("val");
        cqp = $(".detail .item.active > span", target).data("cqp");
        c.log("chart click", cqp, target);
        if (cqp) {
          m = moment(val * 1000);
          start = m.format("YYYYMMDD");
          end = m.add(1, "year").subtract(1, "day").format("YYYYMMDD");
          timecqp = "(int(_.text_datefrom) >= " + start + " & int(_.text_dateto) <= " + end + ")]";
          cqp = decodeURIComponent(cqp).slice(0, -1) + (" & " + timecqp);
          instance = $("#result-container").korptabs("addTab", view.ExampleResults);
          instance.proxy.command = "query";
          instance.makeRequest({
            corpora: _this.corpora.stringifySelected(),
            cqp: cqp
          });
          return util.localize(instance.$result);
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
      var dateArray, diff, duration, exists, i, max, min, n_diff, newMoment, newMoments, _i;

      dateArray = _.pluck(data, "x");
      min = _.min(dateArray, function(mom) {
        return mom.toDate();
      });
      max = _.max(dateArray, function(mom) {
        return mom.toDate();
      });
      c.log("min", min, max);
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
      exists = function(mom) {
        return _.any(_.map(dateArray, function(item) {
          return item.isSame(mom, diff);
        }));
      };
      newMoments = [];
      for (i = _i = 0; 0 <= n_diff ? _i <= n_diff : _i >= n_diff; i = 0 <= n_diff ? ++_i : --_i) {
        newMoment = moment(min).add(diff, i);
        if (!exists(newMoment)) {
          newMoments.push(newMoment);
        }
      }
      newMoments = _.map(newMoments, function(item) {
        return {
          x: item,
          y: 0
        };
      });
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
      c.log("hasfirstvalue", hasFirstValue, firstVal, first);
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
      return $(".x_tick .title:visible", graphDiv).hide().filter(function(n) {
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

    GraphResults.prototype.makeRequest = function(cqp, subcqps, labelMapping, showTotal) {
      var hidden,
        _this = this;

      hidden = $(".progress", this.$result).nextAll().hide();
      this.showPreloader();
      return this.proxy.makeRequest(cqp, subcqps, this.corpora.stringifySelected()).progress(function(data) {
        return _this.onProgress(data);
      }).fail(function(data) {
        c.log("graph crash");
        return _this.resultError(data);
      }).done(function(data) {
        var color, first, hoverDetail, item, last, legend, nontime, old_render, palette, series, shelving, slider, smoother, time, timeunit, xAxis, yAxis, _ref;

        c.log("data", data);
        if (data.ERROR) {
          _this.resultError(data);
        }
        nontime = _this.getNonTime();
        if (nontime) {
          $(".non_time", _this.$result).text(nontime.toFixed(2) + "%").parent().localize();
        } else {
          $(".non_time_div").hide();
        }
        palette = new Rickshaw.Color.Palette();
        if (_.isArray(data.combined)) {
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
                cqp: item.cqp || cqp
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
              cqp: cqp
            }
          ];
        }
        Rickshaw.Series.zeroFill(series);
        window.graph = new Rickshaw.Graph({
          element: $(".chart", _this.$result).get(0),
          renderer: 'line',
          interpolation: "linear",
          series: series,
          padding: {
            top: 0.1,
            right: 0.01
          },
          min: "auto"
        });
        graph.render();
        $(window).on("resize", _.throttle(function() {
          if (_this.$result.is(":visible")) {
            graph.setSize();
            return graph.render();
          }
        }, 200));
        smoother = new Rickshaw.Graph.Smoother({
          graph: graph
        });
        c.log($(".smoothing_switch", _this.$result));
        $(".smoothing_switch", _this.$result).button().change(function() {
          if ($(this).is(":checked")) {
            smoother.setScale(3);
            graph.interpolation = "cardinal";
          } else {
            smoother.setScale(1);
            graph.interpolation = "linear";
          }
          return graph.render();
        });
        $(".form_switch", _this.$result).buttonset().change(function(event, ui) {
          var cls, target, val, _i, _len, _ref;

          target = event.currentTarget;
          val = $(":checked", target).val();
          _ref = _this.$result.attr("class").split(" ");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cls = _ref[_i];
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
            return ("<br><span rel='localize[rel_hits_short]'>" + (util.getLocaleString('rel_hits_short')) + "</span> ") + y.toFixed(2);
          },
          formatter: function(series, x, y, formattedX, formattedY, d) {
            var content;

            content = series.name + ':&nbsp;' + formattedY;
            return "<span data-cqp=\"" + (encodeURIComponent(series.cqp)) + "\">" + content + "</span>";
          }
        });
        _ref = settings.corpusListing.getTimeInterval(), first = _ref[0], last = _ref[1];
        timeunit = last - first > 100 ? "decade" : _this.zoom;
        time = new Rickshaw.Fixtures.Time();
        xAxis = new Rickshaw.Graph.Axis.Time({
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
          return _this.updateTicks();
        };
        xAxis.render();
        yAxis = new Rickshaw.Graph.Axis.Y({
          graph: graph
        });
        yAxis.render();
        hidden.fadeIn();
        return _this.hidePreloader();
      });
    };

    return GraphResults;

  })(BaseResults);

}).call(this);
