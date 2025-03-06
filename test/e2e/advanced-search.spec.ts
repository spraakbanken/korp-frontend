/** @format */
import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("advanced search", () => {
    test("advanced search with results", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor&search_tab=2")
        await page.getByRole("textbox").fill('[swefn contains "Animals"]')
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("björn")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("björn")
    })
})
