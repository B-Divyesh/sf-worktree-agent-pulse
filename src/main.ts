import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./styles.css";
import { BUILD_SOURCE_COMMIT } from "./build-info";
import { SAMPLE_REPOSITORY } from "./sample";
import type { Filter, RepositoryPulse, WorktreePulse } from "./types";
import { clearDemo, getDemoRepository, loadRepositoryPaths, removeRepositoryPath, resetDemo, saveRepositoryPath } from "./storage";
import { captureReturnedLicense, checkoutUrl, hasCachedLicense, storeLicense, verifyLicense } from "./license";
import { detectPlatform, getDownload, platformFromUserAgent, releasesUrl, type Platform } from "./downloads";
import { FREE_WORKTREE_LIMIT, scheduleProRefresh, worktreesForLicense } from "./pro";
import { blockedAlertsEnabled, listenForBlockedAlertActions, notifyBlockedTransitions, setBlockedAlertsEnabled } from "./blocked-notifications";

declare global { interface Window { __TAURI_INTERNALS__?: unknown } }

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("App root is missing");
const app = appRoot;
app.dataset.buildSource = BUILD_SOURCE_COMMIT;

const isNative = Boolean(window.__TAURI_INTERNALS__);
let repository: RepositoryPulse | null = null;
let activeFilter: Filter = "all";
let selectedId: string | null = null;
let isPro = false;
let licenseInitialized = false;
let isSampleProject = false;
let terminalPreviewMessage = "";
let isRestoringHistory = false;
let scrollStateFrame: number | null = null;

interface RouteHistoryState {
  pulseScroll?: { x: number; y: number };
}

const titles: Record<string, string> = {
  "/": "Worktree Agent Pulse — Monitor worktrees",
  "/demo": "Demo — Worktree Agent Pulse",
  "/privacy": "Privacy — Worktree Agent Pulse",
  "/terms": "Terms — Worktree Agent Pulse",
};

const descriptions: Record<string, string> = {
  "/": "See blocked agents and worktrees that need attention in one private desktop board.",
  "/demo": "Try a private sample board with five realistic Git worktrees and agent states.",
  "/privacy": "Learn what Worktree Agent Pulse reads, stores, and sends.",
  "/terms": "Read the license and purchase terms for Worktree Agent Pulse.",
};

const e = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] ?? character));

function locationState(): { path: string; demoMode: boolean } {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const demoQuery = new URLSearchParams(window.location.search).get("demo") === "1";
  return { path, demoMode: path === "/demo" || (path === "/" && demoQuery) };
}

function discardReturnedDemoLicense(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("license")) return;
  url.searchParams.delete("license");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function initializeRealLicense(): void {
  captureReturnedLicense();
  if (licenseInitialized) return;
  licenseInitialized = true;
  isPro = hasCachedLicense();
  void verifyLicense().then((valid) => {
    if (valid === isPro) return;
    isPro = valid;
    if (!isNative && !locationState().demoMode && window.location.pathname === "/") render();
  });
}

function saveHistoryScroll(): void {
  if (isNative || isRestoringHistory) return;
  const current = history.state && typeof history.state === "object" ? history.state as RouteHistoryState : {};
  history.replaceState({ ...current, pulseScroll: { x: window.scrollX, y: window.scrollY } }, "", window.location.href);
}

function navigate(path: string): void {
  saveHistoryScroll();
  history.pushState({ pulseScroll: { x: 0, y: 0 } } satisfies RouteHistoryState, "", path);
  render(true);
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
}

function header(): string {
  return `<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route aria-label="Worktree Agent Pulse home">
        <svg aria-hidden="true" viewBox="0 0 42 32"><path d="M3 6h10v8h8V6h10M13 14v12h18"/><rect x="1" y="4" width="5" height="5"/><rect x="29" y="23" width="5" height="5"/></svg>
        <span>WORKTREE<br><strong>AGENT PULSE</strong></span>
      </a>
      <nav aria-label="Primary">
        <a href="/demo" data-route>Demo</a>
        <a href="/#how">How it works</a>
        <a href="/privacy" data-route>Privacy</a>
      </nav><div id="route-announcer" class="sr-only" aria-live="polite"></div>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <p>See blocked agents and worktrees that need attention in one local board.</p>
    <nav aria-label="Footer"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><span>Built by Param Factory</span></nav>
    <p class="build-id">v0.1.13 · Generated artwork disclosed</p>
  </footer>`;
}

