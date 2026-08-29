# Independent verification 8 — PASS

- Candidate commit: `3b6f3c6afffa5b1c7bd204e510a4bfba4b2dfb62`
- Live URL: <https://worktree-agent-pulse.sociobot.in>
- Verified: 2026-08-29 from the supplied clean checkout
- Work order: `worktree-agent-pulse-verify-8`
- Verdict: **PASS** — no critical, major, or minor product defects found.

No product code was changed. Fresh browser, Lighthouse, request, rate-limit,
and screenshot evidence is under `.factory/verification-8-evidence/`.

## Required first-read gate — PASS

A cold, storage-free visit answers all three questions in plain words:

- What it does: **“See blocked agents and worktrees that need attention.”**
- Who it is for: developers running several CLI agents who need one view of
  worktree activity and Git state.
- What to click first: **“Try it with sample data.”**
- What the click does: **“Loads five worktrees. Nothing is saved.”**

At 1440×900 the action occupied y=618…666 and its explanation y=623…660. At
390×844 they occupied y=581…629 and y=647…665. One keyboard activation opened
`/demo`, immediately showed five realistic worktrees, and displayed the
persistent **“Demo — sample data, nothing is saved”** banner. Evidence:
`first-read-desktop-fresh.png`, `first-read-mobile-fresh.png`, and
`live-audit.json`.

## Claims gate — PASS (31/31)

`.factory/claims.json` exists and contains 31 entries. The mandated
pre-install probe ran first: JavaScript commands could not load their test
packages because a clean clone has no `node_modules`, and native commands
could not compile before the documented Tauri system libraries were present.
Those probes did not reach claim assertions. After `npm ci` and installation
of the repository's documented Linux prerequisites, every exact manifest
command was rerun individually and all 31 passed.

| Claim | Result and observed evidence |
| --- | --- |
| `sample-five` | PASS — desktop and mobile loaded five sample worktrees. |
| `attention` | PASS — complete order was checkout, invoices, main, search, auth. |
| `first-screen-demo` | PASS — action and explanation fit all three asserted viewports. |
| `demo-private` | PASS — same-origin traffic and demo-only session storage. |
| `offline-demo` | PASS — five rows survived a service-worker-controlled offline reload. |
| `metadata-only` | PASS — content canaries stayed out and Git/file state stayed unchanged. |
| `free-price` | PASS — five free and `$19 once` were shown. |
| `no-account` | PASS — fresh storage reached the populated board without sign-in. |
| `pro-capacity-refresh` | PASS — free returned five, Pro eight, scheduler 10,000 ms. |
| `site-network` | PASS — GitHub was contacted only after the download request. |
| `license-local` | PASS — token was URL-stripped, namespaced locally, and sent only to Sociobot. |
| `license-daily` | PASS — re-verification was suppressed until 24 hours. |
| `license-uncached-network-lock` | PASS — an uncached token remained locked after network failure. |
| `license-uncached-rate-limit-lock` | PASS — an uncached token remained locked after HTTP 429. |
| `mac-download-architecture` | PASS — Intel and Apple silicon selected matching DMGs. |
| `release-available` | PASS — current `v0.1.9` release and `SHA256SUMS` exist. |
| `platform-artifacts` | PASS — both DMGs, Windows EXE, AppImage, and DEB have checksums. |
| `release-source-provenance` | PASS — all five published files matched release metadata and hashes. |
| `exact-terminal-path` | PASS — the configured terminal probe received the exact worktree directory. |
| `installer-checksum` | PASS — both installer scripts reject a bad hash before opening/installing. |
| `native-no-tracking` | PASS — no native/WebView analytics or crash client was found. |
| `repository-delete` | PASS — the saved path was forgotten without changing repository files. |
| `checkout-live` | PASS — live endpoint returned HTTP 303 to `checkout.dodopayments.com`. |
| `refund-contact` | PASS — Terms exposes the exact refund mail link. |
| `native-data-local` | PASS — paths/license persist locally; scan results remain in memory. |
| `status-values` | PASS — only working, blocked, and idle become agent states. |
| `node-setup` | PASS — package and release workflow require Node 22+. |
| `build-output` | PASS — `dist/site` exists and JavaScript is 39,754 bytes raw. |
| `release-workflow` | PASS — tag matrix covers both macOS architectures, Windows, AppImage, and DEB. |
| `unsigned-builds` | PASS — release evidence and copy disclose unsigned macOS/Windows builds. |
| `blocked-notifications` | PASS — opt-in transitions, deduplication, and action routing passed. |

A cross-check of the live copy and README found no material promise missing
from the claim manifest.

## Clean install, tests, build, and desktop package — PASS

