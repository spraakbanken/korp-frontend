import { test, expect, Page } from "@playwright/test"
import { describe } from "node:test"

describe("init corpus selection", () => {
    test("no param", async ({ page }) => {
        await page.goto("/#?lang=eng")
        await expect(page.locator("corpus-chooser")).toContainText("23 of")
    })

    test("empty param", async ({ page }) => {
        // This case is not expected, so it's not very important what it resolves to, but let's make sure there's no error.
        await page.goto("/#?lang=eng&corpus=")
        await expect(page.locator("corpus-chooser")).toContainText("0 of")
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

    test("folder on first level", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=strindberg")
        await expect(page.locator("corpus-chooser")).toContainText("2 of")
    })

    test("folder on sub level", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=newstexts.svtnews")
        await expect(page.locator("corpus-chooser")).toContainText("21 of")
    })
})

describe("changing corpus selection", () => {
    let settings: any

    const getUrlParam = (url: string) => new URLSearchParams(new URL(url).hash.slice(1)).get("corpus")

    test("corpus chooser", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor")
        await expect(page.locator("corpus-chooser")).toBeVisible() // Wait for initialization

        // Add to selection
        await page.locator("corpus-chooser").click()
        await page.getByText("Dramawebben (demo)").click()
        await expect(page.locator("corpus-chooser")).toContainText("2 of")
        expect(getUrlParam(page.url())).toEqual("attasidor,drama")

        // Remove from selection
        await page.getByText("Dramawebben (demo").click()
        await expect(page.locator("corpus-chooser")).toContainText("8 Sidor selected")
        expect(getUrlParam(page.url())).toEqual("attasidor")
    })

    test("select recently updated corpus", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor")
        await expect(page.locator("corpus-chooser")).toBeVisible() // Wait for initialization

        // Find most recently updated corpus
        const corpus: any = await page.evaluate(() => {
            const corpora = Object.values(settings.corpora)
            corpora.sort((a: any, b: any) => (b.info.Updated || '0').localeCompare(a.info.Updated || '0'))
            return corpora[0]
        })
        const title = corpus.title["eng"]
        // Click its select button on the frontpage
        await page.getByText(`${title} was updated`).getByRole("button").click()

        // Only the new corpus is selected
        await expect(page.locator("corpus-chooser")).toContainText(`${title} selected`)
        expect(getUrlParam(page.url())).toEqual(corpus.id)
    })

    test("select folder with protected corpora", async ({ page }) => {
        await page.goto("/#?lang=eng&corpus=attasidor")
        await expect(page.locator("corpus-chooser")).toBeVisible() // Wait for initialization

        // Select a folder with protected and non-protected corpora
        await page.locator("corpus-chooser").click()
        await page.getByText("L2 Korp").click()
        await expect(page.locator("corpus-chooser")).toContainText("4 of")
        expect(getUrlParam(page.url())).toEqual("attasidor,coctaill-ae,coctaill-lt,coctaill")
    })
})
