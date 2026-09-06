# Verification 13 — PASS

Date: 2026-09-06

## Verdict

**PASS.** There are **0 findings** at every severity and **0 untested public claims**.

- Candidate implementation reviewed: `48fdcb7aba7fd3b35f445c935c6d1d7ba8e12942` (`perf: defer offscreen landing work`).
- Documentation checkout reviewed: `71d661fb6ac425da3b0ef678b0c05f0702835a1b` (`docs: correct evidence commit identity`).
- The diff between those commits is documentation and evidence only; it does not change product code. The live main bundle contains the full candidate implementation SHA.
- Live URL: <https://worktree-agent-pulse.sociobot.in>
- Desktop release: `v0.1.14`.

## First read and product path

Fresh Chromium desktop and iPhone 13 contexts both loaded the live landing page with no console or page errors.

- Job: **See blocked agents and worktrees that need attention.**
- Audience: developers running several CLI agents who need one view of worktree activity and Git state.
- First action: **Try it with sample data**; the page states that it loads five worktrees and saves nothing.

This information and the primary action were visible before scrolling at 1280×720 and 390×664. The visual system is the documented dark commit-lattice system, not a generic landing template.

## Demo, privacy, accessibility, and routes

- A fresh direct `/demo?license=…` visit stripped the query token, loaded five realistic worktrees, showed `Sample snapshot · no Git scan ran`, and retained the persistent **Demo — sample data, nothing is saved** banner.
- Reset restored the sample. **Start for real** removed the demo namespace and preserved pre-seeded real repository, license, and verdict sentinels byte-for-byte.
- Before leaving demo, every observed request was same-origin. The demo reloaded with networking disabled and retained all five rows and its sample label.
- Keyboard testing opened the selected detail panel, moved focus to its heading, and returned focus to the selected row on Escape. Reduced-motion emulation reported reduced transitions and animations. The full suite also passed 200% reflow, 44 px target, route history, skip-link, and focus-restoration tests.
- Axe integration in the passing browser suite found zero serious or critical findings on landing, demo, Privacy, Terms, 404, and detail states in desktop and mobile projects.
- `/`, `/demo`, `/privacy`, `/terms`, installers, `robots.txt`, and `sitemap.xml` returned 200. The designed unknown route returned the expected HTTP 404 with `Page not found — Worktree Agent Pulse`; this is expected behavior, not a defect. Route titles, canonical URLs, one H1, and one main landmark were correct.
- `/opt/fleet/lib/verify-url.sh` passed against live production: 200, no console/page errors, title, `lang=en`, one H1, main, and no images missing `alt`.
- Live response headers include CSP with `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and denied camera/microphone/geolocation. Landing internal links and both external GitHub links returned successfully.

## Claims

All 31 declared claims have exactly one `@claim:` tag. The exact commands in `.factory/claims.json` were executed from a new clone of documentation HEAD after `npm ci` on Node 22.23.2. The initial native invocations correctly stopped before assertions because this disposable image lacked the documented Tauri Linux prerequisites; after installing those prerequisites, the same unchanged commands passed. This is a host setup condition, not an untested or false claim.

| Claims | Result and evidence |
| --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, `license-uncached-network-lock`, `license-uncached-rate-limit-lock`, `mac-download-architecture`, `refund-contact` | PASS — each exact Playwright grep command passed in Chromium and mobile projects. |
| `metadata-only`, `exact-terminal-path`, `status-values` | PASS — each exact Cargo claim command passed after documented Linux Tauri prerequisites were installed. |
| `pro-capacity-refresh`, `license-daily`, `release-available`, `platform-artifacts`, `installer-checksum`, `native-no-tracking`, `repository-delete`, `native-data-local`, `node-setup`, `release-workflow`, `blocked-notifications` | PASS — each exact Vitest command passed. |
| `release-source-provenance` | PASS — `npm run test:release-provenance -- v0.1.14` verified five advertised assets, their checksums, `latest.json`, and source provenance. |
| `checkout-live` | PASS — the exact command passed; four independent checkout probes each returned HTTP 303. |
| `build-output` | PASS — `npm run test:build-output` produced `dist/site` with 42,160 bytes of JavaScript. |
| `unsigned-builds` | PASS — `npm run test:signing-status` confirmed the current macOS and Windows builds are unsigned and the product discloses that before download. |

There are no unlisted public claims in the current landing copy, README, Privacy, or Terms. The current copy audit records no sentence over 22 words and no banned wording.

## Quality and artifact checks

- `npm ci`: PASS — 106 packages, 0 reported vulnerabilities. `npm audit --omit=dev`: PASS.
- `npm test`: PASS — 21 Vitest tests and 74 Playwright tests.
- `npm run build`, `npm run test:build-output`, and `npm run test:build-identity`: PASS. Build output is `dist/site`; first-load JavaScript is within the static budget.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 7 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings`: PASS.
- `npm run test:lighthouse`: PASS. Three cold mobile samples scored 98/100/100 and 100/100/100 twice (performance/accessibility/best-practices/SEO); total blocking time was 172.18 ms, 37 ms, and 83 ms, all below 200 ms.
- A clean consumer artifact check downloaded `Worktree.Agent.Pulse_0.1.14_amd64.deb`, verified it against `SHA256SUMS`, confirmed package `worktree-agent-pulse` version `0.1.14` for `amd64`, found no unresolved runtime libraries, and kept the extracted installed app open under Xvfb for ten seconds.

## Live billing allowance

The public checkout dependency is currently healthy. Four checkout requests returned HTTP 303. Invalid-license verification returned 200 for requests 1–30; request 31 returned HTTP 429 with `Retry-After: 2`. This static/local-first product has no product backend tenant or database, so tenant-isolation and restart-persistence checks do not apply.

## Earlier finding disposition

All earlier review and verification reports, including their minor findings, were inspected.

- Review 1 `F-1-1` through `F-1-19`: closed. Current claim coverage, true attention ordering, demo legal navigation and sample wording, self-hosted walkthrough, plain terminology/copy audit, and the literal 404 page were rechecked.
- Review 2 `F-2-1` through `F-2-16`: closed. Current keyboard/drawer focus, 200% reflow, 44 px targets, unsigned disclosure, invalid-license recovery, local-data wording, removal boundary, claim tags, status states, Node/build workflow, sample terminal feedback, terminology, and blocked-transition notification checks passed.
- Review 3 `F-3-1`: closed. Direct demo entry did not read, send, or alter real data and did not use the returned query license.
- Earlier verification blockers for checkout availability, claims completeness, first-screen action, dead link, mobile targets, macOS architecture, deletion wording, 404 status, stale artifacts, license fail-open, identifier reflow, history restoration, performance, cold focus order, candidate identity, and release provenance are closed by the checks above.
- Verification 12’s two blockers are specifically closed: checkout returned four consecutive 303 responses and the exact Lighthouse command produced three passing cold samples.

## Remaining external dependencies

macOS and Windows artifacts are intentionally unsigned and disclosed as such. Sociobot/Dodo checkout and license verification remain external service dependencies; they were healthy during this verification. These are documented dependencies, not current findings.
