# Worktree Agent Pulse — repair 11 handoff

Date: 2026-09-06

Live site: <https://worktree-agent-pulse.sociobot.in>

Live demo: <https://worktree-agent-pulse.sociobot.in/demo>

## Release decision

**Ready for verification.** Both verification-12 blockers now pass. The exact checkout claim and three follow-up probes each returned HTTP 303 to a redacted Dodo checkout session. Three cold local and three cold live mobile Lighthouse samples each stayed below 200 ms total blocking time.

The checkout recovery happened in the external Sociobot billing service. No mock checkout, provider credential, or local entitlement bypass was added. The free product remains usable if that external dependency is unavailable.

## Source and release identity

- Verification-12 documentation commit: `8a3e15c48f76032a6e3d3c661afc67d32db2eb19`.
- Repair implementation commit: `48fdcb7aba7fd3b35f445c935c6d1d7ba8e12942`.
- Desktop release: [`v0.1.14`](https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.14), built from the implementation commit.
- Release workflow: <https://github.com/B-Divyesh/sf-worktree-agent-pulse/actions/runs/34014313342> — successful.
- The deployed bundle contains the full implementation SHA. Later evidence and handoff commits do not change the deployed product image.

## What changed

- The landing route now paints the header and first screen first. It adds below-the-fold product sections and the five preview rows over separate animation frames.
- The three walkthrough screenshots have no initial `src`. An intersection observer loads them only when the walkthrough nears the viewport. A browser regression test checks network requests and decoded images, not source text.
- Mobile uses a 768×512, 18,708-byte derivative of the original hero. Desktop keeps the full source image. The derivative and provenance are recorded in `.factory/design.md`.
- IBM Plex Mono now ships only its Latin subsets.
- Direct demo visits register the offline worker immediately. The landing defers registration for five seconds so first paint does not compete with service-worker work.
- Browser Back waits for deferred landing sections before restoring the exact saved scroll position and heading focus.
- Product, Tauri, cache, release-claim, and live-check versions advanced to `0.1.14`.

## Clean setup and claims

A fresh clone of tag `v0.1.14` was installed with `npm ci` on Node 22.23.2. It installed 106 packages with zero reported vulnerabilities. The documented Linux Tauri prerequisites were installed before native checks.

Every one of the 31 commands in `.factory/claims.json` was run exactly from that clone and passed. This includes the isolated/offline demo, request privacy, license failure recovery, native Git boundaries, installers, live checkout, signing status, and release provenance. `npm run test:release-provenance -- v0.1.14` downloaded and hashed both macOS DMGs, the Windows installer, AppImage, and Debian package against `SHA256SUMS` and confirmed the release source SHA.

## Complete local verification

- `npm test`: PASS — 21 Vitest tests; 73 Playwright checks passed and one intentional project variant skipped.
- Accessibility: PASS — serious/critical Axe scans on landing, demo, Privacy, Terms, 404, and drawer states in desktop and 390 px projects; keyboard, focus restoration, 44 px targets, and 200% reflow passed.
- `npm run build:site`: PASS — `dist/site` produced; 42,160 bytes total JavaScript and 21.85 KB CSS.
- `npm run test:build-output`: PASS.
- `npm run test:build-identity`: PASS.
- `npm audit --omit=dev`: PASS — zero vulnerabilities.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 7 tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings`: PASS.
- Debian consumer check: PASS — `Worktree Agent Pulse_0.1.14_amd64.deb` reported the correct name, version, architecture, and dependencies. A clean extraction resolved all dynamic libraries and stayed open under Xvfb for the 10-second smoke window.

Cold local mobile Lighthouse results:

| Sample | Performance | Accessibility | Best practices | SEO | TBT | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 99 ms | 1,510 ms | 0.0168 |
| 2 | 100 | 100 | 100 | 100 | 34 ms | 1,358 ms | 0.0168 |
| 3 | 100 | 100 | 100 | 100 | 35 ms | 1,357 ms | 0.0168 |

Evidence: `.factory/repair-11-evidence/lighthouse-local.{1,2,3}.json`.

## Live verification

- The exact implementation build was deployed to the existing `sf-worktree-agent-pulse` production Static Web App. No DNS, shared service, database, or other product was changed.
- The live bundle exposes `48fdcb7aba7fd3b35f445c935c6d1d7ba8e12942`.
- `verify-url.sh`: PASS — HTTPS 200, correct title and language, one H1, main landmark, image alt coverage, and zero console/page errors. Its simple `innerText` heuristic counts two controls inside off-screen `content-visibility` sections; both have visible text when rendered and pass Axe and keyboard checks.
- The full live Playwright audit passed landing, demo, Privacy, Terms, real HTTP 404, desktop keyboard use, mobile first screen/history, 200% reflow, offline reload, demo isolation, release download, and license input recovery. Serious/critical Axe findings: zero.
- Fresh desktop and phone views plainly state the job: see blocked agents and worktrees needing attention. They name developers running several CLI agents. The first action is **Try it with sample data**, with its five-worktree/no-save result beside it.
- The one-click sample showed five realistic worktrees and the persistent sample banner. Reset restored the five rows, Start for real discarded demo state, and pre-seeded real repository and license bytes were unchanged.
- The hosted Dodo page returned 200 after redirect and contained the Worktree Agent Pulse name and advertised $19 price.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. The designed missing-page route returned the expected HTTP 404.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and the required response CSP with `frame-ancestors 'none'`.
- Billing rate limiting remained active: requests 1–30 returned the invalid-license response; request 31 returned 429 with `Retry-After: 4`.

Cold live mobile Lighthouse results:

| Sample | Performance | Accessibility | Best practices | SEO | TBT | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 107 ms | 1,603 ms | 0.0168 |
| 2 | 100 | 100 | 100 | 100 | 20 ms | 1,415 ms | 0.0168 |
| 3 | 100 | 100 | 100 | 100 | 19 ms | 1,440 ms | 0.0168 |

Evidence: `.factory/repair-11-evidence/`, including live screenshots, `live-audit/live-check.json`, `verify-url/verify.json`, and all six Lighthouse reports.

## Earlier finding disposition

All earlier review, polish, and verification records were read before this change.

- Review 1 copy, claim coverage, attention ordering, navigation, sample wording, walkthrough, terminology, and 404 findings remain closed. The current copy audit and complete claim run cover them.
- Review 2 drawer focus, text reflow, unsigned disclosure, license validation, target size, storage wording, removal safety, visible terminal feedback, and blocked-notification findings remain closed in the full browser suite.
- Review 3 demo/license isolation remains closed. Both demo URLs preserve real repository, license, and verdict sentinels and make no cross-origin request.
- Verification findings for stale downloads, fail-open licensing, mobile identifiers, initial keyboard order, route scroll restoration, immutable deployment identity, and release provenance remain closed by the current clean-clone and live checks.
- Verification 12's checkout blocker is currently closed by four consecutive 303 results. Its performance blocker is closed by six independent cold samples without changing the 200 ms limit.

## Known dependencies and operator action

- Sociobot/Dodo checkout and license verification remain external dependencies. The current checkout is healthy, but this repository cannot prevent a future provider-side outage. `/work/.evidence/billing-offer.json` records the public one-time offer without credentials.
- macOS and Windows builds remain intentionally unsigned and say so before download. Signing later requires owner-managed Apple notarization credentials and `WINDOWS_CERT_PFX`; none are stored here.
- This product has no server tenant, shared database, analytics, tracking, or runtime model call. Backend restart/SQLite checks and AI gateway checks do not apply to this local desktop product and static site.
