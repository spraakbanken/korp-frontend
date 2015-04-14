(function() {
  var prio, stringifyCqp,
    _this = this,
    __slice = [].slice;

  window.c = console;

  prio = settings.cqp_prio || ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word'];

  stringifyCqp = function(cqp_obj, translate_ops) {
    var and_array, bool, bound, flags, flagstr, from, op, operator1, operator2, or_array, or_out, out, out_token, output, tmpl, to, token, type, val, x, _i, _j, _len, _len1, _ref;
    if (translate_ops == null) {
      translate_ops = false;
    }
    output = [];
    cqp_obj = CQP.prioSort(_.cloneDeep(cqp_obj));
    for (_i = 0, _len = cqp_obj.length; _i < _len; _i++) {
      token = cqp_obj[_i];
      if (typeof token === "string") {
        output.push(token);
        continue;
      }
      or_array = (function() {
        var _j, _len1, _ref, _results;
        _ref = token.and_block;
        _results = [];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          and_array = _ref[_j];
          _results.push((function() {
            var _k, _len2, _ref1, _ref2, _ref3, _results1;
            _results1 = [];
            for (_k = 0, _len2 = and_array.length; _k < _len2; _k++) {
              _ref1 = and_array[_k], type = _ref1.type, op = _ref1.op, val = _ref1.val, flags = _ref1.flags;
              if (translate_ops) {
                _ref2 = {
                  "^=": [val + ".*", "="],
                  "_=": [".*" + val + ".*", "="],
                  "&=": [".*" + val, "="],
                  "*=": [val, "="],
                  "!*=": [val, "!="]
                }[op] || [val, op], val = _ref2[0], op = _ref2[1];
              }
              flagstr = "";
              if (flags && _.keys(flags).length) {
                flagstr = " %" + _.keys(flags).join("");
              }
              if (type === "word" && val === "") {
                out = "";
              } else if (type === "date_interval") {
                _ref3 = val.split(","), from = _ref3[0], to = _ref3[1];
                operator1 = ">=";
                operator2 = "<=";
                bool = "&";
                if (op === "!=") {
                  operator1 = "<";
                  operator2 = ">";
                  bool = "|";
                }
                tmpl = _.template("(int(_.text_datefrom) <%= op1 %> <%= from %> <%= bool %> int(_.text_dateto) <%= op2 %> <%= to %>)");
                out = tmpl({
                  op1: operator1,
                  op2: operator2,
                  bool: bool,
                  from: from,
                  to: to
                });
                if (!(from && to)) {
                  out = "";
                }
              } else {
                out = "" + type + " " + op + " \"" + val + "\"";
              }
              _results1.push(out + flagstr);
            }
            return _results1;
          })());
        }
        return _results;
      })();
      or_out = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = or_array.length; _j < _len1; _j++) {
          x = or_array[_j];
          if (x.length > 1) {
            _results.push("(" + (x.join(' | ')) + ")");
          } else {
            _results.push(x.join(' | '));
          }
        }
        return _results;
      })();
      if (token.bound) {
        or_out = _.compact(or_out);
        _ref = _.keys(token.bound);
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          bound = _ref[_j];
          or_out.push("" + bound + "(sentence)");
        }
      }
      out_token = "[" + (or_out.join(' & ')) + "]";
      if (token.repeat) {
        out_token += "{" + (token.repeat.join(',')) + "}";
      }
      output.push(out_token);
    }
    return output.join(" ");
  };

  window.CQP = {
    parse: function() {
      return CQPParser.parse.apply(CQPParser, arguments);
    },
    stringify: stringifyCqp,
    expandOperators: function(cqpstr) {
      return CQP.stringify(CQP.parse(cqpstr), true);
    },
    fromObj: function(obj) {
      return CQP.parse("[" + obj.type + " " + obj.op + " '" + obj.val + "']");
    },
    and_merge: function() {
      var cqpObjs, first, merged, rest, tup, _i, _len, _ref, _ref1, _results;
      cqpObjs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = _.zip.apply(_, cqpObjs);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tup = _ref[_i];
        first = tup[0], rest = 2 <= tup.length ? __slice.call(tup, 1) : [];
        merged = (_ref1 = []).concat.apply(_ref1, _.pluck(rest, "and_block"));
        _results.push(first.and_block = first.and_block.concat(merged));
      }
      return _results;
    },
    concat: function() {
      var cqpObjs, _ref;
      cqpObjs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = []).concat.apply(_ref, cqpObjs);
    },
    prioSort: function(cqpObjs) {
      var getPrio, token, _i, _len;
      getPrio = function(and_array) {
        var numbers;
        numbers = _.map(and_array, function(item) {
          return _.indexOf(prio, item.type);
        });
        return Math.min.apply(Math, numbers);
      };
      for (_i = 0, _len = cqpObjs.length; _i < _len; _i++) {
        token = cqpObjs[_i];
        token.and_block = (_.sortBy(token.and_block, getPrio)).reverse();
      }
      return cqpObjs;
    }
  };

  c.log(CQP.stringify(CQP.parse('[(word &= "ge" | pos = "JJ")]'), true));

  c.log(CQP.stringify([
    {
      "and_block": [
        [
          {
            "type": "date_interval",
            "op": "!=",
            "val": "18870101,20101231"
          }, {
            "type": "word",
            "op": "!=",
            "val": "value"
          }, {
            "type": "word",
            "op": "&=",
            "val": "value2"
          }
        ], [
          {
            "type": "word",
            "op": "not contains",
            "val": "ge..vb.1"
          }
        ]
      ]
    }, {
      "and_block": [
        [
          {
            "type": "word",
            "op": "=",
            "val": ""
          }
        ]
      ],
      "repeat": [1, 2]
    }
  ]));

}).call(this);

/*
//@ sourceMappingURL=cqp.js.map
*/