function statusLabel(item: WorktreePulse): string {
  if (item.agentState === "blocked") return "Blocked";
  if (item.agentState === "working") return "Working";
  if (item.agentState === "idle") return "Idle";
  return "Git only";
}

function needsAttention(item: WorktreePulse): boolean {
  return item.agentState === "blocked" || item.dirty > 0 || item.behind > 0;
}

/** Attention is a stable operational order: blocked, behind, changed, then routine. */
function attentionRank(item: WorktreePulse): number {
  if (item.agentState === "blocked") return 0;
  if (item.behind > 0) return 1;
  if (item.dirty > 0) return 2;
  return 3;
}

function orderWorktrees(items: WorktreePulse[]): WorktreePulse[] {
  return [...items].sort((left, right) => attentionRank(left) - attentionRank(right) || left.name.localeCompare(right.name));
}

function filterItems(items: WorktreePulse[]): WorktreePulse[] {
  if (activeFilter === "needs-attention") return items.filter(needsAttention);
  if (activeFilter === "working") return items.filter((item) => item.agentState === "working");
  if (activeFilter === "clean") return items.filter((item) => !needsAttention(item));
  return items;
}

function row(item: WorktreePulse, preview = false): string {
  const risks = [
    item.dirty ? `<span class="metric warning">${item.dirty} changed</span>` : `<span class="metric quiet">Clean</span>`,
    item.ahead ? `<span class="metric info">↑${item.ahead} ahead</span>` : "",
    item.behind ? `<span class="metric danger">↓${item.behind} behind</span>` : "",
  ].join("");
  const content = `<span class="rail" aria-hidden="true"><i></i></span>
    <span class="tree-main"><strong>${e(item.name)}</strong><span class="branch">${e(item.branch)}</span></span>
    <span class="agent-state state-${item.agentState}"><i aria-hidden="true"></i>${statusLabel(item)}<small>${e(item.agent)}</small></span>
    <span class="git-metrics">${risks}</span>
    <span class="row-arrow" aria-hidden="true">↗</span>`;
  return preview
    ? `<div class="worktree-row preview-row status-${item.agentState}">${content}</div>`
    : `<button class="worktree-row status-${item.agentState}${selectedId === item.id ? " selected" : ""}" data-worktree="${e(item.id)}" aria-label="Open details for ${e(item.name)}">${content}</button>`;
}

function miniDashboard(): string {
  return `<div class="mini-window" role="region" aria-label="Example pulse board with five worktrees" tabindex="0">
    <div class="window-bar"><span></span><span></span><span></span><strong>NORTHSTAR / 5 WORKTREES</strong><em>SAMPLE SNAPSHOT</em></div>
    <div class="mini-body">
      <div class="board-head"><span>WORKTREE</span><span>AGENT</span><span>GIT STATE</span></div>
      ${orderWorktrees(SAMPLE_REPOSITORY.worktrees).map((item) => row(item, true)).join("")}
    </div>
  </div>`;
}

function platformName(platform: Platform): string {
  return platform.startsWith("mac-") ? "macOS" : platform === "windows" ? "Windows" : "Linux";
}

