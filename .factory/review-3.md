# Adversarial first-read review 3 — Worktree Agent Pulse

Date: 2026-08-29

Live target: <https://worktree-agent-pulse.sociobot.in>

Reviewed commit: `d4b4a01555b688fed600ad0c6ce270dcdc0769a2`

Verdict: **FAIL**

The first screen is clear, the sample is useful, all 31 declared commands pass,
and every earlier numbered finding is fixed. The demo is still not isolated
from existing real license data. A direct demo visit reads a real token, sends
it to the billing API, and writes a real verdict while the demo banner says
that nothing is saved. That is one blocking finding, so the zero-finding bar is
not met.

## First screen, before scrolling

Fresh browser contexts were used at 390×844 and 1440×900. No scrolling occurred
before these observations.

| Viewport | What does it do? | For whom? | What should I click first? | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Shows blocked coding agents and Git worktrees needing attention in one local desktop board. | Developers running several CLI agents. | **Try it with sample data**; its explanation says five worktrees load and nothing is saved. | Clear; headline, audience, action, explanation, and three facts are initially visible. |
| 1440×900 | Same answer. | Same answer. | Same action. | Clear. |

The exact text that provides the answers is “See blocked agents and worktrees
that need attention”, “For developers running several CLI agents who need one
view of worktree activity and Git state”, and “Try it with sample data”. This
gate passes.

## Findings

### Blocking

#### F-3-1 — Demo mode reads, sends, and writes real license state

- Exact quote/location: the persistent `/demo` banner says “Demo — sample data,
  nothing is saved”. `.factory/demo.md` also says “Storage namespace:
  `demo:worktree-agent-pulse:*` in `sessionStorage`” and “The demo does not call
  Git, the license API, or the GitHub release API.”
- Live reproduction A: seed `localStorage['sb_license:worktree-agent-pulse']`
  with `review3-real-token`, remove its verdict, then open `/demo` directly in a
  fresh context. The page requests
  `https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=review3-real-token`.
  With a fixture success response, it writes
  `localStorage['sb_license:worktree-agent-pulse:verdict']` while the demo banner
  remains visible.
- Live reproduction B: open `/?demo=1&license=review3-return-token`. The page
  stores that token in the real `sb_license:worktree-agent-pulse` key and calls
  the same cross-origin verification endpoint before removing only the query
  parameter.
- Code evidence: `src/main.ts:25` calls `hasCachedLicense()` before deciding
  whether the page is a demo; `src/main.ts:275` calls `captureReturnedLicense()`
  before calculating `demoMode`; `src/main.ts:492` calls `verifyLicense()` for
  every route. `src/license.ts:24`, `:30`, `:57`, `:64`, `:69`, and `:74` show
  the real token read, API request, and real verdict write.
- Test gap: `tests/e2e/claims.spec.ts:46` starts with empty storage. It checks
  only repository-named local keys and therefore cannot detect license reads,
  writes, or verification traffic caused by pre-existing real state.
- Why this blocks acceptance: demo mode is required to use a separate namespace
  and leave all real data untouched. The current direct-entry path violates that
  boundary and makes the banner and documented demo contract false.
- Concrete fix: calculate demo mode before any license call. While in `/demo` or
  `?demo=1`, do not call `hasCachedLicense`, `captureReturnedLicense`, or
  `verifyLicense`; discard a `license` query without storing it. Extend
  `@claim:demo-private` with `context.addInitScript` to seed byte-for-byte real
  repository, license, and verdict sentinels. Open both direct demo URLs, fail
  any Sociobot request, exercise Reset and Start for real, and assert that only
  `demo:worktree-agent-pulse:*` session storage changes.

## Copy audit

