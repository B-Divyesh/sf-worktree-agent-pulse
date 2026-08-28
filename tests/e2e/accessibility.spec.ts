import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/demo", "/privacy", "/terms", "/missing"]) {
  test(`has no serious accessibility issues on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  });
}

test("keyboard opens and closes worktree details", async ({ page }) => {
  await page.goto("/demo");
  const first = page.locator("[data-worktree]").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "checkout-retry" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".detail-panel")).toHaveCount(0);
});

test("loads without browser console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.goto("/demo");
  expect(errors).toEqual([]);
});

test("footer attribution is text instead of a dead external link", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("footer").getByText("Built by Param Factory", { exact: true })).toBeVisible();
  await expect(page.locator('footer a[href*="param.sociobot.in"]')).toHaveCount(0);
});

test("buy action targets the provisioned checkout endpoint", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Buy Pulse Pro" })).toHaveAttribute(
    "href",
    "https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout",
  );
});
