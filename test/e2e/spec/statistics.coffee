describe "stats table", () ->

    waitFor = (elm) ->
        browser.wait () ->
            return elm.isPresent()
        browser.wait () ->
            return elm.isDisplayed()

    it "should show the correct rows and columns", () ->
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then () ->

            rows = element.all (By.css '.slick-row')
            browser.sleep 500
            expect(rows.count()).toBe 11
            
            # expect a column for hit, total, suc2, suc3
            columns = element.all (By.css '.slick-column-name')
            expect(columns.get(1).getText()).toBe "ord"
            expect(columns.get(3).getText()).toBe "Totalt"
            expect(columns.get(4).getText()).toBe "SUC 2.0"
            expect(columns.get(5).getText()).toBe "SUC 3.0"

    it "should return expected  results for reduce on word", () ->
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then () ->
            rows = element.all (By.css '.slick-row')

            browser.sleep 500

            # total row
            rows.get(0).getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "Σ 2 178,1 (5 082) 2 210,7 (2 579) 2 145,6 (2 503)"

            # gått 
            rows.get(4).getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "gått 206,6 (482) 206,6 (241) 206,6 (241)"

    it "should work to open arc diagram with the correct result", () ->
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2&stats_reduce=lemma").then () ->

            arcDiagramButtons = element.all (By.css '.slick-row .arcDiagramPicture')
            expect(arcDiagramButtons.count()).toBe 5

            arcDiagramButtons.get(0).click()

            pieDiv = element (By.css '#pieDiv')
            expect(pieDiv.isDisplayed()).toBe true
            expect((element (By.css '#pieDiv .radioList_selected')).getText()).toBe "Relativa frekvenser"
            element(By.css '#pieDiv [data-mode=absolute]').click()
            expect((element (By.css '#pieDiv .radioList_selected')).getText()).toBe "Absoluta frekvenser"

    it "should be possible to do a KWIC search on the rows, multi-word", () ->
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=saldo&corpus=suc2,suc3&search=word|gå ut").then () ->
            browser.sleep 500
            rows = element.all (By.css '.slick-row .link')
            # todo this does not count all rows
            # expect(rows.count()).toBe ??

            # todo fails because if weird NaN error on start & end parameters
            # 1. rows.get(14).click()
            # 2. assert result total is 80
            # 3. rows.get(17).click() 
            # 4. assert result total is 4

    it "should be possible to reduce on more than one attribute", () ->
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=word,msd,lex&corpus=suc2,suc3&search=word|gå ut").then () ->

            table = element (By.css "#myGrid")
            waitFor table
            
            browser.sleep 1000

            # expect a column for hit, total, suc2, suc3
            columns = element.all (By.css '.slick-column-name')
            expect(columns.get(1).getText()).toBe "ord"
            expect(columns.get(2).getText()).toBe "msd"
            expect(columns.get(3).getText()).toBe "lemgram"
            
            expect(columns.get(5).getText()).toBe "Totalt"
            expect(columns.get(6).getText()).toBe "SUC 2.0"
            expect(columns.get(7).getText()).toBe "SUC 3.0"

            rows = element.all(By.css '.slick-row')
            # todo this does not count all rows
            # expect(rows.count()).toBe 43
            
            # total row
            rows.get(0).getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "Σ Σ Σ 160,3 (374) 180 (210) 140,6 (164)"

            rows.get(21).getText().then (text) ->
                expect(text.replace /\n/g, " ").toBe "gå ut VB.INF.AKT AB gå på (verb) gå ut (verb) 0,4 (1) 0,9 (1) 0 (0)"
