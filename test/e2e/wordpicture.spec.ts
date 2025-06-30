
import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("word picture", () => {
    test("to sort by LMI/abs", async ({ page }) => {
        // Make a search
        await page.goto("./#?lang=eng&corpus=attasidor&search=word|katt")

        // Go to word picture tab
        await page.getByRole("link", { name: "Word picture" }).click()

        await expect(page.getByRole("heading", { name: "katt (noun)" })).toBeVisible()

        // Ordered by LMI, the first pre-modifier is "sibirisk"
        const table = page.getByRole('table').filter({ hasText: 'sibirisk' })
        await expect(table.getByRole('row').first()).toContainText("sibirisk")

        // Switch to absolute frequency and wait for request to finish
        await page.getByLabel("absolute frequency").click()
        await expect(page.getByRole("progressbar").first()).toBeVisible()
        await expect(page.getByRole("progressbar")).toHaveCount(0)

        // Now "gammal" is first
        const table2 = page.getByRole('table').filter({ hasText: 'sibirisk' })
        await expect(table2.getByRole('row').first()).toContainText("gammal")

        // Word picture is showing if page is reloaded
        await page.reload()
        await expect(page.getByRole("heading", { name: "katt (noun)" })).toBeVisible()
    })

    test("blocked by filters", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill&search=word|miljö&result_tab=3")

        // Enter a filter value
        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("#korp-simple").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()
        await page.getByRole("button", { name: "Search" }).click()

        // Warning showing
        await expect(page.getByRole("status")).toContainText("The word picture cannot be combined with global filters")
    })

    test("example search", async ({ page }) => {
        // Produce a word picture
        await page.goto("./#?lang=eng&corpus=vivill&search=word|miljö&result_tab=3")

        // Switch to absolute frequency and wait for request to finish
        await page.getByLabel("absolute frequency").click()
        await expect(page.getByRole("progressbar").first()).toBeVisible()
        await expect(page.getByRole("progressbar")).toHaveCount(0)

        // For some related word, remember the frequency and click it to open example search
        const row = page.getByRole("row").filter({ hasText: "giftfri" }).first()
        const frequency = (await row.getByRole("cell").nth(2).textContent())?.trim()
        await row.getByText("giftfri").click()

        // Check search results
        await expect(page.getByRole("table")).toContainText("giftfri")
        // The first "Results:" is in the KWIC tab, skip that one.
        const hits = (await page.getByText('Results:').last().textContent())?.trim().slice(9)
        expect(hits).toEqual(frequency)
    })
})
