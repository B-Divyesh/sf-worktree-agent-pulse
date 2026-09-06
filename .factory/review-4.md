# Review 4 — See blocked agents and worktrees needing attention

Date: 2026-09-06

Live URL: <https://worktree-agent-pulse.sociobot.in>

## Verdict

**PASS — zero findings at every severity and zero untested public claims.**

- Implementation reviewed: `48fdcb7aba7fd3b35f445c935c6d1d7ba8e12942`.
- Documentation checkout reviewed: `72c8ec78a0c806fae100449127ff0759af60153d`.
- Live build identity: `71d661fb6ac425da3b0ef678b0c05f0702835a1b`.
- Desktop release: `v0.1.14`, built from the implementation commit.
- The changes from the implementation commit through the live build and documentation checkout are reports, evidence, and copy-audit records only. They do not change product code.

## First screen

Fresh Chromium contexts were used at 1280×720 and 390×844 before scrolling.

- Job: **See blocked agents and worktrees that need attention.**
- Audience: developers running several CLI agents who need one view of worktree activity and Git state.
- First action: **Try it with sample data**. The adjacent text says it loads five worktrees and saves nothing.
- The job, audience, action, explanation, and three plain facts were visible in both initial viewports.
- The dark commit-lattice interface matches `.factory/design.md` and does not use a generic landing template.

## Demo and main paths

- One click opened a realistic five-worktree `northstar` sample. It showed blocked, behind, changed, working, idle, clean, and Git-only states in deterministic attention order.
- The persistent banner said **Demo — sample data, nothing is saved**. The board said **Sample snapshot · no Git scan ran**.
- **Reset demo** restored all five rows and the default filter. **Start for real** removed the demo namespace.
- Direct `/demo` and `/?demo=1&license=…` entries did not read, send, or alter pre-seeded real repository, license, verdict, unrelated local-storage, or session-storage sentinels.
- Demo traffic stayed same-origin. After service-worker installation, an offline reload retained all five rows and the sample label.
- Selecting the first row by keyboard moved focus to its detail heading. The preview named the exact sample path. Escape closed the detail panel and restored row focus.
- Empty license input focused the field, marked it invalid, announced the correction, and sent no request. Unverified licenses stayed locked on network failure and HTTP 429.

## Routes, accessibility, privacy, and links

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific titles, canonical URLs, one H1, and one main landmark.
- A missing route returned the deliberate HTTP 404 with `Page not found — Worktree Agent Pulse`, a product-styled page, and a return action. This expected 404 is not a defect.
- Playwright Axe found zero serious or critical issues on landing, demo, Privacy, Terms, 404, and the detail panel in desktop and mobile projects.
- Keyboard order starts with the skip link. Route changes focus the H1. Back and Forward restore route focus and the exact saved scroll position.
- All visible controls met 44×44 CSS pixels. All routes and worktree identifiers reflowed at 200% on a 390 px viewport.
- Reduced-motion emulation limited animation and transition duration to 0.01 ms. No loop or flash remained.
- `/opt/fleet/lib/verify-url.sh` passed at 919 ms with correct title, language, H1, main, alt coverage, and zero console/page errors. Its two unlabeled-button heuristic results are off-screen `content-visibility` controls with visible names when rendered; Axe and keyboard checks pass them.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and CSP `frame-ancestors 'none'`.
- `robots.txt`, `sitemap.xml`, `install.sh`, and `install.ps1` returned 200. All internal routes and the two GitHub links returned successfully. Checkout returned the expected 303.
- The site contacted no external origin during normal landing or demo use. GitHub was contacted only after the download check. License verification is limited to the Sociobot billing API. No analytics or tracking request was observed.
- The service worker was active, controlled `/demo`, used cache `worktree-agent-pulse-v6`, completed `registration.update()`, and had no waiting worker.

## Public claims

`.factory/claims.json` contains 31 claims. Every ID has exactly one matching `@claim:<id>` tag. Every exact `test` command was run from a clean detached checkout after `npm ci` and the documented Linux Tauri prerequisites were installed.

| Claim IDs | Result |
| --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, `license-uncached-network-lock`, `license-uncached-rate-limit-lock`, `mac-download-architecture`, `refund-contact` | PASS — every exact Playwright grep command passed in Chromium and mobile projects. |
| `metadata-only`, `exact-terminal-path`, `status-values` | PASS — every exact Cargo claim command passed against temporary Git, status-file, and terminal fixtures. |
| `pro-capacity-refresh`, `license-daily`, `release-available`, `platform-artifacts`, `installer-checksum`, `native-no-tracking`, `repository-delete`, `native-data-local`, `node-setup`, `release-workflow`, `blocked-notifications` | PASS — every exact Vitest command passed. |
| `release-source-provenance` | PASS — both macOS DMGs, Windows installer, AppImage, and Debian package matched `SHA256SUMS`, `latest.json`, and source commit `48fdcb7…`. |
| `checkout-live` | PASS — the exact command returned HTTP 303 to the hosted Dodo checkout. |
| `build-output` | PASS — `dist/site` was produced with 42,160 raw JavaScript bytes. |
| `unsigned-builds` | PASS — release evidence confirms the current macOS and Windows builds are unsigned, matching the pre-download disclosure. |

