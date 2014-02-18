(function() {
  var stringifyCqp, tst,
    _this = this;

  window.c = console;

  stringifyCqp = function(cqp_obj) {
    var and_array, flags, op, or_array, or_out, out_token, output, token, type, val, x, _i, _len;

    output = [];
    for (_i = 0, _len = cqp_obj.length; _i < _len; _i++) {
      token = cqp_obj[_i];
      or_array = (function() {
        var _j, _len1, _ref, _results;

        _ref = token.and_block || [];
        _results = [];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          and_array = _ref[_j];
          _results.push((function() {
            var _k, _len2, _ref1, _results1;

            _results1 = [];
            for (_k = 0, _len2 = and_array.length; _k < _len2; _k++) {
              _ref1 = and_array[_k], type = _ref1.type, op = _ref1.op, val = _ref1.val;
              _results1.push("" + type + " " + (op.replace(/^\s+|\s+$/g, '')) + " \"" + val + "\"");
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
          _results.push(x.join(" | "));
        }
        return _results;
      })();
      flags = "";
      if (token.flags) {
        flags = " %" + token.flags.join("");
      }
      out_token = "[" + (or_out.join(' & ')) + flags + "]";
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

  tst = [
    {
      "and_block": [
        [
          {
            "type": "word",
            "op": "=",
            "val": "value"
          }, {
            "type": "word",
            "op": "=",
            "val": "value2"
          }
        ], [
          [
            {
              "type": "word",
              "op": " contains ",
              "val": "ge..vb.1"
            }
          ]
        ]
      ]
    }, {
      "repeat": [1, 2]
    }
  ];

}).call(this);