function landing(): string {
  const platform = platformFromUserAgent(`${navigator.userAgent} ${navigator.platform}`);
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">LOCAL DESKTOP APP</p>
        <h1 tabindex="-1">See blocked agents and worktrees that need attention</h1>
        <p class="lede">For developers running several CLI agents who need one view of worktree activity and Git state.</p>
        <div class="hero-actions">
          <a class="button primary" href="/demo" data-route>Try it with sample data</a>
          <span>Loads five worktrees. Nothing is saved.</span>
        </div>
        <ul class="plain-facts" aria-label="Product facts">
          <li><span aria-hidden="true">01</span>Prompt and output fields are ignored</li>
          <li><span aria-hidden="true">02</span>Works without an account</li>
          <li><span aria-hidden="true">03</span>Five worktrees free · Pro is $19 once</li>
        </ul>
      </div>
      <figure class="hero-art">
        <picture><img src="/assets/hero-lattice.webp" width="1536" height="1024" alt="Five geometric branch rails show active, warning, and blocked worktrees." fetchpriority="high" decoding="async"></picture>
        <figcaption>Preview: five worktrees, including one blocked agent.</figcaption>
      </figure>
    </section>

    <section class="product-preview" aria-labelledby="preview-title">
      <div class="section-index"><span>02</span><p>THE BOARD</p></div>
      <div class="section-content"><h2 id="preview-title">See worktrees in attention order</h2><p>Worktrees with blocked agents, remote changes to pull, or local file changes appear before routine worktrees.</p>${miniDashboard()}</div>
    </section>

    <section id="how" class="how-section" aria-labelledby="how-title">
      <div class="section-index"><span>03</span><p>HOW IT WORKS</p></div>
      <div class="section-content"><h2 id="how-title">Monitor and open worktrees in three steps</h2>
        <ol class="steps">
          <li><span>01</span><div><h3>Add a repository</h3><p>Pulse asks Git for its linked worktrees.</p></div></li>
          <li><span>02</span><div><h3>Opt in agent status</h3><p>Your CLI writes state, tool name, and time. Prompt and output fields are ignored.</p></div></li>
          <li><span>03</span><div><h3>Open the right terminal</h3><p>Select a row to open that exact worktree.</p></div></li>
        </ol>
        <div class="walkthrough" aria-label="Desktop app walkthrough">
          <figure><img src="/assets/walkthrough-add-repository.png" width="960" height="600" alt="Worktree Agent Pulse first-run screen with Add a repository and Load sample project actions." loading="lazy" decoding="async"><figcaption>1. Add a repository from the first-run screen.</figcaption></figure>
          <figure><img src="/assets/walkthrough-inspect.png" width="960" height="600" alt="Worktree Agent Pulse board shows a blocked checkout-retry worktree and changed files." loading="lazy" decoding="async"><figcaption>2. Inspect a blocked or changed worktree.</figcaption></figure>
          <figure><img src="/assets/walkthrough-terminal.png" width="960" height="600" alt="Worktree Agent Pulse detail drawer shows the selected worktree and Open this terminal action." loading="lazy" decoding="async"><figcaption>3. Open the selected worktree in your terminal.</figcaption></figure>
        </div>
      </div>
    </section>

    <section class="privacy-section" aria-labelledby="private-title">
      <div class="section-index"><span>04</span><p>DATA ACCESS</p></div>
      <div class="section-content"><h2 id="private-title">What Pulse reads and ignores</h2><p>Pulse reads Git metadata and three status-file fields. It ignores source, prompt, output, and terminal content. Scans do not change Git state.</p><a href="/privacy" data-route>Read the privacy details →</a></div>
    </section>

    <section class="price-section" aria-labelledby="price-title">
      <div class="section-index"><span>05</span><p>ONE-TIME LICENSE</p></div>
      <div class="section-content price-grid">
        <div><h2 id="price-title">Use five worktrees free</h2><p>Pay once to show every worktree and refresh every 10 seconds.</p></div>
        <div class="price"><strong>$19</strong><span>one-time purchase</span>${isPro ? `<span class="license-active">Pulse Pro is active</span>` : `<a class="button primary" href="${checkoutUrl()}">Buy Pulse Pro</a>`}<button class="text-button" id="restore-license" type="button">Restore a license</button></div>
      </div>
    </section>

    <section class="download-section" aria-labelledby="download-title">
      <div class="section-index"><span>06</span><p>DESKTOP APP</p></div>
      <div class="section-content"><h2 id="download-title">Install for ${platformName(platform)}</h2><p class="signing-note"><strong>Current macOS and Windows builds are unsigned.</strong> <a href="https://github.com/B-Divyesh/sf-worktree-agent-pulse#install-an-unsigned-build" target="_blank" rel="noreferrer">Read the install steps <span class="sr-only">(opens in a new tab)</span></a> before downloading.</p><p class="download-status" id="download-status">Check GitHub Releases for available downloads.</p><div class="download-actions"><button class="button secondary" id="download-button" type="button">Check download for ${platformName(platform)}</button><a href="${releasesUrl}" target="_blank" rel="noreferrer">View all releases <span class="sr-only">(opens in a new tab)</span></a></div></div>
    </section>
  </main>${footer()}<div id="dialog-root"></div>`;
}

function dashboard(mode: "demo" | "native"): string {
  const source = repository ?? SAMPLE_REPOSITORY;
  const isLimited = mode === "native" && !isPro && source.worktrees.length > FREE_WORKTREE_LIMIT;
  const data = isLimited ? { ...source, worktrees: worktreesForLicense(source.worktrees, false) } : source;
  const visible = orderWorktrees(filterItems(data.worktrees));
  const blocked = data.worktrees.filter((item) => item.agentState === "blocked").length;
  const risky = data.worktrees.filter(needsAttention).length;
  const selected = data.worktrees.find((item) => item.id === selectedId);
  const banner = mode === "demo"
    ? `<aside class="demo-banner"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/" data-route>Start for real</a></div></aside>`
    : isSampleProject ? `<aside class="demo-banner native-sample"><strong>Preview — sample worktrees are not folders on this device</strong><div><button id="leave-sample" type="button">Add a real repository</button></div></aside>` : "";
  return `${banner}<div class="app-shell">
    <header class="app-header">
      ${mode === "demo" ? `<a class="skip-link" href="#main">Skip to content</a>` : ""}
      <a class="wordmark" href="${mode === "demo" ? "/" : "#"}" ${mode === "demo" ? "data-route" : ""} aria-label="Worktree Agent Pulse home"><svg aria-hidden="true" viewBox="0 0 42 32"><path d="M3 6h10v8h8V6h10M13 14v12h18"/><rect x="1" y="4" width="5" height="5"/><rect x="29" y="23" width="5" height="5"/></svg><span>WORKTREE<br><strong>AGENT PULSE</strong></span></a>
      <div class="app-actions"><button id="refresh" type="button">↻ <span>Refresh</span></button>${mode === "native" ? `<button id="blocked-alerts" type="button" aria-pressed="${blockedAlertsEnabled()}">${blockedAlertsEnabled() ? "Blocked alerts on" : "Enable blocked alerts"}</button><button class="app-license" type="button">License</button>${!isSampleProject ? `<button id="remove-repository" type="button">Remove repository</button>` : ""}<button id="add-repository" class="primary compact" type="button">+ Add repository</button>` : `<nav class="demo-nav" aria-label="Demo navigation"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a></nav>`}</div>
    </header>
    <main id="main" class="pulse-main">
      <section class="pulse-heading">
        <div><p class="eyebrow">REPOSITORY / ${e(data.name.toUpperCase())}</p><h1 tabindex="-1">Worktree pulse</h1><p class="path" title="${e(data.root)}">${e(data.root)}</p></div>
        <div class="summary"><span><strong>${blocked}</strong>blocked</span><span><strong>${risky}</strong>need attention</span><span><strong>${data.worktrees.length}</strong>worktrees</span></div>
      </section>
      <div class="filter-bar" role="toolbar" aria-label="Filter worktrees">
        ${(["all", "needs-attention", "working", "clean"] as Filter[]).map((filter) => `<button type="button" data-filter="${filter}" aria-pressed="${activeFilter === filter}">${filter === "needs-attention" ? "Needs attention" : filter[0].toUpperCase() + filter.slice(1)} <span>${filterItemsFor(data.worktrees, filter).length}</span></button>`).join("")}
      </div>
      ${isLimited ? `<aside class="limit-note"><strong>Five worktrees are shown.</strong><span>Pulse Pro shows every worktree and refreshes every 10 seconds.</span><button class="text-button app-license" type="button">Restore Pulse Pro</button></aside>` : ""}
      <section class="pulse-board" aria-labelledby="board-title"><h2 id="board-title" class="sr-only">Worktree status</h2>
        <div class="board-head"><span>WORKTREE</span><span>AGENT</span><span>GIT STATE</span></div>
        <div class="worktree-list">${visible.length ? visible.map((item) => row(item)).join("") : `<div class="empty-state"><strong>No worktrees match this filter.</strong><p>Choose another filter to see your worktrees.</p></div>`}</div>
      </section>
      ${selected ? detailPanel(selected, mode) : ""}
      <p class="scan-time" role="status">${mode === "demo" || isSampleProject ? "Sample snapshot · no Git scan ran" : "Last scan: just now · Git reads only"}</p>
    </main>
      ${mode === "demo" ? `<footer class="app-footer"><span>Demo sample data stays separate from real data.</span><nav aria-label="Demo footer"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><span>Built by Param Factory · v0.1.13</span></nav></footer>` : ""}
  </div><div class="live-region sr-only" aria-live="polite"></div><div id="dialog-root"></div>`;
}

