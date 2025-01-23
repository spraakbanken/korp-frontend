/** @format */
import { test, expect } from "@playwright/test"
import { describe } from "node:test"
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

describe("simple search", () => {
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

describe("extended search", () => {
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
