(function() {
  var creds, deferred_domReady, isDev, loc_dfd, t,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.authenticationProxy = new model.AuthenticationProxy();

  window.timeProxy = new model.TimeProxy();

  creds = $.jStorage.get("creds");

  if (creds) {
    authenticationProxy.loginObj = creds;
  }

  if (location.hash.length && location.hash[1] !== "?") {
    location.hash = "#?" + _.str.lstrip(location.hash, "#");
  }

  t = $.now();

  isDev = window.location.host === "localhost";

  $.ajaxSetup({
    dataType: "json",
    traditional: true
  });

  $.ajaxPrefilter("json", function(options, orig, jqXHR) {
    if (options.crossDomain && !$.support.cors) {
      return "jsonp";
    }
  });

  deferred_domReady = $.Deferred(function(dfd) {
    $(function() {
      var mode;
      mode = $.deparam.querystring().mode;
      if ((mode != null) && mode !== "default") {
        return $.getScript("modes/" + mode + "_mode.js").done(function() {
          return dfd.resolve();
        });
      } else {
        return dfd.resolve();
      }
    });
    return dfd;
  }).promise();

  loc_dfd = initLocales();

  $(document).keyup(function(event) {
    if (event.keyCode === 27) {
      if (typeof kwicResults !== "undefined" && kwicResults !== null) {
        kwicResults.abort();
      }
      if (typeof lemgramResults !== "undefined" && lemgramResults !== null) {
        lemgramResults.abort();
      }
      return typeof statsResults !== "undefined" && statsResults !== null ? statsResults.abort() : void 0;
    }
  });

  $.when(loc_dfd, deferred_domReady).then((function(loc_data) {
    var corpus, e, prevFragment, tab_a_selector;
    c.log("preloading done, t = ", $.now() - t);
    angular.bootstrap(document, ['korpApp']);
    try {
      corpus = search()["corpus"];
      if (corpus) {
        settings.corpusListing.select(corpus.split(","));
      }
      view.updateSearchHistory();
    } catch (_error) {
      e = _error;
      c.warn("ERROR setting corpora from location");
    }
    if (isLab) {
      $("body").addClass("lab");
    }
    $("body").addClass("mode-" + currentMode);
    util.browserWarn();
    $("#logo").click(function() {
      window.location = window.location.protocol + "//" + window.location.host + window.location.pathname + location.search;
      return false;
    });
    $("#cog_menu .follow_link").click(function() {
      return window.href = window.open($(this).attr("href"), $(this).attr("target") || "_self");
    });
    $("#search_history").change(function(event) {
      var target;
      c.log("select", $(this).find(":selected"));
      target = $(this).find(":selected");
      if (_.str.contains(target.val(), "http://")) {
        return location.href = target.val();
      } else if (target.is(".clear")) {
        c.log("empty searches");
        $.jStorage.set("searches", []);
        return view.updateSearchHistory();
      }
    });
    creds = $.jStorage.get("creds");
    if (creds) {
      util.setLogin();
    }
    tab_a_selector = "ul .ui-tabs-anchor";
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
    prevFragment = {};
    window.onHashChange = function(event, isInit) {
      var display, hasChanged, newLang;
      c.log("onHashChange");
      hasChanged = function(key) {
        return prevFragment[key] !== search()[key];
      };
      if (hasChanged("lang")) {
        newLang = search().lang || settings.defaultLanguage;
        $("body").scope().lang = newLang;
        window.lang = newLang;
        util.localize();
        $("#languages").radioList("select", newLang);
      }
      display = search().display;
      if (isInit) {
        util.localize();
      }
      return prevFragment = _.extend({}, search());
    };
    $(window).scroll(function() {
      return $("#sidebar").sidebar("updatePlacement");
    });
    $("#about").click(function() {
      if (search().display == null) {
        return search({
          display: "about"
        });
      } else {
        return search("about", null);
      }
    });
    $("#login").click(function() {
      if (search().display == null) {
        return search({
          display: "login"
        });
      } else {
        return search("login", null);
      }
    });
    $("#languages").radioList({
      change: function() {
        c.log("lang change", $(this).radioList("getSelected").data("mode"));
        return search({
          lang: $(this).radioList("getSelected").data("mode")
        });
      },
      selected: settings.defaultLanguage
    });
    $("#sidebar").sidebar();
    $(document).click(function() {
      return $("#simple_text.ui-autocomplete-input").autocomplete("close");
    });
    setTimeout(function() {
      view.initSearchOptions();
      return onHashChange(null, true);
    }, 0);
    return $("body").animate({
      opacity: 1
    }, function() {
      return $(this).css("opacity", "");
    });
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
    while (indexOf.call(folderOrCorpus, ".") >= 0) {
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
          return outCorpora = outCorpora.concat(getAllCorporaInFolders(lastLevel[folderOrCorpus], key));
        }
      });
      outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["contents"]);
    } else {
      outCorpora.push(folderOrCorpus);
    }
    return outCorpora;
  };

  window.initTimeGraph = function(def) {
    var all_timestruct, getValByDate, hasRest, onTimeGraphChange, opendfd, restdata, restyear, timestruct;
    timestruct = null;
    all_timestruct = null;
    restdata = null;
    restyear = null;
    hasRest = false;
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
    window.timeDeferred = timeProxy.makeRequest().fail(function(error) {
      return $("#time_graph").html("<i>Could not draw graph due to a backend error.</i>");
    }).done(function(arg) {
      var all_timestruct, cor, corpus, dataByCorpus, rest, struct;
      dataByCorpus = arg[0], all_timestruct = arg[1], rest = arg[2];
      for (corpus in dataByCorpus) {
        struct = dataByCorpus[corpus];
        if (corpus !== "time") {
          cor = settings.corpora[corpus.toLowerCase()];
          timeProxy.expandTimeStruct(struct);
          cor.non_time = struct[""];
          struct = _.omit(struct, "");
          cor.time = struct;
          if (_.keys(struct).length > 1) {
            if (cor.common_attributes == null) {
              cor.common_attributes = {};
            }
            cor.common_attributes.date_interval = true;
          }
        }
      }
      safeApply($("body").scope(), function(scope) {
        return def.resolve();
      });
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
        output = _(settings.corpusListing.selected).pluck("time").filter(Boolean).map(_.pairs).flatten(true).reduce(function(memo, arg1) {
          var a, b;
          a = arg1[0], b = arg1[1];
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
        hasRest = yeardiff > 0;
        plots = [
          {
            data: normalize([].concat(all_timestruct, [[restyear, rest]])),
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
            show: true,
            tickDecimals: 0
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
          if (date === restyear && hasRest) {
            header.text(util.getLocaleString("corpselector_rest_time"));
            val = restdata;
            total = rest;
          } else {
            header.text(util.getLocaleString("corpselector_time") + " " + item.datapoint[0]);
            val = getValByDate(date, timestruct);
            total = getValByDate(date, all_timestruct);
          }
          pTmpl = _.template("<p><span rel='localize[<%= loc %>]'></span>: <%= num %> <span rel='localize[corpselector_tokens]' </p>");
          firstrow = pTmpl({
            loc: "corpselector_time_chosen",
            num: util.prettyNumbers(val || 0)
          });
          secondrow = pTmpl({
            loc: "corpselector_of_total",
            num: util.prettyNumbers(total)
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
    return $.when(timeDeferred, opendfd).then(function() {
      $("#corpusbox").bind("corpuschooserchange", onTimeGraphChange);
      return onTimeGraphChange();
    });
  };

}).call(this);
