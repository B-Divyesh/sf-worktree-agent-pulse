import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/ibm-plex-mono";
import "./styles.css";
import { SAMPLE_REPOSITORY } from "./sample";
import type { Filter, RepositoryPulse, WorktreePulse } from "./types";
import { getDemoRepository, loadRepositoryPaths, resetDemo, saveRepositoryPath } from "./storage";
import { captureReturnedLicense, checkoutUrl, hasCachedLicense, storeLicense, verifyLicense } from "./license";
import { detectPlatform, getDownload, releasesUrl, type Platform } from "./downloads";

declare global { interface Window { __TAURI_INTERNALS__?: unknown } }

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root is missing");

const isNative = Boolean(window.__TAURI_INTERNALS__);
let repository: RepositoryPulse | null = null;
let activeFilter: Filter = "all";
let selectedId: string | null = null;
let isPro = hasCachedLicense();

const titles: Record<string, string> = {
  "/": "Worktree Agent Pulse — See worktree risk",
  "/demo": "Demo — Worktree Agent Pulse",
  "/privacy": "Privacy — Worktree Agent Pulse",
  "/terms": "Terms — Worktree Agent Pulse",
};

const e = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] ?? character));

function navigate(path: string): void {
  history.pushState({}, "", path);
  render();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
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
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <p>See blocked agents and unsafe worktrees in one local board.</p>
    <nav aria-label="Footer"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://param.sociobot.in" target="_blank" rel="noreferrer">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></nav>
    <p class="build-id">v0.1.0 · Generated artwork disclosed</p>
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
  return `<div class="mini-window" aria-label="Example pulse board with five worktrees">
    <div class="window-bar"><span></span><span></span><span></span><strong>NORTHSTAR / 5 WORKTREES</strong><em>SCANNED NOW</em></div>
    <div class="mini-body">
      <div class="board-head"><span>WORKTREE</span><span>AGENT</span><span>GIT STATE</span></div>
      ${SAMPLE_REPOSITORY.worktrees.map((item) => row(item, true)).join("")}
    </div>
  </div>`;
}

function platformName(platform: Platform): string {
  return platform === "mac" ? "macOS" : platform === "windows" ? "Windows" : "Linux";
}

