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
        await page.getByText("katter").first().click()

        // Check results
        await expect(page.getByRole("table")).toContainText("katter")
        const hits = (await page.getByText('Results:').last().textContent())?.trim().slice(9)
        expect(Number(hits)).toEqual(total)
    })
})
