import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("search history", () => {
    test("simple search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor")

        // Search for "katt"
        await page.getByRole("textbox").fill("katt")
        await page.getByRole("button", { name: "Search" }).click()

        // Search for "hund"
        await page.getByRole("textbox").fill("hund")
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("hund")

        // Redo the "katt" search
        await page.locator("search-history").getByRole("combobox").selectOption("katt")
        await expect(page.getByRole("table")).toContainText("katt")
    })

    test("extended search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor&search_tab=1")

        // Search for "katt"
        await page.locator("#query_table").getByRole("textbox").fill("katt")
        await page.getByRole("button", { name: "Search" }).click()

        // Search for "hund"
        await page.locator("#query_table").getByRole("textbox").fill("hund")
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("hund")

        // Redo the "katt" search
        await page.locator("search-history").getByRole("combobox").selectOption('[word = "katt"]')
        await expect(page.getByRole("table")).toContainText("katt")
    })

    test("advanced search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor&search_tab=2")

        // Search for "katt"
        await page.locator("textarea").fill('[word = "katt"]')
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("katt")

        // Search for "hund"
        await page.locator("textarea").fill('[word = "hund"]')
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("hund")

        // Redo the "katt" search
        await page.locator("search-history").getByRole("combobox").selectOption('[word = "katt"]')
        await expect(page.getByRole("table")).toContainText("katt")
    })

    test("parameters", async ({ page }) => {
        const filters = btoa(JSON.stringify({ text_party_name: ["Centerpartiet"] }))
        // Make a complicated search
        await page.goto(
            `./#?lang=eng&corpus=vivill&search=word|djur&global_filter=${filters}&mid_comp&isCaseInsensitive`
        )
        await expect(page.getByRole("table")).toContainText("djur")
        const hits = await page.locator(".num-result").textContent()
        expect(hits).toBeTruthy()

        // Load fresh page
        await page.goto("./#?lang=eng")
        await page.reload()

        // Redo search
        await page.locator("search-history").getByRole("combobox").selectOption("djur")

        // Check that options are restored
        await expect(page.getByLabel("medial part")).toBeChecked()
        await expect(page.getByLabel("case-insensitive")).toBeChecked()

        // Check that filter is restored
        await expect(page.getByRole("button", { name: "party: Centerpartiet" })).toBeVisible()
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")

        // Check that hit count is the same
        const hits2 = await page.locator(".num-result").textContent()
        expect(hits2).toBe(hits)
    })
})
