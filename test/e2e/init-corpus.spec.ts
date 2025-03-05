import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("init corpus selection", () => {
    test("none selected", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=")
        await expect(page.locator("corpus-chooser")).toContainText("23 of")
    })

    test("few selected", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da")
        await expect(page.locator("corpus-chooser")).toContainText("2 of")
    })

    test("some nonexisting", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da,abc")
        await expect(page.getByRole("dialog")).toContainText("Some selected corpora are not available")
        await page.getByRole("button").click()
        await expect(page.locator("corpus-chooser")).toContainText("2 of")
    })

    test("all nonexisting", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=abc,def")
        await expect(page.getByRole("dialog")).toContainText("Some selected corpora are not available")
        await page.getByRole("button").click()
        await expect(page.locator("corpus-chooser")).toContainText("23 of")
    })

    test("some protected", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor,da,asu")
        await expect(page.getByRole("dialog")).toContainText("Login needed")
        await page.getByRole("button").click()
        // Dismiss login prompt
        await page.locator(".close-x").click()
        await expect(page.locator("corpus-chooser")).toContainText("2 of")
    })

    test("all protected", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=asu")
        await expect(page.getByRole("dialog")).toContainText("Login needed")
        await page.getByRole("button").click()
        // Dismiss login prompt
        await page.locator(".close-x").click()
        await expect(page.locator("corpus-chooser")).toContainText("23 of")
    })
})
