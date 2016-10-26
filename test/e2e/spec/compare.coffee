describe "compare", () ->
    waitFor = (elm) ->
        browser.wait () ->
            return elm.isPresent()
        browser.wait () ->
            return elm.isDisplayed()
            
    selectLemgram = (word) ->
        input = element By.css "#simple_text .autocomplete_searchbox"
        input.clear()
        input.sendKeys word
        
        lemgramSuggestion = (element.all By.css 'ul.dropdown-menu > li').first()
        waitFor lemgramSuggestion
        lemgramSuggestion.click()
        
    saveSearch = (name) ->
        element(By.css ".search_submit .opener").click()
        input = element By.css "#cmp_input"
        input.sendKeys name
        element(By.css ".popover.compare.bottom .btn").click()

    getCompareTabHeading = () ->
        return (element.all(By.css ".search_tabs .nav-tabs li")).last()

    it "should be possible to save searches", () ->
        browser.get(browser.params.url + "#?corpus=suc2").then () ->
        
            selectLemgram "gå"
            saveSearch "gå"
            
            compareTabHeading = getCompareTabHeading()
            
            expect(compareTabHeading.getText()).toBe "Jämförelse 1"
            
            selectLemgram "springa"
            saveSearch "springa"
            
            expect(compareTabHeading.getText()).toBe "Jämförelse 2"
    
    it "should work for simple word comparison", () ->
        browser.get(browser.params.url + "#?corpus=suc2").then () ->
        
            selectLemgram "gå"
            saveSearch "gå"
            
            selectLemgram "springa"
            saveSearch "springa"
            
            getCompareTabHeading().click()
            
            (element.all(By.css ".search_compare button")).last().click()
            
            negativeMeters = element.all By.css ".compare_result .negative li"
            positiveMeters = element.all By.css ".compare_result .positive li"

            negativeMeters.first().getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "går 932"
                
            positiveMeters.first().getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "sprang 45"

            # todo fails because if weird NaN error on start & end parameters
            # negativeMeters.first().click()
        