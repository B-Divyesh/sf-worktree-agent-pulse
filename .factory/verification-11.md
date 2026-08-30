# Verification 11 — FAIL

Date: 2026-08-30

Requested candidate: `d174d2ed7539161d1aa2cba8860e5fcdf15b7301`

Tested checkout: `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`

Live URL: <https://worktree-agent-pulse.sociobot.in>

Demo: <https://worktree-agent-pulse.sociobot.in/demo>

## Decision

**FAIL.** The one-click product flow, all 31 declared claims, the complete automated suites, privacy boundaries, accessibility checks, offline demo, release checksums, and production build all work. Release approval is still blocked by three independent findings:

1. The requested candidate SHA does not exist in the supplied clone or GitHub repository. The work-order base, clean checkout, `origin/main`, and GitHub all resolve to `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`, which is the revision tested here.
2. The mandatory Lighthouse command is not reliably green. Both exact `npm run test:lighthouse` runs failed the `<200 ms` total-blocking-time gate, at 274 ms and 227 ms. A live run also failed at 211 ms. Later idle samples passed at 51 ms local and 160 ms live, proving instability rather than a consistently passing release gate.
3. The desktop downloads offered by the candidate site were built from `763706ba1aab89026cf2090b2289d50142517839`, not the tested candidate. The current site source differs from that release source in `src/main.ts`, `src/styles.css`, tests, and build verification. The web site is current, but the installable product is not a candidate build.

## Findings by severity

### Release blocker — requested candidate cannot be resolved

- `git cat-file` cannot resolve `d174d2ed7539161d1aa2cba8860e5fcdf15b7301`.
- GitHub's commit API returns HTTP 422 for that SHA.
- The supplied checkout and `origin/main` are both `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e` (`docs: record repair 9 production evidence`).
- This report uses the work-order base/remote-main SHA so useful QA could continue, but the exact requested revision cannot be approved.

### High — the required mobile Lighthouse gate fails intermittently

The repository documents `npm run test:lighthouse` as a release gate. It enforces performance >=90, accessibility >=95, best practices/SEO >=90, TBT <200 ms, LCP <2.5 s, and CLS <0.1.

| Target/run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Local exact command, run 1 | 92 | 100 | 100 | 100 | 2,213 ms | **274 ms** | 0.0168 | FAIL |
| Local exact command, run 2 | 94 | 100 | 100 | 100 | 2,238 ms | **227 ms** | 0 | FAIL |
| Live, run 1 | 96 | 100 | 100 | 100 | 1,531 ms | **211 ms** | 0.0168 | FAIL |
| Local idle follow-up | 98 | 100 | 100 | 100 | 2,223 ms | 51 ms | 0 | PASS |
| Live idle follow-up | 98 | 100 | 100 | 100 | 1,503 ms | 160 ms | 0 | PASS |

Both invocations of the exact documented command exited 1. This violates the definition of done even though later isolated samples passed. The failing local traces found five long tasks; the largest were 239 ms in the main bundle and 143/138/127 ms in document or unattributed work. The first live trace found 315 ms and 276 ms document tasks.

### High — downloadable desktop builds are not from the candidate

- The live Linux download resolves to release `v0.1.11`.
- GitHub release target and `latest.json.source_commit` are both `763706ba1aab89026cf2090b2289d50142517839`.
- Candidate/work-order checkout is `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`.
- The intervening candidate changes include route/focus behavior and containment in the shared WebView source and CSS.
- The published AppImage was independently downloaded. Its SHA-256 is `d7d41249ed896ec09d542b16133198d7a3bfab5c7c641f9b94675d46dc0200cc`, exactly matching `SHA256SUMS`, and it stayed running for a 10-second Xvfb smoke test. Integrity is good; candidate provenance is not.

### Medium — production does not expose an immutable web build identity

The live `#app` reports `data-build-source="local-development"`. Static assets are byte-identical to the local build, but the deployed page cannot identify the commit that produced it. This weakens deployment traceability and made byte comparison necessary.

## Mandatory first-read test

**PASS** at 1440×900 and 390×844, cold browser contexts.

- What it does: “See blocked agents and worktrees that need attention.”
- For whom: “For developers running several CLI agents who need one view of worktree activity and Git state.”
- First click: **Try it with sample data**.
- Adjacent explanation: “Loads five worktrees. Nothing is saved.”
- One click opens `/demo`, already populated with five realistic worktrees and the persistent “Demo — sample data, nothing is saved” banner.

Screenshots: `evidence-11/first-read-desktop.png` and `evidence-11/first-read-mobile.png`.

## Claims gate

`.factory/claims.json` exists and contains 31 uniquely tagged claims.

The required before-install invocation was performed first. In the untouched dependency state, 28 commands could not start because `@playwright/test`, Vitest, TypeScript, or Linux Tauri libraries were absent; the three network-only checks passed. Those were environment/setup failures, not failed assertions. After the documented `npm ci` and documented Tauri host prerequisites, every exact command in `claims.json` passed.

| Claim group | Result | Evidence |
| --- | --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, both unverified-license failure claims, `mac-download-architecture`, `refund-contact` | PASS | Each exact Playwright grep command passed in desktop and mobile projects. |
| `metadata-only`, `exact-terminal-path`, `status-values` | PASS | Each exact Rust claim test passed against temporary real Git/status fixtures. |
| `pro-capacity-refresh`, `license-daily`, `release-available`, `platform-artifacts`, `installer-checksum`, `native-no-tracking`, `repository-delete`, `native-data-local`, `node-setup`, `release-workflow`, `blocked-notifications` | PASS | Each exact targeted Vitest command passed. |
| `release-source-provenance`, `checkout-live`, `build-output`, `unsigned-builds` | PASS | Five release artifacts/checksums verified; checkout returned 303 to Dodo; site output was 40,678 bytes JS; signing evidence passed. |