Counts use word tokens; standalone separators and numbered list markers are not words.
Repeated navigation labels are listed once; sample repository names, branches,
counts, and table labels are data rather than sentences. Image alternatives,
headings, actions, captions, labels, and meaningful fragments are included.
No copy exceeds 22 words, contains a banned marketing adjective, uses an
information-free slogan, or has a non-result action. The two demo-isolation
statements are flagged because the direct demo behavior disproves them.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Worktree Agent Pulse | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| LOCAL DESKTOP APP | 3 | Pass |
| See blocked agents and worktrees that need attention | 8 | Pass |
| For developers running several CLI agents who need one view of worktree activity and Git state. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Loads five worktrees. | 3 | Pass |
| Nothing is saved. | 3 | **Flag: F-3-1** |
| Prompt and output fields are ignored | 6 | Pass |
| Works without an account | 4 | Pass |
| Five worktrees free · Pro is $19 once | 7 | Pass |
| Five geometric branch rails show active, warning, and blocked worktrees. | 10 | Pass; image alternative |
| Preview: five worktrees, including one blocked agent. | 7 | Pass |
| THE BOARD | 2 | Pass |
| See worktrees in attention order | 5 | Pass |
| Worktrees with blocked agents, remote changes to pull, or local file changes appear before routine worktrees. | 16 | Pass |
| HOW IT WORKS | 3 | Pass |
| Monitor and open worktrees in three steps | 7 | Pass |
| Add a repository | 3 | Pass |
| Pulse asks Git for its linked worktrees. | 7 | Pass |
| Opt in agent status | 4 | Pass |
| Your CLI writes state, tool name, and time. | 8 | Pass |
| Prompt and output fields are ignored. | 6 | Pass |
| Open the right terminal | 4 | Pass |
| Select a row to open that exact worktree. | 8 | Pass |
| Worktree Agent Pulse first-run screen with Add a repository and Load sample project actions. | 14 | Pass; image alternative |
| Add a repository from the first-run screen. | 7 | Pass |
| Worktree Agent Pulse board shows a blocked checkout-retry worktree and changed files. | 12 | Pass; image alternative |
| Inspect a blocked or changed worktree. | 6 | Pass |
| Worktree Agent Pulse detail drawer shows the selected worktree and Open this terminal action. | 14 | Pass; image alternative |
| Open the selected worktree in your terminal. | 7 | Pass |
| DATA ACCESS | 2 | Pass |
| What Pulse reads and ignores | 5 | Pass |
| Pulse reads Git metadata and three status-file fields. | 8 | Pass |
| It ignores source, prompt, output, and terminal content. | 8 | Pass |
| Scans do not change Git state. | 6 | Pass |
| Read the privacy details | 4 | Pass |
| ONE-TIME LICENSE | 2 | Pass |
| Use five worktrees free | 4 | Pass |
| Pay once to show every worktree and refresh every 10 seconds. | 11 | Pass |
| one-time purchase | 2 | Pass |
| Buy Pulse Pro | 3 | Pass |
| Restore a license | 3 | Pass |
| DESKTOP APP | 2 | Pass |
| Install for Linux | 3 | Pass; platform-specific at runtime |
| Current macOS and Windows builds are unsigned. | 7 | Pass |
| Read the install steps before downloading. | 6 | Pass |
| Check GitHub Releases for available downloads. | 6 | Pass |
| Check download for Linux | 4 | Pass |
| View all releases | 3 | Pass |
| opens in a new tab | 5 | Pass; assistive text |
| See blocked agents and worktrees that need attention in one local board. | 12 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.9 · Generated artwork disclosed | 4 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Worktree Agent Pulse | 3 | Pass |
| See blocked agents and worktrees that need attention in one local desktop board. | 13 | Pass |
| Pulse is for solo developers and tiny teams running several CLI agents in Git worktrees. | 15 | Pass |
| It discovers linked worktrees, reads Git status, shows opt-in agent state, and opens the selected worktree in a terminal. | 19 | Pass |
| It ignores source, prompt, output, and terminal content. | 8 | Pass |
| Scans do not run Git writes. | 6 | Pass |
| Live site: https://worktree-agent-pulse.sociobot.in | 3 | Pass |
| One-click demo: https://worktree-agent-pulse.sociobot.in/demo | 3 | Pass |
| What ships | 2 | Pass |
| Desktop downloads for macOS, Windows, and Linux | 7 | Pass |
| Read-only `git worktree list`, `git rev-parse`, and `git status` scans | 10 | Pass |
| Optional status files let each CLI agent report working, blocked, or idle | 12 | Pass |
| Optional local alerts report new blocked states without sending data away | 11 | Pass |
| A user-triggered action that opens the exact worktree in a terminal | 11 | Pass |
| A separate, offline-ready browser demo with five sample worktrees | 9 | **Flag: F-3-1; not separate from real license state** |
| Free monitoring for five worktrees | 5 | Pass |
| Pulse Pro for $19 once, with unlimited worktrees and 10-second refresh | 11 | Pass |
| Run the site | 3 | Pass |
| Requires Node.js 22 or newer. | 5 | Pass |
| Open `http://localhost:4173`. | 2 | Pass |
| The demo route is `/demo`. | 5 | Pass |
| Run the desktop app | 4 | Pass |
| Install the Tauri 2 prerequisites for your system, then run: | 10 | Pass |
| The app stores repository paths on this device. | 8 | Pass |
| Git and status-file results stay in memory and are rebuilt by local scans. | 13 | Pass |
| Use Remove repository to forget a saved path without changing repository files. | 12 | Pass |
| Clearing the app’s storage also removes saved paths. | 8 | Pass |
| Choose Enable blocked alerts to request system notification permission. | 9 | Pass |
| Pulse alerts only when an agent changes into blocked state. | 10 | Pass |
| Selecting the alert opens that worktree. | 6 | Pass |
| Alert text includes the worktree name and state, not repository content. | 11 | Pass |
| Optional agent status file | 4 | Pass |
| The status file is opt-in. | 5 | Pass |
| Create `.worktree-agent-pulse/status.json` inside a worktree: | 5 | Pass |
| `state` accepts `working`, `blocked`, or `idle`. | 6 | Pass |
| Other fields, including prompt and output text, are ignored. | 9 | Pass |
| Test and build | 3 | Pass |
| `npm run build` writes the deployable site to `dist/site`. | 9 | Pass |
| GitHub Actions builds desktop bundles when a `v*` tag is pushed. | 11 | Pass |
| Install | 1 | Pass |
| Use the detected download on the site, or choose a release asset manually. | 13 | Pass |
| One-line installers verify the release SHA-256 before opening or installing the file: | 12 | Pass |
| Choose the macOS, Windows, AppImage, or Debian package from the release page. | 12 | Pass |
| Install an unsigned build | 4 | Pass |
| Current macOS and Windows builds are unsigned. | 7 | Pass |
| Verify the file against `SHA256SUMS` on the release page before opening it. | 12 | Pass |
| macOS: open the DMG, drag Pulse to Applications, then Control-click Pulse and choose Open. | 14 | Pass |
| Windows: open the setup file, choose More info, confirm the checksum matches, then choose Run anyway. | 16 | Pass |
| Linux: make the AppImage executable, or install the Debian package with your package manager. | 14 | Pass |
| Privacy and billing | 3 | Pass |
| Repository paths and your license token stay in local app storage. | 11 | Pass |
| Git and status-file results stay in memory. | 7 | Pass |
| The public site contacts GitHub only after you request a download. | 11 | Pass |
| License checkout and verification use `api.sociobot.in`. | 6 | Pass |
| Verification runs at most once every 24 hours. | 8 | Pass |
| Request a refund at `hello@sociobot.in`. | 5 | Pass |
| See `/privacy` and `/terms` on the site. | 7 | Pass |
| The sample board works offline after its first visit. | 9 | Pass |
| Project records | 2 | Pass |
| Visual system | 2 | Pass |
| Demo contract | 2 | Pass |
| Tested claims | 2 | Pass |
| Build handoff | 2 | Pass |
| MIT licensed. | 2 | Pass |
| Built by Param Factory. | 4 | Pass |

