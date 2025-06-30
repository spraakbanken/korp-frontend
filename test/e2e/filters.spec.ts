import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("filters", () => {
    test("filters in simple search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill")

        // Enter a filter value
        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("#korp-simple").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()

        // Make a search
        // Use the same word as in the advanced-search test case below, so we can compare hits
        await page.getByRole("textbox").fill("miljö")
        await page.getByRole("button", { name: "Search" }).click()

        // Check that the first hit matches the filter
        await expect(page.getByRole("table")).toContainText("miljö")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")

        // Search is stored in URL
        await page.reload()
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")
    })

    test("filters in extended search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill&search_tab=1")

        // Enter a filter value
        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("extended-standard").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()

        // Make a search
        await page.selectOption(".arg_type", "Swedish FrameNet")
        await page.getByRole("textbox").fill("Animals")
        await page.getByRole("button", { name: "Search" }).click()

        // Check that the first hit matches the filter
        await expect(page.getByRole("table")).toContainText("djur")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("djur")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")
    })

    test("no filters in advanced search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill")

        // Enter a filter value in simple search
        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("#korp-simple").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()

        // Go to advanced search and make a search
        // Use the same word in the simple-search test case above, so we can compare hits
        await page.getByRole('link', { name: 'Advanced' }).click()
        await page.getByRole("textbox").fill('[word = "miljö"]')
        await page.getByRole("button", { name: "Search" }).click()

        // Check that the first hit does not match the filter
        await expect(page.getByRole("table")).toContainText("miljö")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).not.toContainText("Centerpartiet")

        // Filter param in URL does not affect search either
        await page.reload()
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).not.toContainText("Centerpartiet")
    })

    test("escaping values", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=aspacsv")

        // Enter a filter value with special characters
        await page.getByRole("button", { name: "Add author" }).click()
        await page.locator("#korp-simple").getByText("J.R.R. Tolkien").click()
        await page.getByRole("button", { name: "Author: J.R.R. Tolkien" }).click()

        // Search and check that there are results
        await page.getByRole("textbox").fill("Smaug")
        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("Smaug")
    })

    test("empty value", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=aspacsv")

        // Enter an empty filter value
        await page.getByRole("button", { name: "Add description" }).click()
        await page.locator("#korp-simple").getByText("–").click()
        await page.getByRole("button", { name: "Description: –" }).click()

        // Make a search
        await page.getByRole("textbox").fill("draken")
        await page.getByRole("button", { name: "Search" }).click()

        // Check results
        await expect(page.getByRole("table")).toContainText("draken")

        // Check query
        await page.getByRole('link', { name: 'Advanced' }).click()
        await expect(page.locator("pre").first()).toContainText('_.text_description = ""')
    })
})
