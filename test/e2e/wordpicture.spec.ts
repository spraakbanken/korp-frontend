
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
    })
})