## Demo and sandbox verification

- The standard clean one-click flow passes at mobile and desktop: it opens
  `/demo`, immediately shows five realistic worktrees, attention counts,
  filters, and current sample states.
- The banner, **Reset demo**, and **Start for real** are visible. Reset restores
  the five-row order and All filter. Start for real clears the demo session key.
- A repository-path sentinel remains unchanged in the standard flow. The sample
  itself uses `sessionStorage['demo:worktree-agent-pulse:repository']`.
- The sample reloads offline after its first visit.
- The stronger pre-existing-license and returned-license checks fail as recorded
  in F-3-1. The demo therefore does not meet the required isolation boundary.

## Claims audit

A fresh remote clone resolved to the reviewed commit at
`/tmp/pulse-review3-clone-PCHnw0`; `npm ci` installed the pinned dependencies.
The first native command could not start until the documented Ubuntu Tauri
packages were installed because `glib-2.0.pc` was absent. After that host setup,
the exact commands passed unchanged. This was a runner prerequisite, not a test
assertion failure.

| Claim | Exact command | Result |
| --- | --- | --- |
| `sample-five` | `npm run test:e2e -- --grep @claim:sample-five` | PASS — desktop/mobile |
| `attention` | `npm run test:e2e -- --grep @claim:attention` | PASS — complete deterministic order |
| `first-screen-demo` | `npm run test:e2e -- --grep @claim:first-screen-demo` | PASS — all declared viewports |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | Command PASS — desktop/mobile, but insufficient and contradicted by F-3-1 |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | PASS — desktop/mobile |
| `metadata-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only -- --nocapture` | PASS — one native test |
| `free-price` | `npm run test:e2e -- --grep @claim:free-price` | PASS — desktop/mobile |
| `no-account` | `npm run test:e2e -- --grep @claim:no-account` | PASS — desktop/mobile |
| `pro-capacity-refresh` | `npm run test:unit -- -t @claim:pro-capacity-refresh` | PASS — one unit test |
| `site-network` | `npm run test:e2e -- --grep @claim:site-network` | PASS — desktop/mobile |
| `license-local` | `npm run test:e2e -- --grep @claim:license-local` | PASS — desktop/mobile |
| `license-daily` | `npm run test:unit -- -t @claim:license-daily` | PASS — fake clock |
| `license-uncached-network-lock` | `npm run test:e2e -- --grep @claim:license-uncached-network-lock` | PASS — desktop/mobile |
| `license-uncached-rate-limit-lock` | `npm run test:e2e -- --grep @claim:license-uncached-rate-limit-lock` | PASS — desktop/mobile |
| `mac-download-architecture` | `npm run test:e2e -- --grep @claim:mac-download-architecture` | PASS — Intel/Apple silicon fixtures |
| `release-available` | `npm run test:unit -- -t @claim:release-available` | PASS — current public release/checksum |
| `platform-artifacts` | `npm run test:unit -- -t @claim:platform-artifacts` | PASS — five platform artifacts/checksums |
| `release-source-provenance` | `npm run test:release-provenance -- v0.1.9` | PASS — source `5bc7c15…`, five artifact hashes |
| `exact-terminal-path` | `cargo test --manifest-path src-tauri/Cargo.toml claim_exact_terminal_path -- --nocapture` | PASS — one native test |
| `installer-checksum` | `npm run test:unit -- -t @claim:installer-checksum` | PASS |
| `native-no-tracking` | `npm run test:unit -- -t @claim:native-no-tracking` | PASS |
| `repository-delete` | `npm run test:unit -- -t @claim:repository-delete` | PASS — repository/file canaries |
| `checkout-live` | `npm run test:checkout` | PASS — HTTP 303 to Dodo checkout |
| `refund-contact` | `npm run test:e2e -- --grep @claim:refund-contact` | PASS — desktop/mobile |
| `native-data-local` | `npm run test:unit -- -t @claim:native-data-local` | PASS |
| `status-values` | `cargo test --manifest-path src-tauri/Cargo.toml claim_status_values -- --nocapture` | PASS — one native test |
| `node-setup` | `npm run test:unit -- -t @claim:node-setup` | PASS |
| `build-output` | `npm run test:build-output` | PASS — 39,754 raw JavaScript bytes |
| `release-workflow` | `npm run test:unit -- -t @claim:release-workflow` | PASS |
| `unsigned-builds` | `npm run test:signing-status` | PASS — v0.1.9 evidence |
| `blocked-notifications` | `npm run test:unit -- -t @claim:blocked-notifications` | PASS — transition, deduplication, opt-in, action routing |

