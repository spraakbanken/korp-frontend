/** @format */

describe("free order", () => {
    it("gives more results in simple mode", async () => {
        // Enter query
        await browser.get(browser.params.url + "#?corpus=da")
        const input = element.all(by.css("#simple_text input")).first()
        await input.sendKeys("fri handel")

        // Search
        const submitBtn = element.all(by.id("sendBtn")).first()
        // Skip autocomplete call
        browser.waitForAngularEnabled(false)
        await submitBtn.click()

        // Few hits
        const hits = element(by.css(".results-kwic .num-result"))
        await browser.wait(() => hits.getText())
        await expect(await hits.getText()).toBe("2")

        // Enable free order
        const freeOrderChk = element(by.css("#freeOrderChk"))
        await freeOrderChk.click()

        // Search
        await submitBtn.click()
        const resultsKwic = element(by.css(".results-kwic"))
        await browser.wait(async () => !(await resultsKwic.getAttribute("class")).includes("loading"))

        // More hits
        await expect(await hits.getText()).toBe("8")
    })
})
