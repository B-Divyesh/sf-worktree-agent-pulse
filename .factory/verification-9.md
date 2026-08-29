# Independent verification 9 — Worktree Agent Pulse

Date: 2026-08-29
Candidate commit: `18f0fe17507e738eab1a617cbba09b7298a14f82`
Production URL: <https://worktree-agent-pulse.sociobot.in>
Verdict: **FAIL — release-blocking test failure**

## Executive result

The deployed static bundle matches a fresh production build from the candidate checkout, the one-click demo works, all declared claims pass once standard Tauri Linux build prerequisites are installed, and the live privacy/accessibility smoke tests passed. The candidate cannot be accepted because its required complete browser suite does not pass: the mobile route-history test fails repeatedly.

## First read (cold production browser)

Opened `/` in a fresh 1440×900 browser context with no stored state. The first screen says: “See blocked agents and worktrees that need attention.” It says it is for developers running several CLI agents and gives the exact first action: **“Try it with sample data”**, followed by “Loads five worktrees. Nothing is saved.” The three facts cover ignored prompt/output fields, no account, and free/$19 pricing. This satisfies the plain-words and one-click-demo gate. Clicking it opens the five-worktree sample board.

## Claims contract

`.factory/claims.json` exists and declares 31 claims. Every exact command in it was run from this clean checkout after `npm ci`.

- 28 commands passed on the initial sweep.
- The three Rust claim commands initially could not compile because this clean Ubuntu image lacked the documented Tauri Linux desktop prerequisites (`glib-2.0` development files). This was a host dependency error, not a test assertion failure. After installing `libglib2.0-dev`, `libgtk-3-dev`, and `libwebkit2gtk-4.1-dev`, each exact command passed:
  - `claim_metadata_only_ignores_content_and_preserves_git_state`
  - `claim_exact_terminal_path_starts_the_configured_terminal_in_the_selected_worktree`
  - `claim_status_values_accepts_only_the_documented_states`
- The claim sweep also passed the live checkout redirect, published release checksum/provenance, platform artifact, signing-status, installer checksum, demo isolation/offline/privacy, and license-limit commands.

## Local build and test evidence

- `npm ci`: passed; 0 npm vulnerabilities reported.
- `npm run build`: passed. `dist/site` was produced with 40,081 bytes total JavaScript (11,470 bytes gzip for the main bundle) and 25,040 bytes CSS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed, 7 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `npm test`: **failed**. The 21 Vitest unit tests passed; the Playwright run has one failing test, detailed below. This violates the repository quality gate.

### P1 — mobile browser-history scroll restoration is broken and `npm test` fails

`tests/e2e/accessibility.spec.ts:46`, “routes set exact metadata and browser history restores route focus,” fails in the `mobile` project at line 75. The test scrolls the landing route below 500px, opens Privacy, then uses browser Back. The route and focus return correctly, but the old landing scroll position does not: the trace observed `scrollY` values `202`, `48`, then `0` until the 5-second timeout, where the test requires `>500`.

Fresh evidence:

- Full `npm test` left `test-results/.last-run.json` with `status: "failed"` and only this failed Playwright test.
- Failure trace: `test-results/accessibility-routes-set-e-c81e8-istory-restores-route-focus-mobile/trace.zip` (generated locally during this verification).
- A focused reproduction, `npx playwright test tests/e2e/accessibility.spec.ts --grep 'routes set exact metadata' --repeat-each=3`, failed again in the mobile project (`test-results/...mobile-repeat1`).

This is P1 because it breaks documented route-history behavior on the required 390px mobile path and leaves the mandatory full test command non-green. The likely mechanism is that the target header Privacy link is scrolled into view before navigation, so the saved history scroll state becomes the top of the page; regardless, the observable contract and test currently fail.

## Live production evidence

- Fresh candidate build emits `assets/main-DqBptOL-.js`. Its SHA-256 is `f1c1793622e76e29cf998aa7f1c3a2800ad6799e3a7d3da309616d3825668a98`; downloading that exact production asset produced the identical SHA-256. Production therefore matches the candidate’s product bundle.
- Production `/` returned HTTP 200 with `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. HTML has `max-age=30`; the hashed JavaScript has `max-age=31536000, immutable`.
- Fresh desktop and 390×844 mobile visits to `/demo` had one `<h1>`, the persistent demo banner and Reset Demo control, no console/page errors, no Axe serious/critical findings, and only same-origin browser requests during the demo flow.
- Keyboard-only demo use reached controls with a visible `rgb(124, 247, 196) solid 3px` focus outline; Enter opened `checkout-retry` and Escape closed it.
- With `prefers-reduced-motion: reduce`, no looping animation remained. A fresh live demo context reloaded offline after service-worker readiness and still rendered all five worktree rows and its demo banner.
- No product-owned server-side endpoint is present: the deployed product is static. Its only optional product-unlock interaction is the external Sociobot billing API, whose client-side 24-hour verification behavior is covered by the passing `license-daily` claim. There is no documented product API request allowance to probe; a product 429/`Retry-After` result is therefore not applicable.

## Required repair and re-verification

Repair the mobile history scroll restoration (and/or navigation state capture) so Back restores the pre-navigation landing position after a mobile Privacy navigation. Then run `npm test` until it passes, including the repeated mobile route-history test, and submit a new candidate. No product code was modified during this verification.
