/* eslint-disable
    no-undef,
*/

describe("stats table export", function() {

    const waitFor = function(elm) {
        browser.wait(() => elm.isPresent())
        browser.wait(() => elm.isDisplayed())
    }

    xit("should be possible to get relative frequencies as CSV", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(function() {

            const kindOfData = element(by.css("#kindOfData option:checked"))
            const kindOfFormat = element(by.css("#kindOfFormat option:checked"))

            expect(kindOfData.getText()).toMatch(/Relativa.*/)
            expect(kindOfFormat.getText()).toMatch(/CSV.*/)
            
            element(by.css("#generateExportButton")).click()
            element(by.css("#exportButton")).click()
        })
).pend("disabled because tests will succeed even though export fails")

    xit("should be possible to get absolute frequencies as TSV with multiple reduce parameters", () =>
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=word,msd,saldo&corpus=suc2,suc3&search=word|gå ut").then(function() {

            const kindOfData = element(by.css("#kindOfData option:checked"))
            const kindOfFormat = element(by.css("#kindOfFormat option:checked"))

            expect(kindOfData.getText()).toMatch(/Relativa.*/)
            expect(kindOfFormat.getText()).toMatch(/CSV.*/)
            
            element(by.css("#generateExportButton")).click()
            element(by.css("#exportButton")).click()
        })
).pend("disabled because tests will succeed even though export fails")
})
