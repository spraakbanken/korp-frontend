/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("stats table export", function() {

    const waitFor = function(elm) {
        browser.wait(() => elm.isPresent())
        return browser.wait(() => elm.isDisplayed())
    }

    xit("should be possible to get relative frequencies as CSV", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(function() {

            const kindOfData = element(By.css("#kindOfData option:checked"))
            const kindOfFormat = element(By.css("#kindOfFormat option:checked"))

            expect(kindOfData.getText()).toMatch(/Relativa.*/)
            expect(kindOfFormat.getText()).toMatch(/CSV.*/)
            
            element(By.css("#generateExportButton")).click()
            return element(By.css("#exportButton")).click()
        })
).pend("disabled because tests will succeed even though export fails")

    return xit("should be possible to get absolute frequencies as TSV with multiple reduce parameters", () =>
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=word,msd,saldo&corpus=suc2,suc3&search=word|gå ut").then(function() {

            const kindOfData = element(By.css("#kindOfData option:checked"))
            const kindOfFormat = element(By.css("#kindOfFormat option:checked"))

            expect(kindOfData.getText()).toMatch(/Relativa.*/)
            expect(kindOfFormat.getText()).toMatch(/CSV.*/)
            
            element(By.css("#generateExportButton")).click()
            return element(By.css("#exportButton")).click()
        })
).pend("disabled because tests will succeed even though export fails")
})