function landing(): string {
  const platform = detectPlatform();
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">LOCAL WORKTREE MONITOR / 01</p>
        <h1 tabindex="-1">Catch blocked agents before branches drift</h1>
        <p class="lede">For developers running several CLI agents who need one view of worktree activity and Git risk.</p>
        <div class="hero-actions">
          <a class="button primary" href="/demo" data-route>Try it with sample data</a>
          <span>Loads five worktrees. Nothing is saved.</span>
        </div>
        <ul class="plain-facts" aria-label="Product facts">
          <li><span aria-hidden="true">01</span>No prompt or output capture</li>
          <li><span aria-hidden="true">02</span>Works without an account</li>
          <li><span aria-hidden="true">03</span>Five worktrees free · Pro is $19 once</li>
        </ul>
      </div>
      <figure class="hero-art">
        <picture><img src="/assets/hero-lattice.webp" width="1536" height="1024" alt="Five geometric branch rails show active, warning, and blocked worktrees." fetchpriority="high" decoding="async"></picture>
        <figcaption>Five rails. One blocked agent. One glance.</figcaption>
      </figure>
    </section>

    <section class="product-preview" aria-labelledby="preview-title">
      <div class="section-index"><span>02</span><p>THE BOARD</p></div>
      <div class="section-content"><h2 id="preview-title">Scan worktrees by urgency</h2><p>Blocked prompts and dirty branches rise above routine activity.</p>${miniDashboard()}</div>
    </section>

    <section id="how" class="how-section" aria-labelledby="how-title">
      <div class="section-index"><span>03</span><p>HOW IT WORKS</p></div>
      <div class="section-content"><h2 id="how-title">Keep your terminal. Add one view.</h2>
        <ol class="steps">
          <li><span>01</span><div><h3>Add a repository</h3><p>Pulse asks Git for its linked worktrees.</p></div></li>
          <li><span>02</span><div><h3>Opt in agent status</h3><p>Your CLI writes a small status file. Prompt text stays out.</p></div></li>
          <li><span>03</span><div><h3>Open the right terminal</h3><p>Select a row to open that exact worktree.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="privacy-section" aria-labelledby="private-title">
      <div class="section-index"><span>04</span><p>BOUNDARIES</p></div>
      <div class="section-content"><h2 id="private-title">Your code is not the product</h2><p>Pulse reads Git metadata and an adapter status file on your machine. It does not record terminal contents, send prompts, or change Git state.</p><a href="/privacy" data-route>Read the privacy details →</a></div>
    </section>

    <section class="price-section" aria-labelledby="price-title">
      <div class="section-index"><span>05</span><p>ONE-TIME LICENSE</p></div>
      <div class="section-content price-grid">
        <div><h2 id="price-title">Use five worktrees free</h2><p>Pay once when you need more repositories or custom adapter paths.</p></div>
        <div class="price"><strong>$19</strong><span>one-time purchase</span><a class="button primary" href="${checkoutUrl()}">Buy Pulse Pro</a><button class="text-button" id="restore-license" type="button">Restore a license</button></div>
      </div>
    </section>

    <section class="download-section" aria-labelledby="download-title">
      <div class="section-index"><span>06</span><p>DESKTOP APP</p></div>
      <div class="section-content"><h2 id="download-title">Install for ${platformName(platform)}</h2><p class="download-status" id="download-status">Checking the latest release…</p><div class="download-actions"><a class="button secondary disabled" id="download-button" aria-disabled="true">Checking downloads…</a><a href="${releasesUrl}" target="_blank" rel="noreferrer">View all releases <span class="sr-only">(opens in a new tab)</span></a></div><p class="signing-note">Early builds are unsigned. Your system may ask you to confirm the app.</p></div>
    </section>
  </main>${footer()}<div id="dialog-root"></div>`;
}

function dashboard(mode: "demo" | "native"): string {
  const data = repository ?? SAMPLE_REPOSITORY;
  const visible = filterItems(data.worktrees);
  const blocked = data.worktrees.filter((item) => item.agentState === "blocked").length;
  const risky = data.worktrees.filter(needsAttention).length;
  const selected = data.worktrees.find((item) => item.id === selectedId);
  const banner = mode === "demo" ? `<aside class="demo-banner"><strong>Demo — sample data, nothing is saved</strong><div><button id="reset-demo" type="button">Reset demo</button><a href="/" data-route>Start for real</a></div></aside>` : "";
  return `${banner}<div class="app-shell">
    <header class="app-header">
      <a class="wordmark" href="${mode === "demo" ? "/" : "#"}" ${mode === "demo" ? "data-route" : ""} aria-label="Worktree Agent Pulse home"><svg aria-hidden="true" viewBox="0 0 42 32"><path d="M3 6h10v8h8V6h10M13 14v12h18"/><rect x="1" y="4" width="5" height="5"/><rect x="29" y="23" width="5" height="5"/></svg><span>WORKTREE<br><strong>AGENT PULSE</strong></span></a>
      <div class="app-actions"><button id="refresh" type="button">↻ <span>Refresh</span></button>${mode === "native" ? `<button id="add-repository" class="primary compact" type="button">+ Add repository</button>` : ""}</div>
    </header>
    <main id="main" class="pulse-main">
      <section class="pulse-heading">
        <div><p class="eyebrow">REPOSITORY / ${e(data.name.toUpperCase())}</p><h1 tabindex="-1">Worktree pulse</h1><p class="path" title="${e(data.root)}">${e(data.root)}</p></div>
        <div class="summary"><span><strong>${blocked}</strong>blocked</span><span><strong>${risky}</strong>need attention</span><span><strong>${data.worktrees.length}</strong>worktrees</span></div>
      </section>
      <div class="filter-bar" role="toolbar" aria-label="Filter worktrees">
        ${(["all", "needs-attention", "working", "clean"] as Filter[]).map((filter) => `<button type="button" data-filter="${filter}" aria-pressed="${activeFilter === filter}">${filter === "needs-attention" ? "Needs attention" : filter[0].toUpperCase() + filter.slice(1)} <span>${filterItemsFor(data.worktrees, filter).length}</span></button>`).join("")}
      </div>
      <section class="pulse-board" aria-labelledby="board-title"><h2 id="board-title" class="sr-only">Worktree status</h2>
        <div class="board-head"><span>WORKTREE</span><span>AGENT</span><span>GIT STATE</span></div>
        <div class="worktree-list">${visible.length ? visible.map((item) => row(item)).join("") : `<div class="empty-state"><strong>No worktrees match this filter.</strong><p>Choose another filter to see your worktrees.</p></div>`}</div>
      </section>
      ${selected ? detailPanel(selected, mode) : ""}
      <p class="scan-time" role="status">Last scan: just now · Git reads only</p>
    </main>
  </div><div class="live-region sr-only" aria-live="polite"></div>`;
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
    <p class="eyebrow">SELECTED WORKTREE</p><h2 id="detail-title">${e(item.name)}</h2>
    <dl><div><dt>Branch</dt><dd>${e(item.branch)}</dd></div><div><dt>Agent</dt><dd>${e(item.agent)} · ${statusLabel(item)}</dd></div><div><dt>Changes</dt><dd>${item.dirty} files</dd></div><div><dt>Remote</dt><dd>${item.ahead} ahead · ${item.behind} behind</dd></div><div><dt>Path</dt><dd>${e(item.path)}</dd></div></dl>
    <button class="button primary" id="open-terminal" type="button">${mode === "demo" ? "Preview terminal action" : "Open this terminal"}</button>
    <p class="action-note">This user action opens the folder. Pulse does not run Git writes.</p>
  </aside>`;
}

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = kind === "privacy";
  return `${header()}<main id="main" class="legal-page"><p class="eyebrow">POLICY / ${privacy ? "PRIVACY" : "TERMS"}</p><h1 tabindex="-1">${privacy ? "Your repository data stays local" : "Terms for using Pulse"}</h1><p class="lede">Effective August 28, 2026</p>
    ${privacy ? `<section><h2>What the app reads</h2><p>The desktop app reads Git worktree metadata. It reads adapter files only after you add a repository. Adapter files should contain status, tool name, and time only.</p><h2>What stays on your device</h2><p>Repository paths, Git state, adapter state, and your license token stay in local app storage. Pulse does not include analytics or crash tracking.</p><h2>Network requests</h2><p>The site checks GitHub for release files. License purchase and verification use the Sociobot billing API. The desktop monitor needs no network connection.</p><h2>Delete your data</h2><p>Remove saved repositories in the app or clear the app’s local storage. Demo data uses separate session storage and disappears when the session ends.</p>` : `<section><h2>License</h2><p>The free edition monitors up to five worktrees. A $19 one-time Pulse Pro license adds unlimited repositories and custom adapter paths.</p><h2>Payment and refunds</h2><p>Sociobot and Dodo are the merchant of record. Their checkout handles payment and refunds. A refunded license stops verifying.</p><h2>Safe use</h2><p>Pulse reports Git metadata but cannot guarantee branch safety. Check your repository before deleting, rebasing, or merging work.</p><h2>Warranty</h2><p>The software is provided under the MIT License without warranty. You remain responsible for your repositories and agent processes.</p>`}
    <h2>Contact</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a> with questions.</p></section></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><div class="broken-rail" aria-hidden="true"><i></i><b>×</b><i></i></div><p class="eyebrow">404 / DETACHED</p><h1 tabindex="-1">This branch ends here</h1><p>The page does not exist. Return to the pulse board.</p><a class="button primary" href="/" data-route>Return home</a></main>${footer()}`;
}

