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
    return it('has the same number of corpora as the config', function() {
      return expect(cl.corpora.length).toEqual(_.keys(settings.corpora).length);
    });
  });

}).call(this);
