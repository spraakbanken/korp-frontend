(function() {
  describe("config file", function() {
    it("all corpora definitions have the all the required fields", function() {
      var has_all, required_config_fields;

      required_config_fields = ["within", "context", "attributes", "struct_attributes", "id", "title"];
      has_all = _(settings.corpora).values().map(function(corp) {
        return _.values(_.pick(corp, required_config_fields)).length === required_config_fields.length;
      }).all();
      return expect(has_all).toBe(true);
    });
    return it("has 'context' in all corpora definitions", function() {
      var within;

      within = _(settings.corpora).values().map(function(item) {
        return "within" in item;
      }).all();
      return expect(within).toBe(true);
    });
  });

  describe("settings.corpusListing", function() {
    var cl;

    cl = settings.corpusListing;
    it('has the same number of corpora as the config', function() {
      return expect(cl.corpora.length).toEqual(_.keys(settings.corpora).length);
    });
    it('gives no struct attrs intersection with all corpora chosen', function() {
      return expect(_.isEmpty(cl.getStructAttrsIntersection())).toBe(true);
    });
    return it('gives a common attribute from vivill and gp2012', function() {
      var attrs;

      attrs = cl.subsetFactory(["romi", "romii"]).getStructAttrsIntersection();
      return expect("text_title" in attrs && "text_author" in attrs).toBe(true);
    });
  });

}).call(this);
