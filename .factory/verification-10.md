# Verification 10 — FAIL

Date: 2026-08-30  
Candidate: `ff4d7e44c11402f37fdb6cff9234de9c36277aa6`  
Live URL: <https://worktree-agent-pulse.sociobot.in>  
Demo: <https://worktree-agent-pulse.sociobot.in/demo>

## Decision

**FAIL.** The candidate is functionally strong and all declared claims pass, but it misses the factory's mandatory mobile Lighthouse performance floor: **78** versus required **>=90**. This was measured in a clean, idle Chrome run after all concurrent compilation had ended.

## Release-blocking defect

### High — mobile Lighthouse performance is below the required floor

- Evidence: Lighthouse 12.8.2, mobile emulation, live HTTPS URL, Chrome from the pinned Playwright installation.
- Scores: performance **78**, accessibility **100**, best practices **100**, SEO **100**.
- Metrics: FCP 1.2 s; LCP 1.6 s; TBT **990 ms**; interactive 2.7 s; CLS 0.
- The performance budget requires mobile Lighthouse performance >=90. The trace attributes long tasks to the landing document, CSS, and `assets/main-DIwDM50J.js`; the latter is only 35,823 bytes raw, so this needs profiling/optimization rather than relaxing the declared budget.
- Artifact: `.factory/verification-10-evidence/lighthouse-mobile.json`.

### Medium — cold-load keyboard focus bypasses the skip link and header

On both 1440x900 and 390x844, the initial route programmatically focuses the `h1`. Pressing Tab then lands directly on **Try it with sample data**, bypassing the visible skip link, wordmark, and primary navigation in forward order. The skip link has `tabindex=0` and works with programmatic focus, but is not the first forward Tab stop on a cold load. This conflicts with the keyboard/skip-link baseline; retain route-change focus management without moving initial-load focus past header navigation.

## First-read result

**Pass.** Cold live landing copy plainly says it shows blocked agents and worktrees needing attention, names developers running several CLI agents, and offers **Try it with sample data** with the explanation “Loads five worktrees. Nothing is saved.” The action and explanation fit in the initial 390x844 viewport (button 350x48 at y=580.8; explanation at y=646.8).

## Claims contract

`.factory/claims.json` exists with 31 claims. Every listed exact command was run; all claims passed. The first Rust invocation needed the documented Tauri Linux prerequisite packages (`libglib2.0-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, etc.) installed in this otherwise clean image; after that host setup, each exact Rust claim passed.

| Claims | Result | Evidence |
| --- | --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, `license-uncached-network-lock`, `license-uncached-rate-limit-lock`, `mac-download-architecture`, `refund-contact` | PASS | each exact `npm run test:e2e -- --grep @claim:<id>` command; full `npm test` also passed 67 Playwright tests (one intentional skip) |
| `metadata-only`, `exact-terminal-path`, `status-values` | PASS | each exact `cargo test --manifest-path src-tauri/Cargo.toml claim_<name> -- --nocapture` command |
| `pro-capacity-refresh`, `license-daily`, `release-available`, `platform-artifacts`, `installer-checksum`, `native-no-tracking`, `repository-delete`, `native-data-local`, `node-setup`, `release-workflow`, `blocked-notifications` | PASS | each exact `npm run test:unit -- -t @claim:<id>` command |
| `checkout-live` | PASS | `npm run test:checkout`: HTTP 303 to a Dodo HTTPS checkout |
| `release-source-provenance` | PASS | `npm run test:release-provenance -- v0.1.11`: five checksummed artifacts, source `763706ba1aab89026cf2090b2289d50142517839` |
| `build-output` | PASS | `npm run test:build-output`: `dist/site`, JS 40,679 bytes raw |
| `unsigned-builds` | PASS | `npm run test:signing-status`: runner-generated macOS/Windows signing evidence |

## Local quality gates

- `npm ci`: PASS (106 packages; 0 vulnerabilities).
- `npm test`: PASS — 21/21 Vitest and 67 Playwright tests passed; one expected skipped project variant.
- `npm run build`: PASS — TypeScript, Vite build, and service-worker preparation; output in `dist/site`.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 7/7.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- No JavaScript lint script is declared.
- Main JS is 35,823 bytes raw / 11.67 KB gzip; all site JS is 40,679 bytes raw. CSS is 25,039 bytes raw / 6.04 KB gzip.

## Live functional, privacy, and deployment checks

- Desktop and 390px mobile: demo opens in one click; it shows five realistic worktrees, attention filters, reset/start-real banner, blocked state, Git-only state, and safe sample-data text. Reset and direct `/demo` worked. Offline demo reload is covered by its passing fresh-context claim test.
- Invalid license recovery, billing-network failure, billing-429 lock, keyboard row/detail behavior, 200% reflow, 44px targets, and route history were exercised by the passing browser suite.
- Outgoing-request log: cold landing and demo used only same-origin resources. GitHub was contacted only after pressing **Check download for Linux**, and only `https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest` was requested. No console or page errors occurred.
- `verify-url.sh` passed: HTTP 200; title, `lang=en`, one h1, main landmark, image alt coverage, labeled buttons, and no console errors. Report: `.factory/verification-10-evidence/verify.json`.
- Axe on `/`, `/demo`, `/privacy`, and `/terms`: zero serious or critical findings.
- Headers: HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, CSP with `frame-ancestors 'none'`, and denied camera/microphone/geolocation. HTML caches for 30 seconds; hash-named JS caches `max-age=31536000, immutable`.
- Live/current local equality: JS, CSS, hero, and social card SHA-256 values matched exactly; main JS hash `37e6f3b1546604c3ec3970e4b2efddf52a4701de8306a4091a02fb1dbdb46355`.
- Billing verify rate limit: from one client, requests 1–31 returned 200; request 32 first returned **429** with `Retry-After: 2` (requests 33–35 remained 429 with 1-second retry values). Observed allowance: 31 requests per window. No sign-in flow exists, so Entra tenant verification is not applicable.
- Public route checks: `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, and `/sitemap.xml` returned 200; `/missing` returned the designed 404 response.

## Required next step

Profile and eliminate the mobile long tasks, then rerun idle mobile Lighthouse until performance is >=90. Also revise the initial route-focus behavior so a keyboard user reaches the skip link/header in normal forward Tab order. Do not change the claim contract or lower the performance requirement.
