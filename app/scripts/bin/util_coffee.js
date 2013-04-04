(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
        var output;
        output = {};
        $.each(b, function(key, value) {
          if (b[key] != null) {
            return output[key] = value;
          }
        });
        return output;
      }), {});
    };

    CorpusListing.prototype._mapping_union = function(mappingArray) {
      return _.reduce(mappingArray, (function(a, b) {
        return $.extend({}, a, b);
      }), {});
    };

    CorpusListing.prototype.getCurrentAttributes = function() {
      var attrs;
      attrs = this.mapSelectedCorpora(function(corpus) {
        return corpus.attributes;
      });
      return this._invalidateAttrs(attrs);
    };

    CorpusListing.prototype.getStructAttrs = function() {
      var attrs, rest, withDataset;
      attrs = this.mapSelectedCorpora(function(corpus) {
        $.each(corpus.struct_attributes, function(key, value) {
          return value["isStructAttr"] = true;
        });
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
          var ds;
          if (origStruct[key] && origStruct[key].dataset) {
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
      return _(this.selected).pluck("id").invoke("toUpperCase").value().join(",");
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
      return $.grep($.map(_.pluck(settings.corpusListing.selected, "id"), function(id) {
        if (_.keys(settings.corpora[id].context)) {
          return id.toUpperCase() + ":" + _.keys(settings.corpora[id].context).slice(-1);
        }
      }), Boolean).join();
    };

    CorpusListing.prototype.getWithinQueryString = function() {
      return $.grep($.map(_.pluck(settings.corpusListing.selected, "id"), function(id) {
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
      }).flatten().unique().value().join("|");
    };

    CorpusListing.prototype.getTimeInterval = function() {
      var all;
      all = _(settings.corpusListing.selected).pluck("time").filter(function(item) {
        return item != null;
      }).map(_.keys).flatten().map(Number).sort(function(a, b) {
        return a - b;
      }).value();
      return [_.first(all), _.last(all)];
    };

    return CorpusListing;

  })();

  window.ParallelCorpusListing = (function(_super) {

    __extends(ParallelCorpusListing, _super);

    function ParallelCorpusListing(corpora) {
      var _this = this;
      this.parallel_corpora = corpora;
      this.corpora = [];
      this.struct = {};
      $.each(corpora, function(__, struct) {
        return $.each(struct, function(key, corp) {
          if (key === "default") {
            return;
          }
          _this.corpora.push(corp);
          return _this.struct[corp.id] = corp;
        });
      });
    }

    ParallelCorpusListing.prototype.select = function(idArray) {
      var _this = this;
      this.selected = [];
      return $.each(idArray, function(i, id) {
        var corp;
        corp = _this.struct[id];
        return _this.selected = _this.selected.concat(_this.getLinked(corp, true));
      });
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

    ParallelCorpusListing.prototype.getLinked = function(corp, andSelf) {
      var output;
      if (andSelf == null) {
        andSelf = false;
      }
      output = _.filter(this.corpora, function(item) {
        return item.parent === corp.parent && item !== corp;
      });
      if (andSelf) {
        output.push(corp);
      }
      return output;
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