Every claim-like landing/README statement has a corresponding inventory entry.
The problem is not a missing entry: the registered `demo-private` test does not
cover existing real storage or the supported `?demo=1&license=…` entry, so its
passing result does not verify the full promise.

## Earlier-finding verification

Every earlier item was checked against both production and current source.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 urgency order | Fixed — live order is checkout, invoice, northstar, search, auth; full order is asserted. |
| F-1-2 release publication | Fixed — action copy and current-release checksum claim pass. |
| F-1-3 signing status | Fixed — current unsigned disclosure has artifact evidence. |
| F-1-4 OS warning | Fixed — exact linked install steps replace the vague warning. |
| F-1-5 platform availability | Fixed — both macOS builds, Windows, AppImage, Debian, and checksums pass. |
| F-1-6 state coverage | Fixed — native status-value fixtures cover valid, invalid, and missing values. |
| F-1-7 daily verification | Fixed — fake-clock test proves the 24-hour boundary. |
| F-1-8 refunds | Fixed — exact mail contact is present and tested. |
| F-1-9 demo navigation | Fixed — skip, Privacy, Terms, attribution, and version are live. |
| F-1-10 sample scan wording | Fixed — live copy says “Sample snapshot · no Git scan ran”. |
| F-1-11 walkthrough | Fixed — three captioned, self-hosted desktop frames are present. |
| F-1-12 risk terminology | Fixed — public copy consistently uses changed/needs attention. |
| F-1-13 headline metaphor | Fixed — h1 names the job directly. |
| F-1-14 hero sequence lore | Fixed — “LOCAL DESKTOP APP”. |
| F-1-15 slogan caption | Fixed — the caption states five worktrees and one blocked agent. |
| F-1-16 process heading | Fixed — “Monitor and open worktrees in three steps”. |
| F-1-17 privacy heading | Fixed — “What Pulse reads and ignores”. |
| F-1-18 adapter jargon | Fixed — README introduces the optional status file plainly. |
| F-1-19 404 metaphor | Fixed — h1 is “This page does not exist”. |
| F-2-1 drawer focus | Fixed — heading receives focus; Escape returns it to the invoking row. |
| F-2-2 200% reflow | Fixed — all routes, board identifiers, and drawer fit at 390px/200%. |
| F-2-3 unsigned disclosure | Fixed — visible before download, linked instructions, evidence claim passes. |
| F-2-4 empty license validation | Fixed — announced error, invalid state, input focus, and no request. |
| F-2-5 44px targets | Fixed — live desktop and mobile checks find no undersized visible control. |
| F-2-6 native locality wording | Fixed — persistent paths/token and in-memory scan results are distinguished and claimed. |
| F-2-7 removal test scope | Fixed — temporary Git tracked/untracked byte and status canaries are compared. |
| F-2-8 missing claim tag | Fixed — manifest guard finds every declared id exactly once. |
| F-2-9 status values | Fixed — working, blocked, idle, invalid, absent, and missing are covered. |
| F-2-10 Node minimum | Fixed — package, runtime, and workflow agree on Node 22+. |
| F-2-11 build/release claims | Fixed — build output and release matrix have declared tests. |
| F-2-12 invisible preview result | Fixed — visible confirmation names the full sample path. |
| F-2-13 “remote-behind” | Fixed — copy says “remote changes to pull”. |
| F-2-14 “WebView storage” | Fixed — copy says “on this device”. |
| F-2-15 “BOUNDARIES” | Fixed — label is “DATA ACCESS”. |
| F-2-16 blocked notifications | Fixed — optional local transition alerts, deduplication, and action routing are implemented/tested. |