function nativeEmpty(): string {
  return `<div class="app-shell"><header class="app-header">${headerWordmark()}<span class="local-badge">LOCAL ONLY</span></header><main id="main" class="native-empty"><div class="empty-lattice" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow">FIRST SCAN / READY</p><h1 tabindex="-1">Add a repository to find worktrees</h1><p>Pulse reads Git metadata and optional agent status files. It does not read your source files.</p><div class="empty-actions"><button class="button primary" id="add-repository" type="button">Add a repository</button><button class="button secondary" id="load-sample" type="button">Load sample project</button></div><p class="plain-note">Choose a folder that contains a Git repository.</p></main></div>`;
}

function headerWordmark(): string {
  return `<span class="wordmark"><svg aria-hidden="true" viewBox="0 0 42 32"><path d="M3 6h10v8h8V6h10M13 14v12h18"/><rect x="1" y="4" width="5" height="5"/><rect x="29" y="23" width="5" height="5"/></svg><span>WORKTREE<br><strong>AGENT PULSE</strong></span></span>`;
}

function render(): void {
  captureReturnedLicense();
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  let html: string;
  if (isNative) html = repository ? dashboard("native") : nativeEmpty();
  else if (path === "/") html = landing();
  else if (path === "/demo") {
    repository = getDemoRepository(SAMPLE_REPOSITORY);
    html = dashboard("demo");
  } else if (path === "/privacy" || path === "/terms") html = legalPage(path.slice(1) as "privacy" | "terms");
  else html = notFound();
  document.title = isNative ? "Worktree Agent Pulse" : (titles[path] ?? "Page not found — Worktree Agent Pulse");
  app.innerHTML = html;
  bindEvents();
  requestAnimationFrame(() => document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true }));
  if (!isNative && path === "/") void bindDownload();
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
    selectedId = button.dataset.worktree ?? null; render();
    requestAnimationFrame(() => document.querySelector<HTMLElement>("#detail-title")?.focus());
  }));
  document.querySelector("#close-detail")?.addEventListener("click", () => { selectedId = null; render(); });
  document.querySelector("#reset-demo")?.addEventListener("click", () => {
    repository = resetDemo(SAMPLE_REPOSITORY); activeFilter = "all"; selectedId = null; render(); announce("Demo reset.");
  });
  document.querySelector("#refresh")?.addEventListener("click", () => void refresh());
  document.querySelector("#add-repository")?.addEventListener("click", () => void addRepository());
  document.querySelector("#load-sample")?.addEventListener("click", () => { repository = structuredClone(SAMPLE_REPOSITORY); render(); });
  document.querySelector("#open-terminal")?.addEventListener("click", () => void openTerminal());
  document.querySelector("#restore-license")?.addEventListener("click", showLicenseDialog);
}

