(function() {
  var added_corpora_ids,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.util = {};

  window.CorpusListing = (function() {
    function CorpusListing(corpora) {
      this.struct = corpora;
      this.corpora = _.values(corpora);
      this.selected = _.filter(this.corpora, function(corp) {
        return !corp.limited_access;
      });
    }

    CorpusListing.prototype.get = function(key) {
      return this.struct[key];
    };

    CorpusListing.prototype.list = function() {
      return this.corpora;
    };

    CorpusListing.prototype.map = function(func) {
      return _.map(this.corpora, func);
    };

    CorpusListing.prototype.subsetFactory = function(idArray) {
      var cl;
      idArray = _.invoke(idArray, "toLowerCase");
      cl = new CorpusListing(_.pick.apply(_, [this.struct].concat(slice.call(idArray))));
      cl.selected = cl.corpora;
      return cl;
    };

    CorpusListing.prototype.getSelectedCorpora = function() {
      return corpusChooserInstance.corpusChooser("selectedItems");
    };

    CorpusListing.prototype.select = function(idArray) {
      return this.selected = _.values(_.pick.apply(this, [this.struct].concat(idArray)));
    };

    CorpusListing.prototype.mapSelectedCorpora = function(f) {
      return _.map(this.selected, f);
    };

    CorpusListing.prototype._mapping_intersection = function(mappingArray) {
      return _.reduce(mappingArray, (function(a, b) {
        var keys_intersect, to_mergea, to_mergeb;
        keys_intersect = _.intersection(_.keys(a), _.keys(b));
        to_mergea = _.pick.apply(_, [a].concat(slice.call(keys_intersect)));
        to_mergeb = _.pick.apply(_, [b].concat(slice.call(keys_intersect)));
        return _.merge({}, to_mergea, to_mergeb);
      }) || {});
    };

    CorpusListing.prototype._mapping_union = function(mappingArray) {
      return _.reduce(mappingArray, (function(a, b) {
        return _.merge(a, b);
      }), {});
    };

    CorpusListing.prototype.getCurrentAttributes = function() {
      var attrs;
      attrs = this.mapSelectedCorpora(function(corpus) {
        return corpus.attributes;
      });
      return this._invalidateAttrs(attrs);
    };

    CorpusListing.prototype.getCurrentAttributesIntersection = function() {
      var attrs;
      attrs = this.mapSelectedCorpora(function(corpus) {
        return corpus.attributes;
      });
      return this._mapping_intersection(attrs);
    };

    CorpusListing.prototype.getStructAttrsIntersection = function() {
      var attrs;
      attrs = this.mapSelectedCorpora(function(corpus) {
        var key, ref, value;
        ref = corpus.struct_attributes;
        for (key in ref) {
          value = ref[key];
          value["isStructAttr"] = true;
        }
        return corpus.struct_attributes;
      });
      return this._mapping_intersection(attrs);
    };

    CorpusListing.prototype.getStructAttrs = function() {
      var attrs, rest, withDataset;
      attrs = this.mapSelectedCorpora(function(corpus) {
        var key, pos_attrs, ref, value;
        ref = corpus.struct_attributes;
        for (key in ref) {
          value = ref[key];
          value["isStructAttr"] = true;
        }
        pos_attrs = _.pick(corpus.attributes, function(val, key) {
          return val.isStructAttr;
        });
        return _.extend({}, pos_attrs, corpus.struct_attributes);
      });
      rest = this._invalidateAttrs(attrs);
      withDataset = _.filter(_.pairs(rest), function(item) {
        return item[1].dataset;
      });
      $.each(withDataset, function(i, item) {
        var key, val;
        key = item[0];
        val = item[1];
        return $.each(attrs, function(j, origStruct) {
          var ds, ref;
          if ((ref = origStruct[key]) != null ? ref.dataset : void 0) {
            ds = origStruct[key].dataset;
            if ($.isArray(ds)) {
              ds = _.object(ds, ds);
            }
            if (_.isArray(val.dataset)) {
              val.dataset = _.object(val.dataset, val.dataset);
            }
            return $.extend(val.dataset, ds);
          }
        });
      });
      return $.extend(rest, _.object(withDataset));
    };

    CorpusListing.prototype._invalidateAttrs = function(attrs) {
      var intersection, union;
      union = this._mapping_union(attrs);
      intersection = this._mapping_intersection(attrs);
      $.each(union, function(key, value) {
        if (intersection[key] == null) {
          return value["disabled"] = true;
        } else {
          return delete value["disabled"];
        }
      });
      return union;
    };

    CorpusListing.prototype.corpusHasAttrs = function(corpus, attrs) {
      var attr, k, len;
      for (k = 0, len = attrs.length; k < len; k++) {
        attr = attrs[k];
        if (!(attr === "word" || attr in $.extend({}, this.struct[corpus].attributes, this.struct[corpus].struct_attributes))) {
          return false;
        }
      }
      return true;
    };

    CorpusListing.prototype.stringifySelected = function() {
      return _(this.selected).pluck("id").invoke("toUpperCase").join(",");
    };

    CorpusListing.prototype.stringifyAll = function() {
      return _(this.corpora).pluck("id").invoke("toUpperCase").join(",");
    };

    CorpusListing.prototype.getWithinKeys = function() {
      var struct;
      struct = _.map(this.selected, function(corpus) {
        return _.keys(corpus.within);
      });
      return _.union.apply(_, struct);
    };

    CorpusListing.prototype.getContextQueryString = function(prefer, avoid) {
      var contexts, corpus, output;
      output = (function() {
        var k, len, ref, results;
        ref = this.selected;
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          corpus = ref[k];
          contexts = _.keys(corpus.context);
          if (indexOf.call(contexts, prefer) < 0) {
            if (contexts.length > 1 && indexOf.call(contexts, avoid) >= 0) {
              contexts.splice(contexts.indexOf(avoid), 1);
            }
            results.push(corpus.id.toUpperCase() + ":" + contexts[0]);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }).call(this);
      return _(output).compact().join();
    };

    CorpusListing.prototype.getWithinParameters = function() {
      var corpus, defaultWithin, output, within, withins;
      defaultWithin = search().within || _.keys(settings.defaultWithin)[0];
      output = (function() {
        var k, len, ref, results;
        ref = this.selected;
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          corpus = ref[k];
          withins = _.keys(corpus.within);
          if (indexOf.call(withins, defaultWithin) < 0) {
            results.push(corpus.id.toUpperCase() + ":" + withins[0]);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }).call(this);
      within = _(output).compact().join();
      return {
        defaultwithin: defaultWithin,
        within: within
      };
    };

    CorpusListing.prototype.getMorphology = function() {
      return _(this.selected).map(function(corpus) {
        var morf;
        morf = corpus.morf || "saldom";
        return morf.split("|");
      }).flatten().unique().join("|");
    };

    CorpusListing.prototype.getTimeInterval = function() {
      var all;
      all = _(this.selected).pluck("time").filter(function(item) {
        return item != null;
      }).map(_.keys).flatten().map(Number).sort(function(a, b) {
        return a - b;
      }).value();
      return [_.first(all), _.last(all)];
    };

    CorpusListing.prototype.getMomentInterval = function() {
      var from, froms, infoGetter, to, toUnix, tos;
      toUnix = function(item) {
        return item.unix();
      };
      infoGetter = (function(_this) {
        return function(prop) {
          return _(_this.selected).pluck("info").pluck(prop).compact().map(function(item) {
            return moment(item);
          }).value();
        };
      })(this);
      froms = infoGetter("FirstDate");
      tos = infoGetter("LastDate");
      if (!froms.length) {
        from = null;
      } else {
        from = _.min(froms, toUnix);
      }
      if (!tos.length) {
        to = null;
      } else {
        to = _.max(tos, toUnix);
      }
      return [from, to];
    };

    CorpusListing.prototype.getNonProtected = function() {
      return _.filter(this.corpora, function(item) {
        return !item.limited_access;
      });
    };

    CorpusListing.prototype.getTitle = function(corpus) {
      var e;
      try {
        return this.struct[corpus].title;
      } catch (_error) {
        e = _error;
        return c.log("gettitle broken", corpus);
      }
    };

    CorpusListing.prototype.getWordGroup = function(withCaseInsentive) {
      var word, wordInsensitive;
      word = {
        group: "word",
        value: "word",
        label: "word"
      };
      if (withCaseInsentive) {
        wordInsensitive = {
          group: "word",
          value: "word_insensitive",
          label: "word_insensitive"
        };
        return [word, wordInsensitive];
      } else {
        return [word];
      }
    };

    CorpusListing.prototype.getWordAttributeGroups = function(lang, setOperator) {
      var allAttrs, attrs, key, obj;
      if (setOperator === 'union') {
        allAttrs = this.getCurrentAttributes();
      } else {
        allAttrs = this.getCurrentAttributesIntersection();
      }
      attrs = (function() {
        var results;
        results = [];
        for (key in allAttrs) {
          obj = allAttrs[key];
          if (obj.displayType !== "hidden") {
            results.push(_.extend({
              group: "word_attr",
              value: key
            }, obj));
          }
        }
        return results;
      })();
      return attrs;
    };

    CorpusListing.prototype.getStructAttributeGroups = function(lang, setOperator) {
      var allAttrs, common, common_keys, key, obj, sentAttrs;
      if (setOperator === 'union') {
        allAttrs = this.getStructAttrs();
      } else {
        allAttrs = this.getStructAttrsIntersection();
      }
      common_keys = _.compact(_.flatten(_.map(this.selected, function(corp) {
        return _.keys(corp.common_attributes);
      })));
      common = _.pick.apply(_, [settings.common_struct_types].concat(slice.call(common_keys)));
      sentAttrs = (function() {
        var ref, results;
        ref = _.extend({}, common, allAttrs);
        results = [];
        for (key in ref) {
          obj = ref[key];
          if (obj.displayType !== "hidden") {
            results.push(_.extend({
              group: "sentence_attr",
              value: key
            }, obj));
          }
        }
        return results;
      })();
      sentAttrs = _.sortBy(sentAttrs, function(item) {
        return util.getLocaleString(item.label);
      });
      return sentAttrs;
    };

    CorpusListing.prototype.getAttributeGroups = function(lang) {
      var attrs, sentAttrs, words;
      words = this.getWordGroup(false);
      attrs = this.getWordAttributeGroups(lang, 'union');
      sentAttrs = this.getStructAttributeGroups(lang, 'union');
      return words.concat(attrs, sentAttrs);
    };

    CorpusListing.prototype.getStatsAttributeGroups = function(lang) {
      var attrs, sentAttrs, structOp, wordOp, words;
      words = this.getWordGroup(true);
      wordOp = settings.reduce_word_attribute_selector || "union";
      attrs = this.getWordAttributeGroups(lang, wordOp);
      structOp = settings.reduce_struct_attribute_selector || "union";
      sentAttrs = this.getStructAttributeGroups(lang, structOp);
      sentAttrs = _.filter(sentAttrs, function(attr) {
        return attr.displayType !== "date_interval";
      });
      return words.concat(attrs, sentAttrs);
    };

    return CorpusListing;

  })();

  window.ParallelCorpusListing = (function(superClass) {
    extend(ParallelCorpusListing, superClass);

    function ParallelCorpusListing(corpora) {
      ParallelCorpusListing.__super__.constructor.call(this, corpora);
    }

    ParallelCorpusListing.prototype.select = function(idArray) {
      this.selected = [];
      $.each(idArray, (function(_this) {
        return function(i, id) {
          var corp;
          corp = _this.struct[id];
          return _this.selected = _this.selected.concat(_this.getLinked(corp, true, false));
        };
      })(this));
      return this.selected = _.unique(this.selected);
    };

    ParallelCorpusListing.prototype.setActiveLangs = function(langlist) {
      return this.activeLangs = langlist;
    };

    ParallelCorpusListing.prototype.getCurrentAttributes = function(lang) {
      var corpora, struct;
      corpora = _.filter(this.selected, function(item) {
        return item.lang === lang;
      });
      struct = _.reduce(corpora, function(a, b) {
        return $.extend({}, a.attributes, b.attributes);
      }, {});
      return struct;
    };

    ParallelCorpusListing.prototype.getStructAttrs = function(lang) {
      var corpora, struct;
      corpora = _.filter(this.selected, function(item) {
        return item.lang === lang;
      });
      struct = _.reduce(corpora, function(a, b) {
        return $.extend({}, a.struct_attributes, b.struct_attributes);
      }, {});
      $.each(struct, function(key, val) {
        return val["isStructAttr"] = true;
      });
      return struct;
    };

    ParallelCorpusListing.prototype.getLinked = function(corp, andSelf, only_selected) {
      var output, target;
      if (andSelf == null) {
        andSelf = false;
      }
      if (only_selected == null) {
        only_selected = true;
      }
      target = only_selected ? this.selected : this.struct;
      output = _.filter(target, function(item) {
        var ref;
        return ref = item.id, indexOf.call(corp.linked_to || [], ref) >= 0;
      });
      if (andSelf) {
        output = [corp].concat(output);
      }
      return output;
    };

    ParallelCorpusListing.prototype.getEnabledByLang = function(lang, andSelf, flatten) {
      var corps, output;
      if (andSelf == null) {
        andSelf = false;
      }
      if (flatten == null) {
        flatten = true;
      }
      corps = _.filter(this.selected, function(item) {
        return item["lang"] === lang;
      });
      output = _(corps).map((function(_this) {
        return function(item) {
          return _this.getLinked(item, andSelf);
        };
      })(this)).value();
      if (flatten) {
        return _.flatten(output);
      } else {
        return output;
      }
    };

    ParallelCorpusListing.prototype.getLinksFromLangs = function(activeLangs) {
      var cps, k, l, lang, len, len1, linked, main, other, output, ref;
      if (activeLangs.length === 1) {
        return this.getEnabledByLang(activeLangs[0], true, false);
      }
      main = _.filter(this.selected, function(corp) {
        return corp.lang === activeLangs[0];
      });
      output = [];
      ref = activeLangs.slice(1);
      for (k = 0, len = ref.length; k < len; k++) {
        lang = ref[k];
        other = _.filter(this.selected, function(corp) {
          return corp.lang === lang;
        });
        for (l = 0, len1 = other.length; l < len1; l++) {
          cps = other[l];
          linked = _(main).filter(function(mainCorpus) {
            var ref1;
            return ref1 = cps.id, indexOf.call(mainCorpus.linked_to, ref1) >= 0;
          }).value();
          output = output.concat(_.map(linked, function(item) {
            return [item, cps];
          }));
        }
      }
      return output;
    };

    ParallelCorpusListing.prototype.stringifySelected = function(onlyMain) {
      var i, item, k, len, main, output, pair, struct;
      struct = this.getLinksFromLangs(this.activeLangs);
      if (onlyMain) {
        struct = _.map(struct, (function(_this) {
          return function(pair) {
            return _.filter(pair, function(item) {
              return item.lang === _this.activeLangs[0];
            });
          };
        })(this));
        return _(struct).flatten().pluck("id").invoke("toUpperCase").join(",");
      }
      c.log("struct", struct);
      output = [];
      for (i = k = 0, len = struct.length; k < len; i = ++k) {
        item = struct[i];
        main = item[0];
        pair = _.map(item.slice(1), function(corp) {
          return main.id.toUpperCase() + "|" + corp.id.toUpperCase();
        });
        output.push(pair);
      }
      return output.join(",");
    };

    ParallelCorpusListing.prototype.getTitle = function(corpus) {
      return this.struct[corpus.split("|")[1]].title;
    };

    return ParallelCorpusListing;

  })(CorpusListing);

  settings.corpusListing = new CorpusListing(settings.corpora);

  window.applyTo = function(ctrl, f) {
    var s;
    s = getScope(ctrl);
    return s.$apply(f(s));
  };

  window.search = function(obj, val) {
    var ret, s;
    s = $("body").scope();
    ret = safeApply(s.$root, function() {
      if (!obj) {
        return s.$root.search();
      }
      if (_.isObject(obj)) {
        obj = _.extend({}, s.$root.search(), obj);
        return s.$root.search(obj);
      } else {
        return s.$root.search(obj, val);
      }
    });
    if (val === null) {
      onHashChange();
    }
    return ret;
  };

  window.initLocales = function() {
    var def, defs, fn1, k, l, lang, len, len1, packages, pkg, prefix, ref;
    packages = ["locale", "corpora"];
    prefix = "translations";
    defs = [];
    window.loc_data = {};
    def = $.Deferred();
    ref = settings.languages;
    for (k = 0, len = ref.length; k < len; k++) {
      lang = ref[k];
      loc_data[lang] = {};
      fn1 = function(lang, pkg) {
        var file;
        file = pkg + "-" + lang + '.json';
        file = prefix + "/" + file;
        return defs.push($.ajax({
          url: file,
          dataType: "json",
          cache: false,
          success: function(data) {
            return _.extend(loc_data[lang], data);
          }
        }));
      };
      for (l = 0, len1 = packages.length; l < len1; l++) {
        pkg = packages[l];
        fn1(lang, pkg);
      }
    }
    $.when.apply($, defs).then(function() {
      return def.resolve(loc_data);
    });
    return def;
  };

  window.safeApply = function(scope, fn) {
    if (scope.$$phase || scope.$root.$$phase) {
      return fn(scope);
    } else {
      return scope.$apply(fn);
    }
  };

  window.util.setLogin = function() {
    var corp, k, len, ref;
    $("body").toggleClass("logged_in not_logged_in");
    ref = authenticationProxy.loginObj.credentials;
    for (k = 0, len = ref.length; k < len; k++) {
      corp = ref[k];
      $("#hpcorpus_" + (corp.toLowerCase())).closest(".boxdiv.disabled").removeClass("disabled");
    }
    if (window.corpusChooserInstance) {
      window.corpusChooserInstance.corpusChooser("updateAllStates");
    }
    $("#log_out .usrname").text(authenticationProxy.loginObj.name);
    return $(".err_msg", self).hide();
  };

  util.SelectionManager = function() {
    this.selected = $();
    this.aux = $();
  };

  util.SelectionManager.prototype.select = function(word, aux) {
    if ((word == null) || !word.length) {
      return;
    }
    if (this.selected.length) {
      this.selected.removeClass("word_selected token_selected");
      this.aux.removeClass("word_selected aux_selected");
    }
    this.selected = word;
    this.aux = aux || $();
    this.aux.addClass("word_selected aux_selected");
    return word.addClass("word_selected token_selected");
  };

  util.SelectionManager.prototype.deselect = function() {
    if (!this.selected.length) {
      return;
    }
    this.selected.removeClass("word_selected token_selected");
    this.selected = $();
    this.aux.removeClass("word_selected aux_selected");
    this.aux = $();
  };

  util.SelectionManager.prototype.hasSelected = function() {
    return this.selected.length > 0;
  };

  util.getLocaleString = function(key, lang) {
    var e;
    if (!lang) {
      lang = window.lang || settings.defaultLanguage || "sv";
    }
    try {
      return loc_data[lang][key] || key;
    } catch (_error) {
      e = _error;
      return key;
    }
  };

  util.localize = function(root) {
    root = root || "body";
    $(root).localize();
  };

  util.lemgramToString = function(lemgram, appendIndex) {
    var concept, infixIndex, match, type;
    lemgram = _.str.trim(lemgram);
    infixIndex = "";
    concept = lemgram;
    infixIndex = "";
    type = "";
    if (util.isLemgramId(lemgram)) {
      match = util.splitLemgram(lemgram);
      if ((appendIndex != null) && match.index !== "1") {
        infixIndex = $.format("<sup>%s</sup>", match.index);
      }
      concept = match.form.replace(/_/g, " ");
      type = match.pos.slice(0, 2);
    }
    return $.format("%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", [concept, infixIndex, type, util.getLocaleString(type)]);
  };

  util.saldoRegExp = /(.*?)\.\.(\d\d?)(\:\d+)?$/;

  util.saldoToString = function(saldoId, appendIndex) {
    var infixIndex, match;
    match = saldoId.match(util.saldoRegExp);
    infixIndex = "";
    if ((appendIndex != null) && match[2] !== "1") {
      infixIndex = $.format("<sup>%s</sup>", match[2]);
    }
    return $.format("%s%s", [match[1].replace(/_/g, " "), infixIndex]);
  };

  util.sblexArraytoString = function(idArray, labelFunction) {
    labelFunction = labelFunction || util.lemgramToString;
    return _.map(idArray, function(lemgram) {
      return labelFunction(lemgram, true);
    });
  };

  util.lemgramRegexp = /\.\.\w+\.\d\d?(\:\d+)?$/;

  util.isLemgramId = function(lemgram) {
    return lemgram.search(util.lemgramRegexp) !== -1;
  };

  util.splitLemgram = function(lemgram) {
    var keys, splitArray;
    if (!util.isLemgramId(lemgram)) {
      throw new Error("Input to util.splitLemgram is not a lemgram: " + lemgram);
    }
    keys = ["morph", "form", "pos", "index", "startIndex"];
    splitArray = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d\d?)(\:\d+)?$/).slice(2);
    return _.object(keys, splitArray);
  };

  util.splitSaldo = function(saldo) {
    return saldo.match(util.saldoRegExp);
  };

  util.setDownloadLinks = function(xhr_settings, result_data) {
    var corpus_id, corpus_ids, download_params, format, get_corpus_num, i, j, option, result_corpora, result_corpora_settings;
    if (!((xhr_settings != null) && (result_data != null) && (result_data.corpus_order != null) && (result_data.kwic != null))) {
      c.log('failed to do setDownloadLinks');
      return;
    }
    get_corpus_num = function(hit_num) {
      return result_data.corpus_order.indexOf(result_data.kwic[hit_num].corpus);
    };
    c.log('setDownloadLinks data:', result_data);
    $('#download-links').empty();
    result_corpora = result_data.corpus_order.slice(get_corpus_num(0), get_corpus_num(result_data.kwic.length - 1) + 1);
    result_corpora_settings = {};
    i = 0;
    while (i < result_corpora.length) {
      corpus_ids = result_corpora[i].toLowerCase().split('|');
      j = 0;
      while (j < corpus_ids.length) {
        corpus_id = corpus_ids[j];
        result_corpora_settings[corpus_id] = settings.corpora[corpus_id];
        j++;
      }
      i++;
    }
    $('#download-links').append("<option value='init' rel='localize[download_kwic]'></option>");
    i = 0;
    while (i < settings.downloadFormats.length) {
      format = settings.downloadFormats[i];
      option = $("<option \n    value=\"" + format + "\"\n    title=\"" + (util.getLocaleString('formatdescr_' + format)) + "\"\n    class=\"download_link\">" + (format.toUpperCase()) + "</option>");
      download_params = {
        query_params: JSON.stringify($.deparam.querystring(xhr_settings.url)),
        format: format,
        korp_url: window.location.href,
        korp_server_url: settings.cgi_script,
        corpus_config: JSON.stringify(result_corpora_settings),
        corpus_config_info_keys: ['metadata', 'licence', 'homepage', 'compiler'].join(','),
        urn_resolver: settings.urnResolver
      };
      if ('downloadFormatParams' in settings) {
        if ('*' in settings.downloadFormatParams) {
          $.extend(download_params, settings.downloadFormatParams['*']);
        }
        if (format in settings.downloadFormatParams) {
          $.extend(download_params, settings.downloadFormatParams[format]);
        }
      }
      option.appendTo('#download-links').data("params", download_params);
      i++;
    }
    $('#download-links').localize().click(false).change(function(event) {
      var params, self;
      params = $(":selected", this).data("params");
      if (!params) {
        return;
      }
      $.generateFile(settings.download_cgi_script, params);
      self = $(this);
      return setTimeout(function() {
        return self.val("init");
      }, 1000);
    });
  };

  util.searchHash = function(type, value) {
    search({
      search: type + "|" + value,
      page: 0
    });
  };

  added_corpora_ids = [];

  util.loadCorporaFolderRecursive = function(first_level, folder) {
    var cont, outHTML, usedid, val;
    outHTML = void 0;
    if (first_level) {
      outHTML = "<ul>";
    } else {
      outHTML = "<ul title=\"" + folder.title + "\" description=\"" + escape(folder.description) + "\">";
    }
    if (folder) {
      $.each(folder, function(fol, folVal) {
        if (fol !== "contents" && fol !== "title" && fol !== "description") {
          outHTML += "<li>" + util.loadCorporaFolderRecursive(false, folVal) + "</li>";
        }
      });
      if (folder["contents"] && folder["contents"].length > 0) {
        $.each(folder.contents, function(key, value) {
          outHTML += "<li id=\"" + value + "\">" + settings.corpora[value]["title"] + "</li>";
          added_corpora_ids.push(value);
        });
      }
    }
    if (first_level) {
      for (val in settings.corpora) {
        cont = false;
        for (usedid in added_corpora_ids) {
          if (added_corpora_ids[usedid] === val || settings.corpora[val].hide) {
            cont = true;
          }
        }
        if (cont) {
          continue;
        }
        outHTML += "<li id='" + val + "'>" + settings.corpora[val].title + "</li>";
      }
    }
    outHTML += "</ul>";
    return outHTML;
  };

  util.prettyNumbers = function(numstring) {
    var outStrNum, regex;
    regex = /(\d+)(\d{3})/;
    outStrNum = numstring.toString();
    while (regex.test(outStrNum)) {
      outStrNum = outStrNum.replace(regex, "$1" + "<span rel=\"localize[util_numbergroupseparator]\">" + util.getLocaleString("util_numbergroupseparator") + "</span>" + "$2");
    }
    return outStrNum;
  };

  util.suffixedNumbers = function(num) {
    var out;
    out = "";
    if (num < 1000) {
      out = num.toString();
    } else if ((1000 <= num && num < 1e6)) {
      out = (num / 1000).toFixed(2).toString() + "K";
    } else if ((1e6 <= num && num < 1e9)) {
      out = (num / 1e6).toFixed(2).toString() + "M";
    } else if ((1e9 <= num && num < 1e12)) {
      out = (num / 1e9).toFixed(2).toString() + "G";
    } else if (1e12 <= num) {
      out = (num / 1e12).toFixed(2).toString() + "T";
    }
    return out.replace(".", "<span rel=\"localize[util_decimalseparator]\">" + util.getLocaleString("util_decimalseparator") + "</span>");
  };

  util.loadCorpora = function() {
    var outStr, selected;
    added_corpora_ids = [];
    outStr = util.loadCorporaFolderRecursive(true, settings.corporafolders);
    window.corpusChooserInstance = $("#corpusbox").corpusChooser({
      template: outStr,
      infoPopup: function(corpusID) {
        var baseLang, baseLangSentenceHTML, baseLangTokenHTML, corpusObj, lang, lastUpdate, maybeInfo, numSentences, numTokens, output, ref, sentenceString, supportsContext;
        corpusObj = settings.corpora[corpusID];
        maybeInfo = "";
        if (corpusObj.description) {
          maybeInfo = "<br/><br/>" + corpusObj.description;
        }
        numTokens = corpusObj.info.Size;
        baseLang = (ref = settings.corpora[corpusID]) != null ? ref.linked_to : void 0;
        if (baseLang) {
          lang = " (" + util.getLocaleString(settings.corpora[corpusID].lang) + ")";
          baseLangTokenHTML = (util.getLocaleString("corpselector_numberoftokens")) + ": <b>" + (util.prettyNumbers(settings.corpora[baseLang].info.Size)) + "\n</b> (" + (util.getLocaleString(settings.corpora[baseLang].lang)) + ")<br/>";
          baseLangSentenceHTML = (util.getLocaleString("corpselector_numberofsentences")) + ": <b>" + (util.prettyNumbers(settings.corpora[baseLang].info.Sentences)) + "\n</b> (" + (util.getLocaleString(settings.corpora[baseLang].lang)) + ")<br/>";
        } else {
          lang = "";
          baseLangTokenHTML = "";
          baseLangSentenceHTML = "";
        }
        numSentences = corpusObj["info"]["Sentences"];
        lastUpdate = corpusObj["info"]["Updated"];
        if (!lastUpdate) {
          lastUpdate = "?";
        }
        sentenceString = "-";
        if (numSentences) {
          sentenceString = util.prettyNumbers(numSentences.toString());
        }
        output = "<b>\n    <img class=\"popup_icon\" src=\"img/korp_icon.png\" />\n    " + corpusObj.title + "\n</b>\n" + maybeInfo + "\n<br/><br/>" + baseLangTokenHTML + "\n" + (util.getLocaleString("corpselector_numberoftokens")) + ":\n<b>" + (util.prettyNumbers(numTokens)) + "</b>" + lang + "\n<br/>" + baseLangSentenceHTML + "\n" + (util.getLocaleString("corpselector_numberofsentences")) + ": \n<b>" + sentenceString + "</b>" + lang + "\n<br/>\n" + (util.getLocaleString("corpselector_lastupdate")) + ": \n<b>" + lastUpdate + "</b>\n<br/><br/>";
        supportsContext = _.keys(corpusObj.context).length > 1;
        if (supportsContext) {
          output += $("<div>").localeKey("corpselector_supports").html() + "<br>";
        }
        if (corpusObj.limited_access) {
          output += $("<div>").localeKey("corpselector_limited").html();
        }
        return output;
      },
      infoPopupFolder: function(indata) {
        var corporaID, desc, glueString, maybeInfo, missingSentenceData, totalSentences, totalSentencesString, totalTokens;
        corporaID = indata.corporaID;
        desc = indata.description;
        totalTokens = 0;
        totalSentences = 0;
        missingSentenceData = false;
        $(corporaID).each(function(key, oneID) {
          var oneCorpusSentences;
          totalTokens += parseInt(settings.corpora[oneID]["info"]["Size"]);
          oneCorpusSentences = settings.corpora[oneID]["info"]["Sentences"];
          if (oneCorpusSentences) {
            totalSentences += parseInt(oneCorpusSentences);
          } else {
            missingSentenceData = true;
          }
        });
        totalSentencesString = util.prettyNumbers(totalSentences.toString());
        if (missingSentenceData) {
          totalSentencesString += "+";
        }
        maybeInfo = "";
        if (desc && desc !== "") {
          maybeInfo = desc + "<br/><br/>";
        }
        glueString = "";
        if (corporaID.length === 1) {
          glueString = util.getLocaleString("corpselector_corporawith_sing");
        } else {
          glueString = util.getLocaleString("corpselector_corporawith_plur");
        }
        return "<b><img src=\"img/folder.png\" style=\"margin-right:4px; vertical-align:middle; margin-top:-1px\"/>" + indata.title + "</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + util.prettyNumbers(totalTokens.toString()) + "</b> " + util.getLocaleString("corpselector_tokens") + "<br/><b>" + totalSentencesString + "</b> " + util.getLocaleString("corpselector_sentences");
      }
    }).bind("corpuschooserchange", function(evt, corpora) {
      c.log("corpuschooserchange", corpora);
      safeApply($("body").scope(), function(scope) {
        scope.$broadcast("corpuschooserchange", corpora);
      });
    });
    selected = corpusChooserInstance.corpusChooser("selectedItems");
    settings.corpusListing.select(selected);
  };

  window.regescape = function(s) {
    return s.replace(/[\.|\?|\+|\*|\|\'|\"\(\)\^\$]/g, "\\$&");
  };

  util.localizeFloat = function(float, nDec) {
    var lang, sep;
    lang = $("#languages").radioList("getSelected").data("lang");
    sep = null;
    nDec = nDec || float.toString().split(".")[1].length;
    if (lang === "sv") {
      sep = ",";
    } else {
      if (lang === "en") {
        sep = ".";
      }
    }
    return $.format("%." + nDec + "f", float).replace(".", sep);
  };

  util.formatDecimalString = function(x, mode, statsmode, stringOnly) {
    var decimalSeparator, parts;
    if (_.contains(x, ".")) {
      parts = x.split(".");
      decimalSeparator = util.getLocaleString("util_decimalseparator");
      if (stringOnly) {
        return parts[0] + decimalSeparator + parts[1];
      }
      if (mode) {
        return util.prettyNumbers(parts[0]) + "<span rel=\"localize[util_decimalseparator]\">" + decimalSeparator + "</span>" + parts[1];
      } else {
        return util.prettyNumbers(parts[0]) + decimalSeparator + parts[1];
      }
    } else {
      if (statsmode) {
        return x;
      } else {
        return util.prettyNumbers(x);
      }
    }
  };

  util.makeAttrSelect = function(groups) {
    var arg_select;
    arg_select = $("<select/>");
    $.each(groups, function(lbl, group) {
      var optgroup;
      if ($.isEmptyObject(group)) {
        return;
      }
      optgroup = $("<optgroup/>", {
        label: util.getLocaleString(lbl).toLowerCase(),
        rel: $.format("localize[%s]", lbl)
      }).appendTo(arg_select);
      $.each(group, function(key, val) {
        if (val.displayType === "hidden") {
          return;
        }
        $("<option/>", {
          rel: $.format("localize[%s]", val.label)
        }).val(key).text(util.getLocaleString(val.label) || "").appendTo(optgroup).data("dataProvider", val);
      });
    });
    return arg_select;
  };

  util.browserWarn = function() {
    $.reject({
      reject: {
        msie5: true,
        msie6: true,
        msie7: true,
        msie8: true,
        msie9: true
      },
      imagePath: "img/browsers/",
      display: ["firefox", "chrome", "safari", "opera"],
      browserInfo: {
        firefox: {
          text: "Firefox",
          url: "http://www.mozilla.com/firefox/"
        },
        safari: {
          text: "Safari",
          url: "http://www.apple.com/safari/download/"
        },
        opera: {
          text: "Opera",
          url: "http://www.opera.com/download/"
        },
        chrome: {
          text: "Chrome",
          url: "http://www.google.com/chrome/"
        },
        msie: {
          text: "Internet Explorer",
          url: "http://www.microsoft.com/windows/Internet-explorer/"
        }
      },
      header: "Du använder en omodern webbläsare",
      paragraph1: "Korp använder sig av moderna webbteknologier som inte stödjs av din webbläsare. En lista på de mest populära moderna alternativen visas nedan. Firefox rekommenderas varmt.",
      paragraph2: "",
      closeMessage: "Du kan fortsätta ändå – all funktionalitet är densamma – men så fort du önskar att Korp vore snyggare och snabbare är det bara att installera Firefox, det tar bara en minut.",
      closeLink: "Stäng varningen",
      closeCookie: true,
      cookieSettings: {
        path: "/",
        expires: 100000
      }
    });
  };

  util.convertLMFFeatsToObjects = function(structure, key) {
    var dArr, output, theType;
    if (structure != null) {
      output = null;
      theType = util.findoutType(structure);
      if (theType === "object") {
        output = {};
        $.each(structure, function(inkey, inval) {
          var innerType, keyName;
          if (inkey === "feat") {
            innerType = util.findoutType(inval);
            if (innerType === "array") {
              $.each(inval, function(fkey, fval) {
                var keyName;
                keyName = "feat_" + fval["att"];
                if (output[keyName] == null) {
                  output[keyName] = fval["val"];
                } else {
                  if ($.isArray(output[keyName])) {
                    output[keyName].push(fval["val"]);
                  } else {
                    output[keyName] = [output[keyName], fval["val"]];
                  }
                }
              });
            } else {
              keyName = "feat_" + inval["att"];
              if (output[keyName] == null) {
                output[keyName] = inval["val"];
              } else {
                if ($.isArray(output[keyName])) {
                  output[keyName].push(inval["val"]);
                } else {
                  output[keyName] = [output[keyName], inval["val"]];
                }
              }
            }
          } else {
            output[inkey] = util.convertLMFFeatsToObjects(inval);
          }
        });
      } else if (theType === "array") {
        dArr = new Array();
        $.each(structure, function(inkey, inval) {
          dArr.push(util.convertLMFFeatsToObjects(inval));
        });
        output = dArr;
      } else {
        output = structure;
      }
      return output;
    } else {
      return null;
    }
  };

  util.findoutType = function(variable) {
    if ($.isArray(variable)) {
      return "array";
    } else {
      return typeof variable;
    }
  };

  settings.common_struct_types = {
    date_interval: {
      label: "date_interval",
      displayType: "date_interval",
      opts: false,
      extended_template: '<div class="date_interval_arg_type"> <div class="section"> <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top"> <i class="fa fa-calendar"></i> Från </button> {{combined.format("YYYY-MM-DD HH:mm")}} <time-interval ng-click="from_click($event)" class="date_interval popper_menu dropdown-menu" date-model="from_date" time-model="from_time" model="combined" min-date="minDate" max-date="maxDate"> </time-interval> </div> <div class="section"> <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top"> <i class="fa fa-calendar"></i> Till </button> {{combined2.format("YYYY-MM-DD HH:mm")}} <time-interval ng-click="from_click($event)" class="date_interval popper_menu dropdown-menu" date-model="to_date" time-model="to_time" model="combined2" my="left top" at="right top" min-date="minDate" max-date="maxDate"> </time-interval> </div> </div>',
      controller: [
        "$scope", "searches", "$timeout", function($scope, searches, $timeout) {
          var cl, getTime, getYear, ref, ref1, ref2, s, updateIntervals;
          s = $scope;
          cl = settings.corpusListing;
          updateIntervals = function() {
            var from, moments, ref, ref1, to;
            moments = cl.getMomentInterval();
            if (moments.length) {
              return ref = _.invoke(moments, "toDate"), s.minDate = ref[0], s.maxDate = ref[1], ref;
            } else {
              ref1 = cl.getTimeInterval(), from = ref1[0], to = ref1[1];
              s.minDate = moment(from.toString(), "YYYY").toDate();
              return s.maxDate = moment(to.toString(), "YYYY").toDate();
            }
          };
          s.$on("corpuschooserchange", function() {
            return updateIntervals();
          });
          updateIntervals();
          s.from_click = function(event) {
            event.originalEvent.preventDefault();
            return event.originalEvent.stopPropagation();
          };
          c.log("model", s.model);
          getYear = function(val) {
            return moment(val.toString(), "YYYYMMDD").toDate();
          };
          getTime = function(val) {
            c.log("getTime", val, moment(val.toString(), "HHmmss").toDate());
            return moment(val.toString(), "HHmmss").toDate();
          };
          if (!s.model) {
            s.from_date = s.minDate;
            s.to_date = s.maxDate;
            ref = _.invoke(cl.getMomentInterval(), "toDate"), s.from_time = ref[0], s.to_time = ref[1];
          } else if (s.model.length === 4) {
            ref1 = _.map(s.model.slice(0, 3), getYear), s.from_date = ref1[0], s.to_date = ref1[1];
            ref2 = _.map(s.model.slice(2), getTime), s.from_time = ref2[0], s.to_time = ref2[1];
          }
          return s.$watchGroup(["combined", "combined2"], function(arg) {
            var combined, combined2;
            combined = arg[0], combined2 = arg[1];
            c.log("combined", combined);
            c.log("combined2", combined2);
            s.model = [moment(s.from_date).format("YYYYMMDD"), moment(s.to_date).format("YYYYMMDD"), moment(s.from_time).format("HHmmss"), moment(s.to_time).format("HHmmss")];
            return c.log("s.model", s.model);
          });
        }
      ]
    }
  };

}).call(this);