function filterItemsFor(items: WorktreePulse[], filter: Filter): WorktreePulse[] {
  if (filter === "needs-attention") return items.filter(needsAttention);
  if (filter === "working") return items.filter((item) => item.agentState === "working");
  if (filter === "clean") return items.filter((item) => !needsAttention(item));
  return items;
}

function detailPanel(item: WorktreePulse, mode: "demo" | "native"): string {
  return `<aside class="detail-panel" aria-labelledby="detail-title">
    <button class="close-detail" id="close-detail" aria-label="Close worktree details">×</button>
    <p class="eyebrow">SELECTED WORKTREE</p><h2 id="detail-title" tabindex="-1">${e(item.name)}</h2>
    <dl><div><dt>Branch</dt><dd>${e(item.branch)}</dd></div><div><dt>Agent</dt><dd>${e(item.agent)} · ${statusLabel(item)}</dd></div><div><dt>Changes</dt><dd>${item.dirty} files</dd></div><div><dt>Remote</dt><dd>${item.ahead} ahead · ${item.behind} behind</dd></div><div><dt>Path</dt><dd>${e(item.path)}</dd></div></dl>
    <button class="button primary" id="open-terminal" type="button">${mode === "demo" || isSampleProject ? "Preview terminal action" : "Open this terminal"}</button>
    <p class="action-note" role="status">${terminalPreviewMessage ? e(terminalPreviewMessage) : mode === "demo" || isSampleProject ? "Preview only. No terminal will open for sample paths." : "This user action opens the folder. Pulse does not run Git writes."}</p>
  </aside>`;
}

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = kind === "privacy";
  return `${header()}<main id="main" class="legal-page"><p class="eyebrow">POLICY / ${privacy ? "PRIVACY" : "TERMS"}</p><h1 tabindex="-1">${privacy ? "Your repository data stays local" : "Terms for using Pulse"}</h1><p class="lede">Effective August 29, 2026</p>
    ${privacy ? `<section><h2>What the app reads</h2><p>The desktop app reads Git worktree metadata. It reads status files only after you add a repository. Only state, tool name, and time enter the board.</p><h2>What stays on your device</h2><p>Repository paths and your license token stay in local app storage. Git and status-file results stay in memory and are rebuilt by local scans. Pulse includes no analytics or crash tracking.</p><h2>Network requests</h2><p>The site checks GitHub only when you request a download. License purchase and verification use the Sociobot billing API. Git scans and blocked alerts stay on this device.</p><h2>Delete your data</h2><p>Use Remove repository in the desktop app to forget a saved path. It does not change repository files. You can also clear the app’s local storage. Demo data uses separate session storage and disappears when the session ends.</p>` : `<section><h2>License</h2><p>The free edition shows up to five worktrees. A $19 one-time Pulse Pro license shows every worktree and adds 10-second refresh.</p><h2>Payment and refunds</h2><p>Request a refund by emailing <a href="mailto:hello@sociobot.in?subject=Pulse%20refund%20request">hello@sociobot.in</a>. Sociobot and Dodo process checkout.</p><h2>Safe use</h2><p>Pulse reports Git metadata but cannot guarantee branch safety. Check your repository before deleting, rebasing, or merging work.</p><h2>Warranty</h2><p>The software is provided under the MIT License without warranty. You remain responsible for your repositories and agent processes.</p>`}
    <h2>Contact</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a> with questions.</p></section></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><div class="broken-rail" aria-hidden="true"><i></i><b>×</b><i></i></div><p class="eyebrow">404 / MISSING PAGE</p><h1 tabindex="-1">This page does not exist</h1><p>The page does not exist. Return to the pulse board.</p><a class="button primary" href="/" data-route>Return home</a></main>${footer()}`;
}

