import { expect, test } from "@playwright/test";

test("@claim:sample-five loads five sample worktrees in one click", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator(".pulse-board [data-worktree]")).toHaveCount(5);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.getByText("Sample snapshot · no Git scan ran")).toBeVisible();
  await page.goto("/?demo=1");
  await expect(page.locator(".pulse-board [data-worktree]")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
});

test("@claim:attention places blocked, remote-behind, and changed worktrees before routine worktrees", async ({ page }) => {
  await page.goto("/demo");
  const blocked = page.locator('[data-worktree="wt-checkout"]');
  await expect(blocked).toContainText("Blocked");
  await expect(blocked).toContainText("3 changed");
  expect(await page.locator(".pulse-board [data-worktree]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-worktree")))).toEqual([
    "wt-checkout", "wt-invoices", "wt-main", "wt-search", "wt-auth",
  ]);
  await page.getByRole("button", { name: /Needs attention/ }).click();
  expect(await page.locator(".pulse-board [data-worktree]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-worktree")))).toEqual([
    "wt-checkout", "wt-invoices", "wt-main", "wt-search",
  ]);
});

test("@claim:first-screen-demo keeps the primary action in the initial viewport", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const action = page.getByRole("link", { name: "Try it with sample data" });
    const explanation = page.getByText("Loads five worktrees. Nothing is saved.");
    await expect(action).toBeInViewport();
    await expect(explanation).toBeInViewport();
    const actionBox = await action.boundingBox();
    const explanationBox = await explanation.boundingBox();
    expect(actionBox).not.toBeNull();
    expect(explanationBox).not.toBeNull();
    expect((actionBox?.y ?? viewport.height) + (actionBox?.height ?? 1)).toBeLessThanOrEqual(viewport.height);
    expect((explanationBox?.y ?? viewport.height) + (explanationBox?.height ?? 1)).toBeLessThanOrEqual(viewport.height);
  }
});

test("@claim:demo-private isolates both direct demo paths from real data", async ({ browser }) => {
  const realLocalStorage = {
    "pulse:repositories": '["/real/private/repository"]',
    "sb_license:worktree-agent-pulse": "real-license-byte-sentinel",
    "sb_license:worktree-agent-pulse:verdict": '{"sentinel":"real-verdict-bytes"}',
    "real:unrelated": "leave-these-bytes-alone",
  };
  const realSessionStorage = { "real:session:sentinel": "real-session-bytes" };

  for (const entry of ["/demo", "/?demo=1&license=returned-demo-token"]) {
    const context = await browser.newContext();
    await context.addInitScript(({ local, session }) => {
      const realKeys = new Set(Object.keys(local));
      const originalGetItem = Storage.prototype.getItem;
      (window as unknown as { __demoRealStorageReads: string[] }).__demoRealStorageReads = [];
      Storage.prototype.getItem = function getItem(key: string): string | null {
        if (this === localStorage && realKeys.has(key)) {
          (window as unknown as { __demoRealStorageReads: string[] }).__demoRealStorageReads.push(key);
        }
        return originalGetItem.call(this, key);
      };
      for (const [key, value] of Object.entries(local)) localStorage.setItem(key, value);
      for (const [key, value] of Object.entries(session)) sessionStorage.setItem(key, value);
    }, { local: realLocalStorage, session: realSessionStorage });
    const page = await context.newPage();
    const demoRequests: string[] = [];
    const realModeRequests: string[] = [];
    let phase: "demo" | "real" = "demo";
    await page.route("https://api.sociobot.in/**", async (route) => {
      (phase === "demo" ? demoRequests : realModeRequests).push(route.request().url());
      await route.abort("failed");
    });

    await page.goto(`http://127.0.0.1:4173${entry}`);
    await expect(page).toHaveTitle("Demo — Worktree Agent Pulse");
    await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
    await expect(page).not.toHaveURL(/license=/);
    await page.locator('[data-worktree="wt-checkout"]').click();
    await page.getByRole("button", { name: "Preview terminal action" }).click();
    await page.getByRole("button", { name: "Reset demo" }).click();

    const duringDemo = await page.evaluate(() => ({
      local: Object.fromEntries(Object.entries(localStorage)),
      session: Object.fromEntries(Object.entries(sessionStorage)),
      realReads: (window as unknown as { __demoRealStorageReads: string[] }).__demoRealStorageReads,
    }));
    expect(duringDemo.local).toEqual(realLocalStorage);
    expect(duringDemo.session["real:session:sentinel"]).toBe(realSessionStorage["real:session:sentinel"]);
    expect(Object.keys(duringDemo.session).sort()).toEqual([
      "demo:worktree-agent-pulse:repository",
      "real:session:sentinel",
    ]);
    expect(duringDemo.realReads).toEqual([]);
    expect(demoRequests).toEqual([]);

    phase = "real";
    await page.getByRole("link", { name: "Start for real" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:4173/");
    await expect(page.getByRole("heading", { name: "See blocked agents and worktrees that need attention" })).toBeVisible();
    const afterExit = await page.evaluate(() => ({
      local: Object.fromEntries(Object.entries(localStorage)),
      session: Object.fromEntries(Object.entries(sessionStorage)),
    }));
    expect(afterExit.local).toEqual(realLocalStorage);
    expect(afterExit.session).toEqual(realSessionStorage);
    expect(demoRequests).toEqual([]);
    expect(realModeRequests.length).toBeLessThanOrEqual(1);
    await context.close();
  }
});

test("@claim:offline-demo reloads the sample while offline", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
  const cachedUrls = await page.evaluate(async () => (await (await caches.open("worktree-agent-pulse-v3")).keys()).map((request) => request.url));
  expect(cachedUrls.some((url) => url.includes("/assets/main-"))).toBe(true);
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

test("@claim:site-network waits for a download request before contacting GitHub", async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outsideRequests.push(request.url());
  });
  await page.route("https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      html_url: "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.4",
      tag_name: "v0.1.4",
      assets: [
        { name: "worktree-agent-pulse.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/download/v0.1.4/worktree-agent-pulse.AppImage" },
        { name: "worktree-agent-pulse-setup.exe", browser_download_url: "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/download/v0.1.4/worktree-agent-pulse-setup.exe" },
        { name: "worktree-agent-pulse.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/download/v0.1.4/worktree-agent-pulse.dmg" },
      ],
    }),
  }));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "See blocked agents and worktrees that need attention" })).toBeVisible();
  expect(outsideRequests).toEqual([]);
  await page.getByRole("button", { name: /Check download/ }).click();
  await expect(page.getByRole("link", { name: /Download for/ })).toHaveAttribute("href", /releases\/download\/v0\.1\.4/);
  expect(outsideRequests).toEqual(["https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest"]);
});

