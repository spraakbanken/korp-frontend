/** @format */
/* eslint-disable
    no-undef,
*/

describe("compare", function () {
    const selectLemgram = async function (word) {
        const input = element.all(by.css("#simple_text input")).first()
        input.clear()
        await input.sendKeys(word)

        const lemgramSuggestion = element.all(by.css("ul.dropdown-menu > li")).first()
        await lemgramSuggestion.click()
    }

    const saveSearch = async function (name) {
        await element.all(by.css(".search_submit .opener")).first().click()
        const input = element.all(by.css(".cmp_input")).first()
        await input.sendKeys(name)
        await element(by.css(".popover.compare.bottom .btn")).click()
    }

    const getCompareTabHeading = () => element.all(by.css(".search_tabs .nav-tabs li")).last()

    it("should be possible to save searches", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2")
        await selectLemgram("gå")
        await saveSearch("gå")

        const compareTabHeading = getCompareTabHeading()

        await expect(compareTabHeading.getText()).toBe("Jämförelse 1")

        await selectLemgram("springa")
        await saveSearch("springa")

        await expect(compareTabHeading.getText()).toBe("Jämförelse 2")
    })

    it("should work for simple word comparison", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2")
        await selectLemgram("gå")
        await saveSearch("gå")

        await selectLemgram("springa")
        await saveSearch("springa")

        await getCompareTabHeading().click()

        await element.all(by.css(".search_compare button")).last().click()

        const negativeMeters = element.all(by.css(".compare_result .negative li"))
        const positiveMeters = element.all(by.css(".compare_result .positive li"))

        let text = await negativeMeters.first().getText()
        await expect(text.replace(/\n/g, " ")).toBe("går 879")
        text = await positiveMeters.first().getText()
        await expect(text.replace(/\n/g, " ")).toBe("sprang 45")
    })
})

// todo fails because if weird NaN error on start & end parameters
// negativeMeters.first().click()
