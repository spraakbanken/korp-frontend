import { test, expect, Page } from "@playwright/test"
import { describe } from "node:test"

/** Counts aborted requests sent from a page. */
class AbortedCounter {
    abortedCount = 0

    constructor(page: Page) {
        page.on("requestfailed", (request) => {
            if (request.failure()?.errorText.includes("ABORTED")) {
                this.abortedCount++;
            }
        });
    }
}

describe("abort", () => {
    test("by pressing escape", async ({ page }) => {
        const abortedCounter = new AbortedCounter(page);

        // Make a search
        await page.goto("./#?lang=eng&corpus=vivill")
        await page.getByRole("textbox").fill("miljö")
        await page.getByRole("button", { name: "Search" }).click()

        // Press escape
        await page.keyboard.press("Escape")

        // Check that the search was aborted
        expect(abortedCounter.abortedCount).toBe(1)
        await expect(page.getByRole("table")).toHaveCount(0)
        await expect(page.getByRole("status")).toContainText("The search was aborted")
    })

    test("current search when starting a new one", async ({ page }) => {
        const abortedCounter = new AbortedCounter(page);

        // Make a search
        await page.goto("./#?lang=eng&corpus=vivill")
        await page.getByRole("textbox").fill("trafikslag")
        await page.getByRole("button", { name: "Search" }).click()

        // Start a new search
        await page.getByRole("textbox").fill("lagtext")
        await page.getByRole("button", { name: "Search" }).click()

        // Check that the first search was aborted
        expect(abortedCounter.abortedCount).toBe(1)
        await expect(page.getByRole("table")).not.toContainText("trafikslag")
        await expect(page.getByRole("table")).toContainText("lagtext")
    })

    test("when paging quickly", async ({ page }) => {
        const abortedCounter = new AbortedCounter(page);

        // Make a search
        await page.goto("./#?lang=eng&corpus=vivill")
        await page.getByRole("textbox").fill("miljö")
        await page.getByRole("button", { name: "Search" }).click()

        // Click next page quickly
        await page.locator(".pagination-next").first().click()
        await page.locator(".pagination-next").first().click()
        await page.locator(".pagination-next").first().click()

        // Check that the first pager requests were aborted
        expect(abortedCounter.abortedCount).toBe(2)
    })
})
