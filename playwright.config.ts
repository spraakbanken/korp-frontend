/** @format */
import { defineConfig, devices } from "@playwright/test"

// Read .env into process.env
import dotenv from "dotenv"
dotenv.config()

// Use same url as dev server
// TODO Add a way to test against live site
const host = process.env.KORP_HOST || "localhost"
const port = process.env.KORP_PORT || 9111
const protocol = process.env.KORP_HTTPS ? "https" : "http"
const url = `${protocol}://${host}:${port}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./test/e2e",
    fullyParallel: true,
    // Fail on CI if we accidentally left test.only in source
    forbidOnly: !!process.env.CI,
    // Retry on CI only
    retries: process.env.CI ? 2 : 0,
    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,
    // Reporter to use. See https://playwright.dev/docs/test-reporters
    reporter: "html",

    // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: url,
        // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
        trace: "on-first-retry",
    },

    // Ensure local dev server is running
    webServer: {
        command: "yarn dev",
        url,
        reuseExistingServer: !process.env.CI,
        // Certificate for dev server is probably self-signed
        ignoreHTTPSErrors: true,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
    ],
})
