/** @format */
import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("extended search", () => {
    test("extended search with results", async ({ page }) => {
        await page.goto("./#?lang=eng&corpus=attasidor&search_tab=1")
        await page.selectOption(".arg_type", "Swedish FrameNet")
        await page.getByRole("textbox").fill("Animals")

        await page.getByRole("button", { name: "Search" }).click()
        await expect(page.getByRole("table")).toContainText("björn")

        // Search is stored in URL
        await page.reload()
        await expect(page.getByRole("table")).toContainText("björn")
    })
    ;[{ attr: "lemgram" }, { attr: "compounds" }].forEach(({ attr }) =>
        test(`warn about unselected ${attr}`, async ({ page }) => {
            await page.goto(`./#?lang=eng&corpus=suc3&search_tab=1`)

            await page.selectOption("select.arg_type", attr)
            await page.getByRole("textbox").fill("framtid")
            await page.locator("#query_table").click()
            await expect(page.getByText("Choose a value")).toBeVisible()

            await page.getByRole("textbox").fill("frihet")
            await page.getByRole("listbox").getByText("frihet").first().click()
            await expect(page.getByText("Choose a value")).not.toBeVisible()
        })
    )

    test(`reset case sensitive`, async ({ page }) => {
        // Do case-insensitive search
        await page.goto(
            `./#?lang=eng&corpus=vivill&search_tab=1&show_stats&search=cqp&cqp=[word = "framtid" %25c]&result_tab=2`
        )

        // Check advanced query
        await page.getByRole("link", { name: "Advanced" }).click()
        await expect(page.locator("pre").filter({ hasText: "%c" })).toBeVisible()
        await page.getByRole("link", { name: "Extended" }).click()

        // Switch attribute
        await page.selectOption("select.arg_type", "lemgram")
        await page.getByRole("textbox").fill("framtid")
        await page.getByRole("listbox").getByText("framtid").first().click()

        // Check advanced query
        await page.getByRole("link", { name: "Advanced" }).click()
        await expect(page.locator("pre").filter({ hasText: "%c" })).not.toBeVisible()
    })
})