Landing, README, Privacy, and Terms copy were cross-checked against the manifest. No material unlisted product claim was found.

## Clean local gates

- `npm ci`: PASS — 106 packages installed; 0 vulnerabilities.
- `npm test`: PASS — 21/21 Vitest tests and 69/69 runnable Playwright tests; one expected project-specific skip.
- `npm run build`: PASS — TypeScript and Vite production build; `dist/site` created.
- `npm run test:build-output`: PASS — 40,678 bytes total raw JavaScript.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 7/7.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `npm run test:lighthouse`: **FAIL twice**, as detailed above.
- No JavaScript lint script exists; strict TypeScript checking runs in the build.

## Independent functional coverage

- Normal case: the demo loaded five worktrees in the complete attention order `checkout-retry`, `invoice-export`, `northstar`, `search-index`, `auth-cleanup`.
- Boundary case: **Needs attention** returned four rows; the free/pro fixture returned five of eight versus all eight and confirmed the 10,000 ms Pro refresh interval.
- Keyboard: the first Tab exposes **Skip to content**, the second reaches the wordmark; Enter opens a worktree drawer, its heading receives focus, Escape closes it and returns focus to the row. The visible ring is 3 px mint (`#7cf7c4`).
- Detail action: sample mode reports the exact `/Users/mira/Code/northstar-checkout-retry` path without opening a terminal.
- Invalid input: submitting an empty license marks the field invalid, returns focus, announces what to enter, and sends no request.
- Recovery: demo reset restores five rows; **Start for real** removes only demo session data. Billing network and HTTP 429 failures remain locked.
- Native boundaries: temporary repositories covered linked worktree discovery, dirty/ahead/behind values, detached HEAD, missing paths, unsupported/missing agent states, no Git mutations, repository removal, and exact terminal working directory.
- AppImage smoke: the checksummed release stayed alive for 10 seconds under Xvfb. DRI/session-bus warnings were expected from the headless container.

## Accessibility and responsive behavior

- Fresh Axe scans on `/`, `/demo`, `/privacy`, `/terms`, and the 404 route at desktop and 390 px found **0 serious/critical violations** across 10 route/viewport combinations.
- Every route has `lang=en`, one H1, one main landmark, route-specific title/canonical/description, image alt text, and labeled controls.
- Mobile minimum interactive target measured exactly 44 px; no route had horizontal overflow.
- 200% text reflow passed, including long worktree names and drawer values.
- Reduced-motion contexts had no running animations after route load; the CSS reduces animation and transition duration to 0.01 ms.
- Normal `/`, `/demo`, `/privacy`, and `/terms` loads produced no console or page errors. The browser logged only the expected resource-404 message while intentionally visiting the real 404 route.
- `verify-url.sh` passed: HTTP 200, 865 ms load, correct title/language/H1/main/alt labels, and zero errors.

## Privacy, networking, headers, and rate limiting

- Cold landing, demo, Privacy, and Terms traffic was same-origin only. Demo exercise, reset, offline reload, and exit did not contact GitHub, billing, analytics, or another origin.
- After **Check download for Linux**, the only cross-origin request was `https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest`.
- Demo uses only `demo:worktree-agent-pulse:repository` in session storage and leaves seeded real repository/license/verdict bytes unchanged.
- License tests send tokens only to the Sociobot verification endpoint. No Azure/model endpoint or tracking endpoint is present.
- Fresh rate-limit probe: requests 1–30 returned 200/invalid; request 31 returned **429** with `Retry-After: 4`. Observed allowance: 30 successful requests per window from one client.
- Live policy: HSTS with includeSubDomains/preload, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and CSP with `frame-ancestors 'none'`.
- HTML and `sw.js`: `max-age=30, must-revalidate`. Hashed JS/CSS/font/image assets: `max-age=31536000, immutable`.
- The app has no sign-in flow, so Microsoft Entra tenant validation is not applicable.

## Offline and service worker

The live `/demo` registered `sw.js`; `registration.update()` completed with no waiting worker. Cache `worktree-agent-pulse-v4` existed. A fresh context was then taken offline and `/demo` reloaded with HTTP 200 from the worker and all five rows present.

## Bundle and deployment identity

- Total raw JavaScript: 40,678 bytes (budget 200 KB).
- CSS: 25,159 bytes raw / 6.06 KB gzip (budget 50 KB).
- Fonts actually requested on cold mobile load: 52,616 bytes (budget 120 KB).
- Hero image: 63,848 bytes (budget 300 KB).
- All 48 publicly served production files compared were byte-identical to the local `dist/site` output. `staticwebapp.config.json` is deployment configuration and correctly is not public.
- Main JS SHA-256: `de67b25794ae910c5ddfd1dce8aec64e6a1849f07dd3c5c4ecfc826773bf1e61`.
- Main CSS SHA-256: `53da52092c3e4017e53155592af8f503e22b02225ac815eb26d64cf82a2afffc`.

## Required next steps

1. Supply or correct the exact candidate SHA.
2. Make the exact `npm run test:lighthouse` gate consistently meet TBT <200 ms, then show repeated clean local and live passes.
3. Tag and publish desktop artifacts built from the approved candidate; update `latest.json.source_commit` accordingly.
4. Inject the immutable commit into the deployed web build instead of `local-development`.

Evidence is under `.factory/evidence-11/`.
