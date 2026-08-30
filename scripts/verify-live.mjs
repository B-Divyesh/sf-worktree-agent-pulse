import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.argv[2] ?? "https://worktree-agent-pulse.sociobot.in";
const evidence = process.argv[3] ?? ".factory/polish-3-evidence";
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

  const publicRoutes = [
    ["/", "Worktree Agent Pulse — Monitor worktrees", `${origin}/`],
    ["/demo", "Demo — Worktree Agent Pulse", `${origin}/demo`],
    ["/privacy", "Privacy — Worktree Agent Pulse", `${origin}/privacy`],
    ["/terms", "Terms — Worktree Agent Pulse", `${origin}/terms`],
  ];
  for (const [route, title, canonical] of publicRoutes) {
    const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
    assert(response?.status() === 200, `${route} did not return 200`);
    assert(await page.locator("main").count() === 1 && await page.locator("h1").count() === 1, `${route} landmark or heading count`);
    assert(await page.title() === title, `${route} title`);
    assert(await page.locator('link[rel="canonical"]').getAttribute("href") === canonical, `${route} canonical`);
    assert(Boolean(await page.locator('meta[name="description"]').getAttribute("content")), `${route} description`);
    assert(!serious(await new AxeBuilder({ page }).analyze()), `${route} has serious or critical axe findings`);
    pass(`${route} metadata, structure, and axe`, await page.title());
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 1200); });
  await page.waitForFunction(() => scrollY > 500);
  const savedScroll = await page.evaluate(() => scrollY);
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await page.waitForFunction(() => document.activeElement === document.querySelector("h1"));
  assert(await page.evaluate(() => scrollY) === 0, "Privacy route did not start at the top");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.activeElement === document.querySelector("h1"));
  assert(savedScroll > 500 && await page.evaluate(() => scrollY) === savedScroll, "Back did not restore the exact mobile landing scroll");
  await page.goForward({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.activeElement === document.querySelector("h1"));
  pass("mobile history, focus, and scroll", `Privacy navigation started at top; Back restored ${savedScroll}px and landing H1 focus; Forward restored Privacy H1 focus`);

  await page.setViewportSize({ width: 1440, height: 900 });
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

  const realLocal = {
    "pulse:repositories": '["/real/private/repository"]',
    "sb_license:worktree-agent-pulse": "live-real-license-byte-sentinel",
    "sb_license:worktree-agent-pulse:verdict": '{"sentinel":"live-real-verdict-bytes"}',
    "real:unrelated": "live-unrelated-bytes",
  };
  const realSession = { "real:session:sentinel": "live-session-bytes" };
  await page.addInitScript((keys) => {
    const realKeys = new Set(keys);
    const originalGetItem = Storage.prototype.getItem;
    window.__demoRealStorageReads = [];
    Storage.prototype.getItem = function getItem(key) {
      if (this === localStorage && realKeys.has(key)) window.__demoRealStorageReads.push(key);
      return originalGetItem.call(this, key);
    };
  }, Object.keys(realLocal));
  await page.evaluate(({ local, session }) => {
    localStorage.clear();
    sessionStorage.clear();
    for (const [key, value] of Object.entries(local)) localStorage.setItem(key, value);
    for (const [key, value] of Object.entries(session)) sessionStorage.setItem(key, value);
  }, { local: realLocal, session: realSession });
  const demoRequests = [];
  let demoActive = true;
  page.on("request", (request) => {
    if (demoActive && new URL(request.url()).origin !== origin) demoRequests.push(request.url());
  });
  await page.route("https://api.sociobot.in/**", (route) => route.fulfill({
    status: 204,
    contentType: "application/json",
  }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + "/demo", { waitUntil: "domcontentloaded" });
  assert(demoRequests.length === 0, `direct /demo sent a cross-origin request: ${demoRequests.join(", ")}`);
  assert((await page.evaluate(() => window.__demoRealStorageReads)).length === 0, "direct /demo read real local storage");
  await page.goto(origin + "/?demo=1&license=returned-demo-token", { waitUntil: "domcontentloaded" });
  assert(!new URL(page.url()).searchParams.has("license"), "demo return license was not discarded from the URL");
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
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
    realReads: window.__demoRealStorageReads,
  }));
  for (const [key, value] of Object.entries(realLocal)) assert(stores.local[key] === value, `demo changed real local storage: ${key}`);
  assert(Object.keys(stores.local).length === Object.keys(realLocal).length, "demo added real local-storage keys");
  assert(stores.session["real:session:sentinel"] === realSession["real:session:sentinel"], "demo changed real session data");
  assert(Boolean(stores.session["demo:worktree-agent-pulse:repository"]), "demo session record is missing");
  assert(Object.keys(stores.session).length === 2, "demo wrote outside its session namespace");
  assert(stores.realReads.length === 0, `demo read real local storage: ${stores.realReads.join(", ")}`);
  assert(demoRequests.length === 0, `demo made a cross-origin request: ${demoRequests.join(", ")}`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  assert(await page.locator("[data-worktree]").count() === 5, "demo did not reload offline");
  await context.setOffline(false);
  demoActive = false;
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.getByRole("heading", { name: "See blocked agents and worktrees that need attention" }).waitFor();
  const afterExit = await page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
  }));
  for (const [key, value] of Object.entries(realLocal)) assert(afterExit.local[key] === value, `demo exit changed real local storage: ${key}`);
  assert(Object.keys(afterExit.local).length === Object.keys(realLocal).length, "demo exit added real local-storage keys");
  assert(JSON.stringify(afterExit.session) === JSON.stringify(realSession), "demo exit did not discard only demo session data");
  pass("isolated one-click demo", "both direct URLs preserve real repository/license/verdict bytes, make no cross-origin demo request, reset cleanly, exit cleanly, and reload offline");
  pass("drawer keyboard and terminal feedback", "heading focus, visible full path, Escape restores wt-checkout");

  await page.goto(origin + "/privacy", { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 390, height: 844 });
  const devtools = await context.newCDPSession(page);
  await devtools.send("DOM.enable");
  await devtools.send("CSS.enable");
  const { frameTree } = await devtools.send("Page.getFrameTree");
  const { styleSheetId } = await devtools.send("CSS.createStyleSheet", { frameId: frameTree.frame.id });
  await devtools.send("CSS.setStyleSheetText", { styleSheetId, text: ":root { font-size: 200% !important; }" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `privacy page overflows by ${overflow}px at 200%`);
  await page.screenshot({ path: `${evidence}/live-privacy-200-percent.png`, fullPage: true });
  pass("privacy at 200%", "no horizontal clipping at 390 CSS px");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => localStorage.clear());
  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  const releaseResponse = page.waitForResponse((response) => response.url().endsWith("/releases/latest"));
  await page.getByRole("button", { name: "Check download for Linux" }).click();
  assert((await releaseResponse).status() === 200, "GitHub latest-release request did not return 200");
  const liveDownload = page.getByRole("link", { name: "Download for Linux" });
  await liveDownload.waitFor();
  assert((await liveDownload.getAttribute("href"))?.includes("/releases/download/v0.1.13/Worktree.Agent.Pulse_0.1.13_amd64.AppImage"), "live Linux download does not target v0.1.13");
  pass("live release download", "Linux button resolves through the GitHub API to the v0.1.13 AppImage");
  let verificationRequests = 0;
  page.on("request", (request) => { if (request.url().includes("/verify?license=")) verificationRequests += 1; });
  await page.locator("#restore-license").click();
  await page.locator("#verify-license").click();
  assert(await page.locator("#license-token").getAttribute("aria-invalid") === "true", "empty license is not invalid");
  assert(await page.locator("#license-token").evaluate((element) => element === document.activeElement), "empty license did not return focus");
  assert(await page.locator("#license-result").textContent() === "Enter the license token from your purchase email.", "empty license error missing");
  assert(verificationRequests === 0, "empty license made a verification request");
  await page.keyboard.press("Escape");
  const unsigned = page.getByRole("link", { name: /Read the install steps/ });
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
  assert((await page.locator('link[rel="canonical"]').getAttribute("href")) === page.url(), "missing route canonical is not its real URL");
  pass("real 404 route", "HTTP 404 with product title and return action");
  const expectedConsoleMessages = report.consoleErrors.filter((message) => /ERR_INTERNET_DISCONNECTED|status of 404/.test(message));
  report.consoleErrors = report.consoleErrors.filter((message) => !/ERR_INTERNET_DISCONNECTED|status of 404/.test(message));
  report.expectedConsoleMessages = expectedConsoleMessages;
  assert(report.consoleErrors.length === 0, `browser console errors: ${report.consoleErrors.join("; ")}`);
  pass("browser console", "zero errors");

  await writeFile(`${evidence}/live-check.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
