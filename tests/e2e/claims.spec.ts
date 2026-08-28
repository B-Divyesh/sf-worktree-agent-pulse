import { expect, test } from "@playwright/test";

test("@claim:sample-five loads five sample worktrees in one click", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator(".pulse-board [data-worktree]")).toHaveCount(5);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
});

test("@claim:attention shows blocked and dirty worktrees", async ({ page }) => {
  await page.goto("/demo");
  const blocked = page.locator('[data-worktree="wt-checkout"]');
  await expect(blocked).toContainText("Blocked");
  await expect(blocked).toContainText("3 changed");
  await page.getByRole("button", { name: /Needs attention/ }).click();
  await expect(page.locator(".pulse-board [data-worktree]")).toHaveCount(4);
});

test("@claim:demo-private sends no repository data away", async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outsideRequests.push(request.url());
  });
  await page.goto("/demo");
  await page.locator('[data-worktree="wt-checkout"]').click();
  await page.getByRole("button", { name: "Preview terminal action" }).click();
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(storage.local.filter((key) => key.includes("repositories"))).toEqual([]);
  expect(storage.session).toContain("demo:worktree-agent-pulse:repository");
  expect(outsideRequests).toEqual([]);
});

test("@claim:offline-demo reloads the sample while offline", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
  const cachedUrls = await page.evaluate(async () => (await (await caches.open("worktree-agent-pulse-v2")).keys()).map((request) => request.url));
  expect(cachedUrls.some((url) => url.includes("/assets/index-"))).toBe(true);
  await context.setOffline(true);
  await page.goto("/demo");
  await expect(page.locator(".pulse-board [data-worktree]")).toHaveCount(5);
});

test("@claim:free-price shows the free limit and one-time price", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Five worktrees free · Pro is $19 once")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Use five worktrees free" })).toBeVisible();
  await expect(page.getByText("one-time purchase")).toBeVisible();
});

test("@claim:no-account works without an account", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Works without an account")).toBeVisible();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.getByRole("heading", { name: "Worktree pulse" })).toBeVisible();
});
