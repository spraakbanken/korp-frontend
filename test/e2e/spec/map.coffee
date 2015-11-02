describe "map", () ->

    it "should show the correct markers", () ->
        browser.get "http://localhost:9001/#?lang=sv&cqp=%5B%5D&corpus=suc2&page=0&show_map&search=lemgram%7Cskog..nn.1&result_tab=1"
        expect(getMarkers().count()).toBe 7
        expect(getMapsHits()).toBe '7'

    it "should not display map when there are 0 hits", () ->
        browser.get "http://localhost:9001/#?lang=sv&cqp=%5B%5D&corpus=suc2&show_map&search=word%7Ctall&result_tab=1"
        expect(getMapsHits()).toBe '0'

        element.all(By.css ".angular-leaflet-map").then (items) ->
            expect(items.length).toBe 0
# 
    it "should be possible to click the markers and get a link to the kwic search", () ->
        browser.get "http://localhost:9001/#?lang=sv&cqp=%5B%5D&corpus=suc2&page=0&show_map&search=lemgram%7Cskog..nn.1&result_tab=1"
        
        marker = getMarkers().last()
        marker.click() 

        popup = element (By.css ".leaflet-popup-content .link")
        waitFor popup
        popup.click()
        
        # TODO: the KWIC call fails due to some internal error making start and end parameters NaN

waitFor = (elm) ->
    browser.wait () ->
        return elm.isPresent()
    browser.wait () ->
        return elm.isDisplayed()

getMapElem = () ->
    return element (By.css ".angular-leaflet-map")

getMarkers = () ->
    waitFor getMapElem()
    return element.all (By.css ".angular-leaflet-map .leaflet-marker-icon")

getMapsHits = () ->
    mapDiv = element (By.css "#mapTab")
    waitFor mapDiv
    hitSpan = (element.all By.css "#mapHits span").last()
    return hitSpan.getText()