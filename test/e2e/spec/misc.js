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
const waitFor = function(elm) {
    browser.wait(() => elm.isPresent())
    return browser.wait(() => elm.isDisplayed())
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
        return browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${cycleSearch()}&page=7`).then(function() {
            elm = element(By.css(".results-kwic .pager-wrapper:nth-child(2) .active a"))
            return waitFor(elm)
        })
    })

    it("should should bring up the correct page", function() {
        expect(elm.getText()).toBe("8")
        return expect(browser.executeScript("return locationSearch().page")).toBe(7)
    })

    it("should page to the correct page", function() {
        element(By.css(".results-kwic .pagination li:nth-last-child(2)")).click()
        return expect(EC.textToBePresentInElement(elm, "9"))
    })

    it("should go back to 0 when searching anew", function() {
        const input = element.all(By.model('textInField')).first()
        input.clear()
        input.sendKeys("gå")
        input.sendKeys(protractor.Key.ENTER)  
        return expect(browser.executeScript("return locationSearch().page")).toBe(0)
    })

    return it("should should use the correct start/end values", function() {
        expect(browser.executeScript("return kwicResults.proxy.prevParams.start")).toBe(175)
        return expect(browser.executeScript("return kwicResults.proxy.prevParams.end")).toBe(199)
    })
})


describe("json button", function() {
    let elm = null

    beforeEach(() => browser.ignoreSynchronization = true)

    it("should display the correct url", function() {
        const wd = cycleSearch()
        return browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${wd}&page=7`).then(function() {
            elm = element(By.css("#json-link"))
            waitFor(elm)
            return expect(elm.getAttribute("href")).toContain("?command=query")
        })
    })
    
    return it("should switch url when changing tab", function() {
        const wd = cycleSearch()
        return browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${wd}&page=7`).then(function() {

            const elem = element(By.css(".result_tabs > ul > li:nth-child(2)"))
            waitFor(elem)
            elem.click()
            
            elm = element(By.css("#json-link"))
            waitFor(elm)
            return expect(elm.getAttribute("href")).toContain("?command=count")
        })
    })
})


describe("kwic download menu", () =>
    // would love to test that download is really performed but it's hard to test side effects...
    it("should show the csv download option", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(() => expect(element(By.cssContainingText('option', 'CSV')).isPresent()).toBe(true))
    )
)
        
