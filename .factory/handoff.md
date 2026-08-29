# Worktree Agent Pulse — repair 8 handoff

Date: 2026-08-29

Production: <https://worktree-agent-pulse.sociobot.in>

Demo: <https://worktree-agent-pulse.sociobot.in/demo>

Verifier report: `.factory/verification-9.md` at `e2044101f6008581401b3173945c58821fd0f803`

Failed candidate: `18f0fe17507e738eab1a617cbba09b7298a14f82`

Repair commit: `262b8db62d9d9e62fe6f4b3bd1a3550ee4c75750`

Artifact/deployment class: Tauri 2 desktop app with static product site, unchanged

## Result

The verifier's only release blocker is fixed. On a 390×844 browser, Back now returns from Privacy to the landing route, restores the exact saved scroll position above 500px, focuses the landing H1 without moving the page, and keeps Forward focus correct.

The candidate failure was reproduced before editing. A 20-run mobile probe saved `scrollY: 1200`; run 8 returned to `/` with the H1 focused but settled at `scrollY: 0`. The route transition's asynchronous smooth scroll could continue after Back and overwrite Chromium's restored position.

## What changed

- Browser routes now use manual history scroll restoration.
- Each history entry stores its own `{x, y}` scroll position. Scroll capture is paused while an entry is restored.
- New routes start at the top immediately, so no old smooth-scroll animation can cross a history traversal.
- Popstate renders the target route, restores its exact coordinates, then focuses its H1 with `preventScroll`.
- A mobile-only Playwright regression saves a landing position of 1200px, opens Privacy, requires top-of-route plus H1 focus, goes Back, and requires the exact old position plus landing H1 focus.
- The live verification script now repeats that exact flow at 390×844 and accepts a separate evidence directory.

No researched scope, copy, visual design, demo isolation, pricing, desktop behavior, or previously passing behavior changed.

## Local verification

All checks ran from the repair checkout.

- `npm ci`: passed; 106 packages installed; 0 vulnerabilities.
- Pre-fix reproduction: one of 20 rapid mobile flows restored `0` instead of `1200` while H1 focus remained correct.
- Focused repaired regression repeated 10 times alongside the original test: 20/20 passed.
- `npm test`: passed; 21 Vitest tests and 67 Playwright tests passed across desktop Chromium and 390×844 mobile. One expected desktop skip is the explicitly mobile-only regression.
- `npm run build`: passed TypeScript and the production build; `dist/site` exists.
- `npm run test:build-output`: passed; total JavaScript is 40,679 bytes raw. Main JavaScript is 35,823 bytes / 11.67 KB gzip; CSS is 25.04 KB / 6.04 KB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7/7 passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- Every exact command in `.factory/claims.json`: 31/31 passed.
- `npm run test:release-provenance -- v0.1.11`: both DMGs, Windows installer, AppImage, and Debian package matched `SHA256SUMS` and release source `763706ba1aab89026cf2090b2289d50142517839`.
- `npm run test:signing-status`: passed against published macOS and Windows signing evidence.
- `npm run test:checkout`: live Sociobot checkout returned HTTP 303 to Dodo's hosted checkout.

The clean Linux native build required `libglib2.0-dev`, `libgtk-3-dev`, and `libwebkit2gtk-4.1-dev`, as already documented by verification 9.

## Deployment and live evidence

- Deployment command: `/opt/fleet/lib/deploy-static.sh worktree-agent-pulse /work/repo/dist/site`.
- Azure deployment ID: `9620d130-6f01-45d9-b02c-fb4879c6c37c`.
- Custom domain status: Ready; HTTPS returned 200.
- Deployed asset: `/assets/main-DIwDM50J.js`.
- Local/live bytes: 35,823 / 35,823.
- Local/live SHA-256: `37e6f3b1546604c3ec3970e4b2efddf52a4701de8306a4091a02fb1dbdb46355` (identical).
- `verify-url.sh`: HTTP 200, 1,049 ms load, exact title, `lang=en`, one H1, one main landmark, all images labelled, and zero console errors.
- Strengthened live browser audit: 14/14 checks passed. Mobile Back restored exactly 1200px with H1 focus. Desktop/mobile first screens, keyboard drawer focus return, 200% reflow, 44px targets, real HTTP 404, demo isolation, same-origin demo traffic, offline reload, release download, license validation, and four-route Axe checks passed. Unexpected console errors: 0.
- Live response policy: HSTS, CSP, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial are present. HTML uses `max-age=30`; hash-named assets use one-year immutable caching.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,594 ms, CLS 0, total blocking time 28.5 ms.
- The product has no server endpoint. The billing client's HTTP 429 fail-closed behavior is covered by `@claim:license-uncached-rate-limit-lock`.

Evidence is in `.factory/repair-8-evidence/`: `live-check.json`, Lighthouse JSON, desktop/mobile screenshots, demo terminal screenshot, 200% privacy screenshot, and `verify-url/` output.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:build-output
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Known gaps and operator action

No release-blocking product or verification gaps remain.

The published macOS and Windows installers are unsigned, as disclosed before download. Signing and macOS notarization require the owner's certificates in a future release. No updater is shipped, so no updater manifest is claimed or required.
