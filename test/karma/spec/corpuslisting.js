/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.c = console
window._ = require("lodash")
window.settings = {}
require("configjs")
const commonSettings = require("commonjs")
_.map(commonSettings, function(v, k) {
  if (k in window) {
    console.error(`warning, overwriting setting${k}`)
}
  return window[k] = v
})

require("../../../app/scripts/util.js")
require("defaultmode")

describe("config file", function() {

    it("all corpora definitions have the all the required fields", function() {
        const required_config_fields = [
            "within",
            "context",
            "attributes",
            "structAttributes",
            "id",
            "title"
        ]
        const has_all = _(settings.corpora)
            .values()
            .map(corp => _.values(_.pick(corp, required_config_fields)).length === required_config_fields.length)
            .every()

        return expect(has_all).toBe(true)
    })
    return it("has 'context' in all corpora definitions", function() {
        const within = _(settings.corpora)
            .values()
            .map(item => "within" in item)
            .every()

        return expect(within).toBe(true)
    })
})






describe("settings.corpusListing", function() {
    const cl = settings.corpusListing
    it('has the same number of corpora as the config', () => expect(cl.corpora.length).toEqual(_.keys(settings.corpora).length))

    it('gives no struct attrs intersection with all corpora chosen', () => expect(_.isEmpty(cl.getStructAttrsIntersection())).toBe(true))

    return it('gives a common attribute from vivill and gp2012', function() {
        const attrs = cl.subsetFactory(["romi", "romii"]).getStructAttrsIntersection()
        return expect("text_title" in attrs && "text_author" in attrs).toBe(true)
    })
})
