(function() {
  var ExtendedToken, KorpTabs, ModeSelector, Sidebar;

  Sidebar = {
    options: {
      displayOrder: ["pos", "posset", "lemma", "lex", "saldo", "variants"].reverse()
    },
    _init: function() {
      var dfd;

      return dfd = $.Deferred();
    },
    updateContent: function(sentenceData, wordData, corpus, tokens) {
      var corpusObj;

      this.element.html('<div id="selected_sentence" /><div id="selected_word" />');
      corpusObj = settings.corpora[corpus];
      $("<div />").html("<h4 rel='localize[corpus]'></h4> <p>" + corpusObj.title + "</p>").prependTo("#selected_sentence");
      if (!$.isEmptyObject(corpusObj.attributes)) {
        $("#selected_word").append($("<h4>").localeKey("word_attr"));
        this.renderContent(wordData, corpusObj.attributes).appendTo("#selected_word");
      }
      if (!$.isEmptyObject(corpusObj.struct_attributes)) {
        $("#selected_sentence").append($("<h4>").localeKey("sentence_attr"));
        this.renderContent(sentenceData, corpusObj.struct_attributes).appendTo("#selected_sentence");
      }
      this.element.localize();
      this.applyEllipse();
      if (corpusObj.attributes.deprel) {
        return this.renderGraph(tokens);
      }
    },
    renderGraph: function(tokens) {
      var outerW;

      outerW = $(window).width() - 80;
      return $("<span class='link show_deptree'>Visa träd</button>").localeKey("show_deptree").click(function() {
        var iframe, info;

        info = $("<span class='info' />");
        iframe = $('<iframe src="lib/deptrees/deptrees.html"></iframe>').css("width", outerW - 40).load(function() {
          var wnd;

          wnd = this.contentWindow;
          tokens = tokens;
          return wnd.draw_deptree.call(wnd, tokens, function(msg) {
            var type, val, _ref;

            _ref = _.head(_.pairs(msg)), type = _ref[0], val = _ref[1];
            return info.empty().append($("<span>").localeKey(type), $("<span>: </span>"), $("<span>").localeKey("" + type + "_" + val));
          });
        });
        return $("#deptree_popup").empty().append(info, iframe).dialog({
          height: 300,
          width: outerW
        }).parent().find(".ui-dialog-title").localeKey("dep_tree");
      }).appendTo(this.element);
    },
    renderContent: function(wordData, corpus_attrs) {
      var items, key, order, pairs, value;

      pairs = _.pairs(wordData);
      order = this.options.displayOrder;
      pairs.sort(function(_arg, _arg1) {
        var a, b;

        a = _arg[0];
        b = _arg1[0];
        return $.inArray(b, order) - $.inArray(a, order);
      });
      items = (function() {
        var _i, _len, _ref, _results;

        _results = [];
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          _ref = pairs[_i], key = _ref[0], value = _ref[1];
          if (corpus_attrs[key]) {
            _results.push(this.renderItem(key, value, corpus_attrs[key]));
          }
        }
        return _results;
      }).call(this);
      return $(items);
    },
    renderItem: function(key, value, attrs) {
      var address, getStringVal, inner, itr, li, lis, output, pattern, prefix, ul, val, valueArray, x;

      if (attrs.displayType === "hidden" || attrs.displayType === "date_interval") {
        return "";
      }
      output = $("<p><span rel='localize[" + attrs.label + "]'>" + key + "</span>: </p>");
      output.data("attrs", attrs);
      if (value === "|" || value === "") {
        output.append("<i rel='localize[empty]' style='color : grey'>${util.getLocaleString('empty')}</i>");
      }
      if (attrs.type === "set") {
        pattern = attrs.pattern || '<span data-key="<% key %>"><%= val %></span>';
        ul = $("<ul>");
        getStringVal = function(str) {
          return _.reduce(_.invoke(_.invoke(str, "charCodeAt", 0), "toString"), function(a, b) {
            return a + b;
          });
        };
        valueArray = _.filter((value != null ? value.split("|") : void 0) || [], Boolean);
        if (key === "variants") {
          valueArray.sort(function(a, b) {
            var splita, splitb, strvala, strvalb;

            splita = util.splitLemgram(a);
            splitb = util.splitLemgram(b);
            strvala = getStringVal(splita.form) + splita.index + getStringVal(splita.pos);
            strvalb = getStringVal(splitb.form) + splitb.index + getStringVal(splitb.pos);
            return parseInt(strvala) - parseInt(strvalb);
          });
        }
        itr = _.isArray(valueArray) ? valueArray : _.values(valueArray);
        lis = (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = itr.length; _i < _len; _i++) {
            x = itr[_i];
            if (!x.length) {
              continue;
            }
            val = (attrs.stringify || _.identity)(x);
            inner = $(_.template(pattern, {
              key: x,
              val: val
            }));
            if (attrs.translationKey != null) {
              prefix = attrs.translationKey || "";
              inner.localeKey(prefix + val);
            }
            li = $("<li></li>").data("key", x).append(inner);
            if (attrs.externalSearch) {
              address = _.template(attrs.externalSearch, {
                val: x
              });
              li.append($("<a href='" + address + "' class='external_link' target='_blank'></a>").click(function(event) {
                return event.stopImmediatePropagation();
              }));
            }
            if (attrs.internalSearch) {
              li.addClass("link").click(function() {
                var cqpVal;

                cqpVal = $(this).data("key");
                return $.bbq.pushState({
                  "search": "cqp|[" + key + " contains '" + cqpVal + "']"
                });
              });
            }
            _results.push(li);
          }
          return _results;
        })();
        ul.append(lis);
        output.append(ul);
        return output;
      }
      value = (attrs.stringify || _.identity)(value);
      if (attrs.type === "url") {
        return output.append("<a href='" + value + "' class='exturl sidebar_url'>" + (decodeURI(value)) + "</a>");
      } else if (key === "msd") {
        return output.append("<span class='msd'>" + value + "</span>\n    <a href='markup/msdtags.html' target='_blank'>\n        <span id='sidbar_info' class='ui-icon ui-icon-info'></span>\n    </a>\n</span>");
      } else if (attrs.pattern) {
        return output.append(_.template(attrs.pattern, {
          key: key,
          val: value
        }));
      } else {
        if (attrs.translationKey) {
          return output.append("<span rel='localize[" + attrs.translationKey + value + "]'></span>");
        } else {
          return output.append("<span>" + (value || '') + "</span>");
        }
      }
    },
    applyEllipse: function() {
      var oldDisplay, totalWidth;

      oldDisplay = this.element.css("display");
      this.element.css("display", "block");
      totalWidth = this.element.width();
      this.element.find(".sidebar_url").css("white-space", "nowrap").each(function() {
        var a, domain, midsection, oldtext, _results;

        _results = [];
        while ($(this).width() > totalWidth) {
          oldtext = $(this).text();
          a = $.trim(oldtext, "/").replace("...", "").split("/");
          domain = a.slice(2, 3);
          midsection = a.slice(3).join("/");
          midsection = "..." + midsection.slice(2);
          $(this).text(["http:/"].concat(domain, midsection).join("/"));
          if (midsection === "...") {
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return this.element.css("display", oldDisplay);
    },
    _parseLemma: function(attr, tmplVal) {
      var seq;

      seq = [];
      if (attr != null) {
        seq = $.map(attr.split("|"), function(item) {
          var lemma;

          lemma = item.split(":")[0];
          if (tmplVal.pattern) {
            return $.format(tmplVal.pattern, [lemma, lemma]);
          } else {
            return lemma;
          }
        });
      }
      seq = $.grep(seq, function(itm) {
        return itm && itm.length;
      });
      return $.arrayToHTMLList(seq).outerHTML();
    },
    refreshContent: function(mode) {
      var instance, _ref, _ref1,
        _this = this;

      if (mode === "lemgramWarning") {
        return $.Deferred(function(dfd) {
          return _this.element.load("markup/parse_warning.html", function() {
            util.localize();
            _this.element.addClass("ui-state-highlight").removeClass("kwic_sidebar");
            return dfd.resolve();
          });
        }).promise();
      } else {
        this.element.removeClass("ui-state-highlight").addClass("kwic_sidebar");
        instance = $("#result-container").korptabs("getCurrentInstance");
        return instance != null ? (_ref = instance.selectionManager) != null ? (_ref1 = _ref.selected) != null ? _ref1.click() : void 0 : void 0 : void 0;
      }
    },
    updatePlacement: function() {
      var max;

      max = Math.round($("#columns").position().top);
      if ($(window).scrollTop() < max) {
        return this.element.removeClass("fixed");
      } else {
        if ($("#left-column").height() > $("#sidebar").height()) {
          return this.element.addClass("fixed");
        }
      }
    },
    show: function(mode) {
      var _this = this;

      return $.when(this.element).pipe(function() {
        return _this.refreshContent(mode);
      }).done(function() {
        _this.element.show("slide", {
          direction: "right"
        });
        return $("#left-column").animate({
          right: 265
        }, null, null, function() {
          return $.sm.send("sidebar.show.end");
        });
      });
    },
    hide: function() {
      if ($("#left-column").css("right") === "0px") {
        return;
      }
      this.element.hide("slide", {
        direction: "right"
      });
      return $("#left-column").animate({
        right: 0
      }, null, null, function() {
        return $.sm.send("sidebar.hide.end");
      });
    }
  };

  $.widget("korp.sidebar", Sidebar);

  $.widget("korp.radioList", {
    options: {
      change: $.noop,
      separator: "|",
      selected: "default"
    },
    _create: function() {
      var self;

      this._super();
      self = this;
      $.each(this.element, function() {
        return $(this).children().wrap("<li />").click(function() {
          if (!$(this).is(".radioList_selected")) {
            self.select($(this).data("mode"));
            return self._trigger("change", $(this).data("mode"));
          }
        }).parent().prepend($("<span>").text(self.options.separator)).wrapAll("<ul class='inline_list' />");
      });
      this.element.find(".inline_list span:first").remove();
      return this.select(this.options.selected);
    },
    select: function(mode) {
      var target;

      this.options.selected = mode;
      target = this.element.find("a").filter(function() {
        return $(this).data("mode") === mode;
      });
      this.element.find(".radioList_selected").removeClass("radioList_selected");
      this.element.find(target).addClass("radioList_selected");
      return this.element;
    },
    getSelected: function() {
      return this.element.find(".radioList_selected");
    }
  });

  ModeSelector = {
    options: {
      modes: []
    },
    _create: function() {
      var self;

      self = this;
      $.each(this.options.modes, function(i, item) {
        var a;

        a = $("<a href='javascript:'>").localeKey(item.localekey).data("mode", item.mode);
        if (!item.labOnly || (isLab && item.labOnly)) {
          return a.appendTo(self.element);
        }
      });
      return this._super();
    }
  };

  $.widget("korp.modeSelector", $.korp.radioList, ModeSelector);

  $.extend($.ui.autocomplete.prototype, {
    _renderItem: function(ul, item) {
      var li;

      li = $("<li></li>").data("ui-autocomplete-item", item).append($("<a></a>")[(this.options.html ? "html" : "text")](item.label)).appendTo(ul);
      if (!item["enabled"]) {
        li.addClass("autocomplete-item-disabled");
      }
      return li;
    },
    _renderMenu: function(ul, items) {
      var currentCategory, that;

      that = this;
      currentCategory = "";
      return $.each(items, function(index, item) {
        if (item.category && item.category !== currentCategory) {
          ul.append($("<li class='ui-autocomplete-category'></li>").localeKey(item.category));
          currentCategory = item.category;
        }
        return that._renderItem(ul, item);
      });
    }
  });

  $.fn.korp_autocomplete = function(options) {
    var selector;

    selector = $(this);
    if (typeof options === "string" && options === "abort") {
      lemgramProxy.abort();
      selector.preloader("hide");
      return;
    }
    options = $.extend({
      type: "lem",
      select: $.noop,
      labelFunction: util.lemgramToString,
      middleware: function(request, idArray) {
        var dfd, has_morphs, labelArray, listItems;

        dfd = $.Deferred();
        has_morphs = settings.corpusListing.getMorphology().split("|").length > 1;
        if (has_morphs) {
          idArray.sort(function(a, b) {
            var first, second;

            first = (a.split("--").length > 1 ? a.split("--")[0] : "saldom");
            second = (b.split("--").length > 1 ? b.split("--")[0] : "saldom");
            return second < first;
          });
        } else {
          idArray.sort(options.sortFunction || view.lemgramSort);
        }
        labelArray = util.sblexArraytoString(idArray, options.labelFunction);
        listItems = $.map(idArray, function(item, i) {
          var out;

          out = {
            label: labelArray[i],
            value: item,
            input: request.term,
            enabled: true
          };
          if (has_morphs) {
            out["category"] = (item.split("--").length > 1 ? item.split("--")[0] : "saldom");
          }
          return out;
        });
        dfd.resolve(listItems);
        return dfd.promise();
      }
    }, options);
    selector.preloader({
      timeout: 500,
      position: {
        my: "right center",
        at: "right center",
        offset: "-1 0",
        collision: "none"
      }
    }).autocomplete({
      html: true,
      source: function(request, response) {
        var promise;

        c.log("autocomplete request", request);
        c.log("autocomplete type", options.type);
        promise = options.type === "saldo" ? lemgramProxy.saldoSearch(request.term, options["sw-forms"]) : lemgramProxy.karpSearch(request.term, options["sw-forms"]);
        promise.done(function(idArray, textstatus, xhr) {
          idArray = $.unique(idArray);
          return options.middleware(request, idArray).done(function(listItems) {
            selector.data("dataArray", listItems);
            response(listItems);
            if (selector.autocomplete("widget").height() > 300) {
              selector.autocomplete("widget").addClass("ui-autocomplete-tall");
            }
            $("#autocomplete_header").remove();
            $("<li id='autocomplete_header' />").localeKey("autocomplete_header").css("font-weight", "bold").css("font-size", 10).prependTo(selector.autocomplete("widget"));
            return selector.preloader("hide");
          });
        }).fail(function() {
          c.log("sblex fail", arguments);
          return selector.preloader("hide");
        });
        return selector.data("promise", promise);
      },
      search: function() {
        return selector.preloader("show");
      },
      minLength: 1,
      select: function(event, ui) {
        var selectedItem;

        event.preventDefault();
        selectedItem = ui.item.value;
        return $.proxy(options.select, selector)(selectedItem);
      },
      close: function(event) {
        return false;
      },
      focus: function() {
        return false;
      }
    });
    return selector;
  };

  KorpTabs = {
    _init: function() {
      var _this = this;

      this._super();
      this.n = 0;
      this.urlPattern = "#custom-tab-";
      this.element.on("click", ".tabClose", function(event) {
        var closebtn, href, li, prevLi;

        closebtn = $(event.currentTarget);
        if (!closebtn.parent().is(".ui-state-disabled")) {
          c.log("href", closebtn.prev().attr("href"));
          href = closebtn.prev().attr("href");
          li = closebtn.closest(".custom_tab");
          prevLi = li.prev();
          li.remove();
          $(href, _this.element).remove();
          _this.refresh();
          prevLi.find("a:first").click();
        }
        event.stopImmediatePropagation();
        return event.preventDefault();
      });
      return this.tabs.first().data("instance", kwicResults);
    },
    getPanelTemplate: function() {
      return " <div id=\"results-kwic\" ng-controller=\"kwicCtrl\" ng-cloak>\n    <div class=\"result_controls\">\n        <div class=\"controls_n\" >\n            <span rel=\"localize[num_results]\">Antal träffar</span>: <span class=\"num-result\">0</span>\n        </div>\n        <div class=\"progress\">\n            <progress value=\"0\" max=\"100\"></progress>\n        </div>\n       <div class=\"hits_picture\" ></div>\n   </div>\n\n    <div class=\"pager-wrapper\"></div>\n    <span class=\"reading_btn show link\" rel=\"localize[show_reading]\">Visa läsläge</span>\n    <span class=\"reading_btn hide link\" rel=\"localize[show_kwic]\">Visa kwic</span>\n\n\n    <div class=\"table_scrollarea\">\n        <table class=\"results_table kwic\" cellspacing=\"0\">\n            <tr class=\"sentence\" ng-repeat=\"sentence in kwic\" ng-class-even=\"'even'\" ng-class-odd=\"'odd'\"\n                ng-class=\"{corpus_info : sentence.newCorpus, not_corpus_info : !sentence.newCorpus}\">\n                <td class=\"empty_td\"></td>\n                <td colspan=\"0\" class=\"corpus_title\">\n                    {{sentence.newCorpus}}\n                    <span class='corpus_title_warn' rel='localize[no_context_support]' ng-show=\"sentence.noContext\"></span>\n                </td>\n\n                <td class=\"left\" ng-show=\"!sentence.newCorpus\">\n                    <span kwic-word ng-repeat=\"wd in selectLeft(sentence)\"></span>\n                </td>\n                <td class=\"match\" ng-show=\"!sentence.newCorpus\">\n                    <span kwic-word ng-repeat=\"wd in selectMatch(sentence)\"></span>\n                </td>\n                <td class=\"right\" ng-show=\"!sentence.newCorpus\">\n                    <span kwic-word ng-repeat=\"wd in selectRight(sentence)\"></span>\n                </td>\n\n            </tr>\n        </table>\n    </div>\n\n</div>";
    },
    getTabTemplate: function(href, label) {
      return "<li class=\"custom_tab\">\n    <a class=\"custom_anchor\" href=\"" + href + "\">\n        <span rel=\"localize[example]\">" + label + "</span>\n    </a>\n    <a class=\"tabClose\" href=\"#\">\n        <span class=\"ui-icon ui-icon-circle-close\"></span>\n    </a>\n    <div class=\"tab_progress\"></div>\n</li>";
    },
    _tabify: function(init) {
      this._super(init);
      return this.redrawTabs();
    },
    redrawTabs: function() {
      this.refresh();
      $(".custom_tab").css("margin-left", "auto");
      return $(".custom_tab:first").css("margin-left", 8);
    },
    addTab: function(klass, headerLabel) {
      var instance, li, newDiv, panel, tabs, url;

      if (headerLabel == null) {
        headerLabel = "KWIC";
      }
      url = this.urlPattern + this.n;
      tabs = $(".ui-tabs-nav", this.element).append(this.getTabTemplate(url, headerLabel));
      li = $(".ui-tabs-nav > li:last", this.element);
      panel = $("<div>").append(this.getPanelTemplate()).children().first().attr("id", url.slice(1)).unwrap();
      this.element.append(panel);
      this.redrawTabs();
      newDiv = this.element.children().last();
      this.element.injector().invoke([
        "$rootScope", "$compile", function($rootScope, $compile) {
          var cnf;

          cnf = $compile(newDiv);
          return cnf($rootScope);
        }
      ]);
      instance = new klass(li, url);
      li.data("instance", instance);
      this.n++;
      li.find("a.ui-tabs-anchor").trigger("click");
      return instance;
    },
    enableAll: function() {
      var _this = this;

      return $.each(".custom_tab", function(i, elem) {
        return _this.enable(i);
      });
    },
    getCurrentInstance: function() {
      return this.tabs.filter(".ui-tabs-active").data("instance") || null;
    }
  };

  $.widget("korp.korptabs", $.ui.tabs, KorpTabs);

  ExtendedToken = {
    options: {},
    _init: function() {
      var repeat, self,
        _this = this;

      self = this;
      this.table = this.element;
      this.element.find(".ui-icon-circle-close").click(function() {
        if ($(this).css("opacity") === "0") {
          return;
        }
        c.log("close");
        self.element.remove();
        return self._trigger("close");
      });
      this.element.find(".insert_arg").click(function() {
        return _this.insertArg(true);
      });
      this.insertArg();
      repeat = this.element.find(".repeat");
      this.element.find("button").button({
        icons: {
          primary: "ui-icon-gear"
        },
        text: false
      }).click(function() {
        if ($("#opt_menu").is(":visible")) {
          return;
        }
        $("#opt_menu").show().menu({}).one("click", function(evt) {
          var item;

          c.log("click", evt.target);
          if (!$(evt.target).is("a")) {
            return;
          }
          item = $(evt.target).data("item");
          self.element.toggleClass(item);
          return self._trigger("change");
        }).position({
          my: "right top",
          at: "right bottom",
          of: this
        });
        $("body").one("click", function() {
          return $("#opt_menu").hide();
        });
        return false;
      });
      this.element.find(".close_token .ui-icon").click(function() {
        var item;

        item = $(this).closest(".close_token").data("item");
        self.element.toggleClass(item);
        return self._trigger("change");
      });
      return this.element.find(".repeat input").change(function() {
        return _this._trigger("change");
      });
    },
    insertArg: function(animate) {
      var arg, self;

      c.log("insertArg");
      self = this;
      arg = $("#argTmpl").tmpl().find(".or_container").append(this.insertOr()).end().find(".insert_or").click(function() {
        var lastVal, thisarg;

        thisarg = $(this).closest(".query_arg").find(".or_container");
        lastVal = thisarg.find(".arg_type:last").val();
        self.insertOr(true).appendTo($(this).closest(".query_arg").find(".or_container")).hide().slideDown();
        thisarg.find(".arg_type:last").val(lastVal).trigger("change");
        return self._trigger("change");
      }).end().appendTo(this.element.find(".args")).before($("<span>", {
        "class": "and"
      }).localeKey("and").hide().fadeIn());
      util.localize(arg);
      if (animate) {
        arg.hide().slideDown("fast");
      }
      return self._trigger("change");
    },
    insertOr: function(usePrev) {
      var arg_select, arg_value, e, link_mod, orElem, self;

      self = this;
      try {
        arg_select = this.makeSelect();
      } catch (_error) {
        e = _error;
        c.log("error", e);
        return;
      }
      arg_value = this.makeWordArgValue();
      arg_value.attr("data-placeholder", "any_word_placeholder");
      link_mod = $("<span class='val_mod sensitive'>").text("Aa").click(function() {
        var menuMarkup;

        if ($("#mod_menu").length) {
          $("#mod_menu").remove();
          return;
        }
        menuMarkup = "<li data-val=\"sensitive\">\n    <a rel=\"localize[case_sensitive]\">" + (util.getLocaleString('case_sensitive')) + "</a>\n</li>\n<li data-val=\"insensitive\">\n    <a rel=\"localize[case_insensitive]\">" + (util.getLocaleString('case_insensitive')) + "</a>\n</li>";
        $("<ul id='mod_menu'>").append(menuMarkup).insertAfter(this).menu({
          select: function(event, ui) {
            c.log("set ui", this);
            $(this).prev().removeClass("sensitive insensitive").addClass(ui.item.data("val"));
            return self._trigger("change");
          }
        }).position({
          my: "right top",
          at: "right bottom",
          of: this
        });
        $("body").one("click", function() {
          return $("#mod_menu").remove();
        });
        return false;
      });
      orElem = $("#orTmpl").tmpl().find(".right_col").append(arg_select, arg_value, link_mod).end().find(".remove_arg").click(function() {
        var arg;

        if ($(this).css("opacity") === "0") {
          return;
        }
        arg = $(this).closest(".or_arg");
        if (arg.siblings(".or_arg").length === 0) {
          return arg.closest(".query_arg").slideUp("fast", function() {
            $(this).remove();
            return self._trigger("change");
          }).prev().remove();
        } else {
          return arg.slideUp(function() {
            $(this).remove();
            return self._trigger("change");
          });
        }
      }).end();
      arg_value.keyup();
      return orElem;
    },
    makeSelect: function() {
      var arg_opts, arg_select, groups, lang;

      arg_select = $("<select/>").addClass("arg_type").change($.proxy(this.onArgTypeChange, this));
      if (currentMode === "parallel") {
        lang = this.element.closest(".lang_row,#query_table").find(".lang_select").val();
      }
      groups = $.extend({}, settings.arg_groups, {
        word_attr: settings.corpusListing.getCurrentAttributes(lang),
        sentence_attr: settings.corpusListing.getStructAttrs(lang)
      });
      c.log("groups", groups);
      $.each(groups, function(lbl, group) {
        var optgroup;

        if ($.isEmptyObject(group)) {
          return;
        }
        optgroup = $("<optgroup/>", {
          label: util.getLocaleString(lbl).toLowerCase(),
          rel: $.format("localize[%s]", lbl)
        }).appendTo(arg_select);
        return $.each(group, function(key, val) {
          if (val.displayType === "hidden") {
            return;
          }
          return $("<option/>", {
            rel: $.format("localize[%s]", val.label)
          }).val(key).text(util.getLocaleString(val.label) || "").appendTo(optgroup).data("dataProvider", val);
        });
      });
      arg_opts = this.makeOptsSelect(settings.defaultOptions);
      c.log("arg_opts", arg_opts);
      return $("<div>", {
        "class": "arg_selects"
      }).append(arg_select, arg_opts);
    },
    makeOptsSelect: function(groups) {
      var self;

      self = this;
      if ($.isEmptyObject(groups)) {
        return $("<span>", {
          "class": "arg_opts"
        });
      }
      return $("<select>", {
        "class": "arg_opts"
      }).append($.map(groups, function(key, value) {
        return $("<option>", {
          value: key
        }).localeKey(key).get(0);
      })).change(function() {
        return self._trigger("change");
      });
    },
    refresh: function() {
      var self;

      self = this;
      return this.table.find(".or_arg").each(function() {
        var newSelects, oldLower, oldVal, old_data, old_ph, optVal;

        oldVal = $(this).find(".arg_type").val();
        optVal = $(this).find(".arg_opts").val();
        oldLower = $(this).find(".arg_value");
        old_ph = oldLower.attr("placeholder");
        old_data = oldLower.data("value");
        newSelects = self.makeSelect();
        $(this).find(".arg_selects").replaceWith(newSelects);
        newSelects.find(".arg_type").val(oldVal).change();
        newSelects.find(".arg_opts").val(optVal);
        if (oldLower.attr("placeholder")) {
          return $(this).find(".arg_value").data("value", old_data).attr("placeholder", old_ph).placeholder();
        } else {
          return $(this).find(".arg_value").val(oldLower.val());
        }
      });
    },
    makeWordArgValue: function(label) {
      var out, self,
        _this = this;

      self = this;
      out = $("<input type='text'/>").addClass("arg_value");
      if (label === "word") {
        out.keyup(function() {
          if ($(this).val() === "") {
            return $(this).prev().find(".arg_opts").attr("disabled", "disabled");
          } else {
            return $(this).prev().find(".arg_opts").attr("disabled", null);
          }
        }).change(function() {
          c.log("change", _this._trigger);
          return _this._trigger("change");
        }).keyup();
      }
      return out;
    },
    onArgTypeChange: function(event) {
      var all_years, arg_value, data, end, from, keys, labelFunc, newSelect, oldOptVal, oldVal, self, slider, sortFunc, sorter, start, target, to, type;

      self = this;
      target = $(event.currentTarget);
      oldVal = target.parent().siblings(".arg_value:input[type=text]").val() || "";
      oldOptVal = target.next().val();
      data = target.find(":selected").data("dataProvider");
      arg_value = null;
      switch (data.displayType) {
        case "select":
          sorter = function(a, b) {
            var prefix;

            if (data.localize === false) {
              return a > b;
            }
            prefix = data.translationKey || "";
            if (util.getLocaleString(prefix + a) >= util.getLocaleString(prefix + b)) {
              return 1;
            } else {
              return -1;
            }
          };
          arg_value = $("<select />");
          if ($.isArray(data.dataset)) {
            keys = data.dataset;
          } else {
            keys = _.keys(data.dataset);
          }
          keys.sort(sorter);
          $.each(keys, function(_, key) {
            var opt;

            opt = $("<option />").val(regescape(key)).appendTo(arg_value);
            if (data.localize === false) {
              return opt.text(key);
            } else {
              return opt.localeKey((data.translationKey || "") + key);
            }
          });
          break;
        case "autocomplete":
          if (data.label === "saldo") {
            type = "saldo";
            labelFunc = util.saldoToString;
            sortFunc = view.saldoSort;
            c.log("saldo");
          } else {
            type = "lem";
            labelFunc = util.lemgramToString;
            sortFunc = view.lemgramSort;
          }
          arg_value = $("<input type='text'/>").korp_autocomplete({
            labelFunction: labelFunc,
            sortFunction: sortFunc,
            type: type,
            select: function(lemgram) {
              c.log("extended lemgram", lemgram, $(this));
              $(this).data("value", (data.label === "baseform" ? lemgram.split(".")[0] : lemgram));
              return $(this).attr("placeholder", labelFunc(lemgram, true).replace(/<\/?[^>]+>/g, "")).val("").blur().placeholder();
            },
            "sw-forms": true
          }).blur(function() {
            var input;

            input = this;
            return setTimeout((function() {
              c.log("blur");
              if (($(input).val().length && !util.isLemgramId($(input).val())) || $(input).data("value") === null) {
                $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder();
              } else {
                $(input).removeClass("invalid_input");
              }
              return self._trigger("change");
            }), 100);
          });
          break;
        case "date_interval":
          all_years = _(settings.corpusListing.selected).pluck("time").map(_.pairs).flatten(true).filter(function(tuple) {
            return tuple[0] && tuple[1];
          }).map(_.compose(Number, _.head)).value();
          start = Math.min.apply(Math, all_years);
          end = Math.max.apply(Math, all_years);
          arg_value = $("<div>");
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
          arg_value.append(slider, from, to);
          break;
        default:
          arg_value = this.makeWordArgValue(data.label);
          if (data.label === "word") {
            arg_value.attr("data-placeholder", "any_word_placeholder");
          }
          util.localize(arg_value);
      }
      target.parent().siblings(".arg_value").replaceWith(arg_value);
      newSelect = this.makeOptsSelect(data.opts || settings.defaultOptions);
      target.next().replaceWith(newSelect);
      if ((oldVal != null) && oldVal.length) {
        arg_value.val(oldVal);
      }
      switch (target.val()) {
        case "msd":
          $("#msd_popup").load("markup/msd.html", function() {
            return $(this).find("a").click(function() {
              arg_value.val($(this).parent().data("value"));
              return $("#msd_popup").dialog("close");
            });
          });
          $("<span class='ui-icon ui-icon-info' />").click(function() {
            var h, w;

            w = $("html").width() * 0.6;
            h = $("html").height();
            $("#msd_popup").fadeIn("fast").dialog({
              width: w,
              height: h,
              modal: true
            }).parent().find(".ui-dialog-title").localeKey("msd_long");
            return $(".ui-widget-overlay").one("click", function(evt) {
              c.log("body click");
              return $("#msd_popup").dialog("close");
            });
          }).insertAfter(arg_value);
          arg_value.css("width", "93%");
          break;
        default:
          this.element.find(".ui-icon-info").remove();
      }
      arg_value.addClass("arg_value").keyup().change(function() {
        return self._trigger("change");
      });
      return this._trigger("change");
    },
    getOrCQP: function(andSection, expand) {
      var args, bound, boundStr, boundprefix, inner_query, output, self;

      self = this;
      output = "";
      args = {};
      $(".or_container", andSection).each(function(i, item) {
        return $(this).find(".or_arg").each(function() {
          var case_sens, data, opt, type, value, _ref;

          type = $(this).find(".arg_type").val();
          data = $(this).find(".arg_type :selected").data("dataProvider");
          if (!data) {
            return;
          }
          value = $(this).find(".arg_value").val();
          opt = $(this).find(".arg_opts").val();
          case_sens = ($(this).find(".val_mod.sensitive").length === 0 ? " %c" : "");
          if ((_ref = data.displayType) === "autocomplete" || _ref === "date_interval") {
            value = null;
          }
          if (!args[type]) {
            args[type] = [];
          }
          return args[type].push({
            data: data,
            value: value || $(this).find(".arg_value").data("value") || "",
            opt: opt,
            case_sens: case_sens
          });
        });
      });
      inner_query = [];
      $.each(args, function(type, valueArray) {
        return $.each(valueArray, function(i, obj) {
          var defaultArgsFunc;

          defaultArgsFunc = function(s, op) {
            var expandToNonStrict, formatter, getOp, not_operator, operator, prefix, stringify, value;

            getOp = function(value) {
              return {
                is: [operator, "", value, ""],
                is_not: [not_operator, "", value, ""],
                starts_with: ["=", "", value, ".*"],
                contains: ["=", ".*", value, ".*"],
                ends_with: ["=", ".*", value, ""],
                matches: ["=", "", value, ""]
              }[op];
            };
            stringify = function(value) {
              return $.format('%s%s %s "%s%s%s"%s', [prefix, type].concat(getOp(value), [obj.case_sens]));
            };
            operator = (obj.data.type === "set" ? "contains" : "=");
            not_operator = (obj.data.type === "set" ? "not contains" : "!=");
            prefix = (obj.data.isStructAttr ? "_." : "");
            formatter = (op === "matches" || obj.data.displayType === "select" ? _.identity : regescape);
            value = formatter(s);
            if (currentMode === "law") {
              expandToNonStrict = function(value) {
                var undef;

                prefix = (obj.data.isStructAttr !== null ? "_." : "");
                undef = $.format("%s%s = '__UNDEF__'", [prefix, type]);
                return $.format("(%s | %s)", [stringify(value), undef]);
              };
              if (expand) {
                return expandToNonStrict(value);
              }
            }
            return stringify(value);
          };
          return (function(type, obj, defaultArgsFunc) {
            var argFunc;

            c.log("type, obj.value", type, obj);
            argFunc = settings.getTransformFunc(type, obj.value, obj.opt) || defaultArgsFunc;
            return inner_query.push(argFunc(obj.value, obj.opt || settings.defaultOptions));
          })(type, obj, defaultArgsFunc);
        });
      });
      if (inner_query.length > 1) {
        output = "(" + (inner_query.join(" | ")) + ")";
      } else {
        output = inner_query[0];
      }
      bound = [];
      if (this.element.is(".lbound_item")) {
        bound.push("lbound(sentence)");
      }
      if (this.element.is(".rbound_item")) {
        bound.push("rbound(sentence)");
      }
      boundprefix = " & ";
      if (output === "") {
        boundprefix = "";
      }
      boundStr = (bound.length ? boundprefix + bound.join(" & ") : "");
      return output + boundStr;
    },
    sortAnd: function(andBlock1, andBlock2) {
      var min1, min2;

      min1 = _.min(_.map($(andBlock1).find(".arg_type"), function(item) {
        return _.indexOf(settings.cqp_prio, $(item).val());
      }));
      min2 = _.min(_.map($(andBlock2).find(".arg_type"), function(item) {
        return _.indexOf(settings.cqp_prio, $(item).val());
      }));
      return min2 - min1;
    },
    getCQP: function(strict) {
      var andList, min, minOfContainer, min_max, output, self, suffix, totalMin;

      minOfContainer = function(or_container) {
        var types;

        types = _.invoke(_.map($(".arg_type", or_container).get(), $), "val");
        return Math.min.apply(null, _.map(types, getAnnotationRank));
      };
      self = this;
      if (!strict && currentMode === "law") {
        totalMin = _.map($(".or_container").get(), minOfContainer);
        min = Math.min.apply(null, totalMin);
      }
      andList = this.element.find(".query_arg").sort(this.sortAnd);
      output = $(andList).map(function(item) {
        var expand, or_min;

        expand = false;
        if (!strict && currentMode === "law") {
          or_min = minOfContainer(this);
          if (or_min > min) {
            expand = true;
          }
        }
        return self.getOrCQP($(this), expand);
      }).get();
      output = $.grep(output, Boolean);
      min_max = this.element.find(".repeat:visible input").map(function() {
        return $(this).val();
      }).get();
      suffix = "";
      if (min_max.length) {
        min_max[0] = Number(min_max[0]) || 0;
        min_max[1] = Number(min_max[1]) || "";
        suffix = $.format("{%s}", min_max.join(", "));
      }
      return "[" + output.join(" & ") + "]" + suffix;
    }
  };

  $.widget("korp.extendedToken", ExtendedToken);

}).call(this);
