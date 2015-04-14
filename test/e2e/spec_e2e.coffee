waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()


describe "page", () ->
    elm = null

    beforeEach () ->
        browser.ignoreSynchronization = true
        browser.get "http://localhost:9000/#?corpus=suc2&cqp=%5B%5D&search=word%7Cha&page=7"
        elm = element(By.css(".results-kwic .pagination .active a"))
        waitFor(elm)

    it "should go back to 0 when searching anew", () ->
        input = element(By.id('simple_text'))
        input.sendKeys("gå")
        input.sendKeys(protractor.Key.ENTER)
        expect(browser.executeScript("return search().page")).toBe 0    

    it "should page to the correct page", () ->
        element(By.css(".results-kwic .pagination li:nth-last-child(2)")).click()
        waitFor(elm)
        expect(elm.getText()).toBe "9"
        expect(browser.executeScript("return search().page")).toBe 8

    it "should should use the correct start/end values", () ->
        expect(browser.executeScript("return kwicResults.proxy.prevParams.start")).toBe 175
        expect(browser.executeScript("return kwicResults.proxy.prevParams.end")).toBe 199

    it "should should bring up the correct page", () ->
        expect(elm.getText()).toBe "8"
        expect(browser.executeScript("return search().page")).toBe 7
                
            

# describe "works", () ->
#     rows = null
#     testFilter = () ->
#     beforeEach () ->
#         browser.get "http://localhost:9000/#!/titlar"
#         rows = element.all(By.repeater("row in getSource() | orderBy:sorttuple[0]:sorttuple[1] | filter:{mediatype : mediatypeFilter || ''} | filter:filterTitle | filter:filterAuthor"))


#     it "should filter works using the input", () ->
#         filter = element(By.model("filter"))
#         filter.sendKeys("constru")
#         filter.sendKeys(protractor.Key.ENTER)
#         rows.then () ->
#             expect(rows.count()).toEqual 1

# describe "titles", () ->
#     rows = null
#     testFilter = () ->
#     beforeEach () ->
#         browser.get "http://localhost:9000/#!/titlar?niva=titles"
#         rows = element.all(By.repeater("row in getSource() | orderBy:sorttuple[0]:sorttuple[1] | filter:{mediatype : mediatypeFilter || ''} | filter:filterTitle | filter:filterAuthor"))


#     it "should filter titles using the input", () ->
#         filter = element(By.model("filter"))
#         filter.sendKeys("psalm")
#         filter.sendKeys(protractor.Key.ENTER)
#         rows.then () ->
#             expect(rows.count()).toEqual 779


# describe "epubList", () ->
#     rows = null
#     beforeEach () ->
#         browser.get "http://localhost:9000/#!/epub"
#         rows = element.all(By.repeater("row in rows | filter:rowFilter | orderBy:sorttuple[0]:sorttuple[1]"))


#     it "should filter using the input", () ->
#         filter = element(By.model("filterTxt"))
#         filter.sendKeys("nordanf")
#         rows.then () ->
#             expect(rows.count()).toEqual 1



# describe "reader", () ->
#     ptor = null
#     beforeEach () ->
#         ptor = protractor.getInstance()

#     it "should change page on click", () ->
#         browser.get "http://localhost:9000/#!/forfattare/StrindbergA/titlar/Fadren/sida/3/etext"
#         element(By.css ".pager_ctrls a[rel=next]").click()
#         expect(ptor.getCurrentUrl()).toBe("http://localhost:9000/#!/forfattare/StrindbergA/titlar/Fadren/sida/4/etext")
    
#     it "should correctly handle pagestep", () ->
#         browser.get "http://localhost:9000/#!/forfattare/SilfverstolpeM/titlar/ManneDetGarAn/sida/-7/faksimil"
#         element(By.css ".pager_ctrls a[rel=next]").click()

#         expect(ptor.getCurrentUrl()).toBe("http://localhost:9000/#!/forfattare/SilfverstolpeM/titlar/ManneDetGarAn/sida/-5/faksimil")

# describe "editor", () ->
#     ptor = null
#     beforeEach () ->
#         ptor = protractor.getInstance()

#     it "should change page on click", () ->
#         browser.get "http://localhost:9000/#!/editor/lb238704/ix/3/f"
#         element(By.css ".pager_ctrls a[rel=next]").click()
#         expect(ptor.getCurrentUrl()).toBe("http://localhost:9000/#!/editor/lb238704/ix/4/f")

#         expect(element(By.css "img.faksimil").getAttribute("src"))
#             .toEqual("http://litteraturbanken.se/txt/lb238704/lb238704_3/lb238704_3_0005.jpeg")


    
#     # it "should correctly handle pagestep", () ->
#     #     browser.get "http://localhost:9000/#!/forfattare/SilfverstolpeM/titlar/ManneDetGarAn/sida/-7/faksimil"
#     #     element(By.css ".pager_ctrls a[rel=next]").click()

#     #     expect(ptor.getCurrentUrl()).toBe("http://localhost:9000/#!/forfattare/SilfverstolpeM/titlar/ManneDetGarAn/sida/-5/faksimil")






# describe "search", () ->
#     ptor = null
#     beforeEach () ->
#         ptor = protractor.getInstance()

#         browser.get "http://localhost:9000/#!/sok"
        

#     it "should give search results. ", () ->

#         # element(By.css ".open_toggle").click()
#         # won't work :(
#         # ptor.findElement((By.cssContainingText "#author_select option", "StrindbergA")).then (elem) ->
#         #     elem.click()


        
#         input = element(By.model "query")
#         input.sendKeys("kriget är förklarat!")
#         input.sendKeys(protractor.Key.ENTER)

#         rows = element.all(By.repeater("sent in kwic"))
#         rows.then () ->
#             expect(rows.count()).toEqual 1
