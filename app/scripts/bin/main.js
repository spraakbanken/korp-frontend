(function() {
  var chained, deferred_domReady, deferred_load, deferred_mode, deferred_sm, initTimeGraph, isDev, loc_dfd, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  t = $.now();

  isDev = window.location.host === "localhost";

  deferred_load = $.get("markup/searchbar.html");

  $.ajaxSetup({
    dataType: "json",
    traditional: true
  });

  $.ajaxPrefilter("json", function(options, orig, jqXHR) {
    if (options.crossDomain && !$.support.cors) {
      return "jsonp";
    }
  });

  deferred_sm = $.Deferred(function(dfd) {
    if (navigator.userAgent.match(/Android/i) && !window.XSLTProcessor) {
      alert("Använd Firefox eller Opera för att köra Korp i Android.");
      return;
    }
    return $.sm("korp_statemachine.xml", dfd.resolve);
  }).promise();

  deferred_mode = $.Deferred();

  deferred_domReady = $.Deferred(function(dfd) {
    return $(function() {
      var mode;

      mode = $.deparam.querystring().mode;
      if ((mode != null) && mode !== "default") {
        c.log("fetchin mode", mode);
        return $.getScript("modes/" + mode + "_mode.js").done(function() {
          c.log("got mode", mode);
          deferred_mode.resolve();
          return dfd.resolve();
        }).fail(function(args, msg, e) {
          c.log("mode fail", arguments);
          window.args = arguments;
          deferred_mode.reject();
          return dfd.reject();
        });
      } else {
        deferred_mode.resolve();
        return dfd.resolve();
      }
    });
  }).promise();

  chained = deferred_mode.pipe(function() {
    return $.ajax({
      url: settings.cgi_script,
      data: {
        command: "info",
        corpus: $.map($.keys(settings.corpora), function(item) {
          return item.toUpperCase();
        }).join(),
        log: 1
      }
    });
  });

  chained.done(function(info_data) {
    return $.each(settings.corpora, function(key) {
      return settings.corpora[key]["info"] = info_data["corpora"][key.toUpperCase()]["info"];
    });
  });

  loc_dfd = util.initLocalize();

  $.when(deferred_load, chained, deferred_domReady, deferred_sm, loc_dfd).then((function(searchbar_html) {
    var creds, end, from, labs, onHashChange, paper, start, tab_a_selector, tabs, to;

    $.revision = parseInt("$Rev: 65085 $".split(" ")[1]);
    c.log("preloading done, t = ", $.now() - t);
    if (isLab) {
      $("body").addClass("lab");
    }
    window.currentMode = $.deparam.querystring().mode || "default";
    $("body").addClass("mode-" + currentMode);
    util.browserWarn();
    view.updateSearchHistory();
    from = $("#time_from");
    to = $("#time_to");
    start = 1900;
    end = new Date().getFullYear();
    $("#time_slider").slider({
      range: true,
      min: start,
      max: end,
      values: [1982, end],
      slide: function(event, ui) {
        from.val(ui.values[0]);
        return to.val(ui.values[1]);
      },
      change: function(event, ui) {
        return $(this).data("value", ui.values);
      }
    });
    $("#mode_switch").modeSelector({
      change: function() {
        var mode;

        mode = $(this).modeSelector("option", "selected");
        $.bbq.removeState("corpus");
        if (mode === "default") {
          return location.href = location.pathname;
        } else {
          return location.href = location.pathname + "?mode=" + mode;
        }
      },
      selected: currentMode,
      modes: settings.modeConfig
    }).add("#about").vAlign();
    paper = new Raphael(document.getElementById("cog"), 33, 33);
    paper.path("M26.974,16.514l3.765-1.991c-0.074-0.738-0.217-1.454-0.396-2.157l-4.182-0.579c-0.362-0.872-0.84-1.681-1.402-2.423l1.594-3.921c-0.524-0.511-1.09-0.977-1.686-1.406l-3.551,2.229c-0.833-0.438-1.73-0.77-2.672-0.984l-1.283-3.976c-0.364-0.027-0.728-0.056-1.099-0.056s-0.734,0.028-1.099,0.056l-1.271,3.941c-0.967,0.207-1.884,0.543-2.738,0.986L7.458,4.037C6.863,4.466,6.297,4.932,5.773,5.443l1.55,3.812c-0.604,0.775-1.11,1.629-1.49,2.55l-4.05,0.56c-0.178,0.703-0.322,1.418-0.395,2.157l3.635,1.923c0.041,1.013,0.209,1.994,0.506,2.918l-2.742,3.032c0.319,0.661,0.674,1.303,1.085,1.905l4.037-0.867c0.662,0.72,1.416,1.351,2.248,1.873l-0.153,4.131c0.663,0.299,1.352,0.549,2.062,0.749l2.554-3.283C15.073,26.961,15.532,27,16,27c0.507,0,1.003-0.046,1.491-0.113l2.567,3.301c0.711-0.2,1.399-0.45,2.062-0.749l-0.156-4.205c0.793-0.513,1.512-1.127,2.146-1.821l4.142,0.889c0.411-0.602,0.766-1.243,1.085-1.905l-2.831-3.131C26.778,18.391,26.93,17.467,26.974,16.514zM20.717,21.297l-1.785,1.162l-1.098-1.687c-0.571,0.22-1.186,0.353-1.834,0.353c-2.831,0-5.125-2.295-5.125-5.125c0-2.831,2.294-5.125,5.125-5.125c2.83,0,5.125,2.294,5.125,5.125c0,1.414-0.573,2.693-1.499,3.621L20.717,21.297z").attr({
      fill: "#666",
      stroke: "none",
      transform: "s0.6"
    });
    paper = new Raphael(document.getElementById("labs_logo"), 39, 60);
    labs = paper.path("M22.121,24.438l-3.362-7.847c-0.329-0.769-0.599-2.081-0.599-2.917s0.513-1.521,1.14-1.521s1.141-0.513,1.141-1.14s-0.685-1.14-1.521-1.14h-6.84c-0.836,0-1.52,0.513-1.52,1.14s0.513,1.14,1.14,1.14s1.14,0.685,1.14,1.521s-0.269,2.148-0.599,2.917l-3.362,7.847C8.55,25.206,8.28,26.177,8.28,26.595s0.342,1.103,0.76,1.521s1.444,0.76,2.28,0.76h8.359c0.836,0,1.862-0.342,2.28-0.76s0.76-1.103,0.76-1.521S22.45,25.206,22.121,24.438zM16.582,7.625c0,0.599,0.484,1.083,1.083,1.083s1.083-0.484,1.083-1.083s-0.484-1.084-1.083-1.084S16.582,7.026,16.582,7.625zM13.667,7.792c0.276,0,0.5-0.224,0.5-0.5s-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5S13.391,7.792,13.667,7.792zM15.584,5.292c0.874,0,1.583-0.709,1.583-1.583c0-0.875-0.709-1.584-1.583-1.584C14.709,2.125,14,2.834,14,3.709C14,4.583,14.709,5.292,15.584,5.292z").attr({
      fill: "#333",
      stroke: "none",
      transform: "t0,18s1.7"
    });
    $("#logo").click(function() {
      window.location = window.location.protocol + "//" + window.location.host + window.location.pathname + location.search;
      return false;
    });
    $("#cog_menu").menu({}).hide().find(".follow_link").click(function() {
      return window.href = window.open($(this).attr("href"), $(this).attr("target") || "_self");
    });
    $("#cog").click(function() {
      if ($("#cog_menu:visible").length) {
        return;
      }
      $("#cog_menu").fadeIn("fast").position({
        my: "right top",
        at: "right bottom",
        of: "#top_bar",
        offset: "-8 3"
      });
      $("body").one("click", function() {
        return $("#cog_menu").fadeOut("fast");
      });
      return false;
    });
    $("#searchbar").html(searchbar_html[0]);
    $("#search_history").change(function(event) {
      c.log("select", $(this).find(":selected"));
      return location.href = $(this).find(":selected").val();
    });
    loadCorpora();
    creds = $.jStorage.get("creds");
    $.sm.start();
    if (creds) {
      authenticationProxy.loginObj = creds;
      util.setLogin();
    }
    tab_a_selector = "ul .ui-tabs-anchor";
    $("#search-tab").tabs({
      event: "change",
      activate: function(event, ui) {
        var selected;

        if ($("#sidebar").data("korpSidebar")) {
          if ($("#columns").position().top > 0) {
            $("#sidebar").sidebar("updatePlacement");
          }
        }
        selected = ui.newPanel.attr("id").split("-")[1];
        return $.sm.send("searchtab." + selected);
      }
    });
    if (currentMode === "parallel") {
      $(".ui-tabs-nav li").first().hide();
      $(".ui-tabs-nav li").last().hide();
      $("#korp-simple").hide();
      $(".ui-tabs-nav a").eq(1).localeKey("parallel");
      $("#korp-advanced").hide();
      $("#search-tab").tabs("option", "active", 1);
      $("#result-container > ul li:last ").hide();
    }
    $("#result-container").korptabs({
      event: "change",
      activate: function(event, ui) {
        var currentId, instance, selected, suffix, type;

        if (ui.newTab.is(".custom_tab")) {
          instance = $(this).korptabs("getCurrentInstance");
          suffix = instance instanceof view.GraphResults ? ".graph" : ".kwic";
          type = instance;
          return $.sm.send("resultstab.custom" + suffix);
        } else {
          currentId = ui.newPanel.attr("id");
          selected = currentId.split("-")[1];
          return $.sm.send("resultstab." + selected);
        }
      }
    });
    tabs = $(".ui-tabs");
    tabs.on("click", tab_a_selector, function() {
      var id, idx, state;

      if ($(this).parent().is(".ui-state-disabled")) {
        return;
      }
      state = {};
      id = $(this).closest(".ui-tabs").attr("id");
      if (!id) {
        return false;
      }
      idx = $(this).parent().prevAll().length;
      state[id] = idx;
      $.bbq.pushState(state);
      return false;
    });
    $(".custom_anchor").on("mouseup", function() {
      c.log("custom click");
      $.bbq.removeState("result-container");
      return $(this).triggerHandler("change");
    });
    $("#log_out").click(function() {
      $.each(authenticationProxy.loginObj.credentials, function(i, item) {
        return $(".boxdiv[data=" + (item.toLowerCase()) + "]").addClass("disabled");
      });
      authenticationProxy.loginObj = {};
      $.jStorage.deleteKey("creds");
      $("body").toggleClass("logged_in not_logged_in");
      $("#pass").val("");
      return $("#corpusbox").corpusChooser("redraw");
    });
    onHashChange = function(event, isInit) {
      var corp_array, corpus, data, display, e, hasChanged, page, prevFragment, processed_corp_array, reading, search, showAbout, type, value;

      hasChanged = function(key) {
        return prevFragment[key] !== e.getState(key);
      };
      showAbout = function() {
        $("#about_content").dialog({
          beforeClose: function() {
            $.bbq.removeState("display");
            return false;
          }
        }).css("opacity", 0).parent().find(".ui-dialog-title").localeKey("about");
        $("#about_content").fadeTo(400, 1);
        return $("#about_content").find("a").blur();
      };
      prevFragment = $.bbq.prevFragment || {};
      e = $.bbq;
      if (hasChanged("lang")) {
        loc_dfd = util.initLocalize();
        loc_dfd.done(function() {
          return util.localize();
        });
        $("#languages").radioList("select", $.localize("getLang"));
      }
      page = e.getState("page", true);
      if (hasChanged("page") && !hasChanged("search")) {
        kwicResults.setPage(page);
      }
      if (isInit) {
        kwicResults.current_page = page;
      }
      corpus = e.getState("corpus");
      if (isInit && corpus && corpus.length !== 0 && hasChanged("corpus")) {
        corp_array = corpus.split(",");
        processed_corp_array = _(corp_array).map(function(val) {
          return getAllCorporaInFolders(settings.corporafolders, val);
        }).flatten().value();
        corpusChooserInstance.corpusChooser("selectItems", processed_corp_array);
        $("#select_corpus").val(corpus);
        simpleSearch.enableSubmit();
      }
      display = e.getState("display");
      if (display === "about") {
        if ($("#about_content").is(":empty")) {
          $("#about_content").load("markup/about.html", function() {
            $("#revision").text($.revision);
            util.localize(this);
            return showAbout();
          });
        } else {
          showAbout();
        }
      } else if (display === "login") {
        $("#login_popup").dialog({
          height: 220,
          width: 177,
          modal: true,
          resizable: false,
          create: function() {
            return $(".err_msg", this).hide();
          },
          open: function() {
            return $(".ui-widget-overlay").hide().fadeIn();
          },
          beforeClose: function() {
            $(".ui-widget-overlay").remove();
            $("<div />", {
              "class": "ui-widget-overlay"
            }).css({
              height: $("body").outerHeight(),
              width: $("body").outerWidth(),
              zIndex: 1001
            }).appendTo("body").fadeOut(function() {
              return $(this).remove();
            });
            $.bbq.removeState("display");
            return false;
          }
        }).show().unbind("submit").submit(function() {
          var self;

          self = this;
          authenticationProxy.makeRequest($("#usrname", this).val(), $("#pass", this).val()).done(function(data) {
            util.setLogin();
            return $.bbq.removeState("display");
          }).fail(function() {
            c.log("login fail");
            $("#pass", self).val("");
            return $(".err_msg", self).show();
          });
          return false;
        });
        $("#ui-dialog-title-login_popup").attr("rel", "localize[log_in]");
      } else {
        $(".ui-dialog").fadeTo(400, 0, function() {
          return $(".ui-dialog-content", this).dialog("destroy");
        });
      }
      reading = e.getState("reading_mode");
      if (hasChanged("reading_mode")) {
        if (reading) {
          kwicResults.$result.addClass("reading_mode");
          if (!isInit) {
            kwicResults.makeRequest();
          }
        } else {
          kwicResults.$result.removeClass("reading_mode");
          if (!isInit) {
            kwicResults.makeRequest();
          } else {
            kwicResults.centerScrollbar();
          }
        }
      }
      search = e.getState("search");
      if ((search != null) && search !== prevFragment["search"]) {
        kwicResults.current_page = page || 0;
        type = search.split("|")[0];
        value = search.split("|").slice(1).join("|");
        view.updateSearchHistory(value);
        data = {
          value: value,
          page: page,
          isInit: isInit
        };
        switch (type) {
          case "word":
            $("#simple_text").val(value);
            simpleSearch.onSimpleChange();
            simpleSearch.setPlaceholder(null, null);
            if (settings.lemgramSelect) {
              simpleSearch.makeLemgramSelect();
            }
            $.sm.send("submit.word", data);
            break;
          case "lemgram":
            $.sm.send("submit.lemgram", data);
            break;
          case "saldo":
            extendedSearch.setOneToken("saldo", value);
            $.sm.send("submit.cqp", data);
            break;
          case "cqp":
            advancedSearch.setCQP(value);
            $.sm.send("submit.cqp", data);
        }
      }
      tabs.each(function() {
        var idx;

        idx = e.getState(this.id, true);
        if (idx === null) {
          return;
        }
        return $(this).find(tab_a_selector).eq(idx).triggerHandler("change");
      });
      return $.bbq.prevFragment = $.deparam.fragment();
    };
    $(window).bind("hashchange", onHashChange);
    $(window).scroll(function() {
      return $("#sidebar").sidebar("updatePlacement");
    });
    $("#about").click(function() {
      if ($.bbq.getState("display") == null) {
        return $.bbq.pushState({
          display: "about"
        });
      } else {
        return $.bbq.removeState("display");
      }
    });
    $("#login").click(function() {
      if ($.bbq.getState("display") == null) {
        return $.bbq.pushState({
          display: "login"
        });
      } else {
        return $.bbq.removeState("display");
      }
    });
    $("#languages").radioList({
      change: function() {
        return $.bbq.pushState({
          lang: $(this).radioList("getSelected").data("mode")
        });
      },
      selected: settings.defaultLanguage
    }).vAlign();
    $("#sidebar").sidebar().sidebar("hide");
    $("#simple_text")[0].focus();
    $(document).click(function() {
      return $("#simple_text.ui-autocomplete-input").autocomplete("close");
    });
    view.initSearchOptions();
    onHashChange(null, true);
    $("body").animate({
      opacity: 1
    }, function() {
      return $(this).css("opacity", "");
    });
    return initTimeGraph();
  }), function() {
    c.log("failed to load some resource at startup.", arguments);
    return $("body").css({
      opacity: 1,
      padding: 20
    }).html('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">').append("<p>The server failed to respond, please try again later.</p>");
  });

  window.getAllCorporaInFolders = function(lastLevel, folderOrCorpus) {
    var leftPart, outCorpora, posOfPeriod, rightPart;

    outCorpora = [];
    while (__indexOf.call(folderOrCorpus, ".") >= 0) {
      posOfPeriod = _.indexOf(folderOrCorpus, ".");
      leftPart = folderOrCorpus.substr(0, posOfPeriod);
      rightPart = folderOrCorpus.substr(posOfPeriod + 1);
      if (lastLevel[leftPart]) {
        lastLevel = lastLevel[leftPart];
        folderOrCorpus = rightPart;
      } else {
        break;
      }
    }
    if (lastLevel[folderOrCorpus]) {
      $.each(lastLevel[folderOrCorpus], function(key, val) {
        if (key !== "title" && key !== "contents" && key !== "description") {
          return outCorpora.extend(getAllCorporaInFolders(lastLevel[folderOrCorpus], key));
        }
      });
      outCorpora.extend(lastLevel[folderOrCorpus]["contents"]);
    } else {
      outCorpora.push(folderOrCorpus);
    }
    return outCorpora;
  };

  initTimeGraph = function() {
    var all_timestruct, getValByDate, onTimeGraphChange, opendfd, restdata, restyear, time_comb, timestruct;

    timestruct = null;
    all_timestruct = null;
    restdata = null;
    restyear = null;
    time_comb = timeProxy.makeRequest(true);
    onTimeGraphChange = function() {};
    getValByDate = function(date, struct) {
      var output;

      output = null;
      $.each(struct, function(i, item) {
        if (date === item[0]) {
          output = item[1];
          return false;
        }
      });
      return output;
    };
    window.timeDeferred = timeProxy.makeRequest(false).done(function(data) {
      c.log("write time");
      return $.each(data, function(corpus, struct) {
        var cor;

        if (corpus !== "time") {
          cor = settings.corpora[corpus.toLowerCase()];
          timeProxy.expandTimeStruct(struct);
          cor.non_time = struct[""];
          struct = _.omit(struct, "");
          cor.time = struct;
          if (_.keys(struct).length > 1) {
            return cor.struct_attributes.date_interval = {
              label: "date_interval",
              displayType: "date_interval",
              opts: settings.liteOptions
            };
          }
        }
      });
    });
    $.when(time_comb, timeDeferred).then(function(combdata, timedata) {
      all_timestruct = combdata[0];
      onTimeGraphChange = function(evt, data) {
        var endyear, max, normalize, one_px, output, plot, plots, yeardiff;

        one_px = max / 46;
        normalize = function(array) {
          return _.map(array, function(item) {
            var out;

            out = [].concat(item);
            if (out[1] < one_px && out[1] > 0) {
              out[1] = one_px;
            }
            return out;
          });
        };
        output = _(settings.corpusListing.selected).pluck("time").filter(Boolean).map(_.pairs).flatten(true).reduce(function(memo, _arg) {
          var a, b;

          a = _arg[0], b = _arg[1];
          if (typeof memo[a] === "undefined") {
            memo[a] = b;
          } else {
            memo[a] += b;
          }
          return memo;
        }, {});
        max = _.reduce(all_timestruct, function(accu, item) {
          if (item[1] > accu) {
            return item[1];
          }
          return accu;
        }, 0);
        timestruct = timeProxy.compilePlotArray(output);
        endyear = all_timestruct.slice(-1)[0][0];
        yeardiff = endyear - all_timestruct[0][0];
        restyear = endyear + (yeardiff / 25);
        restdata = _(settings.corpusListing.selected).filter(function(item) {
          return item.time;
        }).reduce(function(accu, corp) {
          return accu + parseInt(corp.non_time || "0");
        }, 0);
        plots = [
          {
            data: normalize([].concat(all_timestruct, [[restyear, combdata[1]]])),
            bars: {
              fillColor: "lightgrey"
            }
          }, {
            data: normalize(timestruct),
            bars: {
              fillColor: "navy"
            }
          }
        ];
        if (restdata) {
          plots.push({
            data: normalize([[restyear, restdata]]),
            bars: {
              fillColor: "indianred"
            }
          });
        }
        plot = $.plot($("#time_graph"), plots, {
          bars: {
            show: true,
            fill: 1,
            align: "center"
          },
          grid: {
            hoverable: true,
            borderColor: "white"
          },
          yaxis: {
            show: false
          },
          xaxis: {
            show: true
          },
          hoverable: true,
          colors: ["lightgrey", "navy"]
        });
        return $.each($("#time_graph .tickLabel"), function() {
          if (parseInt($(this).text()) > new Date().getFullYear()) {
            return $(this).hide();
          }
        });
      };
      return $("#time_graph,#rest_time_graph").bind("plothover", _.throttle(function(event, pos, item) {
        var date, firstrow, header, pTmpl, secondrow, time, total, val;

        if (item) {
          date = item.datapoint[0];
          header = $("<h4>");
          if (date === restyear) {
            header.text(util.getLocaleString("corpselector_rest_time"));
            val = restdata;
            total = combdata[1];
          } else {
            header.text(util.getLocaleString("corpselector_time") + " " + item.datapoint[0]);
            val = getValByDate(date, timestruct);
            total = getValByDate(date, all_timestruct);
          }
          c.log("output", timestruct[item.datapoint[0].toString()]);
          pTmpl = _.template("<p><span rel='localize[<%= loc %>]'></span>: <%= num %> <span rel='localize[corpselector_tokens]' </p>");
          firstrow = pTmpl({
            loc: "corpselector_time_chosen",
            num: prettyNumbers(val || 0)
          });
          secondrow = pTmpl({
            loc: "corpselector_of_total",
            num: prettyNumbers(total)
          });
          time = item.datapoint[0];
          $(".corpusInfoSpace").css({
            top: $(this).parent().offset().top
          });
          return $(".corpusInfoSpace").find("p").empty().append(header, "<span> </span>", firstrow, secondrow).localize().end().fadeIn("fast");
        } else {
          return $(".corpusInfoSpace").fadeOut("fast");
        }
      }, 100));
    });
    opendfd = $.Deferred();
    $("#corpusbox").one("corpuschooseropen", function() {
      return opendfd.resolve();
    });
    return $.when(time_comb, time, opendfd).then(function() {
      $("#corpusbox").bind("corpuschooserchange", onTimeGraphChange);
      return onTimeGraphChange();
    });
  };

}).call(this);
