import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("KWIC", () => {
    test("progress bar and first page preview", async ({ page }) => {
        // Let a large corpus be last, so the full result takes longer than the first page
        // Corpora are searched in alphabetical order
        await page.goto("./#?lang=eng&corpus=suc3,wikipedia-sv")

        // Disable backend cache so the search doesn't load too fast
        await page.route("**/query*", async (route) => {
            await route.continue({ url: route.request().url() + "&cache=false" })
        })

        // Make a search wide enough that the first page covers only one corpus, and the remaining corpora take a while to search
        await page.getByRole("textbox").fill("kunskap")
        await page.getByRole("button", { name: "Search" }).click()

        // Progress bar visible
        await expect(page.getByRole("progressbar").first()).toBeVisible()

        // Wait for first page to load
        await expect(page.getByRole("table")).toContainText("kunskap")

        // Progress bar visible while rest of result still loading
        await expect(page.getByRole("progressbar").first()).toBeVisible()

        // Eventually, full result is done
        await expect(page.getByRole("progressbar")).toHaveCount(0, { timeout: 20000 })
    })

    test("context view", async ({ page }) => {
        // Context search is slow, so use a small corpus
        await page.goto("./#?lang=eng&corpus=psalmboken&search=word|Så skall min skröplighet")

        // Expect result without context
        await expect(page.getByRole("table")).toContainText("Så skall min skröplighet")
        await expect(page.getByRole("table")).not.toContainText("Men mörkrets makt är stor")

        // Enable context, automatically updates the search
        await page.getByLabel("Show context").click()

        // Expect result with context
        await expect(page.locator(".results_table")).toContainText("Så skall min skröplighet", { timeout: 10000 })
        await expect(page.locator(".results_table")).toContainText("Men mörkrets makt är stor")
    })
})
