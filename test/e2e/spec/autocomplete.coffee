describe "lemgram autocomplete", () ->

    it "should show for default mode", () ->
        browser.get "http://localhost:9001/"
        input = element(By.model 'textInField')
        input.sendKeys "gå"
        
        autocompleteMenu = element(By.css 'ul.dropdown-menu')
        expect(autocompleteMenu.isDisplayed()).toBe true

    it "should not show for historic mode", () ->
        browser.get "http://localhost:9001/?mode=all_hist"
        input = element(By.model 'textInField')
        input.sendKeys "gå"
        
        autocompleteMenu = element(By.css 'ul.dropdown-menu')
        browser.sleep 1000
        expect(autocompleteMenu.isDisplayed()).toBe false

waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()
