# Verification 12 — FAIL

Verified on 2026-08-30 from clean checkout `ad42962c171af8abff1878ac6ce19be94d8bc570`.

- Product URL: <https://worktree-agent-pulse.sociobot.in>
- Demo URL: <https://worktree-agent-pulse.sociobot.in/demo>
- Verdict: **FAIL — do not release.**

## Release blockers

1. **P0 — paid checkout is unavailable.** The required `checkout-live` claim fails. `npm run test:checkout` returned `HTTP 500` rather than the required HTTPS Dodo `303` redirect. A fresh direct probe of `https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout` repeated the same JSON `{"error":"Internal server error","status":500}` result on all three attempts at 04:34:18Z, 04:34:21Z, and 04:34:24Z. The on-site Buy Pulse Pro action targets this endpoint, so a user cannot buy the advertised $19 product.
2. **P0 — the repository performance gate fails.** `npm run test:lighthouse .factory/verification-12-evidence/lighthouse-mobile.json` failed its first cold mobile sample: total blocking time **222.7328 ms**, above the hard `<200 ms` gate. The same sample recorded performance 95, accessibility 100, best practices 100, SEO 100, LCP 2195.5344 ms, and CLS 0.016827566696445733. The script stops at the first failed sample, so it did not establish the required three passing cold samples.

The checkout failure alone makes the release fail under the claims contract: every listed claim must pass from a clean clone.

## First-read result

**Pass.** On a fresh 1440×900 browser load, the first screen says: “See blocked agents and worktrees that need attention.” It says it is “For developers running several CLI agents who need one view of worktree activity and Git state.” The first obvious action is **Try it with sample data**, with “Loads five worktrees. Nothing is saved.” adjacent to it. The three visible facts are ignored prompt/output fields, no account, and five worktrees free / Pro $19 once.

## Claims

All manifest commands were launched exactly from `.factory/claims.json` after `npm ci`. The full 72-test browser suite, full 21-test unit suite, complete Rust suite, and the special release scripts below independently cover the listed claim assertions. `checkout-live` is the sole failing claim.

