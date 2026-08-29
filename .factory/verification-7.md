# Independent verification 7 — FAIL

- Candidate commit: `3e7918193ef353c84cf277577b830d0c45f62282`
- Live URL: <https://worktree-agent-pulse.sociobot.in>
- Verified: 2026-08-29 from the supplied clean checkout
- Work order: `worktree-agent-pulse-verify-7`
- Verdict: **FAIL** — two major release-blocking defects remain: paid license verification fails open, and the primary board loses identifiers at 200% text.

No product code was changed. Fresh visual evidence is under
`.factory/verification-evidence-7/`.

## Required first-read gate — PASS

A cold, storage-free visit at 1440×900 and 390×844 answers all three required
questions in the initial viewport:

- What it does: **“See blocked agents and worktrees that need attention.”**
- Who it is for: developers running several CLI agents who need one view of
  worktree activity and Git state.
- What to do first: **“Try it with sample data.”**
- What the click does: **“Loads five worktrees. Nothing is saved.”**

The action was fully visible at `y=581…629` in the 390×844 viewport and opened
`/demo` in one click. The result had five worktrees and the persistent
**“Demo — sample data, nothing is saved”** banner. Evidence:
`verification-evidence-7/first-read-desktop.png` and
`verification-evidence-7/first-read-mobile.png`.

## Claims gate — PASS after native build-environment setup

`.factory/claims.json` exists with 29 entries. Every listed command was run
individually and in manifest order. Twenty-six passed immediately. The three
Cargo commands initially exited before test execution because the clean worker
did not have `glib-2.0.pc`. After installing the Tauri Linux prerequisites
identified by the repository's handoff, the same exact commands were rerun and
their assertions passed. No claim assertion failed in the configured native
build environment.

| Claim | Result |
| --- | --- |
| `sample-five` | PASS — desktop and mobile loaded five rows through the one-click demo. |
| `attention` | PASS — blocked, behind, and changed worktrees appeared in the complete deterministic order. |
| `first-screen-demo` | PASS — action and explanation fit 1440×900, 1280×800, and 390×844. |
| `demo-private` | PASS — same-origin requests and demo-only session storage. |
| `offline-demo` | PASS — five rows remained after service-worker-controlled offline reload. |
| `metadata-only` | PASS after Tauri prerequisites — source/prompt/output canaries stayed out and Git/file state was unchanged. |
| `free-price` | PASS — five free and `$19 once` are visible. |
| `no-account` | PASS — fresh storage reached the board without sign-in. |
| `pro-capacity-refresh` | PASS — free showed five, Pro eight, and scheduler interval was 10,000 ms. |
| `site-network` | PASS — no external request before the download action; then only GitHub's Releases API. |
| `license-local` | PASS — returned token was URL-stripped, locally namespaced, and sent only to Sociobot. |
| `license-daily` | PASS — verification was suppressed until the 24-hour boundary. |
| `mac-download-architecture` | PASS — Intel and Apple silicon selected their matching DMGs. |
| `release-available` | PASS — public `v0.1.8` and `SHA256SUMS` exist. |
| `platform-artifacts` | PASS — both DMGs, Windows EXE, AppImage, DEB, and checksums exist. |
| `release-source-provenance` | PASS — five downloads matched their hashes and release metadata identifies source `8d7b595…`. |
| `exact-terminal-path` | PASS after Tauri prerequisites — terminal probe received the selected worktree as its working directory. |
| `installer-checksum` | PASS — both installers reject a bad hash before opening, copying, or starting an asset. |
| `native-no-tracking` | PASS — native/WebView source has no analytics or crash-tracking client. |
| `repository-delete` | PASS — removing a saved path preserved repository files and Git state. |
| `checkout-live` | PASS — HTTP 303 to an HTTPS `checkout.dodopayments.com` session. |
| `refund-contact` | PASS — Terms exposes the exact refund `mailto:`. |
| `native-data-local` | PASS — paths/license persist locally; board scan results stay in memory. |
| `status-values` | PASS after Tauri prerequisites — only working, blocked, and idle were accepted. |
| `node-setup` | PASS — package, runtime, and release workflow require Node 22+. |
| `build-output` | PASS — `dist/site` exists with 39,195 bytes of JavaScript. |
| `release-workflow` | PASS — tag matrix declares both macOS architectures, Windows, AppImage, and Debian. |
| `unsigned-builds` | PASS — public runner evidence and copy disclose unsigned macOS/Windows builds. |
| `blocked-notifications` | PASS — opt-in transition, deduplication, and action routing passed. |

## Clean build, tests, and package — PASS

- `npm ci`: passed; 106 packages, zero audit vulnerabilities.
- `npm test`: passed — 19 Vitest tests and 58 Playwright tests.
- `npm run build`: passed, including `tsc --noEmit`; exact site output is
  `dist/site`.
- No JavaScript lint script is declared.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `CI=true VITE_BUILD_SOURCE_COMMIT=3e791819… npm run tauri -- build --bundles deb`: passed.
- Fresh DEB: 2,473,410 bytes, SHA-256
  `a92b269672bf68718bd543171b18c850e406b3cdd60a37279258b899d1b5de3f`.
- Clean DEB extraction had no missing `ldd` dependency. The app remained alive
  for the eight-second Xvfb smoke window (expected timeout exit 124); only
  headless GPU/session-bus warnings appeared.

## Useful-product and recovery paths

