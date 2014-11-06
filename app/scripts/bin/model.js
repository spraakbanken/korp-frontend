(function() {
  var BaseProxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      var newText, stats, struct, _ref;
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
      if ((this.total == null) && ((_ref = struct.progress_corpora) != null ? _ref.length : void 0)) {
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

  model.SearchProxy = (function(_super) {
    __extends(SearchProxy, _super);

    function SearchProxy() {}

    SearchProxy.prototype.relatedWordSearch = function(lemgram) {
      return $.ajax({
        url: "http://spraakbanken.gu.se/ws/saldo-ws/grel/json/" + lemgram,
        success: function(data) {
          var hasAnyFreq, lemgrams;
          c.log("related words success");
          lemgrams = [];
          $.each(data, function(i, item) {
            return lemgrams = lemgrams.concat(item.rel);
          });
          hasAnyFreq = false;
          return lemgramProxy.lemgramCount(lemgrams).done(function(freqs) {
            $.each(data, function(i, item) {
              return item.rel = $.grep(item.rel, function(lemgram) {
                if (freqs[lemgram]) {
                  hasAnyFreq = true;
                }
                return !!freqs[lemgram];
              });
            });
            if (hasAnyFreq) {
              return simpleSearch.renderSimilarHeader(lemgram, data);
            } else {
              return simpleSearch.removeSimilarHeader();
            }
          });
        }
      });
    };

    return SearchProxy;

  })(BaseProxy);

  model.KWICProxy = (function(_super) {
    __extends(KWICProxy, _super);

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
      var corpus, data, def, key, o, self, val, _i, _len, _ref, _ref1, _ref2;
      c.log("kwicproxy.makeRequest");
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
      data = {
        command: "query",
        defaultcontext: _.keys(settings.defaultContext)[0],
        defaultwithin: _.keys(settings.defaultWithin)[0],
        show: [],
        show_struct: [],
        incremental: $.support.ajaxProgress,
        cache: true
      };
      $.extend(data, kwicResults.getPageInterval(page), o.ajaxParams);
      _ref = settings.corpusListing.selected;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        corpus = _ref[_i];
        _ref1 = corpus.within;
        for (key in _ref1) {
          val = _ref1[key];
          data.show.push(key);
        }
        _ref2 = corpus.attributes;
        for (key in _ref2) {
          val = _ref2[key];
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
          return self.addAuthorizationHeader(req);
        },
        success: function(data, status, jqxhr) {
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

  model.LemgramProxy = (function(_super) {
    __extends(LemgramProxy, _super);

    function LemgramProxy() {
      LemgramProxy.__super__.constructor.call(this);
    }

    LemgramProxy.prototype.buildAffixQuery = function(isValid, key, value) {
      if (!isValid) {
        return "";
      }
      return $.format("| (%s contains \"%s\")", [key, value]);
    };

    LemgramProxy.prototype.lemgramSearch = function(lemgram, searchPrefix, searchSuffix) {
      var cqp;
      cqp = $.format("[(lex contains \"%s\")%s%s]", [lemgram, this.buildAffixQuery(searchPrefix, "prefix", lemgram), this.buildAffixQuery(searchSuffix, "suffix", lemgram)]);
      return cqp;
    };

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
          return self.addAuthorizationHeader(req);
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

    return LemgramProxy;

  })(BaseProxy);

  model.StatsProxy = (function(_super) {
    __extends(StatsProxy, _super);

    function StatsProxy() {
      StatsProxy.__super__.constructor.call(this);
      this.prevRequest = null;
      this.prevParams = null;
      this.currentPage = 0;
      this.page_incr = 25;
    }

    StatsProxy.prototype.makeRequest = function(cqp, callback) {
      var data, def, reduceval, self, _ref;
      self = this;
      StatsProxy.__super__.makeRequest.call(this);
      reduceval = search().stats_reduce || "word";
      if (reduceval === "word_insensitive") {
        reduceval = "word";
      }
      data = {
        command: "count",
        groupby: reduceval,
        cqp: cqp,
        corpus: settings.corpusListing.stringifySelected(true),
        incremental: $.support.ajaxProgress,
        defaultwithin: "sentence"
      };
      if (((_ref = settings.corpusListing.getCurrentAttributes()[reduceval]) != null ? _ref.type : void 0) === "set") {
        data.split = reduceval;
      }
      if ($("#reduceSelect select").val() === "word_insensitive") {
        $.extend(data, {
          ignore_case: "word"
        });
      }
      if ($(".within_select").val() !== settings.defaultWithin) {
        data.within = settings.corpusListing.getWithinQueryString();
      }
      this.prevParams = data;
      def = $.Deferred();
      this.pendingRequests.push($.ajax({
        url: settings.cgi_script,
        data: data,
        beforeSend: function(req, settings) {
          c.log("req", req);
          self.prevRequest = settings;
          return self.addAuthorizationHeader(req);
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
          return callback(progressObj);
        },
        success: function(data) {
          var add, columns, combinedWordArray, corpus, dataset, groups, i, minWidth, obj, row, totalRow, valueGetter, word, wordArray, wordGetter, _i, _len, _ref1, _ref2;
          if (data.ERROR != null) {
            c.log("gettings stats failed with error", $.dump(data.ERROR));
            def.reject(data);
            return;
          }
          minWidth = 100;
          columns = [
            {
              id: "hit",
              name: "stats_hit",
              field: "hit_value",
              sortable: true,
              formatter: settings.reduce_stringify(reduceval),
              minWidth: minWidth
            }, {
              id: "total",
              name: "stats_total",
              field: "total_value",
              sortable: true,
              formatter: self.valueFormatter,
              minWidth: minWidth
            }
          ];
          $.each(_.keys(data.corpora).sort(), function(i, corpus) {
            return columns.push({
              id: corpus,
              name: settings.corpora[corpus.toLowerCase()].title,
              field: corpus + "_value",
              sortable: true,
              formatter: self.valueFormatter,
              minWidth: minWidth
            });
          });
          totalRow = {
            id: "row_total",
            hit_value: "&Sigma;",
            total_value: data.total.sums
          };
          $.each(data.corpora, function(corpus, obj) {
            return totalRow[corpus + "_value"] = obj.sums;
          });
          wordArray = _.keys(data.total.absolute);
          valueGetter = function(obj, word) {
            return obj[word];
          };
          wordGetter = function(word) {
            return word;
          };
          if (reduceval === "lex" || reduceval === "saldo" || reduceval === "baseform") {
            groups = _.groupBy(wordArray, function(item) {
              return item.replace(/:\d+/g, "");
            });
            combinedWordArray = _.keys(groups);
            add = function(a, b) {
              return a + b;
            };
            valueGetter = function(obj, word) {
              return _.reduce(_.map(groups[word], function(wd) {
                return obj[wd];
              }), add);
            };
            wordGetter = function(word) {
              return groups[word];
            };
          }
          dataset = [totalRow];
          _ref1 = combinedWordArray || wordArray;
          for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            word = _ref1[i];
            row = {
              id: "row" + i,
              hit_value: wordGetter(word),
              total_value: {
                absolute: valueGetter(data.total.absolute, word),
                relative: valueGetter(data.total.relative, word)
              }
            };
            _ref2 = data.corpora;
            for (corpus in _ref2) {
              obj = _ref2[corpus];
              row[corpus + "_value"] = {
                absolute: valueGetter(obj.absolute, word),
                relative: valueGetter(obj.relative, word)
              };
            }
            dataset[i + 1] = row;
          }
          c.log("stats resolve");
          return def.resolve([data, wordArray, columns, dataset]);
        }
      }));
      return def.promise();
    };

    StatsProxy.prototype.valueFormatter = function(row, cell, value, columnDef, dataContext) {
      if (!value.relative && !value.absolute) {
        return "";
      }
      return "<span>\n      <span class='relStat'>" + (util.formatDecimalString(value.relative.toFixed(1), true)) + "</span>\n      <span class='absStat'>(" + (util.prettyNumbers(String(value.absolute))) + ")</span>\n<span>";
    };

    return StatsProxy;

  })(BaseProxy);

  model.AuthenticationProxy = (function() {
    function AuthenticationProxy() {
      this.loginObj = {};
    }

    AuthenticationProxy.prototype.makeRequest = function(usr, pass) {
      var auth, dfd, self;
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
      var _ref;
      if (!this.loginObj.credentials) {
        return false;
      }
      return _ref = corpusId.toUpperCase(), __indexOf.call(this.loginObj.credentials, _ref) >= 0;
    };

    return AuthenticationProxy;

  })();

  model.TimeProxy = (function(_super) {
    __extends(TimeProxy, _super);

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
      var maxYear, minYear, prevVal, thisVal, y, years, _i, _results;
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
      _results = [];
      for (y = _i = minYear; minYear <= maxYear ? _i <= maxYear : _i >= maxYear; y = minYear <= maxYear ? ++_i : --_i) {
        thisVal = struct[y];
        if (typeof thisVal === "undefined") {
          _results.push(struct[y] = prevVal);
        } else {
          _results.push(prevVal = thisVal);
        }
      }
      return _results;
    };

    return TimeProxy;

  })(BaseProxy);

  model.GraphProxy = (function(_super) {
    __extends(GraphProxy, _super);

    function GraphProxy() {
      GraphProxy.__super__.constructor.call(this);
      this.prevParams = null;
    }

    GraphProxy.prototype.expandSubCqps = function(subArray) {
      var array, cqp, i, p, padding, _i, _ref, _results;
      padding = _.map((function() {
        _results = [];
        for (var _i = 0, _ref = subArray.length.toString().length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), function() {
        return "0";
      });
      array = (function() {
        var _j, _len, _results1;
        _results1 = [];
        for (i = _j = 0, _len = subArray.length; _j < _len; i = ++_j) {
          cqp = subArray[i];
          p = padding.slice(i.toString().length).join("");
          _results1.push(["subcqp" + p + i, cqp]);
        }
        return _results1;
      })();
      return _.object(array);
    };

    GraphProxy.prototype.makeRequest = function(cqp, subcqps, corpora) {
      var def, params;
      GraphProxy.__super__.makeRequest.call(this);
      params = {
        command: "count_time",
        cqp: cqp,
        corpus: corpora,
        granularity: this.granularity,
        incremental: $.support.ajaxProgress
      };
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
            return _this.addAuthorizationHeader(req);
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

//# sourceMappingURL=model.js.map