function nativeEmpty(): string {
  return `<div class="app-shell"><header class="app-header">${headerWordmark()}<span class="local-badge">LOCAL ONLY</span></header><main id="main" class="native-empty"><div class="empty-lattice" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow">FIRST SCAN / READY</p><h1 tabindex="-1">Add a repository to find worktrees</h1><p>Pulse reads Git metadata and optional agent status files. It does not read your source files.</p><div class="empty-actions"><button class="button primary" id="add-repository" type="button">Add a repository</button><button class="button secondary" id="load-sample" type="button">Load sample project</button></div><p class="plain-note">Choose a folder that contains a Git repository.</p></main></div>`;
}

function headerWordmark(): string {
  return `<span class="wordmark"><svg aria-hidden="true" viewBox="0 0 42 32"><path d="M3 6h10v8h8V6h10M13 14v12h18"/><rect x="1" y="4" width="5" height="5"/><rect x="29" y="23" width="5" height="5"/></svg><span>WORKTREE<br><strong>AGENT PULSE</strong></span></span>`;
}

function render(focusHeading = false): void {
  const { path, demoMode } = locationState();
  if (demoMode) discardReturnedDemoLicense();
  else initializeRealLicense();
  if (!isNative && !demoMode) clearDemo();
  let html: string;
  if (isNative) html = repository ? dashboard("native") : nativeEmpty();
  else if (demoMode) {
    repository = getDemoRepository(SAMPLE_REPOSITORY);
    html = dashboard("demo");
  } else if (path === "/") html = landing();
  else if (path === "/privacy" || path === "/terms") html = legalPage(path.slice(1) as "privacy" | "terms");
  else html = notFound();
  const title = isNative ? "Worktree Agent Pulse" : (demoMode ? titles["/demo"] : titles[path] ?? "Page not found — Worktree Agent Pulse");
  const description = demoMode ? descriptions["/demo"] : descriptions[path] ?? "Return to the Worktree Agent Pulse home page.";
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `https://worktree-agent-pulse.sociobot.in${demoMode ? "/demo" : path}`);
  app.innerHTML = html;
  const announcer = document.querySelector<HTMLElement>("#route-announcer, .live-region");
  if (announcer) announcer.textContent = title;
  bindEvents();
  if (focusHeading) requestAnimationFrame(() => document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true }));
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((link) => link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(new URL(link.href).pathname);
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter as Filter; selectedId = null; render();
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-worktree]").forEach((button) => button.addEventListener("click", () => {
    selectedId = button.dataset.worktree ?? null; terminalPreviewMessage = ""; render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>("#detail-title")?.focus());
  }));
  document.querySelector("#close-detail")?.addEventListener("click", closeDetail);
  document.querySelector("#reset-demo")?.addEventListener("click", () => {
    repository = resetDemo(SAMPLE_REPOSITORY); activeFilter = "all"; selectedId = null; render(); announce("Demo reset.");
  });
  document.querySelector("#refresh")?.addEventListener("click", () => void refresh());
  document.querySelector("#blocked-alerts")?.addEventListener("click", () => void toggleBlockedAlerts());
  document.querySelector("#add-repository")?.addEventListener("click", () => void addRepository());
  document.querySelector("#load-sample")?.addEventListener("click", () => { isSampleProject = true; repository = structuredClone(SAMPLE_REPOSITORY); render(); });
  document.querySelector("#leave-sample")?.addEventListener("click", () => { isSampleProject = false; repository = null; render(); });
  document.querySelector("#remove-repository")?.addEventListener("click", () => void removeRepository());
  document.querySelector("#open-terminal")?.addEventListener("click", () => void openTerminal());
  document.querySelector("#restore-license")?.addEventListener("click", showLicenseDialog);
  document.querySelectorAll(".app-license").forEach((button) => button.addEventListener("click", showLicenseDialog));
  document.querySelector("#download-button")?.addEventListener("click", () => void bindDownload());
}