function announce(message: string): void {
  const region = document.querySelector<HTMLElement>(".live-region");
  if (region) region.textContent = message;
}

async function bindDownload(): Promise<void> {
  const platform = detectPlatform();
  const result = await getDownload(platform);
  const button = document.querySelector<HTMLAnchorElement>("#download-button");
  const status = document.querySelector<HTMLElement>("#download-status");
  if (!button || !status) return;
  if (result) {
    button.href = result.url; button.textContent = `Download for ${platformName(platform)}`; button.classList.remove("disabled"); button.removeAttribute("aria-disabled");
    status.textContent = `${result.version} is ready. Choose another build on the release page.`;
  } else {
    button.href = releasesUrl; button.textContent = "View release status"; button.classList.remove("disabled"); button.removeAttribute("aria-disabled");
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
    saveRepositoryPath(path); render();
  } catch (error) {
    showError("Pulse could not read that repository.", error instanceof Error ? error.message : "Choose a Git repository and try again.");
  }
}

async function refresh(): Promise<void> {
  if (!repository) return;
  if (!isNative) { repository = { ...repository, scannedAt: new Date().toISOString() }; render(); announce("Sample status refreshed."); return; }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    repository = await invoke<RepositoryPulse>("scan_repository", { path: repository.root }); render(); announce("Worktrees refreshed.");
  } catch (error) { showError("Refresh failed.", error instanceof Error ? error.message : "Check that the repository still exists."); }
}

