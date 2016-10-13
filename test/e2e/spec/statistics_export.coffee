# disabled because tests will succeed even though export fails
xdescribe "stats table export", () ->

    waitFor = (elm) ->
        browser.wait () ->
            return elm.isPresent()
        browser.wait () ->
            return elm.isDisplayed()

    it "should be possible to get relative frequencies as CSV", () ->
        browser.get "http://localhost:9001/#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2"

        kindOfData = element By.css "#kindOfData option:checked"
        kindOfFormat = element By.css "#kindOfFormat option:checked"

        expect(kindOfData.getText()).toMatch /Relativa.*/
        expect(kindOfFormat.getText()).toMatch /CSV.*/
        
        element(By.css "#generateExportButton").click()
        element(By.css "#exportButton").click()

        # todo check that file was actually downloaded, might have been interrupted and thats ok

    it "should be possible to get absolute frequencies as TSV with multiple reduce parameters", () ->
        browser.get "http://localhost:9001/#?result_tab=2&stats_reduce=word,msd,saldo&corpus=suc2,suc3&search=word|gå ut"

        kindOfData = element By.css "#kindOfData option:checked"
        kindOfFormat = element By.css "#kindOfFormat option:checked"

        expect(kindOfData.getText()).toMatch /Relativa.*/
        expect(kindOfFormat.getText()).toMatch /CSV.*/
        
        element(By.css "#generateExportButton").click()
        element(By.css "#exportButton").click()

        # todo check that file was actually downloaded, might have been interrupted and thats ok
