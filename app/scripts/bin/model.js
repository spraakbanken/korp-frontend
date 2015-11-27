(function() {
  "use strict";
  var BaseProxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.model = {};

  model.getAuthorizationHeader = function() {
    if (typeof authenticationProxy !== "undefined" && !$.isEmptyObject(authenticationProxy.loginObj)) {
      return {
        "Authorization": "Basic " + authenticationProxy.loginObj.auth
      };
    } else {
      return {};
    }
  };

  BaseProxy = (function() {
    function BaseProxy() {
      this.prev = "";
      this.progress = 0;
      this.total;
      this.total_results = 0;
      this.pendingRequests = [];
    }

    BaseProxy.prototype.expandCQP = function(cqp) {
      var e;
      try {
        return CQP.expandOperators(cqp);
      } catch (_error) {
        e = _error;
        c.warn("CQP expansion failed", cqp);
        return cqp;
      }
    };

    BaseProxy.prototype.makeRequest = function() {
      this.abort();
      this.prev = "";
      this.progress = 0;
      this.total_results = 0;
      return this.total = null;
    };

    BaseProxy.prototype.abort = function() {
      if (this.pendingRequests.length) {
        return _.invoke(this.pendingRequests, "abort");
      }
    };

    BaseProxy.prototype.hasPending = function() {
      return _.any(_.map(this.pendingRequests, function(req) {
        return req.readyState !== 4 && req.readyState !== 0;
      }));
    };

    BaseProxy.prototype.parseJSON = function(data) {
      var e, json, out;
      try {
        json = data;
        if (json[0] !== "{") {
          json = "{" + json;
        }
        if (json.match(/,\s*$/)) {
          json = json.replace(/,\s*$/, "") + "}";
        }
        out = JSON.parse(json);
        return out;
      } catch (_error) {
        e = _error;
        return JSON.parse(data);
      }
    };

    BaseProxy.prototype.addAuthorizationHeader = function(req) {
      var pairs;
      pairs = _.pairs(model.getAuthorizationHeader());
      if (pairs.length) {
        return req.setRequestHeader.apply(req, pairs[0]);
      }
    };

    BaseProxy.prototype.calcProgress = function(e) {
      var newText, ref, stats, struct;
      newText = e.target.responseText.slice(this.prev.length);
      struct = {};
      try {
        struct = this.parseJSON(newText);
      } catch (_error) {}
      $.each(struct, (function(_this) {
        return function(key, val) {
          var currentCorpus, sum;
          if (key !== "progress_corpora" && key.split("_")[0] === "progress") {
            currentCorpus = val.corpus || val;
            sum = _(currentCorpus.split("|")).map(function(corpus) {
              return Number(settings.corpora[corpus.toLowerCase()].info.Size);
            }).reduce(function(a, b) {
              return a + b;
            }, 0);
            _this.progress += sum;
            return _this.total_results += parseInt(val.hits);
          }
        };
      })(this));
      stats = (this.progress / this.total) * 100;
      if ((this.total == null) && ((ref = struct.progress_corpora) != null ? ref.length : void 0)) {
        this.total = $.reduce($.map(struct["progress_corpora"], function(corpus) {
          if (!corpus.length) {
            return;
          }
          return _(corpus.split("|")).map(function(corpus) {
            return parseInt(settings.corpora[corpus.toLowerCase()].info.Size);
          }).reduce(function(a, b) {
            return a + b;
          }, 0);
        }), function(val1, val2) {
          return val1 + val2;
        }, 0);
      }
      this.prev = e.target.responseText;
      return {
        struct: struct,
        stats: stats,
        total_results: this.total_results
      };
    };

    return BaseProxy;

  })();

  model.KWICProxy = (function(superClass) {
    extend(KWICProxy, superClass);

    function KWICProxy() {
      KWICProxy.__super__.constructor.call(this);
      this.prevRequest = null;
      this.queryData = null;
      this.prevAjaxParams = null;
      this.foundKwic = false;
    }

    KWICProxy.prototype.popXhr = function(xhr) {
      var i;
      i = $.inArray(this.pendingRequests, xhr);
      if (i !== -1) {
        return this.pendingRequests.pop(i);
      }
    };

    KWICProxy.prototype.makeRequest = function(options, page, progressCallback, kwicCallback) {
      var corpus, data, def, j, key, len, o, ref, ref1, ref2, self, val;
      c.log("kwicproxy.makeRequest", options, page, kwicResults.getPageInterval(Number(page)));
      self = this;
      this.foundKwic = false;
      KWICProxy.__super__.makeRequest.call(this);
      kwicCallback = kwicCallback || $.proxy(kwicResults.renderResult, kwicResults);
      self.progress = 0;
      o = $.extend({
        queryData: null,
        progress: function(data, e) {
          var progressObj;
          progressObj = self.calcProgress(e);
          if (progressObj == null) {
            return;
          }
          progressCallback(progressObj);
          if (progressObj["struct"].kwic) {
            c.log("found kwic!");
            this.foundKwic = true;
            return kwicCallback(progressObj["struct"]);
          }
        }
      }, options);
      _.extend(options.ajaxParams, settings.corpusListing.getWithinParameters());
      data = {
        command: "query",
        defaultcontext: settings.defaultOverviewContext,
        show: [],
        show_struct: [],
        cache: true
      };
      $.extend(data, kwicResults.getPageInterval(page), o.ajaxParams);
      ref = settings.corpusListing.selected;
      for (j = 0, len = ref.length; j < len; j++) {
        corpus = ref[j];
        ref1 = corpus.within;
        for (key in ref1) {
          val = ref1[key];
          data.show.push(_.last(key.split(" ")));
        }
        ref2 = corpus.attributes;
        for (key in ref2) {
          val = ref2[key];
          data.show.push(key);
        }
        if (corpus.struct_attributes != null) {
          $.each(corpus.struct_attributes, function(key, val) {
            if ($.inArray(key, data.show_struct) === -1) {
              return data.show_struct.push(key);
            }
          });
        }
      }
      if (data.cqp) {
        data.cqp = this.expandCQP(data.cqp);
      }
      this.prevCQP = data.cqp;
      data.show = (_.uniq(["sentence"].concat(data.show))).join(",");
      c.log("data.show", data.show);
      data.show_struct = (_.uniq(data.show_struct)).join(",");
      this.prevRequest = data;
      this.prevMisc = {
        "hitsPerPage": $("#num_hits").val()
      };
      this.prevParams = data;
      def = $.ajax({
        url: settings.cgi_script,
        data: data,
        beforeSend: function(req, settings) {
          self.prevRequest = settings;
          self.addAuthorizationHeader(req);
          return self.prevUrl = this.url;
        },
        success: function(data, status, jqxhr) {
          c.log("jqxhr", this);
          self.queryData = data.querydata;
          if (data.incremental === false || !this.foundKwic) {
            return kwicCallback(data);
          }
        },
        progress: o.progress
      });
      this.pendingRequests.push(def);
      return def;
    };

    return KWICProxy;

  })(BaseProxy);

  model.LemgramProxy = (function(superClass) {
    extend(LemgramProxy, superClass);

    function LemgramProxy() {
      LemgramProxy.__super__.constructor.call(this);
    }

    LemgramProxy.prototype.makeRequest = function(word, type, callback) {
      var def, params, self;
      LemgramProxy.__super__.makeRequest.call(this);
      self = this;
      params = {
        command: "relations",
        word: word,
        corpus: settings.corpusListing.stringifySelected(),
        incremental: $.support.ajaxProgress,
        type: type,
        cache: true
      };
      this.prevParams = params;
      def = $.ajax({
        url: settings.cgi_script,
        data: params,
        success: function(data) {
          c.log("relations success", data);
          return self.prevRequest = params;
        },
        progress: function(data, e) {
          var progressObj;
          progressObj = self.calcProgress(e);
          if (progressObj == null) {
            return;
          }
          return callback(progressObj);
        },
        beforeSend: function(req, settings) {
          self.prevRequest = settings;
          self.addAuthorizationHeader(req);
          return self.prevUrl = this.url;
        }
      });
      this.pendingRequests.push(def);
      return def;
    };

    LemgramProxy.prototype.karpSearch = function(word, sw_forms) {
      var deferred;
      deferred = $.Deferred((function(_this) {
        return function(dfd) {
          return _this.pendingRequests.push($.ajax({
            url: "http://spraakbanken.gu.se/ws/karp-sok",
            data: {
              wf: word,
              resource: settings.corpusListing.getMorphology(),
              format: "json",
              "sms-forms": false,
              "sw-forms": sw_forms
            },
            success: function(data, textStatus, xhr) {
              var div, output;
              if (Number(data.count) === 0) {
                dfd.reject();
                return;
              }
              c.log("karp success", data, sw_forms);
              div = ($.isPlainObject(data.div) ? [data.div] : data.div);
              output = $.map(div.slice(0, Number(data.count)), function(item) {
                item = util.convertLMFFeatsToObjects(item);
                return item.LexicalEntry.Lemma.FormRepresentation.feat_lemgram;
              });
              return dfd.resolve(output, textStatus, xhr);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              c.log("karp error", jqXHR, textStatus, errorThrown);
              return dfd.reject();
            }
          }));
        };
      })(this)).promise();
      return deferred;
    };

    LemgramProxy.prototype.saldoSearch = function(word, sw_forms) {
      var dfd;
      dfd = $.Deferred();
      this.karpSearch(word, sw_forms).done(function(lemgramArray) {
        return $.ajax({
          url: "http://spraakbanken.gu.se/ws/karp-sok",
          data: {
            lemgram: lemgramArray.join("|"),
            resource: "saldo",
            format: "json"
          }
        }).done(function(data, textStatus, xhr) {
          var div, output;
          if (data.count === 0) {
            dfd.reject();
            c.log("saldo search 0 results");
            return;
          }
          div = ($.isPlainObject(data.div) ? [data.div] : data.div);
          output = $.map(div.slice(0, Number(data.count)), function(item) {
            var sense;
            sense = item.LexicalEntry.Sense;
            if (!$.isArray(sense)) {
              sense = [sense];
            }
            return _.map(sense, function(item) {
              return item.id;
            });
          });
          c.log("saldoSearch results", output);
          return dfd.resolve(output, textStatus, xhr);
        }).fail(function() {
          c.log("saldo search failed");
          return dfd.reject();
        });
      });
      return dfd;
    };

    LemgramProxy.prototype.lemgramCount = function(lemgrams, findPrefix, findSuffix) {
      var count, self;
      self = this;
      count = $.grep(["lemgram", (findPrefix ? "prefix" : ""), (findSuffix ? "suffix" : "")], Boolean);
      return $.ajax({
        url: settings.cgi_script,
        data: {
          command: "lemgram_count",
          lemgram: lemgrams,
          count: count.join(","),
          corpus: settings.corpusListing.stringifySelected()
        },
        beforeSend: function(req) {
          return self.addAuthorizationHeader(req);
        },
        method: "POST"
      });
    };

    LemgramProxy.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix) {
      return $.format("[(lex contains \"%s\")%s%s]", [lemgram, this.buildAffixQuery(searchPrefix, "prefix", lemgram), this.buildAffixQuery(searchSuffix, "suffix", lemgram)]);
    };

    LemgramProxy.prototype.buildAffixQuery = function(isValid, key, value) {
      if (!isValid) {
        return "";
      }
      return $.format("| (%s contains \"%s\")", [key, value]);
    };

    return LemgramProxy;

  })(BaseProxy);

  model.StatsProxy = (function(superClass) {
    extend(StatsProxy, superClass);

    function StatsProxy() {
      StatsProxy.__super__.constructor.call(this);
      this.prevRequest = null;
      this.prevParams = null;
      this.currentPage = 0;
      this.page_incr = 25;
    }

    StatsProxy.prototype.processData = function(def, data, reduceVals, reduceValLabels, ignoreCase) {
      var columns, corpus, corpusData, dataset, groups, j, len, minWidth, newAbsolute, newRelative, reduceVal, reduceValLabel, ref, ref1, ref2, sizeOfDataset, statsWorker, summarizedData, wordArray;
      minWidth = 100;
      columns = [];
      ref = _.zip(reduceVals, reduceValLabels);
      for (j = 0, len = ref.length; j < len; j++) {
        ref1 = ref[j], reduceVal = ref1[0], reduceValLabel = ref1[1];
        columns.push({
          id: reduceVal,
          name: reduceValLabel,
          field: "hit_value",
          sortable: true,
          formatter: settings.reduce_statistics(reduceVals, ignoreCase),
          minWidth: minWidth,
          cssClass: "parameter-column",
          headerCssClass: "localized-header"
        });
      }
      columns.push({
        id: "pieChart",
        name: "",
        field: "hit_value",
        sortable: false,
        formatter: settings.reduce_statistics_pie_chart,
        maxWidth: 25,
        minWidth: 25
      });
      columns.push({
        id: "total",
        name: "stats_total",
        field: "total_value",
        sortable: true,
        formatter: this.valueFormatter,
        minWidth: minWidth,
        headerCssClass: "localized-header"
      });
      $.each(_.keys(data.corpora).sort(), (function(_this) {
        return function(i, corpus) {
          return columns.push({
            id: corpus,
            name: settings.corpora[corpus.toLowerCase()].title,
            field: corpus + "_value",
            sortable: true,
            formatter: _this.valueFormatter,
            minWidth: minWidth
          });
        };
      })(this));
      groups = _.groupBy(_.keys(data.total.absolute), function(item) {
        return item.replace(/:\d+/g, "");
      });
      wordArray = _.keys(groups);
      sizeOfDataset = wordArray.length;
      dataset = new Array(sizeOfDataset + 1);
      summarizedData = {};
      ref2 = data.corpora;
      for (corpus in ref2) {
        corpusData = ref2[corpus];
        newAbsolute = _.reduce(corpusData.absolute, (function(result, value, key) {
          var currentValue, newKey;
          newKey = key.replace(/:\d+/g, "");
          currentValue = result[newKey] || 0;
          result[newKey] = currentValue + value;
          return result;
        }), {});
        newRelative = _.reduce(corpusData.relative, (function(result, value, key) {
          var currentValue, newKey;
          newKey = key.replace(/:\d+/g, "");
          currentValue = result[newKey] || 0;
          result[newKey] = currentValue + value;
          return result;
        }), {});
        summarizedData[corpus] = {
          absolute: newAbsolute,
          relative: newRelative
        };
      }
      statsWorker = new Worker("scripts/statistics_worker.js");
      statsWorker.onmessage = function(e) {
        c.log("Called back by the worker!\n");
        c.log(e);
        return def.resolve([data, wordArray, columns, e.data, summarizedData]);
      };
      return statsWorker.postMessage({
        "total": data.total,
        "dataset": dataset,
        "allrows": wordArray,
        "corpora": data.corpora,
        "groups": groups,
        loc: {
          'sv': "sv-SE",
          'en': "gb-EN"
        }[$("body").scope().lang]
      });
    };

    StatsProxy.prototype.makeParameters = function(reduceVals, cqp) {
      var parameters;
      parameters = {
        command: "count",
        groupby: reduceVals.join(','),
        cqp: this.expandCQP(cqp),
        corpus: settings.corpusListing.stringifySelected(true),
        incremental: $.support.ajaxProgress
      };
      _.extend(parameters, settings.corpusListing.getWithinParameters());
      return parameters;
    };

    StatsProxy.prototype.makeRequest = function(cqp, callback) {
      var data, def, ignoreCase, reduceValLabels, reduceVals, reduceval, self;
      self = this;
      StatsProxy.__super__.makeRequest.call(this);
      reduceval = search().stats_reduce || "word";
      ignoreCase = false;
      if (reduceval === "word_insensitive") {
        ignoreCase = true;
        reduceval = "word";
      }
      reduceVals = reduceval.split(",");
      reduceValLabels = _.map(reduceVals, function(reduceVal) {
        if (reduceVal === "word") {
          return "word";
        }
        if (settings.corpusListing.getCurrentAttributes()[reduceVal]) {
          return settings.corpusListing.getCurrentAttributes()[reduceVal].label;
        } else {
          return settings.corpusListing.getStructAttrs()[reduceVal].label;
        }
      });
      data = this.makeParameters(reduceVals, cqp);
      data.split = _.filter(reduceVals, function(reduceVal) {
        var ref;
        return ((ref = settings.corpusListing.getCurrentAttributes()[reduceVal]) != null ? ref.type : void 0) === "set";
      }).join(',');
      if (ignoreCase) {
        $.extend(data, {
          ignore_case: "word"
        });
      }
      this.prevNonExpandedCQP = cqp;
      this.prevParams = data;
      def = $.Deferred();
      this.pendingRequests.push($.ajax({
        url: settings.cgi_script,
        data: data,
        beforeSend: function(req, settings) {
          self.prevRequest = settings;
          self.addAuthorizationHeader(req);
          return self.prevUrl = this.url;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          c.log("gettings stats error, status: " + textStatus);
          return def.reject(textStatus, errorThrown);
        },
        progress: function(data, e) {
          var progressObj;
          progressObj = self.calcProgress(e);
          if (progressObj == null) {
            return;
          }
          return typeof callback === "function" ? callback(progressObj) : void 0;
        },
        success: (function(_this) {
          return function(data) {
            if (data.ERROR != null) {
              c.log("gettings stats failed with error", data.ERROR);
              def.reject(data);
              return;
            }
            return _this.processData(def, data, reduceVals, reduceValLabels, ignoreCase);
          };
        })(this)
      }));
      return def.promise();
    };

    StatsProxy.prototype.valueFormatter = function(row, cell, value, columnDef, dataContext) {
      return dataContext[columnDef.id + "_display"];
    };

    return StatsProxy;

  })(BaseProxy);

  model.NameProxy = (function(superClass) {
    extend(NameProxy, superClass);

    function NameProxy() {
      NameProxy.__super__.constructor.call(this);
    }

    NameProxy.prototype.makeParameters = function(reduceVal, cqp) {
      var parameters;
      parameters = NameProxy.__super__.makeParameters.call(this, ["word"], cqp);
      parameters.cqp2 = "[pos='PM']";
      return parameters;
    };

    NameProxy.prototype.processData = function(def, data, reduceval) {
      return def.resolve(data);
    };

    return NameProxy;

  })(model.StatsProxy);

  model.AuthenticationProxy = (function() {
    function AuthenticationProxy() {
      this.loginObj = {};
    }

    AuthenticationProxy.prototype.makeRequest = function(usr, pass) {
      var auth, dfd, self;
      c.log("makeRequest: (usr, pass", usr, pass);
      self = this;
      if (window.btoa) {
        auth = window.btoa(usr + ":" + pass);
      } else {
        throw "window.btoa is undefined";
      }
      dfd = $.Deferred();
      $.ajax({
        url: settings.cgi_script,
        type: "GET",
        data: {
          command: "authenticate"
        },
        beforeSend: function(req) {
          return req.setRequestHeader("Authorization", "Basic " + auth);
        }
      }).done(function(data, status, xhr) {
        c.log("auth done", arguments);
        if (!data.corpora) {
          dfd.reject();
          return;
        }
        self.loginObj = {
          name: usr,
          credentials: data.corpora,
          auth: auth
        };
        $.jStorage.set("creds", self.loginObj);
        return dfd.resolve(data);
      }).fail(function(xhr, status, error) {
        c.log("auth fail", arguments);
        return dfd.reject();
      });
      return dfd;
    };

    AuthenticationProxy.prototype.hasCred = function(corpusId) {
      var ref;
      if (!this.loginObj.credentials) {
        return false;
      }
      return ref = corpusId.toUpperCase(), indexOf.call(this.loginObj.credentials, ref) >= 0;
    };

    return AuthenticationProxy;

  })();

  model.TimeProxy = (function(superClass) {
    extend(TimeProxy, superClass);

    function TimeProxy() {}

    TimeProxy.prototype.makeRequest = function() {
      var dfd, xhr;
      dfd = $.Deferred();
      xhr = $.ajax({
        url: settings.cgi_script,
        type: "GET",
        data: {
          command: "timespan",
          granularity: "y",
          corpus: settings.corpusListing.stringifyAll()
        }
      });
      xhr.done((function(_this) {
        return function(data, status, xhr) {
          var combined, rest;
          c.log("timespan done", data);
          if (data.ERROR) {
            c.error("timespan error", data.ERROR);
            dfd.reject(data.ERROR);
            return;
          }
          rest = data.combined[""];
          delete data.combined[""];
          _this.expandTimeStruct(data.combined);
          combined = _this.compilePlotArray(data.combined);
          if (_.keys(data).length < 2 || data.ERROR) {
            dfd.reject();
            return;
          }
          return dfd.resolve([data.corpora, combined, rest]);
        };
      })(this));
      xhr.fail(function() {
        c.log("timeProxy.makeRequest failed", arguments);
        return dfd.reject();
      });
      return dfd;
    };

    TimeProxy.prototype.compilePlotArray = function(dataStruct) {
      var output;
      output = [];
      $.each(dataStruct, function(key, val) {
        if (!key || !val) {
          return;
        }
        return output.push([parseInt(key), val]);
      });
      output = output.sort(function(a, b) {
        return a[0] - b[0];
      });
      return output;
    };

    TimeProxy.prototype.expandTimeStruct = function(struct) {
      var j, maxYear, minYear, prevVal, ref, ref1, results, thisVal, y, years;
      years = _.map(_.pairs(_.omit(struct, "")), function(item) {
        return Number(item[0]);
      });
      if (!years.length) {
        return;
      }
      minYear = _.min(years);
      maxYear = _.max(years);
      if (_.isNaN(maxYear) || _.isNaN(minYear)) {
        c.log("expandTimestruct broken, years:", years);
        return;
      }
      results = [];
      for (y = j = ref = minYear, ref1 = maxYear; ref <= ref1 ? j <= ref1 : j >= ref1; y = ref <= ref1 ? ++j : --j) {
        thisVal = struct[y];
        if (typeof thisVal === "undefined") {
          results.push(struct[y] = prevVal);
        } else {
          results.push(prevVal = thisVal);
        }
      }
      return results;
    };

    return TimeProxy;

  })(BaseProxy);

  model.GraphProxy = (function(superClass) {
    extend(GraphProxy, superClass);

    function GraphProxy() {
      GraphProxy.__super__.constructor.call(this);
      this.prevParams = null;
    }

    GraphProxy.prototype.expandSubCqps = function(subArray) {
      var array, cqp, i, j, p, padding, ref, results;
      padding = _.map((function() {
        results = [];
        for (var j = 0, ref = subArray.length.toString().length; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this), function() {
        return "0";
      });
      array = (function() {
        var k, len, results1;
        results1 = [];
        for (i = k = 0, len = subArray.length; k < len; i = ++k) {
          cqp = subArray[i];
          p = padding.slice(i.toString().length).join("");
          results1.push(["subcqp" + p + i, cqp]);
        }
        return results1;
      })();
      return _.object(array);
    };

    GraphProxy.prototype.makeRequest = function(cqp, subcqps, corpora, from, to) {
      var def, params, self;
      GraphProxy.__super__.makeRequest.call(this);
      self = this;
      params = {
        command: "count_time",
        cqp: this.expandCQP(cqp),
        corpus: corpora,
        granularity: this.granularity,
        incremental: $.support.ajaxProgress
      };
      if (from) {
        params.from = from;
      }
      if (to) {
        params.to = to;
      }
      _.extend(params, this.expandSubCqps(subcqps));
      this.prevParams = params;
      def = $.Deferred();
      $.ajax({
        url: settings.cgi_script,
        dataType: "json",
        data: params,
        beforeSend: (function(_this) {
          return function(req, settings) {
            _this.prevRequest = settings;
            _this.addAuthorizationHeader(req);
            return self.prevUrl = _this.url;
          };
        })(this),
        progress: (function(_this) {
          return function(data, e) {
            var progressObj;
            progressObj = _this.calcProgress(e);
            if (progressObj == null) {
              return;
            }
            return def.notify(progressObj);
          };
        })(this),
        error: function(jqXHR, textStatus, errorThrown) {
          return def.reject(textStatus);
        },
        success: function(data) {
          return def.resolve(data);
        }
      });
      return def.promise();
    };

    return GraphProxy;

  })(BaseProxy);

}).call(this);
