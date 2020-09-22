/** @format */
/* eslint-disable
    no-undef,
*/

var waitFor = async function (elm) {
    await browser.wait(() => elm.isPresent())
    await browser.wait(() => elm.isDisplayed())
}

describe("parallel mode", () => {
    it("should perform a kwic search", async () => {
        await browser.get(
            browser.params.url +
                "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0"
        )

        await waitFor(element(by.css("table.kwic")))

        const hits = element(by.css(".results-kwic .num-result"))
        await expect(hits.getText()).toBe("54")
    })

    it("should show a linked sentence", async () => {
        await browser.get(
            browser.params.url +
                "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&page=0"
        )

        await waitFor(element(by.css("table.kwic")))

        const linked = element(by.css("table.kwic tr:nth-child(3) > td.lnk"))
        await expect(linked.getText()).toBe("Honden en katten en ongewassen mensen .")
    })

    it("should perform a statistics search", async () => {
        await browser.get(
            browser.params.url +
                "?mode=parallel#?stats_reduce=word&corpus=saltnld-sv&parallel_corpora=swe&cqp_swe=%5Bword%20%3D%20%22katt%22%5D&search=cqp%7C%5Bword%20%3D%20%22katt%22%5D&result_tab=2"
        )
        // browser.sleep(1000)
        await waitFor(element(by.css("#myGrid div.slick-pane")))
        const hits = element(
            by.css(
                "#myGrid > div.slick-pane.slick-pane-top.slick-pane-left > div.slick-viewport.slick-viewport-top.slick-viewport-left > div > div.ui-widget-content.slick-row.odd > div.slick-cell.l3.r3 > span > span.relStat"
            )
        )
        await expect(hits.getText()).toBe("39,6")
    })
})
