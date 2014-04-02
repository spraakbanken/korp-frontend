
describe "parsing", () ->
    it "can parse simple expr", () ->
        expect(JSON.stringify(CQP.parse("[word = 'foo']")))
            .toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo"}]]}]')
    
    it "can parse struct attr", () ->
        expect(JSON.stringify(CQP.parse("[_.text_type = 'bar']")))
            .toEqual('[{"and_block":[[{"type":"_.text_type","op":"=","val":"bar"}]]}]')


    it "can parse a sequence", () ->
        expect(JSON.stringify(CQP.parse("[word = 'foo'] [word = 'bar']")))
            .toEqual('[{"and_block":[[{"type":"word","op":"=","val":"foo"}]]},{"and_block":[[{"type":"word","op":"=","val":"bar"}]]}]')