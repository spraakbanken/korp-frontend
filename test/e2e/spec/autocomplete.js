/** @format */
/* eslint-disable
    no-undef,
*/
const waitFor = async function (elm) {
    await browser.wait(() => elm.isPresent())
    await browser.wait(() => elm.isDisplayed())
    return elm
}

describe("lemgram autocomplete", () =>
    it("should show for default mode", async () => {
        await browser.get(browser.params.url)
        const input = element.all(by.css("#simple_text input")).first()
        await input.sendKeys("gå")

        const autocompleteMenu = element.all(by.css("ul.dropdown-menu")).first()
        await expect(autocompleteMenu.isDisplayed()).toBe(true)
    }))

describe("lemgram suggestions", () =>
    it("should be clickable and show correct output", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2")
        const input = element.all(by.css("#simple_text input")).first()
        await input.sendKeys("gå")

        const lemgramSuggestion = element.all(by.css("ul.dropdown-menu > li")).first()
        await lemgramSuggestion.click()

        await expect(input.getText()).toBe("")
        await expect(input.getAttribute("placeholder")).toBe("gå (verb)")

        const submitBtn = element.all(by.id("sendBtn")).first()
        await submitBtn.click()

        const hits = element(by.css(".results-kwic .num-result"))
        await browser.wait(() => hits.getText())
        await expect(hits.getText()).toBe("2 502")
    }))
