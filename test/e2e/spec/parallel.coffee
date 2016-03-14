describe "parallel mode", () ->

    it "should perform a kwic search", () ->
        browser.get "http://localhost:9001/?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0"
        
        waitFor element By.css "table.kwic"
        
        hits = element By.css ".results-kwic .num-result"
        expect(hits.getText()).toBe "54"


    it "should show a linked sentence", () ->
        browser.get "http://localhost:9001/?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0"
        
        waitFor element By.css "table.kwic"
        
        linked = element By.css "table.kwic tr:nth-child(3) > td.lnk"
        expect(linked.getText()).toBe "Honden en katten en ongewassen mensen ."

    it "should perform a statistics search", () ->
        browser.get "http://localhost:9001/?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&result_tab=2"
        
        browser.sleep 500
        hits = element By.css "#myGrid > div.slick-viewport > div > div.ui-widget-content.slick-row.odd > div.slick-cell.l3.r3 > span > span.relStat"
        expect(hits.getText()).toBe "39,6"


    

waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()
