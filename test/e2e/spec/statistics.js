/** @format */
/* eslint-disable
    no-undef,
*/
browser
    .manage()
    .logs()
    .get("browser")
    .then(function (browserLog) {
        console.log("log: " + require("util").inspect(browserLog))
    })

describe("stats table", function () {
    const waitFor = async function (elm) {
        await browser.wait(() => elm.isPresent())
        await browser.wait(() => elm.isDisplayed())
        return elm
    }

    it("should show the correct rows and columns", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2&show_stats")
        await browser.sleep(1000)
        const rows = element.all(by.css(".slick-row"))
        await expect(rows.count()).toBe(10)

        // expect a column for hit, total, suc2, suc3
        const columns = element.all(by.css(".slick-column-name"))
        await expect(columns.get(1).getText()).toBe("ord")
        await expect(columns.get(3).getText()).toBe("Totalt")
        await expect(columns.get(4).getText()).toBe("SUC 2.0")
        await expect(columns.get(5).getText()).toBe("SUC 3.0")
    })

    it("should return expected  results for reduce on word", async () => {
        await browser.get(browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2&show_stats")
        await browser.sleep(1000)
        const rows = element.all(by.css(".slick-row"))

        // total row
        let totalRow = await rows.get(0)
        let text = await totalRow.getText()
        await expect(text.replace(/\n/g, " ")).toBe("Σ 2 145,1 (5 005) 2 144,7 (2 502) 2 145,6 (2 503)")

        // gått
        text = await rows.get(4).getText()

        await expect(text.replace(/\n/g, " ")).toBe("gått 206,6 (482) 206,6 (241) 206,6 (241)")
    })

    it("should work to open arc diagram with the correct result", async () => {
        await browser.get(
            browser.params.url + "#?corpus=suc2,suc3&search=lemgram|gå..vb.1&result_tab=2&stats_reduce=lemma&show_stats"
        )
        // browser.sleep(1000)
        const table = element(by.css("#myGrid"))
        await waitFor(table)
        const arcDiagramButtons = element.all(by.css(".slick-row .arcDiagramPicture"))
        await expect(arcDiagramButtons.count()).toBe(3)

        await arcDiagramButtons.get(0).click()

        const pieDiv = await waitFor(element(by.css("#pieDiv")))
        await expect(pieDiv.isDisplayed()).toBe(true)
        await expect(element(by.css("#pieDiv .radioList_selected")).getText()).toBe("Relativa frekvenser")
        await element(by.css("#pieDiv [data-mode=absolute]")).click()
        await expect(element(by.css("#pieDiv .radioList_selected")).getText()).toBe("Absoluta frekvenser")
    })

    it("should be possible to reduce on more than one attribute", async () => {
        await browser.get(
            browser.params.url +
                "#?result_tab=2&stats_reduce=word,msd,lex&corpus=suc2,suc3&search=word|gå ut&show_stats"
        )

        const table = element(by.css("#myGrid"))
        await waitFor(table)

        // expect a column for hit, total, suc2, suc3
        const columns = element.all(by.css(".slick-column-name"))
        await waitFor(columns)
        await expect(columns.get(1).getText()).toBe("ord")
        await expect(columns.get(2).getText()).toBe("msd")
        await expect(columns.get(3).getText()).toBe("lemgram")

        await expect(columns.get(5).getText()).toBe("Totalt")
        await expect(columns.get(6).getText()).toBe("SUC 2.0")
        await expect(columns.get(7).getText()).toBe("SUC 3.0")

        const rows = element.all(by.css(".slick-row"))
        // todo this does not count all rows
        // await expect(rows.count()).toBe 43

        // total row
        const text = await rows.get(0).getText()
        await expect(text.replace(/\n/g, " ")).toBe("Σ Σ Σ 140,6 (328) 140,6 (164) 140,6 (164)")
    })
})

// TODO this always fails
// rows.get(21).getText().then (text) ->
//     await expect(text.replace /\n/g, " ").toBe "gå ut VB.INF.AKT AB gå på (verb) gå ut (verb) 0,4 (1) 0,9 (1) 0 (0)"
