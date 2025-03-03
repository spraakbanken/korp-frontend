import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
    await page.goto("./#?lang=eng&corpus=attasidor&search_tab=1")

    // Select the time interval attribute
    await page.locator(".arg_type").selectOption("time interval")

    // Change lower date
    await page.getByRole("button", { name: "2002-11-14" }).click()
    await page.getByRole("button", { name: "15" }).click()
    await page.getByRole("button", { name: "2002-11-15" }).click()

    // Change upper date
    await page.getByRole("button", { name: "2024-02-08" }).click()
    await page.getByRole("button", { name: "07" }).first().click()
    await page.getByRole("button", { name: "2024-02-07" }).click()

    // Check values in advanced search
    await page.getByRole("link", { name: "Advanced" }).click()
    await expect(page.getByText("Active CQP query in extended")).toContainText("int(_.text_datefrom) > 20021115")
    await expect(page.getByText("Active CQP query in extended")).toContainText("int(_.text_dateto) < 20240207")
})