function announce(message: string): void {
  const region = document.querySelector<HTMLElement>(".live-region");
  if (region) region.textContent = message;
}

async function bindDownload(): Promise<void> {
  const platform = await detectPlatform();
  const result = await getDownload(platform);
  const button = document.querySelector<HTMLButtonElement>("#download-button");
  const status = document.querySelector<HTMLElement>("#download-status");
  if (!button || !status) return;
  button.disabled = true;
  button.textContent = "Checking releases…";
  if (result) {
    button.outerHTML = `<a class="button primary" href="${e(result.url)}">Download for ${platformName(platform)}</a>`;
    status.textContent = `${result.version} is ready. Choose another build on the release page.`;
  } else {
    button.outerHTML = `<a class="button secondary" href="${releasesUrl}" target="_blank" rel="noreferrer">View release status <span class="sr-only">(opens in a new tab)</span></a>`;
    status.textContent = "Downloads are being published. The release page has current status.";
  }
}

async function addRepository(): Promise<void> {
  if (!isNative) return;
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const path = await open({ directory: true, multiple: false, title: "Choose a Git repository" });
    if (!path) return;
    const { invoke } = await import("@tauri-apps/api/core");
    repository = await invoke<RepositoryPulse>("scan_repository", { path });
    isSampleProject = false;
    saveRepositoryPath(path); render();
  } catch (error) {
    showError("Pulse could not read that repository.", error instanceof Error ? error.message : "Choose a Git repository and try again.");
  }
}

