(function() {
  var parseDateInterval, prio, stringifyCqp,
    slice = [].slice;

  window.c = console;

  prio = settings.cqp_prio || ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word'];

  parseDateInterval = function(op, val, expanded_format) {
    var days_diff, fieldMapping, fromdate, fromtime, m_from, m_to, out, todate, totime;
    val = _.invoke(val, "toString");
    if (!expanded_format) {
      return "$date_interval " + op + " '" + (val.join(",")) + "'";
    }
    fromdate = val[0], todate = val[1], fromtime = val[2], totime = val[3];
    m_from = moment(fromdate, "YYYYMMDD");
    m_to = moment(todate, "YYYYMMDD");
    fieldMapping = {
      text_datefrom: fromdate,
      text_dateto: todate,
      text_timefrom: fromtime,
      text_timeto: totime
    };
    op = function(field, operator, valfield) {
      val = valfield ? fieldMapping[valfield] : fieldMapping[field];
      return "int(_." + field + ") " + operator + " " + val;
    };
    days_diff = m_from.diff(m_to, "days");
    c.log("days_diff", days_diff);
    if (days_diff === 0) {
      out = (op('text_datefrom', '=')) + " & " + (op('text_timefrom', '>=')) + " & " + (op('text_dateto', '=')) + " & " + (op('text_timeto', '<='));
    } else if (days_diff === -1) {
      out = "((" + (op('text_datefrom', '=')) + " & " + (op('text_timefrom', '>=')) + ") | " + (op('text_datefrom', '=', 'text_dateto')) + ") & (" + (op('text_dateto', '=', 'text_datefrom')) + " | (" + (op('text_dateto', '=')) + " & " + (op('text_timeto', '<=')) + "))";
    } else {
      out = "((" + (op('text_datefrom', '=')) + " & " + (op('text_timefrom', '>=')) + ") | (" + (op('text_datefrom', '>')) + " & " + (op('text_datefrom', '<=', 'text_dateto')) + ")) & (" + (op('text_dateto', '<')) + " | (" + (op('text_dateto', '=')) + " & " + (op('text_timeto', '<=')) + "))";
    }
    out = out.replace(/\s+/g, " ");
    if (!(fromdate && todate)) {
      out = "";
    }
    return out;
  };

  stringifyCqp = function(cqp_obj, expanded_format) {
    var and_array, bound, flags, flagstr, i, j, len, len1, op, or_array, or_out, out, out_token, output, ref, token, type, val, x;
    if (expanded_format == null) {
      expanded_format = false;
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
            var k, len2, ref1, ref2, results1;
            results1 = [];
            for (k = 0, len2 = and_array.length; k < len2; k++) {
              ref1 = and_array[k], type = ref1.type, op = ref1.op, val = ref1.val, flags = ref1.flags;
              if (expanded_format) {
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
                out = parseDateInterval(op, val, expanded_format);
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
    getTimeInterval: function(obj) {
      var from, i, item, j, k, len, len1, len2, or_block, ref, to, token;
      from = [];
      to = [];
      for (i = 0, len = obj.length; i < len; i++) {
        token = obj[i];
        ref = token.and_block;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          or_block = ref[j];
          for (k = 0, len2 = or_block.length; k < len2; k++) {
            item = or_block[k];
            if (item.type === "date_interval") {
              from.push(moment("" + item.val[0] + item.val[2], "YYYYMMDDhhmmss"));
              to.push(moment("" + item.val[1] + item.val[3], "YYYYMMDDhhmmss"));
            }
          }
        }
      }
      if (!from.length) {
        return;
      }
      from = _.min(from, function(mom) {
        return mom.toDate();
      });
      to = _.max(to, function(mom) {
        return mom.toDate();
      });
      return [from, to];
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
