import { test, expect } from "@playwright/test";

// The public marketing/legal surface must render for anonymous visitors even
// with no backend configured (graceful degradation). These are smoke + basic
// accessibility/i18n checks — no auth, no external services.

test("home page renders with the brand and a heading", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status(), "home responds").toBeLessThan(400);
  await expect(page).toHaveTitle(/Maktab/i);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("the document declares a language (i18n/a11y)", async ({ page }) => {
  await page.goto("/");
  const lang = await page.locator("html").getAttribute("lang");
  expect(lang, "html[lang] is set").toBeTruthy();
});

for (const path of ["/pricing", "/faq", "/features", "/how-it-works", "/for-students"]) {
  test(`public page ${path} loads and shows content`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `${path} responds`).toBeLessThan(400);
    // A real heading proves the page rendered, not just a blank shell.
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
}

test("the sign-in page is reachable and rendered for signed-out visitors", async ({ page }) => {
  const res = await page.goto("/login");
  expect(res?.status(), "/login responds").toBeLessThan(400);
  // The auth entry point must actually render (a form/heading), not a blank shell.
  await expect(page.locator("form, h1, h2").first()).toBeVisible();
});
