import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("filters", () => {
    test("filters in simple search", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill")

        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("#korp-simple").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()

        await page.getByRole("textbox").fill("miljö")
        await page.getByRole("button", { name: "Search" }).click()

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

        await page.getByRole("button", { name: "Add party" }).click()
        await page.locator("extended-standard").getByText("Centerpartiet").click()
        await page.getByRole("button", { name: "Party: Centerpartiet" }).click()

        await page.selectOption(".arg_type", "Swedish FrameNet")
        await page.getByRole("textbox").fill("Animals")
        await page.getByRole("button", { name: "Search" }).click()

        await expect(page.getByRole("table")).toContainText("djur")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("djur")
        await page.getByRole("table").locator(".word").first().click()
        await expect(page.locator("sidebar")).toContainText("Centerpartiet")
    })
})
