/** @format */
import { test, expect } from "@playwright/test"
import { describe } from "node:test"

describe("korp", () => {
    ;[
        { lang: "swe", text: "Språkbankens ordforskningsplattform" },
        { lang: "eng", text: "Språkbanken's word research platform" },
    ].forEach(({ lang, text }) =>
        test(`has tagline ${lang}`, async ({ page }) => {
            await page.goto(`./#?lang=${lang}`)
            await expect(page).toHaveTitle(/Korp/)
            await expect(page.locator("#content")).toContainText(text)
        })
    )

    test("select corpus", async ({ page }) => {
        await page.goto("./#?lang=swe")
        await page.locator("corpus-chooser").click()
        await page.getByText("Avmarkera").click()
        await page.getByText("SUC 3.0").click()
        await page.locator("corpus-chooser").click()
        await expect(page.locator("corpus-chooser")).toContainText("SUC 3.0")
        await expect(page.locator("corpus-chooser")).not.toContainText("SUC 2.0")
    })
})
