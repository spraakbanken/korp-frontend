import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("parallel", () => {
    test("basic search", async ({ page }) => {
        await page.goto("./?mode=parallel#?lang=eng&corpus=aspacsven-sv")
        await page.getByRole("textbox").fill("katt")

        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("katt")
        await expect(page.getByRole("table")).toContainText("cat")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("katt")
        await expect(page.getByRole("table")).toContainText("cat")
    })
})
