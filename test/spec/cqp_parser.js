(function() {
  var basicExpressions, changingExpressions, expandExpressions;

  describe("parsing", function() {
    it("can parse simple expr", function() {
      return expect(JSON.stringify(CQP.parse("[word = 'foo']"))).toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo","flags":null}]]}]');
    });
    it("can parse struct attr", function() {
      return expect(JSON.stringify(CQP.parse("[_.text_type = 'bar']"))).toEqual('[{"and_block":[[{"type":"_.text_type","op":"=","val":"bar","flags":null}]]}]');
    });
    return it("can parse a sequence", function() {
      return expect(JSON.stringify(CQP.parse("[word = 'foo'] [word = 'bar']"))).toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo","flags":null}]]},{"and_block":[[{"type":"word","op":"=","val":"bar","flags":null}]]}]');
    });
  });

  basicExpressions = ["[word = \"foo\"]", "[word = \"foo\"] [word = \"bar\"] [word = \"what\"]", "[word = \"foo\"] []{1,3} [word = \"what\"]", "[(word = \"foo\" | pos = \"NN\")]", "[$date_interval = '20130610,20130617,114657,111014']", "[]", "[]{5,7}", "[pos = \"PM\" & lex contains \"katt..nn.1\"]", "[word = \"\\\"\"]"];

  changingExpressions = [
    {
      input: "[word = \"foo\" | pos = \"NN\"]",
      expected: "[(word = \"foo\" | pos = \"NN\")]"
    }, {
      input: "[word = 'foo']",
      expected: "[word = \"foo\"]"
    }, {
      input: "[word = '\"']",
      expected: "[word = \"\\\"\"]"
    }
  ];

  expandExpressions = [
    {
      input: "[$date_interval = \"20130610,20130617,114657,111014\"]",
      expected: "[((int(_.text_datefrom) = 20130610 & int(_.text_timefrom) >= 114657) | (int(_.text_datefrom) > 20130610 & int(_.text_datefrom) <= 20130617)) & (int(_.text_dateto) < 20130617 | (int(_.text_dateto) = 20130617 & int(_.text_timeto) <= 111014))]"
    }
  ];

  describe("parsing", function() {
    it("can parse simple expr", function() {
      var expr, i, len, results;
      results = [];
      for (i = 0, len = basicExpressions.length; i < len; i++) {
        expr = basicExpressions[i];
        results.push(expect(CQP.stringify(CQP.parse(expr))).toEqual(expr));
      }
      return results;
    });
    it("changes", function() {
      var expr, i, len, results;
      results = [];
      for (i = 0, len = changingExpressions.length; i < len; i++) {
        expr = changingExpressions[i];
        results.push(expect(CQP.stringify(CQP.parse(expr.input))).toEqual(expr.expected));
      }
      return results;
    });
    return it("expands", function() {
      var expr, i, len, results;
      results = [];
      for (i = 0, len = expandExpressions.length; i < len; i++) {
        expr = expandExpressions[i];
        results.push(expect(CQP.stringify(CQP.parse(expr.input), true)).toEqual(expr.expected));
      }
      return results;
    });
  });

}).call(this);