test("@claim:mac-download-architecture selects the matching macOS artifact", async ({ browser }) => {
  const release = {
    html_url: "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.5",
    tag_name: "v0.1.5",
    assets: [
      { name: "Worktree.Agent.Pulse_0.1.5_aarch64.dmg", browser_download_url: "https://github.com/example/aarch64.dmg" },
      { name: "Worktree.Agent.Pulse_0.1.5_x64.dmg", browser_download_url: "https://github.com/example/x64.dmg" },
    ],
  };
  for (const [userAgent, expected] of [
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/122 Safari/537.36", "https://github.com/example/x64.dmg"],
    ["Mozilla/5.0 (Macintosh; Arm Mac OS X 14_0) AppleWebKit/537.36 Chrome/122 Safari/537.36", "https://github.com/example/aarch64.dmg"],
  ]) {
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();
    await page.route("https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(release) }));
    await page.goto("http://127.0.0.1:4173/");
    await page.getByRole("button", { name: "Check download for macOS" }).click();
    await expect(page.getByRole("link", { name: "Download for macOS" })).toHaveAttribute("href", expected);
    await context.close();
  }
});

test("@claim:license-local stores a returned license locally and sends it only to Sociobot", async ({ page }) => {
  const outsideRequests: string[] = [];
  await page.route("https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=fixture-token", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ valid: true, reason: "ok", expires_at: null }),
  }));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outsideRequests.push(request.url());
  });
  await page.goto("/?license=fixture-token");
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:worktree-agent-pulse"))).toBe("fixture-token");
  await expect.poll(() => outsideRequests.length).toBe(1);
  expect(outsideRequests).toEqual(["https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=fixture-token"]);
});

test("@claim:license-uncached-network-lock keeps an unverified returned token locked when billing is unavailable", async ({ page, context }) => {
  let attempts = 0;
  await page.route("https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=unverified-network-token", async (route) => {
    attempts += 1;
    await route.abort("failed");
  });
  await page.goto("/?license=unverified-network-token");
  await expect.poll(() => attempts).toBe(1);
  await expect(page.getByRole("link", { name: "Buy Pulse Pro" })).toBeVisible();
  await expect(page.getByText("Pulse Pro is active", { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("sb_license:worktree-agent-pulse:verdict"))).toBeNull();

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("link", { name: "Buy Pulse Pro" })).toBeVisible();
  await expect(page.getByText("Pulse Pro is active", { exact: false })).toHaveCount(0);
});

test("@claim:license-uncached-rate-limit-lock keeps an unverified returned token locked after a billing 429", async ({ page }) => {
  let attempts = 0;
  await page.route("https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=unverified-rate-limit-token", async (route) => {
    attempts += 1;
    await route.fulfill({ status: 429, headers: { "Retry-After": "4" }, body: "Slow down" });
  });
  await page.goto("/?license=unverified-rate-limit-token");
  await expect.poll(() => attempts).toBe(1);
  await expect(page.getByRole("link", { name: "Buy Pulse Pro" })).toBeVisible();
  await expect(page.getByText("Pulse Pro is active", { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("sb_license:worktree-agent-pulse:verdict"))).toBeNull();
});

test("@claim:refund-contact provides a concrete refund contact", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.locator('a[href="mailto:hello@sociobot.in?subject=Pulse%20refund%20request"]')).toHaveText("hello@sociobot.in");
});