async function removeRepository(): Promise<void> {
  if (!isNative || !repository || isSampleProject) return;
  const path = repository.root;
  if (!window.confirm(`Forget ${repository.name}? This only removes the saved path from Pulse. Your repository files are unchanged.`)) return;
  removeRepositoryPath(path);
  repository = null;
  selectedId = null;
  const nextPath = loadRepositoryPaths()[0];
  if (!nextPath) { render(); return; }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    repository = await invoke<RepositoryPulse>("scan_repository", { path: nextPath });
  } catch {
    removeRepositoryPath(nextPath);
  }
  render();
}

async function refresh(): Promise<void> {
  if (!repository) return;
  if (!isNative) { repository = { ...repository, scannedAt: new Date().toISOString() }; render(); announce("Sample status refreshed."); return; }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const previous = repository.worktrees;
    repository = await invoke<RepositoryPulse>("scan_repository", { path: repository.root });
    const blocked = await notifyBlockedTransitions(previous, repository.worktrees);
    render(); announce(blocked.length ? `${blocked[0].name} became blocked.` : "Worktrees refreshed.");
  } catch (error) { showError("Refresh failed.", error instanceof Error ? error.message : "Check that the repository still exists."); }
}

async function openTerminal(): Promise<void> {
  const item = repository?.worktrees.find((worktree) => worktree.id === selectedId);
  if (!item) return;
  if (!isNative || isSampleProject) {
    terminalPreviewMessage = `Installed Pulse would open ${item.path} in your terminal.`;
    render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>("#open-terminal")?.focus());
    announce(terminalPreviewMessage);
    return;
  }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("open_terminal", { path: item.path }); announce(`Opened terminal for ${item.name}.`);
  } catch (error) { showError("The terminal did not open.", error instanceof Error ? error.message : "Pulse could not open the selected folder in a terminal."); }
}

function showError(title: string, detail: string): void {
  const old = document.querySelector(".error-toast"); old?.remove();
  const toast = document.createElement("div"); toast.className = "error-toast"; toast.setAttribute("role", "alert");
  toast.innerHTML = `<strong>${e(title)}</strong><span>${e(detail)}</span><button aria-label="Dismiss error">×</button>`;
  toast.querySelector("button")?.addEventListener("click", () => toast.remove()); document.body.append(toast);
}

