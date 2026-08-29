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
  const heading = page.getByRole("heading", { name: "checkout-retry" });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  const drawerResults = await new AxeBuilder({ page: page as never }).include(".detail-panel").analyze();
  expect(drawerResults.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator(".detail-panel")).toHaveCount(0);
  await expect(first).toBeFocused();
});

test("demo keeps legal navigation and sample semantics visible", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByRole("link", { name: "Privacy" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Terms" }).first()).toBeVisible();
  await expect(page.getByText("Built by Param Factory · v0.1.8")).toBeVisible();
  await expect(page.getByText("Sample snapshot · no Git scan ran")).toBeVisible();
  await expect(page).toHaveTitle("Demo — Worktree Agent Pulse");
});

test("landing provides three captioned desktop walkthrough frames", async ({ page }) => {
  await page.goto("/");
  const walkthrough = page.locator(".walkthrough");
  await expect(walkthrough.locator("figure")).toHaveCount(3);
  await expect(walkthrough.locator("img")).toHaveCount(3);
  for (const image of await walkthrough.locator("img").all()) await expect(image).toHaveAttribute("alt", /.+/);
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

test("mobile controls have 44px touch targets on every public route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/demo", "/privacy", "/terms", "/missing"]) {
    await page.goto(route);

    const controls = page.locator("a, button");
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      if (!await control.isVisible()) continue;

      const label = (await control.innerText()).trim().replace(/\s+/g, " ") || await control.getAttribute("aria-label") || `control ${index}`;
      const box = await control.boundingBox();
      expect(box, `${route}: ${label} has a measurable hit area`).not.toBeNull();
      expect(box?.width, `${route}: ${label} is at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box?.height, `${route}: ${label} is at least 44px high`).toBeGreaterThanOrEqual(44);
    }
  }
});

test("desktop controls have 44px targets on every public route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/", "/demo", "/privacy", "/terms", "/missing"]) {
    await page.goto(route);
    const controls = page.locator("a, button");
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      if (!await control.isVisible()) continue;
      const box = await control.boundingBox();
      const label = (await control.innerText()).trim().replace(/\s+/g, " ") || await control.getAttribute("aria-label") || `control ${index}`;
      expect(box?.width, `${route}: ${label} is at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box?.height, `${route}: ${label} is at least 44px high`).toBeGreaterThanOrEqual(44);
    }
  }
});

test("privacy reflows at 200 percent text on a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/privacy");
  await page.addStyleTag({ content: ":root { font-size: 200% !important; }" });
  expect(await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }))).toEqual({ document: 390, viewport: 390 });
  const heading = page.getByRole("heading", { level: 1 });
  expect(await heading.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
});

test("empty license validation explains the error and focuses the field", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/verify?license=")) requests.push(request.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: "Restore a license" }).click();
  await page.getByRole("button", { name: "Verify license" }).click();
  const input = page.getByLabel("License token");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter the license token from your purchase email.")).toBeVisible();
  expect(requests).toEqual([]);
});

test("terminal preview gives a visible result", async ({ page }) => {
  await page.goto("/demo");
  await page.locator('[data-worktree="wt-checkout"]').click();
  await page.getByRole("button", { name: "Preview terminal action" }).click();
  await expect(page.locator(".action-note")).toHaveText("Installed Pulse would open /Users/mira/Code/northstar-checkout-retry in your terminal.");
});

test("mobile board keeps operational data at the 17px text floor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  for (const selector of [".branch", ".metric", ".agent-state small", ".scan-time"]) {
    const size = await page.locator(selector).first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(size, `${selector} is legible on a phone`).toBeGreaterThanOrEqual(17);
  }
});

test("buy action targets the provisioned checkout endpoint", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Buy Pulse Pro" })).toHaveAttribute(
    "href",
    "https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout",
  );
});

test("download disclosure links to exact unsigned install steps", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Current macOS and Windows builds are unsigned.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Read the install steps/ })).toHaveAttribute(
    "href",
    "https://github.com/B-Divyesh/sf-worktree-agent-pulse#install-an-unsigned-build",
  );
});
