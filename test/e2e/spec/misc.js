/** @format */
/* eslint-disable
    no-undef,
*/

let i = 0
const cycleSearch = function () {
    i++
    const list = ["gå", "ha", "ta", "ska"]
    return list[i] || list[(i = 0)]
}

const EC = protractor.ExpectedConditions

var waitFor = async function (elm) {
    await browser.wait(() => elm.isPresent())
    await browser.wait(() => elm.isDisplayed())
}

describe("page", function () {
    let elm = null

    beforeEach(async function () {
        // browser.ignoreSynchronization = true
        await browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${cycleSearch()}&page=7`)
        elm = element.all(by.css(".results-kwic kwic-pager .pager-wrapper .active a")).first()
        await waitFor(elm)
    })

    it("should bring up the correct page", async function () {
        // await browser.sleep(2000)
        await expect(elm.getText()).toBe("8")
        await expect(browser.executeScript("return locationSearch().page")).toBe(7)
    })

    it("should page to the correct page", async function () {
        await element.all(by.css(".results-kwic kwic-pager .pagination li:nth-last-child(2)")).first().click()
        await expect(elm.getText()).toContain("9")
        // await expect(EC.textToBePresentInElement(elm, 9))
    })

    it("should go back to 0 when searching anew", async function () {
        const input = element.all(by.model("$ctrl.textInField")).first()
        await input.clear()
        await input.sendKeys("gå")
        await input.sendKeys(protractor.Key.ESCAPE)
        await input.sendKeys(protractor.Key.ENTER)
        const page = await browser.executeScript("return locationSearch().page")
        const isZero = page == 0 || page == null || page == undefined
        await expect(isZero).toBe(true)
    })
})

describe("json button", function () {
    let elm = null

    beforeEach(async () => {
        // browser.ignoreSynchronization = true
        const wd = cycleSearch()
        await browser.get(browser.params.url + `#?corpus=suc2&cqp=%5B%5D&search=word%7C${wd}&page=7&show_stats`)
    })

    it("should display the correct url", async function () {
        const elm = element(by.css("#json-link"))
        await waitFor(elm)
        await expect(elm.getAttribute("href")).toContain("query?")
    })

    it("should switch url when changing tab", async function () {
        const elem = element(by.css(".result_tabs > ul > li:nth-child(2)"))
        // waitFor(elem)
        await elem.click()

        elm = element(by.css("#json-link"))
        await waitFor(elm)
        await expect(elm.getAttribute("href")).toContain("count?")
    })
})

describe("kwic download menu", () =>
    // would love to test that download is really performed but it's hard to test side effects...
    it("should show the csv download option", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2")
        await expect(element(by.cssContainingText("option", "CSV")).isPresent()).toBe(true)
    }))
