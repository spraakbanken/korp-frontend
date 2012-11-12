(function() {
  var Sidebar;

  Sidebar = {
    options: {
      displayOrder: ["pos", "posset", "lemma", "lex", "saldo", "variants"].reverse()
    },
    _init: function() {},
    updateContent: function(sentenceData, wordData, corpus) {
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
      return this.applyEllipse();
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
      var address, getStringVal, inner, li, lis, output, pattern, prefix, ul, val, valueArray, x;
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
        valueArray = _.filter(value.split("|"), Boolean);
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
        lis = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = valueArray.length; _i < _len; _i++) {
            x = valueArray[_i];
            if (!x.length) {
              continue;
            }
            val = (attrs.stringify || _.identity)(x);
            inner = $(_.template(pattern, {
              key: x,
              val: val
            }));
            if (attrs.translationKey) {
              prefix = attrs.translationKey || "";
              inner.localeKey(prefix + x);
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
        return output.append("<span class='msd'>" + value + "</span>\n    <a href='markup/msdtags.html' target='_blank'>\n        <span id='sidbar_info' class='ui-icon ui-icon-info'></span>\n    </a> \n</span>  ");
      } else if (attrs.pattern) {
        return output.append(_.template(attrs.pattern));
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
      var instance,
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
        if (instance && instance.selectionManager.selected) {
          return instance.selectionManager.selected.click();
        }
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

  $.widget("ui.sidebar", Sidebar);

}).call(this);