async function openTerminal(): Promise<void> {
  const item = repository?.worktrees.find((worktree) => worktree.id === selectedId);
  if (!item) return;
  if (!isNative) { announce(`Demo action: terminal would open ${item.name}.`); return; }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("open_terminal", { path: item.path }); announce(`Opened terminal for ${item.name}.`);
  } catch (error) { showError("The terminal did not open.", error instanceof Error ? error.message : "Set your default terminal and try again."); }
}

function showError(title: string, detail: string): void {
  const old = document.querySelector(".error-toast"); old?.remove();
  const toast = document.createElement("div"); toast.className = "error-toast"; toast.setAttribute("role", "alert");
  toast.innerHTML = `<strong>${e(title)}</strong><span>${e(detail)}</span><button aria-label="Dismiss error">×</button>`;
  toast.querySelector("button")?.addEventListener("click", () => toast.remove()); document.body.append(toast);
}

function showLicenseDialog(): void {
  const root = document.querySelector("#dialog-root"); if (!root) return;
  root.innerHTML = `<div class="dialog-backdrop"><div class="license-dialog" role="dialog" aria-modal="true" aria-labelledby="license-title"><button id="close-license" class="close-detail" aria-label="Close license dialog">×</button><p class="eyebrow">PULSE PRO</p><h2 id="license-title">Restore your license</h2><label for="license-token">License token</label><input id="license-token" autocomplete="off" spellcheck="false"><p id="license-result" role="status">Paste the token from your purchase email.</p><button class="button primary" id="verify-license" type="button">Verify license</button></div></div>`;
  const input = document.querySelector<HTMLInputElement>("#license-token"); input?.focus();
  const close = () => { root.innerHTML = ""; document.querySelector<HTMLElement>("#restore-license")?.focus(); };
  document.querySelector("#close-license")?.addEventListener("click", close);
  document.querySelector(".dialog-backdrop")?.addEventListener("click", (event) => { if (event.target === event.currentTarget) close(); });
  document.querySelector("#verify-license")?.addEventListener("click", async () => {
    const result = document.querySelector<HTMLElement>("#license-result");
    if (!input?.value.trim() || !result) return;
    storeLicense(input.value); result.textContent = "Checking the license…";
    isPro = await verifyLicense(true); result.textContent = isPro ? "Pulse Pro is active on this device." : "This license is not active. Check the token and try again.";
  });
}

window.addEventListener("popstate", render);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && selectedId) { selectedId = null; render(); }
  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && document.activeElement?.matches("[data-worktree]")) {
    event.preventDefault(); const rows = [...document.querySelectorAll<HTMLButtonElement>("[data-worktree]")]; const index = rows.indexOf(document.activeElement as HTMLButtonElement); const offset = event.key === "ArrowDown" ? 1 : -1; rows[(index + offset + rows.length) % rows.length]?.focus();
  }
});

if ("serviceWorker" in navigator && !isNative) window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));

if (isNative && loadRepositoryPaths()[0]) {
  import("@tauri-apps/api/core").then(({ invoke }) => invoke<RepositoryPulse>("scan_repository", { path: loadRepositoryPaths()[0] })).then((result) => { repository = result; render(); }).catch(() => render());
} else render();

void verifyLicense().then((valid) => { isPro = valid; });