- Demo filters returned All 5 / Needs attention 4 / Working 1 / Clean 1.
- Row keyboard navigation wrapped correctly: first → last with ArrowUp and
  last → first with ArrowDown.
- Enter moved focus to `#detail-title`; after the terminal-preview transition,
  Escape returned focus to the invoking worktree in six repeated fresh runs.
- The drawer exposed the exact sample branch, Git state, adapter state, and
  path. The terminal preview reported the full selected directory without
  opening anything.
- Reset restored five rows. Empty license submission focused the field, set
  `aria-invalid=true`, announced the corrective instruction, and made no
  request. A real invalid token produced a clear retry message.
- Native tests covered a real temporary Git repository, paths with spaces,
  dirty/ahead/behind counts, detached HEAD, missing terminal paths, unsupported
  status values, and file/Git preservation.

## Live accessibility, privacy, and network — mixed

Passing evidence:

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 at desktop and 390px;
  each had `lang=en`, one `<main>`, one `<h1>`, complete image alt text, no
  normal-width horizontal overflow, and zero serious/critical Axe findings.
- A real missing route returned HTTP 404 with the product's designed page.
- Fresh complete flows produced zero console/page errors.
- Visible keyboard focus was a 3px mint outline. Reduced motion changed all
  non-zero motion to `0.00001s`.
- All visible desktop and mobile links/buttons measured at least 44×44 CSS px.
- Initial landing and complete demo flows made no cross-origin request.
  Download checking made only the documented GitHub API request. Invalid
  license verification contacted only `api.sociobot.in`.
- Site headers include HSTS, `nosniff`, strict-origin referrer policy, denied
  camera/microphone/geolocation, and a CSP matching the observed requests.
  HTML and `sw.js` revalidate after 30 seconds; hashed assets are immutable for
  one year.
- The license verification endpoint allowed 30 requests from one client.
  Requests 31–33 returned HTTP 429 with `Retry-After: 4`; successful responses
  were `Cache-Control: no-store` with origin-specific CORS.
- Service-worker update reached `activated`; cache
  `worktree-agent-pulse-v3` served a five-row `/demo` reload offline.
- There is no sign-in flow, so the Entra tenant requirement is not applicable.

Failing accessibility evidence is in the major finding below.

## Performance and deployment identity — PASS

- Fresh mobile Lighthouse: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.2 s, LCP 1.6 s, TBT 200 ms, CLS 0, Speed Index 1.4 s.
- Cold transferred resources: JavaScript 11,313 bytes compressed / 34,339 raw;
  CSS 6,182 / 24,765; fonts 52,616; hero WebP 63,848. All stated budgets pass.
- A default production build matched the live deployment byte-for-byte for all
  42 served files checked, including HTML, service worker, installers, hashed
  JS/CSS/fonts, artwork, walkthrough images, robots, and sitemap.
- The explicit download action selected the real `v0.1.8` Linux AppImage and
  emitted no console error. Every crawled link resolved; checkout and mail
  actions were verified separately.
- Release `v0.1.8` targets `8d7b5956800efd108c73773d9a507a9687ca4883`.
  Candidate changes after that tag are verification docs/evidence, the
  live-check script, and formatting inside a Rust test; shipped runtime source
  is unchanged. `latest.json`, the tag target, and checksums agree.

## Release-blocking defects

### Major — a new unverified token unlocks Pulse Pro when verification fails

`src/license.ts::hasCachedLicense()` returns `true` whenever a token exists and
there is no cached verdict. `verifyLicense(true)` returns that optimistic value
on every fetch failure. In two fresh live-browser cases, a never-valid token
`not-a-license-qa7` received either an aborted request or HTTP 429. Both cases
displayed **“Pulse Pro is active on this device”** with no verdict stored.

The bypass persists: after storing the fake token with no verdict, an offline
reload showed **Pulse Pro is active** and removed the Buy link. The desktop app
uses this same `isPro` value to remove the five-worktree limit. This violates
the paid-unlock requirement to verify on first unlock and to unlock
optimistically only from a cached valid verdict. Evidence:
`verification-evidence-7/license-fail-open.png`.

Required fix: distinguish “valid cached verdict” from “token exists.” A new or
uncached token must remain locked when verification cannot complete. Only a
previous, unexpired `valid: true` verdict may be used offline. Add claim tests
for network failure and 429 with an uncached fake token.

### Major — 200% text clips primary worktree and branch identifiers

At 390×844 with root text enlarged to 200%, the demo's primary board renders
`checkout-retry`, `invoice-export`, `search-index`, `auth-cleanup`, and several
branch paths as clipped ellipses. Measurements showed, for example,
`checkout-retry` at 238px scroll width inside a 161px `overflow:hidden`
container. This loses the identifiers users need to distinguish worktrees and
violates the accessibility requirement that text resize to 200% without loss.

The existing test covers only `/privacy`, so it misses the product's main
screen. Evidence: `verification-evidence-7/demo-200-percent.png`.

Required fix: reflow the board at 200% (wrap identifiers or use a stacked
layout without clipping), then test every public route and the open drawer at
390px/200%.

## Non-blocking performance observation

The three below-the-fold walkthrough PNGs have no `loading="lazy"` and all load
on the cold mobile visit, adding 140,127 bytes. Lighthouse and byte budgets
still pass, but this does not follow the attached lazy-below-the-fold guidance.
