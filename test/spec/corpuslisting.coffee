

describe "config file", () ->

    it "all corpora definitions have the all the required fields", () ->
        required_config_fields = [
            "within"
            "context"
            "attributes"
            "struct_attributes"
            "id"
            "title"
        ]
        has_all = _(settings.corpora)
            .values()
            .map((corp) ->
                _.values(_.pick(corp, required_config_fields)).length == required_config_fields.length
            )
            .all()

        expect(has_all).toBe(true)
    it "has 'context' in all corpora definitions", () ->
        within = _(settings.corpora)
            .values()
            .map((item) -> "within" of item)
            .all()

        expect(within).toBe(true)






describe "settings.corpusListing", () ->
    cl = settings.corpusListing
    it 'has the same number of corpora as the config', () ->
        expect(cl.corpora.length).toEqual(_.keys(settings.corpora).length)

    # it 