Landing, README, Privacy, Terms, installer, and release copy were cross-checked against the manifest. No unlisted, false, incomplete, or untested public claim remains. The current copy audit contains no sentence over 22 words and no banned word.

## Build and installed artifact

- `npm ci`: PASS — 106 packages; zero reported vulnerabilities.
- `npm audit --omit=dev`: PASS — zero vulnerabilities.
- `npm test`: PASS — 21 unit tests and 73 browser tests passed; one intentional project variant skipped.
- `npm run build`: PASS — `dist/site` produced.
- `npm run test:build-output`: PASS — 42,160 raw JavaScript bytes.
- `npm run test:build-identity`: PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 7 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings`: PASS.
- `npm run test:lighthouse`: PASS. Three cold mobile samples scored 100/100/100 for performance, accessibility, best practices, and SEO. TBT was 32/33/47 ms; LCP was 1,511/1,360/1,359 ms; CLS was 0.0168 in each sample.
- Cold mobile transfer was 92,801 bytes total: 12,585 JavaScript, 6,081 CSS, 53,576 fonts, and 18,976 hero image bytes.
- A clean consumer check downloaded `Worktree.Agent.Pulse_0.1.14_amd64.deb`, matched it to `SHA256SUMS`, confirmed package `worktree-agent-pulse` version `0.1.14` for `amd64`, resolved every runtime library, and kept the extracted installed binary open under Xvfb for ten seconds.

## Billing and backend scope

- The checkout dependency returned HTTP 303.
- Invalid-license requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`.
- This is a static site and local desktop app. It has no product backend, tenant store, server health route, shared database, or restart-persistence promise. Backend tenant-isolation, SQLite-on-`/data`, and restart tests therefore do not apply.

## Earlier findings

All earlier review and verification reports were inspected, including minor findings.

- Review 1 `F-1-1`–`F-1-8`: closed by deterministic attention ordering and tested release availability, signing, platforms, status values, 24-hour verification, and refund contact.
- Review 1 `F-1-9`–`F-1-11`: closed by legal navigation and footer on demo, explicit sample-snapshot wording, and three captioned self-hosted desktop walkthrough frames.
- Review 1 minor `F-1-12`–`F-1-19`: closed by the current terminology table, literal job headline, plain labels/captions/section headings, explained status-file term, and literal 404 heading.
- Review 2 `F-2-1`–`F-2-5`: closed by drawer focus restoration, 200% reflow, unsigned disclosure, announced license validation, and 44 px controls.
- Review 2 `F-2-6`–`F-2-12`: closed by precise local-data wording, repository-file preservation fixtures, one-to-one claim tags, status-value coverage, Node/build workflow claims, and visible terminal-preview feedback.
- Review 2 minor `F-2-13`–`F-2-16`: closed by consistent terms, plain storage wording, `DATA ACCESS` section label, and opt-in blocked-transition alerts.
- Review 3 `F-3-1`: closed. Both direct demo entries avoided all real-license reads, requests, and writes and preserved every real-data sentinel.
- Initial verification through verification 3 findings for checkout, claim coverage, first-screen placement, dead links, touch targets, macOS architecture, removal wording, sample terminal behavior, real 404 status, and mobile text size are closed by the live audit and exact claims.
- Verification 5 stale artifacts are closed by release `v0.1.14` provenance and checksums.
- Verification 6 and 7 focus, reflow, unsigned disclosure, empty-license recovery, target size, fail-open licensing, and identifier clipping findings are closed by the browser suite and live audit.
- Verification 9 history restoration is closed by exact mobile Back/Forward scroll and H1-focus checks.
- Verification 10 performance and initial focus-order findings are closed by three passing Lighthouse samples and skip-link-first keyboard order.
- Verification 11 candidate identity, intermittent performance, stale release, and build-identity findings are closed. The live build identifies documentation commit `71d661f…`; its product code equals implementation `48fdcb7…`, and release `v0.1.14` is built from that implementation.
- Verification 12 checkout and performance blockers are closed by the current 303 checkout and three passing cold Lighthouse samples.

## Product completeness

No missed-leverage finding applies. Repository discovery, opt-in status input, local blocked alerts, exact-terminal opening, offline sample data, and cross-platform installers cover the brief. Adding a model feature would not improve this read-only local monitoring job and would weaken its privacy boundary.

## Remaining dependencies

macOS and Windows artifacts are intentionally unsigned and disclosed before download. Sociobot/Dodo checkout and license verification are external dependencies and were healthy during this review. These are disclosed dependencies, not current findings.