F-3-1 is a newly exercised state combination, not a renamed earlier finding.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  HTTP 404 with the designed broken-rail page and a working home action.
- Route titles are respectively “Worktree Agent Pulse — Monitor worktrees”,
  “Demo — Worktree Agent Pulse”, “Privacy — Worktree Agent Pulse”, and “Terms —
  Worktree Agent Pulse”. Each has one h1, one main, `lang="en"`, a route-specific
  description/canonical, OG/Twitter metadata, favicon, and apple-touch icon.
- Internal navigation, `/#how`, Privacy, Terms, GitHub install/release links,
  checkout, `robots.txt`, and `sitemap.xml` all resolve. Mail links are explicit.
- Route navigation focuses the new h1 and updates the polite announcer. Back and
  Forward restore the correct route, scroll position, and h1 focus.
- The factory URL verifier passes with zero console errors. Standalone Axe 4.10.3
  reports zero violations on five live routes. Live drawer focus, 200% reflow,
  reduced motion, and 44px target checks pass.
- `npm test` passes 21 unit and 64 Playwright tests. `npm run build` produces
  `dist/site`; the main JavaScript is 34.90 kB raw and 11.42 kB gzip. The full
  native suite passes 7 tests.
- The asymmetric graphite commit lattice, clipped panels, rail geometry, and
  mint/amber/coral states are recognisably product-specific and do not resemble
  a generic centered SaaS template.

## Missed leverage

No additional AI, import/export, or sync feature is implied by the brief. Git
status inspection and ordering are deterministic, and sending repository data
to a model would weaken the local-first boundary. The previously missing useful
addition—optional local notification when an agent becomes blocked—is now
implemented and tested. There is no decorative AI or embedded provider key.

## What would make this perfect

Resolve F-3-1 without weakening the copy: make demo mode bypass every real
license read, capture, verification request, and verdict write. Add the
pre-seeded real-state and `?demo=1&license=…` cases to `@claim:demo-private`, then
repeat the full clean-clone claim matrix and live request-log check. Nothing else
was found to change.