function showLicenseDialog(): void {
  const root = document.querySelector("#dialog-root"); if (!root) return;
  const returnFocus = document.activeElement as HTMLElement | null;
  root.innerHTML = `<div class="dialog-backdrop"><div class="license-dialog" role="dialog" aria-modal="true" aria-labelledby="license-title"><button id="close-license" class="close-detail" aria-label="Close license dialog">×</button><p class="eyebrow">PULSE PRO</p><h2 id="license-title">Restore your license</h2><label for="license-token">License token</label><input id="license-token" required autocomplete="off" spellcheck="false" aria-describedby="license-result"><p id="license-result" role="status">Paste the token from your purchase email.</p><button class="button primary" id="verify-license" type="button">Verify license</button></div></div>`;
  const input = document.querySelector<HTMLInputElement>("#license-token"); input?.focus();
  const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", handleKey); if (isNative) render(); else returnFocus?.focus(); };
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") { close(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...root.querySelectorAll<HTMLElement>("button, input, a[href]")];
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", handleKey);
  document.querySelector("#close-license")?.addEventListener("click", close);
  document.querySelector(".dialog-backdrop")?.addEventListener("click", (event) => { if (event.target === event.currentTarget) close(); });
  document.querySelector("#verify-license")?.addEventListener("click", async () => {
    const result = document.querySelector<HTMLElement>("#license-result");
    if (!input?.value.trim() || !result) {
      if (input && result) {
        input.setAttribute("aria-invalid", "true");
        result.textContent = "Enter the license token from your purchase email.";
        input.focus();
      }
      return;
    }
    input.removeAttribute("aria-invalid");
    storeLicense(input.value); result.textContent = "Checking the license…";
    isPro = await verifyLicense(true); result.textContent = isPro ? "Pulse Pro is active on this device." : "This license is not active. Check the token and try again.";
  });
}

function closeDetail(): void {
  const returnId = selectedId;
  selectedId = null;
  terminalPreviewMessage = "";
  render();
  requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-worktree="${CSS.escape(returnId ?? "")}"]`)?.focus());
}

async function toggleBlockedAlerts(): Promise<void> {
  const enabled = blockedAlertsEnabled();
  const granted = await setBlockedAlertsEnabled(!enabled);
  render();
  announce(granted ? "Blocked alerts enabled." : enabled ? "Blocked alerts disabled." : "Notification permission was not granted.");
}

if (!isNative) {
  history.scrollRestoration = "manual";
  saveHistoryScroll();
  window.addEventListener("scroll", () => {
    if (isRestoringHistory) return;
    if (scrollStateFrame !== null) cancelAnimationFrame(scrollStateFrame);
    scrollStateFrame = requestAnimationFrame(() => {
      scrollStateFrame = null;
      saveHistoryScroll();
    });
  }, { passive: true });
}

window.addEventListener("popstate", (event) => {
  const state = event.state && typeof event.state === "object" ? event.state as RouteHistoryState : {};
  const position = state.pulseScroll ?? { x: 0, y: 0 };
  isRestoringHistory = true;
  render();
  requestAnimationFrame(() => {
    window.scrollTo({ left: position.x, top: position.y, behavior: "instant" });
    document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    isRestoringHistory = false;
    saveHistoryScroll();
  });
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && selectedId) closeDetail();
  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && document.activeElement?.matches("[data-worktree]")) {
    event.preventDefault(); const rows = [...document.querySelectorAll<HTMLButtonElement>("[data-worktree]")]; const index = rows.indexOf(document.activeElement as HTMLButtonElement); const offset = event.key === "ArrowDown" ? 1 : -1; rows[(index + offset + rows.length) % rows.length]?.focus();
  }
});

if ("serviceWorker" in navigator && !isNative) window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));

if (isNative) void listenForBlockedAlertActions((worktreeId) => {
  if (!repository?.worktrees.some((item) => item.id === worktreeId)) return;
  selectedId = worktreeId;
  render();
  requestAnimationFrame(() => document.querySelector<HTMLElement>("#detail-title")?.focus());
});

if (isNative && loadRepositoryPaths()[0]) {
  import("@tauri-apps/api/core").then(({ invoke }) => invoke<RepositoryPulse>("scan_repository", { path: loadRepositoryPaths()[0] })).then((result) => { repository = result; render(); }).catch(() => render());
} else render(isNative);

scheduleProRefresh(
  () => void refresh(),
  () => Boolean(isNative && isPro && repository && document.visibilityState === "visible"),
);
