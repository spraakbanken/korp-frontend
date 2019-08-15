/* eslint-disable
    no-undef,
*/
describe("parallel mode", function() {

    it("should perform a kwic search", () =>
        browser.get(browser.params.url + "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0").then(function() {
        
            waitFor(element(by.css("table.kwic")))
            
            const hits = element(by.css(".results-kwic .num-result"))
            expect(hits.getText()).toBe("54")
        })
    )


    it("should show a linked sentence", () =>
        browser.get(browser.params.url + "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0").then(function() {
        
            waitFor(element(by.css("table.kwic")))
            
            const linked = element(by.css("table.kwic tr:nth-child(3) > td.lnk"))
            expect(linked.getText()).toBe("Honden en katten en ongewassen mensen .")
        })
    )

    it("should perform a statistics search", () =>
        browser.get(browser.params.url + "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&result_tab=2").then(function() {
            browser.sleep(1000)
            const hits = element(by.css("#myGrid > div.slick-viewport > div > div.ui-widget-content.slick-row.odd > div.slick-cell.l3.r3 > span > span.relStat"))
            expect(hits.getText()).toBe("39,6")
        })
    )
})


    

var waitFor = function(elm) {
    browser.wait(() => elm.isPresent())
    browser.wait(() => elm.isDisplayed())
}
