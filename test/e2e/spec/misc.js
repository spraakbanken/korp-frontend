/* eslint-disable
    no-undef,
*/

const waitFor = function(elm) {
    browser.wait(() => elm.isPresent())
    browser.wait(() => elm.isDisplayed())
}

let i = 0
const cycleSearch = function() {
    i++
    const list = ["gå", "ha", "ta", "ska"]
    return list[i] || list[(i = 0)]
}

const EC = protractor.ExpectedConditions

describe("page", function() {
    let elm = null
    
    beforeEach(function() {
        browser.ignoreSynchronization = true
        browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${cycleSearch()}&page=7`).then(function() {
            elm = element(by.css(".results-kwic .pager-wrapper:nth-child(2) .active a"))
            waitFor(elm)
        })
    })

    it("should should bring up the correct page", function() {
        expect(elm.getText()).toBe("8")
        expect(browser.executeScript("return locationSearch().page")).toBe(7)
    })

    it("should page to the correct page", function() {
        element(by.css(".results-kwic .pagination li:nth-last-child(2)")).click()
        expect(EC.textToBePresentInElement(elm, "9"))
    })

    it("should go back to 0 when searching anew", function() {
        const input = element.all(by.model('textInField')).first()
        input.clear()
        input.sendKeys("gå")
        input.sendKeys(protractor.Key.ENTER)  
        expect(browser.executeScript("return locationSearch().page")).toBe(0)
    })

    it("should should use the correct start/end values", function() {
        expect(browser.executeScript("return kwicResults.proxy.prevParams.start")).toBe(175)
        expect(browser.executeScript("return kwicResults.proxy.prevParams.end")).toBe(199)
    })
})


describe("json button", function() {
    let elm = null

    beforeEach(() => { browser.ignoreSynchronization = true })

    it("should display the correct url", function() {
        const wd = cycleSearch()
        browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${wd}&page=7`).then(function() {
            elm = element(by.css("#json-link"))
            waitFor(elm)
            expect(elm.getAttribute("href")).toContain("?command=query")
        })
    })
    
    it("should switch url when changing tab", function() {
        const wd = cycleSearch()
        browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${wd}&page=7`).then(function() {

            const elem = element(by.css(".result_tabs > ul > li:nth-child(2)"))
            waitFor(elem)
            elem.click()
            
            elm = element(by.css("#json-link"))
            waitFor(elm)
            expect(elm.getAttribute("href")).toContain("?command=count")
        })
    })
})


describe("kwic download menu", () =>
    // would love to test that download is really performed but it's hard to test side effects...
    it("should show the csv download option", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(() => expect(element(by.cssContainingText('option', 'CSV')).isPresent()).toBe(true))
    )
)
        
