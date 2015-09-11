(function() {
  var prio, stringifyCqp,
    slice = [].slice;

  window.c = console;

  prio = settings.cqp_prio || ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word'];

  stringifyCqp = function(cqp_obj, translate_ops) {
    var and_array, bool, bound, flags, flagstr, from, i, j, len, len1, op, operator1, operator2, or_array, or_out, out, out_token, output, ref, tmpl, to, token, type, val, x;
    if (translate_ops == null) {
      translate_ops = false;
    }
    output = [];
    cqp_obj = CQP.prioSort(_.cloneDeep(cqp_obj));
    for (i = 0, len = cqp_obj.length; i < len; i++) {
      token = cqp_obj[i];
      if (typeof token === "string") {
        output.push(token);
        continue;
      }
      or_array = (function() {
        var j, len1, ref, results;
        ref = token.and_block;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          and_array = ref[j];
          results.push((function() {
            var k, len2, ref1, ref2, ref3, results1;
            results1 = [];
            for (k = 0, len2 = and_array.length; k < len2; k++) {
              ref1 = and_array[k], type = ref1.type, op = ref1.op, val = ref1.val, flags = ref1.flags;
              if (translate_ops) {
                ref2 = {
                  "^=": [val + ".*", "="],
                  "_=": [".*" + val + ".*", "="],
                  "&=": [".*" + val, "="],
                  "*=": [val, "="],
                  "!*=": [val, "!="]
                }[op] || [val, op], val = ref2[0], op = ref2[1];
              }
              flagstr = "";
              if (flags && _.keys(flags).length) {
                flagstr = " %" + _.keys(flags).join("");
              }
              if (type === "word" && val === "") {
                out = "";
              } else if (type === "date_interval") {
                ref3 = val.split(","), from = ref3[0], to = ref3[1];
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
                out = type + " " + op + " \"" + val + "\"";
              }
              results1.push(out + flagstr);
            }
            return results1;
          })());
        }
        return results;
      })();
      or_out = (function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = or_array.length; j < len1; j++) {
          x = or_array[j];
          if (x.length > 1) {
            results.push("(" + (x.join(' | ')) + ")");
          } else {
            results.push(x.join(' | '));
          }
        }
        return results;
      })();
      if (token.bound) {
        or_out = _.compact(or_out);
        ref = _.keys(token.bound);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          bound = ref[j];
          or_out.push(bound + "(sentence)");
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
    parse: (function(_this) {
      return function() {
        return CQPParser.parse.apply(CQPParser, arguments);
      };
    })(this),
    stringify: stringifyCqp,
    expandOperators: function(cqpstr) {
      return CQP.stringify(CQP.parse(cqpstr), true);
    },
    fromObj: function(obj) {
      return CQP.parse("[" + obj.type + " " + obj.op + " '" + obj.val + "']");
    },
    and_merge: function() {
      var cqpObjs, first, i, len, merged, ref, ref1, rest, results, tup;
      cqpObjs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref = _.zip.apply(_, cqpObjs);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        tup = ref[i];
        first = tup[0], rest = 2 <= tup.length ? slice.call(tup, 1) : [];
        merged = (ref1 = []).concat.apply(ref1, _.pluck(rest, "and_block"));
        results.push(first.and_block = first.and_block.concat(merged));
      }
      return results;
    },
    concat: function() {
      var cqpObjs, ref;
      cqpObjs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref = []).concat.apply(ref, cqpObjs);
    },
    prioSort: function(cqpObjs) {
      var getPrio, i, len, token;
      getPrio = function(and_array) {
        var numbers;
        numbers = _.map(and_array, function(item) {
          return _.indexOf(prio, item.type);
        });
        return Math.min.apply(Math, numbers);
      };
      for (i = 0, len = cqpObjs.length; i < len; i++) {
        token = cqpObjs[i];
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

//# sourceMappingURL=cqp.js.map
