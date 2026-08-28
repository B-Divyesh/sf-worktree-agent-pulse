# Independent verification 2 — FAIL

- Candidate commit: `2af0594e7a24ad7da9bf95a24a2dc1c4600688c0`
- Product source release: `v0.1.4` / `73c4c70224c4c1eb7c3e4eacaafa433593749783` (the candidate changes only handoff documentation)
- Live URL: `https://worktree-agent-pulse.sociobot.in`
- Verified: 2026-08-28, from this clean checkout
- Verdict: **FAIL — one release-blocking mobile accessibility defect.**

## First read

Cold live landing page: Worktree Agent Pulse is a local board for developers running several CLI agents; it surfaces worktree activity and Git risk, especially blocked agents and branch drift. The first action is **Try it with sample data**; its adjacent explanation says it loads five worktrees and saves nothing. This is clear, present above the fold at 1440×900, 1280×800, and 390×844, and the one-click `/demo` board works.

## Release-blocking defect

### High — visible mobile links miss the required 44×44 CSS-pixel touch target

Fresh Playwright measurement at 390×844 on the live deployment found these visible, operable links below the contractual 44px minimum height:

| Control | Measured size |
| --- | --- |
| Header: Demo | 38×21.8px |
| Header: Privacy | 50×21.8px |
| Header wordmark/home | 110.9×32px |
| `Read the privacy details` | 219×22px |
| Footer Privacy | 50×21.8px |
| Footer Terms | 39×21.8px |

The primary sample-data control is correctly 350×48px and the page has no horizontal overflow, but the acceptance contract requires *every* touch target to be at least 44px. This blocks release until the link hit areas are enlarged and covered by a mobile regression test.

## Claims — PASS

`.factory/claims.json` exists and declares 12 claims. I ran every listed command from the clean checkout, using the shipped demo route where applicable. All passed.

| Claim | Exact command | Fresh evidence |
| --- | --- | --- |
| sample-five | `npm run test:e2e -- --grep @claim:sample-five` | 2 passed (desktop + 390px) |
| attention | `npm run test:e2e -- --grep @claim:attention` | 2 passed |
| first-screen-demo | `npm run test:e2e -- --grep @claim:first-screen-demo` | passed at 1440×900, 1280×800, 390×844 |
| demo-private | `npm run test:e2e -- --grep @claim:demo-private` | 2 passed; same-origin/demo-session assertion |
| offline-demo | `npm run test:e2e -- --grep @claim:offline-demo` | 2 passed; cached sample reload |
| metadata-only | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only -- --nocapture` | 1 passed; canaries excluded and Git/file state preserved |
| free-price | `npm run test:e2e -- --grep @claim:free-price` | 2 passed |
| no-account | `npm run test:e2e -- --grep @claim:no-account` | 2 passed |
| pro-capacity-refresh | `npm run test:unit -- -t @claim:pro-capacity-refresh` | 1 passed; 5/free, 8/Pro, 10,000ms scheduler |
| site-network | `npm run test:e2e -- --grep @claim:site-network` | 2 passed |
| license-local | `npm run test:e2e -- --grep @claim:license-local` | 2 passed |
| checkout-live | `npm run test:checkout` | HTTP 303 to HTTPS `checkout.dodopayments.com` session |

`npm test` subsequently passed all 4 unit tests and all 36 Playwright tests.

## Build, desktop, deployment, and policy evidence

- `npm ci`: passed; 0 npm vulnerabilities reported.
- `npm run build`: passed; static output in `dist/site`. Main JS is 28,053 bytes raw / 9.56KB gzip; CSS is 23,230 bytes raw / 5.73KB gzip; hero is 63,848 bytes.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`, and full `cargo test --manifest-path src-tauri/Cargo.toml`: passed (4 Rust tests). The base image initially lacked Linux Tauri development libraries; after installing the exact Ubuntu prerequisites declared in the release workflow, no repository files changed.
- Exact production desktop build: `npm run tauri build -- --bundles deb` completed. It produced `src-tauri/target/release/bundle/deb/Worktree Agent Pulse_0.1.4_amd64.deb` (1,953,532 bytes). The release binary had no missing shared-library report and stayed alive under `xvfb-run` for the full eight-second smoke window (timeout exit 124).
- Live app routes `/`, `/demo`, `/privacy`, `/terms`, and `/missing`: HTTP 200, route-specific titles, exactly one `main` and one `h1`, no console/page errors, and zero axe serious/critical findings.
- Keyboard smoke: skip link, demo entry, worktree selection/Enter, row Arrow navigation, Escape detail close, license dialog focus trap/Escape, and invalid-license recovery were exercised by the included tests and manual live flow.
- Reduced-motion live context uses 0.01ms transition/animation durations; the focused CTA has a visible 3px `#7cf7c4` outline.
- `/demo` has the persistent sample-data banner, reset/start-for-real controls, five realistic rows, separate `demo:worktree-agent-pulse:*` session storage, and reloads offline after first visit.
- Fresh live header checks found HTTPS/HSTS, `nosniff`, strict referrer policy, denied camera/microphone/geolocation, and a CSP limiting connections to the documented GitHub and Sociobot APIs. Landing made no cross-origin requests until the visitor requests a download.
- Fresh 45-request sequential burst to `https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=qa-rate-limit-fixture`: 30 returned 200; request 31 first returned 429 with `Retry-After: 4`; 15 total returned 429. No sign-in flow exists.
- Deployment identity: SHA-256 of fresh `dist/site/assets/index-DMPVuVh2.js` and live `/assets/index-DMPVuVh2.js` both equal `223bda5a4f1694dff5e791c5b79eed15dbdf182dec8406c851e887738ec273a7`.
- GitHub Release v0.1.4 targets source `73c4c70` and contains macOS arm64/x64 DMGs, Windows NSIS EXE, Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. A freshly downloaded DEB has checksum `29d2dc70055a2e19c715b39180e658c70d2fbfef74f33d53da902a2dfacfbf0d`, matching `SHA256SUMS`, and declares `worktree-agent-pulse 0.1.4 amd64`.

## Required remediation

Increase the hit area of all interactive links on mobile to at least 44×44 CSS pixels (not merely their visible text), then add an automated 390px target-size assertion. Re-run independent QA after deployment.
