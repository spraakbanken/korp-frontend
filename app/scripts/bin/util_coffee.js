(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CorpusListing = (function() {
    function CorpusListing(corpora) {
      this.struct = corpora;
      this.corpora = _.values(corpora);
      this.selected = [];
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
      }));
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

    CorpusListing.prototype.getContextQueryString = function() {
      return $.grep($.map(_.pluck(this.selected, "id"), function(id) {
        if (_.keys(settings.corpora[id].context)) {
          return id.toUpperCase() + ":" + _.keys(settings.corpora[id].context).slice(-1);
        }
      }), Boolean).join();
    };

    CorpusListing.prototype.getWithinQueryString = function() {
      return $.grep($.map(_.pluck(this.selected, "id"), function(id) {
        if (_.keys(settings.corpora[id].within)) {
          return id.toUpperCase() + ":" + _.keys(settings.corpora[id].within).slice(-1);
        }
      }), Boolean).join();
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

    return CorpusListing;

  })();

  window.ParallelCorpusListing = (function(_super) {
    __extends(ParallelCorpusListing, _super);

    function ParallelCorpusListing(corpora) {
      ParallelCorpusListing.__super__.constructor.call(this, corpora);
    }

    ParallelCorpusListing.prototype.select = function(idArray) {
      var _this = this;

      this.selected = [];
      $.each(idArray, function(i, id) {
        var corp;

        corp = _this.struct[id];
        return _this.selected = _this.selected.concat(_this.getLinked(corp, true, false));
      });
      return this.selected = _.unique(this.selected);
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
      var corps, output,
        _this = this;

      if (andSelf == null) {
        andSelf = false;
      }
      if (flatten == null) {
        flatten = true;
      }
      corps = _.filter(this.selected, function(item) {
        return item["lang"] === lang;
      });
      output = _(corps).map(function(item) {
        return _this.getLinked(item, andSelf);
      }).value();
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
      var currentLangList, output, struct;

      currentLangList = _.map($(".lang_select").get(), function(item) {
        return $(item).val();
      });
      struct = this.getLinksFromLangs(currentLangList);
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

    return ParallelCorpusListing;

  })(CorpusListing);

  settings.corpusListing = new CorpusListing(settings.corpora);

  window.getScope = function(ctrl) {
    return angular.element("[ng-controller=" + ctrl + "]").scope();
  };

  window.applyTo = function(ctrl, f) {
    var s;

    s = getScope(ctrl);
    return s.$apply(f(s));
  };

}).call(this);
