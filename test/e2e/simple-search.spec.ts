/** @format */
import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("simple search", () => {
    test("simple word search with results", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor")
        await page.getByRole("textbox").fill("katt")

        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("katt")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("katt")
    })

    test("simple lemgram search with results", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor")
        await page.getByRole("textbox").fill("katt")

        // Select lemgram
        await page.getByRole("listbox").getByText("katt").first().click()
        expect(await page.getByRole("textbox").getAttribute("placeholder")).toContain("katt")

        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("katter")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("katter")
    })

    test("lemgram suggestions", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=suc3")

        // Type and select a lemgram
        await page.getByRole("textbox").fill("framtid")
        await page.getByRole("listbox").getByText("framtid").first().click()
        expect(await page.getByRole("textbox").getAttribute("placeholder")).toContain("framtid")

        // Change, do not select, search
        await page.getByRole("textbox").fill("jämlikhet")
        await expect(page.getByRole("listbox").getByText("jämlikhet")).toBeVisible()
        await page.getByRole("button", { name: "Search" }).click()

        // Change again
        await page.getByRole("textbox").fill("frihet")
        await expect(page.getByRole("listbox").getByText("frihet")).toBeVisible()
    })

    test("related words should appear", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=vivill&search=lemgram|framtid\\.\\.nn\\.1")
        await page.getByText("Related words").click()
        await expect(page.getByRole("dialog")).toContainText(/utsikt/)
    })
})
