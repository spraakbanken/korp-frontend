import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
    await page.goto("./#?lang=eng&corpus=ordat&search_tab=1")

    // Select the time interval attribute
    await page.locator(".arg_type").selectOption("time interval")

    // Change lower date
    await page.getByRole("button", { name: "1923-01-01" }).click()
    await page.getByRole("button", { name: "15" }).click()
    await page.getByRole("button", { name: "1923-01-15" }).click()

    // Change upper date
    await page.getByRole("button", { name: "1958-12-31" }).click()
    await page.getByRole("button", { name: "07" }).first().click()
    await page.getByRole("button", { name: "1958-12-07" }).click()

    // Check values in advanced search
    await page.getByRole("link", { name: "Advanced" }).click()
    await expect(page.getByText("Active CQP query in extended")).toContainText("int(_.text_datefrom) >= 19230115")
    await expect(page.getByText("Active CQP query in extended")).toContainText("int(_.text_dateto) <= 19581207")
})
