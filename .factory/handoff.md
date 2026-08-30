# Worktree Agent Pulse — repair 9 handoff

Date: 2026-08-30

Production: <https://worktree-agent-pulse.sociobot.in>

Demo: <https://worktree-agent-pulse.sociobot.in/demo>

Verifier report: `.factory/verification-10.md` at `89722455ca905812ed2d77ffc3fd42a511c1dfc0`

Failed candidate: `ff4d7e44c11402f37fdb6cff9234de9c36277aa6`

Repair implementation: `c1bccd0b0cf27658dbebfef04f9c794f22cf53a8`

Artifact/deployment class: Tauri 2 desktop app with static product site, unchanged

## Result

Both release-blocking verifier findings are fixed and deployed.

- Mobile Lighthouse improved from 78 performance and 990 ms total blocking time to 100 performance and 0 ms total blocking time on the live domain.
- A cold page load now leaves focus on the document. The first Tab focuses and reveals **Skip to content**, the second reaches the wordmark, and forward navigation continues through the primary navigation. This passed at 1440×900 and 390×844.
- Client-side route changes and Back/Forward still focus the new H1. Mobile Back still restores the exact prior landing scroll position.

The researched brief, 31-claim contract, demo data and isolation, copy, visual identity, pricing, billing, downloads, and native behavior are unchanged.

## Root cause and repair

The public site called `render(true)` on cold startup. Its animation-frame H1 focus moved the browser's starting focus beyond the skip link and header. Under the verifier's slower CPU, that focus also forced layout across the full landing document and contributed to repeated long tasks.

- Cold public routes now render without programmatic H1 focus. Native startup keeps its existing behavior through `render(isNative)`.
- In-app navigation and history traversal retain H1 focus management and `preventScroll` restoration.
- Independent landing sections use layout, paint, and style containment so rendering work stays scoped without hiding or delaying content.
- `tests/e2e/accessibility.spec.ts` now asserts the exact cold-load Tab order on desktop and mobile, including the visible skip link.
- `npm run test:lighthouse` runs pinned Lighthouse 12.8.2 against a fresh production preview. It fails below 90 performance, 95 accessibility, 90 best practices/SEO, 200 ms TBT, 2.5 s LCP, or 0.1 CLS.

## Clean local verification

All checks ran after `npm ci` from the repair checkout.

- `npm ci`: 106 packages; 0 vulnerabilities.
- `npm test`: 21/21 Vitest tests and 69/69 runnable Playwright tests passed across desktop Chromium and 390×844 mobile. One expected project variant was skipped.
- Browser coverage includes all declared web claims, cold-load and route-change keyboard focus, drawer focus return, 44 px targets, 200% text reflow, serious/critical Axe findings on every route, zero console errors, privacy request boundaries, invalid/rate-limited license states, and a fresh-context offline demo reload.
- `npm run test:lighthouse`: 98 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1,222 ms, LCP 2,189 ms, TBT 106 ms, interactive 2,227 ms, CLS 0. Benchmark index: 2,228.
- `npm run build`: TypeScript and Vite passed; `dist/site` exists.
- `npm run test:build-output`: passed; all JavaScript is 40,677 bytes raw. Main JavaScript is 35,822 bytes / 11.67 KB gzip; CSS is 25,159 bytes / 6.06 KB gzip.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7/7 passed, including metadata-only scanning, exact-terminal-path, and status-value claims.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- No JavaScript lint script is declared; TypeScript strict checking runs in every production build.
- `npm run test:checkout`: live Sociobot checkout returned HTTP 303 to Dodo's hosted checkout.
- `npm run test:release-provenance -- v0.1.11`: five advertised desktop artifacts match `SHA256SUMS` and source `763706ba1aab89026cf2090b2289d50142517839`.
- `npm run test:signing-status`: published macOS and Windows unsigned-signing evidence passed.

The clean Linux native checks required the documented Tauri packages, including `libglib2.0-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`.

## Deployment and live evidence

- Deployment command: `/opt/fleet/lib/deploy-static.sh worktree-agent-pulse dist/site`.
- Azure Static Web Apps deployment ID: `e6a4da33-b688-4ec9-9e97-79e91f5c6189`.
- App: `sf-worktree-agent-pulse` in `centralus`; custom domain status Ready; HTTPS returned 200.
- Live Lighthouse 12.8.2: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1,205 ms, LCP 1,505 ms, TBT 0 ms, interactive 1,505 ms, CLS 0. Benchmark index: 2,508.
- `verify-url.sh`: HTTP 200, 987 ms load, exact title, `lang=en`, one H1, one main landmark, all images and buttons labelled, and zero console errors.
- Strengthened live browser audit: 14/14 checks passed. It covered four-route Axe scans, desktop/mobile first screens, exact history focus and scroll, demo isolation, same-origin demo traffic, offline reload, drawer keyboard behavior, 200% mobile privacy reflow, 44 px controls, the GitHub release download, form errors, and the real HTTP 404.
- An additional live cold-load probe passed at 1440×900 and 390×844: initial BODY focus, then visible skip link, then wordmark.
- Live response policy includes HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and CSP with `frame-ancestors 'none'`. HTML caches for 30 seconds; hashed JavaScript caches for one year as immutable.
- Public route responses: `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, and `/sitemap.xml` returned 200; `/missing` returned 404.
- Local and live assets are byte-identical. Main JavaScript SHA-256: `de67b25794ae910c5ddfd1dce8aec64e6a1849f07dd3c5c4ecfc826773bf1e61`. Main CSS SHA-256: `53da52092c3e4017e53155592af8f503e22b02225ac815eb26d64cf82a2afffc`.
- The product has no server endpoint or sign-in flow. Entra identity is not applicable. Billing uses only the live Sociobot endpoint, and the browser claim suite verifies fail-closed network and HTTP 429 behavior.

Evidence is in `.factory/repair-9-evidence/`: local and live Lighthouse JSON, local and live `verify-url.sh` output, full desktop/mobile screenshots, `live-check.json`, the demo terminal result, and the 200% privacy capture.

## Run locally

```bash
npm ci
npm test
npm run test:lighthouse
npm run build
npm run test:build-output
npm run test:checkout
npm run test:release-provenance -- v0.1.11
npm run test:signing-status
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Known gaps and operator action

No release-blocking product, verification, deployment, or claim gaps remain.

The current macOS and Windows installers remain unsigned, as disclosed before download. A future signed release requires the owner's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` credentials plus their password secrets. No updater is shipped or claimed, so no updater manifest is required.
