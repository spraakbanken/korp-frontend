waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()

i = 0
cycleSearch = () ->
    i++
    list = ["gå", "ha", "ta", "ska"]
    return list[i] or list[i=0]

EC = protractor.ExpectedConditions

describe "page", () ->
    elm = null
    

    beforeEach () ->
        browser.ignoreSynchronization = true
        browser.get "http://localhost:9000/#?corpus=suc2&cqp=%5B%5D&search=word%7C#{cycleSearch()}&page=7"
        elm = element(By.css(".results-kwic .pagination .active a"))
        waitFor(elm)


    it "should should bring up the correct page", () ->
        expect(elm.getText()).toBe "8"
        expect(browser.executeScript("return search().page")).toBe 7


    it "should page to the correct page", () ->
        element(By.css(".results-kwic .pagination li:nth-last-child(2)")).click()
        expect(EC.textToBePresentInElement(elm, "9"))

    it "should go back to 0 when searching anew", () ->
        input = element(By.id('simple_text'))
        input.sendKeys("gå")
        input.sendKeys(protractor.Key.ENTER)
        expect(browser.executeScript("return search().page")).toBe 0    

    it "should should use the correct start/end values", () ->
        expect(browser.executeScript("return kwicResults.proxy.prevParams.start")).toBe 175
        expect(browser.executeScript("return kwicResults.proxy.prevParams.end")).toBe 199
