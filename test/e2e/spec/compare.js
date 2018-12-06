/* eslint-disable
    no-undef,
*/

describe("compare", function() {
    const waitFor = function(elm) {
        browser.wait(() => elm.isPresent())
        browser.wait(() => elm.isDisplayed())
    }
            
    const selectLemgram = function(word) {
        const input = element.all(by.css("#simple_text input")).first()
        input.clear()
        input.sendKeys(word)
        
        const lemgramSuggestion = (element.all(by.css('ul.dropdown-menu > li'))).first()
        waitFor(lemgramSuggestion)
        lemgramSuggestion.click()
    }
        
    const saveSearch = function(name) {
        element(by.css(".search_submit .opener")).click()
        const input = element(by.css("#cmp_input"))
        input.sendKeys(name)
        element(by.css(".popover.compare.bottom .btn")).click()
    }

    const getCompareTabHeading = () => (element.all(by.css(".search_tabs .nav-tabs li"))).last()

    it("should be possible to save searches", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
        
            selectLemgram("gå")
            saveSearch("gå")
            
            const compareTabHeading = getCompareTabHeading()
            
            expect(compareTabHeading.getText()).toBe("Jämförelse 1")
            
            selectLemgram("springa")
            saveSearch("springa")
            
            expect(compareTabHeading.getText()).toBe("Jämförelse 2")
        })
    )
    
    it("should work for simple word comparison", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
        
            selectLemgram("gå")
            saveSearch("gå")
            
            selectLemgram("springa")
            saveSearch("springa")
            
            getCompareTabHeading().click();
            
            (element.all(by.css(".search_compare button"))).last().click()
            
            const negativeMeters = element.all(by.css(".compare_result .negative li"))
            const positiveMeters = element.all(by.css(".compare_result .positive li"))

            negativeMeters.first().getText().then(text => expect(text.replace(/\n/g, " ")).toBe("går 879"))
                
            positiveMeters.first().getText().then(text => expect(text.replace(/\n/g, " ")).toBe("sprang 45"))
        })
    )
})

            // todo fails because if weird NaN error on start & end parameters
            // negativeMeters.first().click()
        
