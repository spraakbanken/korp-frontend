describe "lemgram autocomplete", () ->

    it "should show for default mode", () ->
        browser.get "http://localhost:9001/"
        input = element By.css "#simple_text .autocomplete_searchbox"
        input.sendKeys "gå"
        
        autocompleteMenu = element(By.css 'ul.dropdown-menu')
        expect(autocompleteMenu.isDisplayed()).toBe true

    it "should not show for historic mode", () ->
        browser.get "http://localhost:9001/?mode=all_hist"
        input = element By.css "#simple_text .standard_searchbox"
        input.sendKeys "gå"
        
        autocompleteMenu = element By.css 'ul.dropdown-menu'
        browser.sleep 1000
        expect(autocompleteMenu.isDisplayed()).toBe false

describe "lemgram suggestions", () ->
    
    it "should be clickable and show correct output", () ->
        browser.get "http://localhost:9001/#?corpus=suc2"
        input = element By.css "#simple_text .autocomplete_searchbox"
        input.sendKeys "gå"
        
        lemgramSuggestion = (element.all By.css 'ul.dropdown-menu > li').first()
        waitFor lemgramSuggestion
        lemgramSuggestion.click()
        
        expect(input.getText()).toBe ""
        expect(input.getAttribute "placeholder").toBe "gå (verb)"
        
        submitBtn = element(By.id "sendBtn")
        submitBtn.click()
        
        waitFor element By.css "table.kwic"
        
        hits = element By.css ".results-kwic .num-result"
        expect(hits.getText()).toBe "2 579"

waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()
