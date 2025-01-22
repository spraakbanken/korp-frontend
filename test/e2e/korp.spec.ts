import { test, expect } from "@playwright/test";
import { describe } from "node:test";

test("has description", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/Korp/);
  await expect(page.locator("#content")).toContainText(
    "Språkbankens ordforskningsplattform"
  );
});

test("select corpus", async ({ page }) => {
  await page.goto("./");
  await page.locator("corpus-chooser").click();
  await page.getByText("Avmarkera").click();
  await page.getByText("SUC 3.0").click();
  await page.locator("corpus-chooser").click();
  await expect(page.locator("corpus-chooser")).toContainText("SUC 3.0");
  await expect(page.locator("corpus-chooser")).not.toContainText("SUC 2.0");
});

function korpUrl(options?: {
  corpus?: string | string[];
  search?: string;
  cqp?: string;
  search_tab?: number;
}) {
  const params = new URLSearchParams();
  params.set("lang", "eng");
  if (options?.corpus) {
    const corpus = Array.isArray(options.corpus)
      ? options.corpus
      : [options.corpus];
    params.set("corpus", corpus.join(","));
  }
  if (options?.search) params.set("search", options.search);
  if (options?.cqp) params.set("cqp", options.cqp);
  if (options?.search_tab) params.set("search_tab", String(options.search_tab));
  return `./#?${params.toString()}`;
}

describe("simple search", () => {
  test("related words should appear", async ({ page }) => {
    await page.goto(
      korpUrl({ corpus: "vivill", search: "lemgram|framtid\\.\\.nn\\.1" })
    );
    await page.getByText("Related words").click();
    await expect(page.getByRole("dialog")).toContainText(/utsikt/);
  });

  test("lemgram suggestions", async ({ page }) => {
    await page.goto(korpUrl({ corpus: ["suc3"] }));
    await page.getByRole("textbox").fill("framtid");
    await page.getByRole("listbox").getByText("framtid").first().click();

    // Change, do not select
    await page.getByRole("textbox").fill("fritid");
    await page.getByRole("listbox").getByText("fritid").isVisible();
    await page.getByRole("button", { name: "Search" }).click();

    // Change again
    await page.getByRole("textbox").fill("frihet");
    await page.getByRole("listbox").getByText("fritid").isVisible();
  });
});

describe("extended search", () => {
  test("warnings when using lemgram, initial part and final part", async ({
    page,
  }) => {
    await page.goto(korpUrl({ corpus: "suc3", search_tab: 1 }));

    async function check() {
      await page.getByRole("textbox").fill("framtid");
      await page.locator("#query_table").click();
      await expect(page.getByText("Choose a value")).toBeVisible();

      await page.getByRole("textbox").fill("frihet");
      await page.getByRole("listbox").getByText("frihet").first().click();
      await expect(page.getByText("Choose a value")).not.toBeVisible();
    }

    await page.selectOption("select.arg_type", "lemgram");
    await check();

    await page.selectOption("select.arg_type", "compounds");
    await check();
  });
});
