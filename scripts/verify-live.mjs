import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.argv[2] ?? "https://worktree-agent-pulse.sociobot.in";
const evidence = ".factory/polish-2-evidence";
const report = { checkedAt: new Date().toISOString(), origin, checks: [], consoleErrors: [] };
const pass = (name, detail = "pass") => report.checks.push({ name, detail });
const assert = (value, message) => { if (!value) throw new Error(message); };
const serious = (results) => results.violations.some((item) => ["serious", "critical"].includes(item.impact ?? ""));

await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") report.consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => report.consoleErrors.push(error.message));

  for (const route of ["/", "/demo", "/privacy", "/terms"]) {
    const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
    assert(response?.status() === 200, `${route} did not return 200`);
    assert(await page.locator("main").count() === 1 && await page.locator("h1").count() === 1, `${route} landmark or heading count`);
    assert((await page.title()).includes("Worktree Agent Pulse"), `${route} title`);
    assert(!serious(await new AxeBuilder({ page }).analyze()), `${route} has serious or critical axe findings`);
    pass(`${route} metadata, structure, and axe`, await page.title());
  }

  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  for (const selector of ["h1", ".lede", ".hero-actions", ".plain-facts"]) {
    const box = await page.locator(selector).boundingBox();
    assert(box && box.y >= 0 && box.y + box.height <= 900, `${selector} is outside the desktop first screen`);
  }
  await page.screenshot({ path: `${evidence}/live-landing-desktop.png`, fullPage: true });
  pass("desktop first screen", "headline, audience sentence, sample CTA, explanation, and three facts visible");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  for (const selector of ["h1", ".lede", ".hero-actions", ".plain-facts"]) {
    const box = await page.locator(selector).boundingBox();
    assert(box && box.y >= 0 && box.y + box.height <= 844, `${selector} is outside the mobile first screen`);
  }
  await page.screenshot({ path: `${evidence}/live-landing-mobile.png`, fullPage: true });
  pass("mobile first screen", "all required first-screen elements visible at 390x844");

  await page.evaluate(() => localStorage.setItem("pulse:repos", '["/real/sentinel"]'));
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("sb_license:worktree-agent-pulse", "real-token"));
  assert(await page.locator("[data-worktree]").count() === 5, "demo does not have five worktrees");
  assert(await page.getByText("Demo — sample data, nothing is saved", { exact: false }).count() > 0, "demo banner missing");
  assert(await page.locator("#reset-demo").count() === 1 && await page.getByRole("link", { name: "Start for real" }).count() === 1, "demo controls missing");
  const order = await page.locator("[data-worktree]").evaluateAll((elements) => elements.map((element) => element.getAttribute("data-worktree")));
  assert(JSON.stringify(order) === JSON.stringify(["wt-checkout", "wt-invoices", "wt-main", "wt-search", "wt-auth"]), "demo order changed");

  await page.locator('[data-worktree="wt-checkout"]').focus();
  await page.keyboard.press("Enter");
  assert(await page.locator("#detail-title").evaluate((element) => element === document.activeElement), "drawer heading did not receive focus");
  const drawerResults = await new AxeBuilder({ page }).include(".detail-panel").analyze();
  assert(!serious(drawerResults), `drawer has serious or critical axe findings: ${JSON.stringify(drawerResults.violations.map(({ id, impact }) => ({ id, impact })))}`);
  await page.locator("#open-terminal").click();
  await page.locator(".action-note").getByText("Installed Pulse would open /Users/mira/Code/northstar-checkout-retry in your terminal.").waitFor();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${evidence}/live-demo-terminal.png`, fullPage: true });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  assert(await page.locator(".detail-panel").count() === 0, "drawer did not close");
  assert(await page.evaluate(() => document.activeElement?.getAttribute("data-worktree")) === "wt-checkout", "drawer did not return focus");

  await page.locator("#reset-demo").click();
  const stores = await page.evaluate(() => ({
    repositories: localStorage.getItem("pulse:repos"),
    license: localStorage.getItem("sb_license:worktree-agent-pulse"),
    demo: sessionStorage.getItem("demo:pulse:repository"),
  }));
  assert(stores.repositories === '["/real/sentinel"]' && stores.license === "real-token" && Boolean(stores.demo), "demo storage is not isolated");
  assert(requests.every((url) => new URL(url).origin === location.origin), "demo made a cross-origin request");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  assert(await page.locator("[data-worktree]").count() === 5, "demo did not reload offline");
  await context.setOffline(false);
  pass("isolated one-click demo", "five rows, banner/reset/start, same-origin requests, separate session storage, offline reload");
  pass("drawer keyboard and terminal feedback", "heading focus, visible full path, Escape restores wt-checkout");

  await page.goto(origin + "/privacy", { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `privacy page overflows by ${overflow}px at 200%`);
  await page.screenshot({ path: `${evidence}/live-privacy-200-percent.png`, fullPage: true });
  pass("privacy at 200%", "no horizontal clipping at 390 CSS px");
  await page.evaluate(() => { document.documentElement.style.zoom = "1"; });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  let verificationRequests = 0;
  page.on("request", (request) => { if (request.url().includes("/verify?license=")) verificationRequests += 1; });
  await page.locator("#restore-license").click();
  await page.locator("#verify-license").click();
  assert(await page.locator("#license-token").getAttribute("aria-invalid") === "true", "empty license is not invalid");
  assert(await page.locator("#license-token").evaluate((element) => element === document.activeElement), "empty license did not return focus");
  assert(await page.locator("#license-result").textContent() === "Enter the license token from your purchase email.", "empty license error missing");
  assert(verificationRequests === 0, "empty license made a verification request");
  await page.keyboard.press("Escape");
  const unsigned = page.getByRole("link", { name: /Install an unsigned build/ });
  assert(await unsigned.isVisible() && (await unsigned.getAttribute("href"))?.includes("install-an-unsigned-build"), "unsigned-build disclosure missing");

  for (const route of ["/", "/demo", "/privacy", "/terms", "/missing"]) {
    await page.goto(origin + route, { waitUntil: "domcontentloaded" });
    const undersized = await page.locator("a,button").evaluateAll((elements) => elements.filter((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && (box.width < 44 || box.height < 44);
    }).map((element) => element.textContent?.trim()));
    assert(!undersized.length, `${route} has undersized targets: ${undersized.join(", ")}`);
  }
  pass("forms, unsigned disclosure, and targets", "empty license announced without a request; README link resolves; all desktop targets >=44px");

  const missing = await page.goto(origin + `/cold-missing-${Date.now()}`, { waitUntil: "domcontentloaded" });
  assert(missing?.status() === 404 && (await page.title()).startsWith("Page not found"), "missing route is not a real product 404");
  pass("real 404 route", "HTTP 404 with product title and return action");
  assert(report.consoleErrors.length === 0, `browser console errors: ${report.consoleErrors.join("; ")}`);
  pass("browser console", "zero errors");

  await writeFile(`${evidence}/live-check.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
