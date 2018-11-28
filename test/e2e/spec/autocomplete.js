/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("lemgram autocomplete", () =>

    it("should show for default mode", () =>
        browser.get(browser.params.url).then(function() {
            const input = element.all(By.css("#simple_text input")).first()
            input.sendKeys("gå")
            
            const autocompleteMenu = element(By.css('ul.dropdown-menu'))
            return expect(autocompleteMenu.isDisplayed()).toBe(true)
        })
    )
)

describe("lemgram suggestions", () =>
    
    it("should be clickable and show correct output", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
            const input = element.all(By.css("#simple_text input")).first()
            input.sendKeys("gå")
            
            const lemgramSuggestion = (element.all(By.css('ul.dropdown-menu > li'))).first()
            waitFor(lemgramSuggestion)
            lemgramSuggestion.click()
            
            expect(input.getText()).toBe("")
            expect(input.getAttribute("placeholder")).toBe("gå (verb)")
            
            const submitBtn = element(By.id("sendBtn"))
            submitBtn.click()
            
            waitFor(element(By.css("table.kwic")))
            
            const hits = element(By.css(".results-kwic .num-result"))
            return expect(hits.getText()).toBe("2 502")
        })
    )
)

var waitFor = function(elm) {
    browser.wait(() => elm.isPresent())
    return browser.wait(() => elm.isDisplayed())
}
