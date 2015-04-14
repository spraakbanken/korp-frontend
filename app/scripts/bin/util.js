(function() {
  var added_corpora_ids,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      cl = new CorpusListing(_.pick.apply(_, [this.struct].concat(__slice.call(idArray))));
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
        to_mergea = _.pick.apply(_, [a].concat(__slice.call(keys_intersect)));
        to_mergeb = _.pick.apply(_, [b].concat(__slice.call(keys_intersect)));
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
        var key, value, _ref;
        _ref = corpus.struct_attributes;
        for (key in _ref) {
          value = _ref[key];
          value["isStructAttr"] = true;
        }
        return corpus.struct_attributes;
      });
      return this._mapping_intersection(attrs);
    };

    CorpusListing.prototype.getStructAttrs = function() {
      var attrs, rest, withDataset;
      attrs = this.mapSelectedCorpora(function(corpus) {
        var key, value, _ref;
        _ref = corpus.struct_attributes;
        for (key in _ref) {
          value = _ref[key];
          value["isStructAttr"] = true;
        }
        return corpus.struct_attributes;
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
          var ds, _ref;
          if ((_ref = origStruct[key]) != null ? _ref.dataset : void 0) {
            ds = origStruct[key].dataset;
            if ($.isArray(ds)) {
              ds = _.object(ds, ds);
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

    CorpusListing.prototype.corpusHasAttr = function(corpus, attr) {
      return attr in $.extend({}, this.struct[corpus].attributes, this.struct[corpus].struct_attributes);
    };

    CorpusListing.prototype.stringifySelected = function() {
      return _(this.selected).pluck("id").invoke("toUpperCase").join(",");
    };

    CorpusListing.prototype.stringifyAll = function() {
      return _(this.corpora).pluck("id").invoke("toUpperCase").join(",");
    };

    CorpusListing.prototype.getAttrIntersection = function(attr) {
      var struct;
      struct = _.map(this.selected, function(corpus) {
        return _.keys(corpus[attr]);
      });
      return _.intersection.apply(null, struct);
    };

    CorpusListing.prototype.getAttrUnion = function(attr) {
      var struct;
      struct = _.map(this.selected, function(corpus) {
        return _.keys(corpus[attr]);
      });
      return _.union.apply(_, struct);
    };

    CorpusListing.prototype.getContextQueryString = function(prefer) {
      var context, contexts, corpus, output;
      output = (function() {
        var _i, _len, _ref, _results;
        _ref = this.selected;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          corpus = _ref[_i];
          contexts = _.keys(corpus.context);
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = contexts.length; _j < _len1; _j++) {
              context = contexts[_j];
              if (context && !(context in settings.defaultContext)) {
                _results1.push(corpus.id.toUpperCase() + ":" + context);
              } else {
                _results1.push(false);
              }
            }
            return _results1;
          })());
        }
        return _results;
      }).call(this);
      return _(output).flatten().compact().join();
    };

    CorpusListing.prototype.getWithinQueryString = function() {
      var corpus, output, within, withins;
      output = (function() {
        var _i, _len, _ref, _results;
        _ref = this.selected;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          corpus = _ref[_i];
          withins = _.keys(corpus.within);
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = withins.length; _j < _len1; _j++) {
              within = withins[_j];
              if (within && !(within in settings.defaultWithin)) {
                _results1.push(corpus.id.toUpperCase() + ":" + within);
              } else {
                _results1.push(false);
              }
            }
            return _results1;
          })());
        }
        return _results;
      }).call(this);
      return _(output).flatten().compact().join();
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

    CorpusListing.prototype.getAttributeGroups = function(lang) {
      var attrs, common, common_keys, key, obj, sent_attrs, word;
      word = {
        group: "word",
        value: "word",
        label: "word"
      };
      attrs = (function() {
        var _ref, _results;
        _ref = this.getCurrentAttributes(lang);
        _results = [];
        for (key in _ref) {
          obj = _ref[key];
          if (obj.displayType !== "hidden") {
            _results.push(_.extend({
              group: "word_attr",
              value: key
            }, obj));
          }
        }
        return _results;
      }).call(this);
      common_keys = _.compact(_.flatten(_.map(this.selected, function(corp) {
        return _.keys(corp.common_attributes);
      })));
      common = _.pick.apply(_, [settings.common_struct_types].concat(__slice.call(common_keys)));
      sent_attrs = (function() {
        var _ref, _results;
        _ref = _.extend({}, common, this.getStructAttrs(lang));
        _results = [];
        for (key in _ref) {
          obj = _ref[key];
          if (obj.displayType !== "hidden") {
            _results.push(_.extend({
              group: "sentence_attr",
              value: key
            }, obj));
          }
        }
        return _results;
      }).call(this);
      sent_attrs = _.sortBy(sent_attrs, function(item) {
        return util.getLocaleString(item.label);
      });
      return [word].concat(attrs, sent_attrs);
    };

    return CorpusListing;

  })();

  window.ParallelCorpusListing = (function(_super) {
    __extends(ParallelCorpusListing, _super);

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
        var _ref;
        return _ref = item.id, __indexOf.call(corp.linked_to || [], _ref) >= 0;
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
      var cps, lang, linked, main, other, output, _i, _j, _len, _len1, _ref;
      if (activeLangs.length === 1) {
        return this.getEnabledByLang(activeLangs[0], true, false);
      }
      main = _.filter(this.selected, function(corp) {
        return corp.lang === activeLangs[0];
      });
      output = [];
      _ref = activeLangs.slice(1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lang = _ref[_i];
        other = _.filter(this.selected, function(corp) {
          return corp.lang === lang;
        });
        for (_j = 0, _len1 = other.length; _j < _len1; _j++) {
          cps = other[_j];
          linked = _(main).filter(function(mainCorpus) {
            var _ref1;
            return _ref1 = cps.id, __indexOf.call(mainCorpus.linked_to, _ref1) >= 0;
          }).value();
          output = output.concat(_.map(linked, function(item) {
            return [item, cps];
          }));
        }
      }
      return output;
    };

    ParallelCorpusListing.prototype.getAttributeQuery = function(attr) {
      var output, struct;
      struct = this.getLinksFromLangs(this.activeLangs);
      output = [];
      $.each(struct, function(i, corps) {
        var mainId, mainIsPivot, other, pair;
        mainId = corps[0].id.toUpperCase();
        mainIsPivot = !!corps[0].pivot;
        other = corps.slice(1);
        pair = _.map(other, function(corp) {
          var a;
          if (mainIsPivot) {
            a = _.keys(corp[attr])[0];
          } else {
            a = _.keys(corps[0][attr])[0];
          }
          return mainId + "|" + corp.id.toUpperCase() + ":" + a;
        });
        return output.push(pair);
      });
      return output.join(",");
    };

    ParallelCorpusListing.prototype.getContextQueryString = function() {
      return this.getAttributeQuery("context");
    };

    ParallelCorpusListing.prototype.getWithinQueryString = function() {
      return this.getAttributeQuery("within");
    };

    ParallelCorpusListing.prototype.stringifySelected = function(onlyMain) {
      var i, item, main, output, pair, struct, _i, _len;
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
      for (i = _i = 0, _len = struct.length; _i < _len; i = ++_i) {
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
    var def, defs, lang, packages, pkg, prefix, _fn, _i, _j, _len, _len1, _ref;
    packages = ["locale", "corpora"];
    prefix = "translations";
    defs = [];
    window.loc_data = {};
    def = $.Deferred();
    _ref = settings.languages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      lang = _ref[_i];
      loc_data[lang] = {};
      _fn = function(lang, pkg) {
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
      for (_j = 0, _len1 = packages.length; _j < _len1; _j++) {
        pkg = packages[_j];
        _fn(lang, pkg);
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
    var corp, _i, _len, _ref;
    $("body").toggleClass("logged_in not_logged_in");
    _ref = authenticationProxy.loginObj.credentials;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      corp = _ref[_i];
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

  util.getLocaleString = function(key) {
    var lang, output;
    lang = search().lang || settings.defaultLanguage || "sv";
    if (loc_data && loc_data[lang]) {
      output = loc_data[lang][key];
    }
    if ((output == null) && (key != null)) {
      return key;
    }
    return output;
  };

  util.localize = function(root) {
    root = root || "body";
    $(root).localize();
  };

  util.lemgramToString = function(lemgram, appendIndex) {
    var concept, e, infixIndex, match, type;
    lemgram = _.str.trim(lemgram);
    infixIndex = "";
    if (util.isLemgramId(lemgram)) {
      match = util.splitLemgram(lemgram);
      if ((appendIndex != null) && match.index !== "1") {
        infixIndex = $.format("<sup>%s</sup>", match.index);
      }
      concept = match.form.replace(/_/g, " ");
      type = match.pos.slice(0, 2);
    } else {
      concept = "";
      type = "";
      try {
        concept = lemgram.split("_")[0];
        type = lemgram.split("_")[1].toLowerCase();
      } catch (_error) {
        e = _error;
        c.log("lemgramToString broken for ", lemgram);
      }
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

  util.setJsonLink = function(settings) {
    if (settings == null) {
      c.log("failed to update json link");
      return;
    }
    $("#json-link").attr("href", settings.url);
    $("#json-link").show();
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
        var baseLang, baseLangSentenceHTML, baseLangTokenHTML, corpusObj, lang, lastUpdate, maybeInfo, numSentences, numTokens, output, sentenceString, supportsContext, _ref;
        corpusObj = settings.corpora[corpusID];
        maybeInfo = "";
        if (corpusObj.description) {
          maybeInfo = "<br/><br/>" + corpusObj.description;
        }
        numTokens = corpusObj.info.Size;
        baseLang = (_ref = settings.corpora[corpusID]) != null ? _ref.linked_to : void 0;
        if (baseLang) {
          lang = " (" + util.getLocaleString(settings.corpora[corpusID].lang) + ")";
          baseLangTokenHTML = "" + (util.getLocaleString("corpselector_numberoftokens")) + ": <b>" + (util.prettyNumbers(settings.corpora[baseLang].info.Size)) + "\n</b> (" + (util.getLocaleString(settings.corpora[baseLang].lang)) + ")<br/>";
          baseLangSentenceHTML = "" + (util.getLocaleString("corpselector_numberofsentences")) + ": <b>" + (util.prettyNumbers(settings.corpora[baseLang].info.Sentences)) + "\n</b> (" + (util.getLocaleString(settings.corpora[baseLang].lang)) + ")<br/>";
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

}).call(this);

//# sourceMappingURL=util.js.map
