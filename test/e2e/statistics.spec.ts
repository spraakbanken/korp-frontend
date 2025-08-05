import { expect, test } from "@playwright/test"
import { describe } from "node:test"

const sum = (xs: number[]) => xs.reduce((sum, x) => sum + x, 0)

describe("statistics", () => {
    test("total", async ({ page }) => {
        // Make a lemgram search in two corpora
        await page.goto("/#?lang=eng&corpus=attasidor,da&search=lemgram|katt\.\.nn\.1")

        // Open statistics and check result
        await page.getByRole("link", { name: "Statistics" }).click()
        await expect(page.getByText("Number of rows: 8")).toBeVisible()

        // Select a row, check the sum column
        const row = page.locator(".slick-row").filter({ hasText: "katter" }).first()
        const numbers = (await row.locator(".slick-cell").filter({ hasText: /\d+/ }).allTextContents()).map(Number)
        expect(sum(numbers.slice(1))).toEqual(Number(numbers[0]))

        // Reload and check result
        await page.reload()
        await expect(page.getByText("Number of rows: 8")).toBeVisible()
    })

    test("example", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da&search=lemgram|katt\.\.nn\.1&result_tab=2")

        // Open example search, check results
        const row = page.locator(".slick-row").filter({ hasText: "katter" }).first()
        const total = Number(await row.locator(".slick-cell").filter({ hasText: /\d+/ }).first().textContent())
        await row.getByText("katter").first().click()

        // Check results
        await expect(page.getByRole("table")).toContainText("katter")
        const hits = (await page.getByText('Results:').last().textContent())?.trim().slice(9)
        expect(Number(hits)).toEqual(total)
    })

    test("group by", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da&search=lemgram|katt\.\.nn\.1&result_tab=2")
        await expect(page.getByText("Number of rows: 8")).toBeVisible()

        // Modify selection of attributes to group the statistics by
        await page.getByLabel("Group by:").click()
        await page.getByRole("option", { name: "sense" }).click()
        await page.getByRole("option", { name: "msd" }).click()
        await page.getByLabel("Group by:").click()
        await expect(page.getByLabel("Group by:")).toHaveText('word, sense, msd')

        // Result should reload
        // There are a few more rows
        await expect(page.getByText("Number of rows: 11")).toBeVisible()

        // Reload and check result
        await page.reload()
        await expect(page.getByText("Number of rows: 11")).toBeVisible()
    })

    test("case-insensitive word", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da&search=lemgram|katt\.\.nn\.1&result_tab=2")
        await expect(page.getByText("Number of rows: 8")).toBeVisible()

        // Set case-insensitive
        await page.getByLabel("Group by:").click()
        await page.getByRole("button", { name: "Aa" }).click()
        await page.getByLabel("Group by:").click()

        // Result should reload
        // There should be fewer rows
        await expect(page.getByText("Number of rows: 5")).toBeVisible()

        // Reload and check result
        await page.reload()
        await expect(page.getByText("Number of rows: 5")).toBeVisible()

        // Open example search, check results
        const row = page.locator(".slick-row").filter({ hasText: "katter" }).first()
        const total = Number(await row.locator(".slick-cell").filter({ hasText: /\d+/ }).first().textContent())
        await row.getByText("katter").first().click()

        // Check results
        await expect(page.getByRole("table")).toContainText("katter")
        const hits = (await page.getByText('Results:').last().textContent())?.trim().slice(9)
        expect(Number(hits)).toEqual(total)
    })

    test("group-by fallback on corpus change", async ({ page }) => {
        // Search in drama and group by the author attribute
        await page.goto("/#?lang=eng&corpus=drama&search=lemgram|stad\.\.nn\.1&stats_reduce=text_author&result_tab=2")
        await expect(page.locator("corpus-chooser")).toBeVisible() // Wait for initialization

        // Switch corpus to folke which has no author attribute
        await page.locator("corpus-chooser").click()
        await page.getByText("Select none").click()
        await page.getByText("Folke").click()
        await expect(page.locator("corpus-chooser")).toContainText("Folke selected")

        // Fall back to word
        await expect(page.getByLabel("Group by:")).toHaveText('word')
    })
})
