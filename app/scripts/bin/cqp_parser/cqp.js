(function() {
  var stringifyCqp,
    _this = this;

  window.c = console;

  stringifyCqp = function(cqp_obj, translate_ops) {
    var and_array, bool, bound, flags, flagstr, from, op, operator1, operator2, or_array, or_out, out, out_token, output, tmpl, to, token, type, val, x, _i, _j, _len, _len1, _ref;
    if (translate_ops == null) {
      translate_ops = false;
    }
    output = [];
    for (_i = 0, _len = cqp_obj.length; _i < _len; _i++) {
      token = cqp_obj[_i];
      or_array = [];
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
                  "*=": [val, "="]
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
    stringify: stringifyCqp
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
