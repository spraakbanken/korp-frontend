/* eslint-disable
    no-undef,
*/
describe("lemgram autocomplete", () =>

    it("should show for default mode", () =>
        browser.get(browser.params.url).then(function() {
            const input = element.all(by.css("#simple_text input")).first()
            input.sendKeys("gå")
            
            const autocompleteMenu = element(by.css('ul.dropdown-menu'))
            expect(autocompleteMenu.isDisplayed()).toBe(true)
        })
    )
)

describe("lemgram suggestions", () =>
    
    it("should be clickable and show correct output", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
            const input = element.all(by.css("#simple_text input")).first()
            input.sendKeys("gå")
            
            const lemgramSuggestion = (element.all(by.css('ul.dropdown-menu > li'))).first()
            waitFor(lemgramSuggestion)
            lemgramSuggestion.click()
            
            expect(input.getText()).toBe("")
            expect(input.getAttribute("placeholder")).toBe("gå (verb)")
            
            const submitBtn = element(by.id("sendBtn"))
            submitBtn.click()
            
            waitFor(element(by.css("table.kwic")))
            
            const hits = element(by.css(".results-kwic .num-result"))
            expect(hits.getText()).toBe("2 502")
        })
    )
)

var waitFor = function(elm) {
    browser.wait(() => elm.isPresent())
    browser.wait(() => elm.isDisplayed())
}
