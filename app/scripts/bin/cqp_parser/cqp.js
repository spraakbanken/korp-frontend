(function() {
  var parseDateInterval, prio, stringifyCqp,
    _this = this,
    __slice = [].slice;

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
      out = "" + (op('text_datefrom', '=')) + " &        " + (op('text_timefrom', '>=')) + " &        " + (op('text_dateto', '=')) + " &        " + (op('text_timeto', '<='));
    } else if (days_diff === -1) {
      out = "((" + (op('text_datefrom', '=')) + " & " + (op('text_timefrom', '>=')) + ") | " + (op('text_datefrom', '=', 'text_dateto')) + ") &        (" + (op('text_dateto', '=', 'text_datefrom')) + " | (" + (op('text_dateto', '=')) + " & " + (op('text_timeto', '<=')) + "))";
    } else {
      out = "((" + (op('text_datefrom', '=')) + " & " + (op('text_timefrom', '>=')) + ") |         (" + (op('text_datefrom', '>')) + " & " + (op('text_datefrom', '<=', 'text_dateto')) + ")) &        (" + (op('text_dateto', '<')) + " | (" + (op('text_dateto', '=')) + " & " + (op('text_timeto', '<=')) + "))";
    }
    out = out.replace(/\s+/g, " ");
    if (!(fromdate && todate)) {
      out = "";
    }
    return out;
  };

  stringifyCqp = function(cqp_obj, expanded_format) {
    var and_array, bound, flags, flagstr, op, or_array, or_out, out, out_token, output, token, type, val, x, _i, _j, _len, _len1, _ref;
    if (expanded_format == null) {
      expanded_format = false;
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
            var _k, _len2, _ref1, _ref2, _results1;
            _results1 = [];
            for (_k = 0, _len2 = and_array.length; _k < _len2; _k++) {
              _ref1 = and_array[_k], type = _ref1.type, op = _ref1.op, val = _ref1.val, flags = _ref1.flags;
              if (expanded_format) {
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
                out = parseDateInterval(op, val, expanded_format);
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
    getTimeInterval: function(obj) {
      var from, item, or_block, to, token, _i, _j, _k, _len, _len1, _len2, _ref;
      from = [];
      to = [];
      for (_i = 0, _len = obj.length; _i < _len; _i++) {
        token = obj[_i];
        _ref = token.and_block;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          or_block = _ref[_j];
          for (_k = 0, _len2 = or_block.length; _k < _len2; _k++) {
            item = or_block[_k];
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