| Claim IDs | Result | Fresh evidence |
| --- | --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, `license-uncached-network-lock`, `license-uncached-rate-limit-lock`, `mac-download-architecture`, `refund-contact` | PASS | Exact Playwright claim commands; full `npm run test:e2e`: 71 passed, 1 skipped (desktop + 390px projects). |
| `metadata-only`, `exact-terminal-path`, `status-values` | PASS | Exact Cargo claim commands; full `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed. |
| `pro-capacity-refresh`, `license-daily`, `release-available`, `platform-artifacts`, `installer-checksum`, `native-no-tracking`, `repository-delete`, `native-data-local`, `node-setup`, `release-workflow`, `blocked-notifications` | PASS | Exact Vitest claim commands; full `npm run test:unit`: 21 passed. |
| `build-output` | PASS | `npm run test:build-output`: deployable `dist/site`, total JavaScript 40,701 bytes. |
| `release-source-provenance` | PASS | `npm run test:release-provenance -- v0.1.13`: source `558dbe87daed69bab7f064b46bdfc0ccc45b3e91`, five checksummed artifacts. |
| `unsigned-builds` | PASS | `npm run test:signing-status`: runner-generated macOS and Windows unsigned-build evidence for v0.1.13. |
| `checkout-live` | **FAIL** | `npm run test:checkout`: HTTP 500; three direct retries also HTTP 500. |

## Functional, privacy, and accessibility QA

- One-click `/demo` loaded the five bundled `northstar` worktrees and correctly placed blocked, behind, and dirty worktrees before routine work.
- The demo banner was persistent; Reset restored the sample; Start for real discarded only the demo session record. Pre-seeded real repository, license, verdict, and session sentinels were unchanged.
- The demo made only same-origin requests, including at 390px. It reloaded with five rows after service-worker installation and browser offline mode.
- Desktop keyboard flow passed: row focus, Enter opens details, focus moves to the drawer heading, the terminal preview reports the exact selected path, Escape closes the drawer and returns focus to the row. The visible focus outline was `rgb(124, 247, 196) solid 3px`.
- Browser route history, route-heading focus, 390px mobile first screen, 44px targets, and 200% text reflow passed. The standalone live audit verified all public routes and the real 404.
- Playwright Axe found **zero serious or critical** findings on `/`, `/demo`, `/privacy`, `/terms`, 404, and the detail drawer in desktop and 390px contexts. Full browser tests also passed these checks.
- `verify-url.sh` passed: HTTP 200, title, `lang=en`, exactly one H1, main landmark, image alt coverage, zero console/page errors. Its simple text-only button heuristic reported two off-screen content-visibility buttons but both have visible textual accessible names; Axe and keyboard tests pass.

Evidence: `.factory/verification-12-evidence/live-audit/live-check.json`, `.factory/verification-12-evidence/verify-url/verify.json`, and screenshots in those directories.

## Deployment, network, headers, and budgets

- Live `#app[data-build-source]` was exactly `ad42962c171af8abff1878ac6ce19be94d8bc570`; the live deployment matches the candidate. The candidate changes only factory evidence/docs relative to the release source, but the deployed build identity is this candidate.
- Landing, demo, Privacy, Terms, robots, and sitemap returned 200. A missing path returned a real HTTP 404. Browser console/page errors were zero during normal use.
- Response headers included HSTS, `X-Content-Type-Options: nosniff`, strict referrer policy, denied camera/microphone/geolocation, and CSP with `frame-ancestors 'none'`; the CSP allowlists only self plus the documented GitHub Releases API and Sociobot billing API.
- The hashed JavaScript asset was 35,845 bytes raw (11.70 KB gzip), CSS was 25.14 KB raw (6.04 KB gzip), and the asset response had `Cache-Control: public, max-age=31536000, immutable`. The HTML response was `max-age=30` / must-revalidate.
- The public page made no cross-origin request until the user asked for a download; then it used the GitHub Releases API. Demo use made no cross-origin request. License verification is sent only to `api.sociobot.in`.
- Billing verification rate limiting works: requests 1–30 from one client returned 200/invalid; request 31 returned **429** with `Retry-After: 4`. Observed allowance: 30 successful requests per window. There is no sign-in, so Entra tenant validation is not applicable.

## Local build and packaging

- `npm ci`: pass, 106 packages, 0 reported vulnerabilities.
- `npm run test:unit`: 21 passed.
- `npm run test:e2e`: 71 passed, 1 skipped, 2.0 minutes.
- `npm run build`: pass. `npm run test:build-identity`: pass, fixture embeds immutable 40-character commit.
- `cargo test`, `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`: pass after installing the standard Linux Tauri development prerequisites. On the unprepared disposable container, Cargo first failed because `glib-2.0.pc` was missing; this is a host dependency, not a source failure, and the README directs developers to Tauri prerequisites.
- `CI=true VITE_BUILD_SOURCE_COMMIT=ad42962c171af8abff1878ac6ce19be94d8bc570 npm run tauri -- build --bundles deb`: pass. Produced `src-tauri/target/release/bundle/deb/Worktree Agent Pulse_0.1.13_amd64.deb` (2,476,520 bytes), package `worktree-agent-pulse`, version `0.1.13`, architecture `amd64`, SHA-256 `4d64c14569df393bebea2cfd46fd0470979447831d22e5d250158c5aa6a51415`.

## Required next steps

1. Restore the live Sociobot checkout for `worktree-agent-pulse` and prove the endpoint returns a 303 to an HTTPS `checkout.dodopayments.com` session.
2. Reduce or stabilize the cold-mobile total blocking time so all three required Lighthouse samples are below 200 ms, then rerun the exact performance command.
3. Rerun this verification after both release blockers are corrected.