- `npm ci`: passed on Node `v22.23.2`; 106 packages, zero audit vulnerabilities.
- `npm test`: passed — 21 Vitest tests and 64 Playwright tests.
- `npm run build`: passed, including `tsc --noEmit`; exact output is
  `dist/site`. No separate lint script is declared.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`:
  passed.
- Candidate-stamped production command
  `CI=true VITE_BUILD_SOURCE_COMMIT=3b6f3c6afffa5b1c7bd204e510a4bfba4b2dfb62 npm run tauri -- build --bundles deb`:
  passed.
- Local DEB: 2,475,120 bytes; SHA-256
  `5e3b2b7ca0d0aca8d15185e039926637706ed616de63920d13c92da39cf10492`.
- A clean DEB extraction had no unresolved `ldd` dependency. The extracted
  executable stayed alive for an eight-second Xvfb smoke run. Only expected
  headless GPU and absent session-bus warnings appeared.

## Useful product and recovery paths — PASS

- The live demo returned All 5 / Needs attention 4 / Working 1 / Clean 1.
- The attention order was `checkout-retry`, `invoice-export`, `northstar`,
  `search-index`, `auth-cleanup`.
- Keyboard Enter opened the selected worktree, focus moved to its drawer
  heading, Space ran the terminal preview, and Escape restored row focus.
- The preview named the exact selected directory and did not open a terminal.
- Reset restored all five worktrees. Demo storage contained only
  `demo:worktree-agent-pulse:repository`; local storage remained empty.
- Empty license submission focused the field, set `aria-invalid=true`,
  explained the correction, and sent no request.
- A real invalid token received HTTP 200 with an invalid verdict, displayed
  **“This license is not active. Check the token and try again.”**, and did not
  activate Pro.
- Native tests exercised real repositories, paths with spaces, dirty/ahead/
  behind state, detached HEAD, invalid/missing status files, a missing terminal
  path, and repository preservation.

## Live accessibility, privacy, routing, and PWA — PASS

- The factory `verify-url.sh` passed: HTTPS 200, 894 ms load, zero console
  errors, title/lang/main present, one H1, complete alt text, and labeled
  buttons (`verify.json`).
- Fresh live Axe 4.10.2 audits of `/`, `/demo`, `/privacy`, `/terms`, and the
  designed 404 at desktop and 390 px found zero serious/critical violations.
- Valid routes had zero console or page errors and no horizontal overflow.
  Chromium reports the intentional top-level 404 response as a failed network
  resource; the rendered 404 document has no script error.
- Every visible link and button on all five routes measured at least 44×44 px.
- Focus is a visible 3 px mint outline. The skip link becomes visible and
  targets `#main`. Route changes and browser back/forward focus the new H1.
- At 390 px with 200% text, document width remained 390 px and no worktree or
  branch identifier clipped. Reduced motion left no duration above 0.001 s.
- Landing and the complete demo flow made same-origin requests only. The
  explicit download check added exactly one request to `api.github.com` and
  produced the real `v0.1.9` AppImage link without a console error.
- The service worker updated to `activated`, controlled the page, used cache
  `worktree-agent-pulse-v3`, and reloaded `/demo` offline with five rows.
- HTML and `sw.js` revalidate after 30 seconds. Hashed JS/CSS/image assets are
  immutable for one year. CSP, HSTS, `nosniff`, referrer policy, and denied
  camera/microphone/geolocation headers were present.
- Titles, canonical/OG/Twitter metadata, robots, sitemap, SVG favicon,
  180×180 touch icon, and the real 1200×630 social image passed.
- There is no sign-in flow, so the Entra tenant requirement is not applicable.

## Performance — PASS

- Fresh mobile Lighthouse: Performance 98, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.2 s, LCP 1.6 s, TBT 160 ms, CLS 0, Speed Index 1.2 s.
- A measured mobile demo navigation took 98 ms, a filter interaction 59 ms,
  and the largest Event Timing interaction duration was 32 ms.
- Cold loaded resources: JavaScript 34,898 bytes raw / 11,523 encoded; CSS
  25,039 / 6,230; fonts 52,616; hero WebP 63,848. All budgets pass.
- Evidence: `lighthouse-mobile.json` and `resource-sizes.json`.

## Deployment, release, and API identity — PASS

- A fresh default production build matched all 42 public live files
  byte-for-byte. `staticwebapp.config.json` was correctly excluded because it
  configures the host and is not a public asset.
- Release `v0.1.9` targets `5bc7c15f01fe352b4bf4ea4c658e651782c062d8`.
  The candidate differs from that tag only in `.factory` handoff/evidence
  records; product source, assets, configuration, dependencies, and runtime
  output are identical.
- GitHub Actions run `33272885314` completed successfully for the release.
- A fresh 77,285,880-byte AppImage download matched SHA-256
  `090c82bded1a059872c509afd6ddc3a6040874a99c3c83eb66274cf0b4c9c0ec`
  in `SHA256SUMS`; `latest.json` and the tag name the same source commit. The
  AppImage stayed alive for a 12-second Xvfb extract-and-run smoke test.
- The Sociobot license verification endpoint allowed 30 requests from one
  client. Attempt 31 returned HTTP 429 with `Retry-After: 4`; successful
  invalid verdicts used `Cache-Control: no-store` and origin-specific CORS.
- The product has no server-side application backend. Backend concurrency,
  health, and persistence checks are therefore not applicable.

## Defects by severity

- Critical: none.
- Major: none.
- Minor: none.

Environment note: direct AppImage mounting could not use `/dev/fuse` in the
container; AppImage's supported extract-and-run mode exercised the published
binary successfully. Current macOS and Windows packages are intentionally
unsigned and clearly disclosed.
