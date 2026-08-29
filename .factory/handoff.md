# Worktree Agent Pulse — polish 1 handoff

Date: 2026-08-29

Work order: `worktree-agent-pulse-polish-1`

Repair commit: `2bdf7b9472a43ffa0e015476ecde9e93edfe3c39`

## What changed

- Closed all 19 findings in `.factory/review-1.md`; the finding-by-finding mapping is in `.factory/polish-1.md`.
- Rewrote the first screen and surrounding landing/README language in plain words. Public terminology now uses **changed** for uncommitted files and **needs attention** as the umbrella state.
- Added deterministic attention ordering: blocked, remote-behind, changed, then routine. The order is asserted against every sample row.
- Added a true direct `?demo=1` sandbox entry alongside `/demo`, a persistent reset/start banner, demo-only storage, legal navigation, attribution, and clear “Sample snapshot · no Git scan ran” wording.
- Added three self-hosted captures of the real product UI for first run, inspection, and terminal opening.
- Removed unprovable signing/operating-system claims, replaced vague release/refund wording with tested factual paths, and added current-release, platform-artifact, daily-license, and refund-contact claims.
- Updated title/metadata, 404 copy, docs, demo documentation, copy audit, and the verb-first catalog description.

## Verification

- Fresh committed clone: `npm ci` completed with 0 audit vulnerabilities. Every one of the 21 exact commands in `.factory/claims.json` completed, covering demo, privacy/network isolation, offline, release assets/checksums, pricing, license timing, installers, native behavior, checkout, and refund contact.
- `npm test`: passed — 12 Vitest tests and 48 Playwright checks across desktop Chromium and 390×844 mobile Chromium. This includes route-wide Axe serious/critical scans, keyboard detail use, touch-target checks, direct `?demo=1`, offline reload, and console checks.
- `npm run build`: passed; `dist/site` produced. Main JS is 31.48 KB raw / 10.36 KB gzip; CSS is 24.37 KB raw / 5.93 KB gzip.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed — 6 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `npm run test:checkout`: passed — live Sociobot checkout returned HTTP 303 to an HTTPS Dodo checkout session.

## Deployment and cold live verification

- Pushed `main` to `origin` and deployed `dist/site` with `swa deploy dist/site --env production --app-name sf-worktree-agent-pulse --resource-group sociobot --no-use-keychain`.
- Live URL: <https://worktree-agent-pulse.sociobot.in>
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 744 ms load, title/language/main/h1/alt/button checks, and no application console/page errors. Evidence: `/work/.evidence/worktree-agent-pulse-polish-1/verify.json` plus desktop/mobile screenshots.
- A cold 390px live Playwright/Axe check passed on `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and `/missing`: correct route titles, exactly one `main`, zero serious/critical Axe findings, direct demo banner/reset, Privacy/Terms links, correct sample label, correct five-row order, and HTTP 404 with “This page does not exist.” The browser reports the expected document HTTP-404 resource event for `/missing`; there are no application console or page errors.

## Run locally

```sh
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

## Known gaps

None from the cumulative review. Desktop signing is intentionally not claimed in the product copy; adding notarization or Authenticode later requires the operator certificates.
