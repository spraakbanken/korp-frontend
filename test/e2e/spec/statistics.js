/* eslint-disable
    no-undef,
*/

var fs = require('fs');

// abstract writing screen shot to a file
function writeScreenShot(data, filename) {
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
}


browser.manage().logs()
  .get('browser').then(function(browserLog) {
  console.log('log: ' + 
    require('util').inspect(browserLog));
});

describe("stats table", function() {

    const waitFor = function(elm) {
        browser.wait(() => elm.isPresent())
        browser.wait(() => elm.isDisplayed())
    }

    it("should show the correct rows and columns", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(function() {
            console.log(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2")
            browser.sleep(5000).then( () => {

                const rows = element.all((by.css('.slick-row')))
                browser.executeScript('window.scrollTo(0,3000);').then( () =>
                browser.takeScreenshot().then(function (png) {
                     writeScreenShot(png, 'exception.png');
                 })
                )
            expect(rows.count()).toBe(10)
            } )
            
            // expect a column for hit, total, suc2, suc3
            const columns = element.all((by.css('.slick-column-name')))
            expect(columns.get(1).getText()).toBe("ord")
            expect(columns.get(3).getText()).toBe("Totalt")
            expect(columns.get(4).getText()).toBe("SUC 2.0")
            expect(columns.get(5).getText()).toBe("SUC 3.0")
        })
    )

    it("should return expected  results for reduce on word", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2").then(function() {
            const rows = element.all((by.css('.slick-row')))

            browser.sleep(1000)

            // total row
            rows.get(0).getText().then(text => expect(text.replace(/\n/g, " ")).toBe("Σ 2 145,1 (5 005) 2 144,7 (2 502) 2 145,6 (2 503)"))

            // gått 
            rows.get(4).getText().then(text => expect(text.replace(/\n/g, " ")).toBe("gått 206,6 (482) 206,6 (241) 206,6 (241)"))
        })
    )

    it("should work to open arc diagram with the correct result", () =>
        browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2&stats_reduce=lemma").then(function() {
            browser.sleep(1000)
            const arcDiagramButtons = element.all((by.css('.slick-row .arcDiagramPicture')))
            expect(arcDiagramButtons.count()).toBe(3)

            arcDiagramButtons.get(0).click()

            const pieDiv = element((by.css('#pieDiv')))
            expect(pieDiv.isDisplayed()).toBe(true)
            expect((element((by.css('#pieDiv .radioList_selected')))).getText()).toBe("Relativa frekvenser")
            element(by.css('#pieDiv [data-mode=absolute]')).click()
            expect((element((by.css('#pieDiv .radioList_selected')))).getText()).toBe("Absoluta frekvenser")
        })
    )

    it("should be possible to do a KWIC search on the rows, multi-word", () =>
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=saldo&corpus=suc2,suc3&search=word|gå ut").then(function() {
            let rows
            browser.sleep(500)
            rows = element.all((by.css('.slick-row .link')))
        })
    )
            // todo this does not count all rows
            // expect(rows.count()).toBe ??

            // TODO fails because if weird NaN error on start & end parameters
            // 1. rows.get(14).click()
            // 2. assert result total is 80
            // 3. rows.get(17).click() 
            // 4. assert result total is 4

    it("should be possible to reduce on more than one attribute", () =>
        browser.get(browser.params.url + "#?result_tab=2&stats_reduce=word,msd,lex&corpus=suc2,suc3&search=word|gå ut").then(function() {

            const table = element((by.css("#myGrid")))
            waitFor(table)
            
            browser.sleep(1000)

            // expect a column for hit, total, suc2, suc3
            const columns = element.all((by.css('.slick-column-name')))
            expect(columns.get(1).getText()).toBe("ord")
            expect(columns.get(2).getText()).toBe("msd")
            expect(columns.get(3).getText()).toBe("lemgram")
            
            expect(columns.get(5).getText()).toBe("Totalt")
            expect(columns.get(6).getText()).toBe("SUC 2.0")
            expect(columns.get(7).getText()).toBe("SUC 3.0")

            const rows = element.all(by.css('.slick-row'))
            // todo this does not count all rows
            // expect(rows.count()).toBe 43
            
            // total row
            rows.get(0).getText().then(text => expect(text.replace(/\n/g, " ")).toBe("Σ Σ Σ 140,6 (328) 140,6 (164) 140,6 (164)"))
        })
    )
})

            // TODO this always fails
            // rows.get(21).getText().then (text) ->
            //     expect(text.replace /\n/g, " ").toBe "gå ut VB.INF.AKT AB gå på (verb) gå ut (verb) 0,4 (1) 0,9 (1) 0 (0)"
