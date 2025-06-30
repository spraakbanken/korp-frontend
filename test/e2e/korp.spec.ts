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
})
