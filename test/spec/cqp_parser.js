(function() {
  describe("parsing", function() {
    it("can parse simple expr", function() {
      return expect(JSON.stringify(CQP.parse("[word = 'foo']"))).toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo"}]]}]');
    });
    it("can parse struct attr", function() {
      return expect(JSON.stringify(CQP.parse("[_.text_type = 'bar']"))).toEqual('[{"and_block":[[{"type":"_.text_type","op":"=","val":"bar"}]]}]');
    });
    return it("can parse a sequence", function() {
      return expect(JSON.stringify(CQP.parse("[word = 'foo'] [word = 'bar']"))).toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo"}]]},{"and_block":[[{"type":"word","op":"=","val":"bar"}]]}]');
    });
  });

}).call(this);

//# sourceMappingURL=cqp_parser.js.map
