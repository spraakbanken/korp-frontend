describe "stats table export", () ->

    waitFor = (elm) ->
        browser.wait () ->
            return elm.isPresent()
        browser.wait () ->
            return elm.isDisplayed()

    xit "should be possible to get relative frequencies as CSV", () ->
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then () ->

            kindOfData = element By.css "#kindOfData option:checked"
            kindOfFormat = element By.css "#kindOfFormat option:checked"

            expect(kindOfData.getText()).toMatch /Relativa.*/
            expect(kindOfFormat.getText()).toMatch /CSV.*/
            
            element(By.css "#generateExportButton").click()
            element(By.css "#exportButton").click()

            # todo check that file was actually downloaded, might have been interrupted and thats ok
    .pend "disabled because tests will succeed even though export fails"

    xit "should be possible to get absolute frequencies as TSV with multiple reduce parameters", () ->
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=word,msd,saldo&corpus=suc2,suc3&search=word|gå ut").then () ->

            kindOfData = element By.css "#kindOfData option:checked"
            kindOfFormat = element By.css "#kindOfFormat option:checked"

            expect(kindOfData.getText()).toMatch /Relativa.*/
            expect(kindOfFormat.getText()).toMatch /CSV.*/
            
            element(By.css "#generateExportButton").click()
            element(By.css "#exportButton").click()

        # todo check that file was actually downloaded, might have been interrupted and thats ok
    .pend "disabled because tests will succeed even though export fails"
