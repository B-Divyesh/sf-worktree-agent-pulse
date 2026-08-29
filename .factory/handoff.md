# Worktree Agent Pulse — verification 9 handoff

Date: 2026-08-29
Candidate: `18f0fe17507e738eab1a617cbba09b7298a14f82`
Verdict: **FAIL — do not release this candidate.**

## Current independent verification

All 31 declared claim commands passed after standard Linux Tauri development prerequisites were installed (the initial native compile was blocked only by missing GLib headers in this disposable image). The exact production build passed; full native tests (7), formatting, and strict Clippy passed. The live static bundle matches the candidate build byte-for-byte (`assets/main-DqBptOL-.js`, SHA-256 `f1c1793622e76e29cf998aa7f1c3a2800ad6799e3a7d3da309616d3825668a98`).

The live cold first screen plainly states the job, target user, and **Try it with sample data** action. Desktop and 390px live demo checks passed: demo-only same-origin traffic, no browser errors, no Axe serious/critical issues, visible keyboard focus, Enter/Escape details interaction, reduced-motion behavior, and offline reload with five sample rows. CSP/HSTS/nosniff/referrer headers are present; the hash-named JS is cached immutable for one year.

### Release blocker (P1)

`npm test` is not green. Its 21 unit tests pass, but the mobile execution of `tests/e2e/accessibility.spec.ts:46` fails after browser Back: expected restored landing `scrollY > 500`, observed `0` after five seconds. Route URL and H1 focus restore, but the scroll location does not. A three-repeat focused reproduction failed again in the mobile project. This violates the required mobile route-history behavior and the mandatory test quality gate.

Repair that behavior and rerun `npm test` successfully before submitting another candidate. Exact command output, claim evidence, request/header evidence, and the local Playwright trace path are recorded in `.factory/verification-9.md`. No product code was changed during verification.

## Superseded builder handoff (historical context)

Production: <https://worktree-agent-pulse.sociobot.in>

Demo: <https://worktree-agent-pulse.sociobot.in/demo>

Release: <https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.11>

Release source: `763706ba1aab89026cf2090b2289d50142517839`

## What changed

- Demo mode is resolved before license initialization. `/demo` and `/?demo=1` do not read, capture, verify, or change real license data.
- A `license` query on a demo URL is removed without storing it. Demo reset and exit touch only `demo:worktree-agent-pulse:repository` in session storage.
- `@claim:demo-private` now seeds byte-for-byte real repository, license, verdict, unrelated local, and session sentinels. It instruments storage reads, blocks Sociobot, exercises both direct demo URLs, resets, exits, and checks every byte.
- Route tests now assert exact titles, descriptions, canonical URLs, one h1, Back/Forward focus, and scroll restoration. The live verifier repeats these checks against production.
- The first-screen copy, catalog sentence, legal pages, real 404, mobile layout, 200% text reflow, touch targets, terminal feedback, and earlier review repairs remain intact.
- The hero image is preloaded from the HTML shell. This reduced mobile Lighthouse LCP from 3.2 seconds to 1.7 seconds without changing the product art.
- The service-worker precache now deduplicates assets and uses cache version `worktree-agent-pulse-v4`. Offline tests use isolated browser contexts and acquire service-worker control before disabling the network.
- `.factory/polish-3.md` maps every F-1-*, F-2-*, and F-3-* finding to its repair and evidence.
- `.factory/catalog-description.txt` is a 78-character, verb-first sentence.

## Verification

All commands passed against the release source.

- Clean detached clone at `763706ba1aab89026cf2090b2289d50142517839`: `npm ci` completed with 0 vulnerabilities.
- Every one of the 31 exact commands in `.factory/claims.json` passed from that clean clone.
- `npm test`: 21 unit tests and 66 Playwright tests passed across desktop Chromium and a 390×844 mobile project.
- The browser suite includes Axe checks for `/`, `/demo`, `/privacy`, `/terms`, and `/missing`; no serious or critical findings remain.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `npm run test:build-output`: passed; `dist/site` exists with 40,081 raw JavaScript bytes and 25,040 CSS bytes.
- `npm run test:checkout`: live checkout returned HTTP 303 to the hosted Dodo checkout.
- `npm run test:release-provenance -- v0.1.11`: downloaded and hashed both DMGs, Windows installer, AppImage, and Debian package. All five matched `SHA256SUMS` and source commit `763706ba1aab89026cf2090b2289d50142517839`.
- `npm run test:signing-status`: passed against runner-generated macOS and Windows evidence.
- GitHub Actions release run [33278835133](https://github.com/B-Divyesh/sf-worktree-agent-pulse/actions/runs/33278835133): all four platform jobs and the manifest job passed.

## Production evidence

- Deployment command: `/opt/fleet/lib/deploy-static.sh worktree-agent-pulse /work/repo/dist/site`.
- Azure deployment id: `8544f5ea-5a0a-45e7-b93a-e67261b65194`.
- Local and live `main-6iGFEiuO.js` SHA-256: `bc06804dcd6c6f153c5b67525379d10fbf9cd0751193b9e23bfd951ef1122fdb`.
- The live bundle embeds release source `763706ba1aab89026cf2090b2289d50142517839`.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 980 ms cold load, exact title, `lang=en`, one h1, main landmark, alt text, and zero console errors.
- `.factory/polish-3-evidence/live-check.json`: 14 cold-live checks passed. Both direct demo URLs preserved all real-data sentinels, sent no cross-origin request in demo, reset and exited cleanly, and reloaded offline.
- The same report confirms exact route metadata, Back/Forward focus and scroll, drawer focus return, full terminal path, legal links, the live v0.1.11 AppImage link, 44 px controls, 200% reflow, HTTP 404, and zero unexpected console errors.
- Mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100, LCP 1.726 seconds, CLS 0.017, total blocking time 0 ms.
- Screenshots: `live-landing-desktop.png`, `live-landing-mobile.png`, `live-demo-terminal.png`, and `live-privacy-200-percent.png` in `.factory/polish-3-evidence/`.

## Run locally

```bash
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run tauri dev
```

## Known gaps

No product or review gaps remain.

The published macOS and Windows installers are unsigned, as disclosed before download. The current release workflow expects no certificate secrets. Signed distribution would require an operator to add certificate-backed signing and notarization before a later release.
