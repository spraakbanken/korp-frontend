/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("compare", function() {
    const waitFor = function(elm) {
        browser.wait(() => elm.isPresent());
        return browser.wait(() => elm.isDisplayed());
    };
            
    const selectLemgram = function(word) {
        const input = element.all(By.css("#simple_text input")).first();
        input.clear();
        input.sendKeys(word);
        
        const lemgramSuggestion = (element.all(By.css('ul.dropdown-menu > li'))).first();
        waitFor(lemgramSuggestion);
        return lemgramSuggestion.click();
    };
        
    const saveSearch = function(name) {
        element(By.css(".search_submit .opener")).click();
        const input = element(By.css("#cmp_input"));
        input.sendKeys(name);
        return element(By.css(".popover.compare.bottom .btn")).click();
    };

    const getCompareTabHeading = () => (element.all(By.css(".search_tabs .nav-tabs li"))).last();

    it("should be possible to save searches", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
        
            selectLemgram("gå");
            saveSearch("gå");
            
            const compareTabHeading = getCompareTabHeading();
            
            expect(compareTabHeading.getText()).toBe("Jämförelse 1");
            
            selectLemgram("springa");
            saveSearch("springa");
            
            return expect(compareTabHeading.getText()).toBe("Jämförelse 2");
        })
    );
    
    return it("should work for simple word comparison", () =>
        browser.get(browser.params.url + "#?corpus=suc2").then(function() {
        
            selectLemgram("gå");
            saveSearch("gå");
            
            selectLemgram("springa");
            saveSearch("springa");
            
            getCompareTabHeading().click();
            
            (element.all(By.css(".search_compare button"))).last().click();
            
            const negativeMeters = element.all(By.css(".compare_result .negative li"));
            const positiveMeters = element.all(By.css(".compare_result .positive li"));

            negativeMeters.first().getText().then(text => expect(text.replace(/\n/g, " ")).toBe("går 879"));
                
            return positiveMeters.first().getText().then(text => expect(text.replace(/\n/g, " ")).toBe("sprang 45"));
        })
    );
});

            // todo fails because if weird NaN error on start & end parameters
            // negativeMeters.first().click()
        