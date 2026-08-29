# Adversarial first-read review 1 — Worktree Agent Pulse

Date: 2026-08-29

Live target: <https://worktree-agent-pulse.sociobot.in>

Reviewed commit: `ccf06d2dc183cdeda6f0c5550449e709ab29f99f`

Verdict: **FAIL**

The product is clear and immediately tryable, but it does not meet the zero-finding standard. One landing claim is contradicted by the sample board, seven other runtime/release claims are missing adequate claims coverage, the demo route drops required site navigation, and several headings violate the supplied plain-words rules.

## First screen, before scrolling

Fresh contexts were used with empty cookies, local storage, and session storage.

| Viewport | What does it do? | For whom? | What should I click first? | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Shows blocked coding agents and Git worktree risks in one board. | Developers running several CLI agents. | **Try it with sample data**; the adjacent text says it loads five worktrees and saves nothing. | Clear. The full action and explanation are visible before scrolling. |
| 1440×900 | Same answer. | Same answer. | Same action. | Clear. |

The exact first-screen text that supplied those answers was “Catch blocked agents before branches drift”, “For developers running several CLI agents who need one view of worktree activity and Git risk”, and “Try it with sample data”. This is not a blocking first-screen failure, although the headline still contains a metaphor; see F-1-13.

## Findings

### Blocking

#### F-1-1 — The urgency-order claim is unlisted and false in the supplied sample

- Exact quote/location: landing section “Scan worktrees by urgency”: “Blocked agents and dirty branches rise above routine activity.”
- Verification: `.factory/claims.json` only promises that blocked agents and dirty branches *appear*. `@claim:attention` asserts their presence and a four-row filter result, not their order. In the live five-row board, the changed `northstar` row appears below the clean `auth-cleanup` row.
- Why this misleads: ordering by urgency is the section’s stated value. A visitor is told attention items rise, but the first data set disproves it.
- Concrete fix: sort every `needsAttention` row ahead of routine rows, with deterministic blocked/behind/changed ordering. Extend `@claim:attention` to assert the complete row order. If no ordering is intended, rewrite the section to “See blocked agents and changed worktrees” and remove “by urgency” and “rise above”.

### Major

#### F-1-2 — Release publication is an unlisted claim

- Exact quote/location: landing download section: “Downloads are published through GitHub Releases.”
- Why this misleads: the release page returned 200 during review, but no claims entry proves that a usable current release is published. `site-network` tests request timing, and `mac-download-architecture` uses a mocked release.
- Concrete fix: add a `release-available` claims entry and test that the advertised current release exposes the required asset and checksum, or rewrite this to the action-only “Check GitHub Releases for available downloads.”

#### F-1-3 — Signing status is asserted without a claim test

- Exact quotes/locations: landing: “Early builds are unsigned.” README: “Release artifacts are unsigned until the operator adds platform certificates.”
- Why this misleads: signing status affects whether a download can be trusted and installed. No claims entry inspects the shipped artifacts.
- Concrete fix: add one signing-status claim with platform-appropriate artifact inspection, then use one consistent sentence such as “Current macOS and Windows builds are unsigned.”

#### F-1-4 — The operating-system warning is an unlisted claim

- Exact quote/location: landing download section: “Your system may ask you to confirm the app.” README: “On macOS, right-click the unsigned app and choose Open.” and “On Windows, confirm the unsigned publisher warning.”
- Why this misleads: these are installation-behavior instructions, but no clean-sandbox or packaged-app test covers them.
- Concrete fix: add tested install smoke procedures for current macOS and Windows artifacts, or link to a plainly labelled install-troubleshooting page and remove the unverified outcome from landing copy.

#### F-1-5 — Platform availability is an unlisted product claim

- Exact quotes/locations: README “Tauri 2 desktop app for macOS, Windows, and Linux” and “Linux provides AppImage and Debian packages.”
- Why this misleads: the existing macOS test only selects between two mocked DMGs. It does not prove that current macOS, Windows, AppImage, and Debian artifacts exist.
- Concrete fix: add a `platform-artifacts` claim that checks the current release for both macOS architectures, Windows x64, AppImage, Debian, and `SHA256SUMS`.

#### F-1-6 — The full state list is not covered by a listed claim

- Exact quote/location: README “Dirty, ahead, behind, detached, working, idle, and blocked states.”
- Why this misleads: `attention` verifies blocked and changed states only. `metadata-only` verifies three adapter fields and privacy. Untagged Rust parser tests do not create claims coverage for every listed state.
- Concrete fix: add a `worktree-states` claim and one tagged fixture test that observes all seven states in serialized board data, or narrow the bullet to the tested states.

#### F-1-7 — “Daily verification” is not tested

- Exact quote/location: README privacy section: “License checkout and daily verification use `api.sociobot.in`; the license token stays in local storage.”
- Why this misleads: `license-local` proves the destination and local token storage, but it does not advance time to prove the 24-hour cache interval.
- Concrete fix: extend the claim and tagged test with a fake clock: one request on first verification, none before 24 hours, and one after 24 hours. Otherwise remove “daily”.

#### F-1-8 — Refund handling is not tested or explained

- Exact quote/location: README: “Sociobot and Dodo handle checkout and refunds.”
- Why this misleads: `checkout-live` proves only a redirect to Dodo. It does not prove a refund path, policy, or contact.
- Concrete fix: replace it with a concrete instruction such as “Request a refund at [documented route/contact]” and test that route, or remove the refund statement.

#### F-1-9 — The demo route omits required site navigation

- Exact location: live `/demo`; its header contains only the wordmark and Refresh, and it has no footer.
- Why this matters: Privacy and Terms are available on every other route but disappear while the visitor is evaluating the sample and its storage claim.
- Concrete fix: retain the compact app header, but add visible Privacy and Terms links plus the standard product/version attribution, either in that header or a compact footer.

#### F-1-10 — Sample data is labelled as a current Git scan

- Exact quotes/locations: landing board: “SCANNED NOW”; `/demo`: “Last scan: just now · Git reads only”.
- Why this misleads: entering `/demo` loads bundled JSON and does not run Git. The demo banner identifies sample data, but the scan labels still describe an event that did not occur.
- Concrete fix: render “Sample snapshot · no Git scan ran” in demo/preview mode. Reserve scan timestamps and “Git reads only” for a real native scan.

#### F-1-11 — The desktop-product walkthrough is incomplete

- Exact location: landing “How it works” section.
- Why this matters: the desktop demo contract calls for a captioned 3–5-frame walkthrough. The landing has one board preview and three text steps, but no frames showing first-run repository selection, risk review, and terminal opening.
- Concrete fix: add three self-hosted, captioned screenshots from the real desktop app: add a repository; inspect a blocked/changed worktree; open the selected terminal. Preserve the current one-click live sample.

### Minor

#### F-1-12 — The product uses five terms for overlapping risk concepts

- Exact quotes/locations: “Git risk”, “dirty branches”, “needs attention”, “changed”, and “unsafe worktrees” across the landing page and README.
- Why this slows the first read: a visitor must infer whether dirty, changed, unsafe, risk, and needs attention are the same state or different classifications.
- Concrete fix: use **changed** for uncommitted files and **needs attention** for the umbrella filter. Rewrite the footer as “See blocked agents and worktrees that need attention in one local board.”

#### F-1-13 — The headline ends in a metaphor

- Exact quote/location: landing h1: “Catch blocked agents before branches drift”.
- Why this weakens clarity: “branches drift” does not name an observable Git state and violates the supplied no-metaphor rule.
- Concrete fix: “See blocked agents and worktree risks.”

#### F-1-14 — The hero eyebrow is decorative sequence lore

- Exact quote/location: “LOCAL WORKTREE MONITOR / 01”.
- Why this adds noise: “/ 01” communicates no action, feature, price, or proof.
- Concrete fix: remove the line, or use the descriptive label “LOCAL DESKTOP APP”.

#### F-1-15 — The hero caption uses slogans instead of one usable description

- Exact quote/location: “Five rails. One blocked agent. One glance.”
- Why this adds noise: “rails” is a visual metaphor and “one glance” is an unmeasured speed claim.
- Concrete fix: “Preview: five worktrees, including one blocked agent.”

#### F-1-16 — The process heading does not name its section

- Exact quote/location: landing h2: “Keep your terminal. Add one view.”
- Why this fails out of context: a screen-reader heading list does not reveal that the section explains setup and use.
- Concrete fix: “Monitor and open worktrees in three steps.”

#### F-1-17 — The privacy heading is a slogan

- Exact quote/location: landing h2: “Your code is not the product”.
- Why this fails out of context: it hints at privacy but does not name what Pulse reads or ignores.
- Concrete fix: “What Pulse reads and ignores.”

#### F-1-18 — The README introduces “adapter” as jargon

- Exact quote/location: README bullet “Optional status-file adapters for any CLI agent”.
- Why this slows the first read: the term is not explained until a later section.
- Concrete fix: “Optional status files let each CLI agent report working, blocked, or idle.”

#### F-1-19 — The 404 h1 is a metaphor

- Exact quote/location: designed 404 h1: “This branch ends here”.
- Why this fails the heading rule: it does not identify the page as missing when read alone.
- Concrete fix: “This page does not exist.” Keep the broken-rail artwork as the product-specific visual treatment.

## Copy audit

Word counts treat whitespace-separated tokens as words. Code blocks and sample data values are not sentences; meaningful headings, labels, actions, and fragments are included. No item exceeds 22 words. Button labels use result-naming verbs. Flags refer to findings above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| LOCAL WORKTREE MONITOR / 01 | 5 | Flag: F-1-14 |
| Catch blocked agents before branches drift | 6 | Flag: F-1-13 |
| For developers running several CLI agents who need one view of worktree activity and Git risk. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Loads five worktrees. | 3 | Pass |
| Nothing is saved. | 3 | Pass in the stated demo/real-data sense |
| Prompt and output fields are ignored | 6 | Pass |
| Works without an account | 4 | Pass |
| Five worktrees free. | 3 | Pass |
| Pro is $19 once. | 4 | Pass |
| Five rails. | 2 | Flag: F-1-15 |
| One blocked agent. | 3 | Flag: F-1-15 |
| One glance. | 2 | Flag: F-1-15 |
| THE BOARD | 2 | Pass |
| Scan worktrees by urgency | 4 | Flag: F-1-1 |
| Blocked agents and dirty branches rise above routine activity. | 9 | Flag: F-1-1, F-1-12 |
| HOW IT WORKS | 3 | Pass |
| Keep your terminal. | 3 | Flag: F-1-16 |
| Add one view. | 3 | Flag: F-1-16 |
| Add a repository | 3 | Pass |
| Pulse asks Git for its linked worktrees. | 7 | Pass |
| Opt in agent status | 4 | Pass |
| Your CLI writes state, tool name, and time. | 8 | Pass |
| Prompt and output fields are ignored. | 6 | Pass |
| Open the right terminal | 4 | Pass |
| Select a row to open that exact worktree. | 8 | Pass |
| BOUNDARIES | 1 | Flag: F-1-17 |
| Your code is not the product | 6 | Flag: F-1-17 |
| Pulse reads Git metadata and three adapter fields. | 8 | Pass |
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
| Install for Linux | 3 | Pass |
| Downloads are published through GitHub Releases. | 6 | Flag: F-1-2 |
| Check download for Linux | 4 | Pass |
| View all releases | 3 | Pass |
| Early builds are unsigned. | 4 | Flag: F-1-3 |
| Your system may ask you to confirm the app. | 9 | Flag: F-1-4 |
| See blocked agents and unsafe worktrees in one local board. | 10 | Flag: F-1-12 |
| Built by Param Factory | 4 | Pass |
| Generated artwork disclosed | 3 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Worktree Agent Pulse | 3 | Pass |
| See blocked coding agents and unsafe Git worktrees in one local desktop board. | 13 | Flag: F-1-12 |
| Pulse is for solo developers and tiny teams running several CLI agents in Git worktrees. | 15 | Pass |
| It discovers linked worktrees, reads Git status, shows opt-in agent state, and opens the selected worktree in a terminal. | 19 | Pass |
| It ignores source, prompt, output, and terminal content. | 8 | Pass |
| Scans do not run Git writes. | 6 | Pass |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What ships | 2 | Pass |
| Tauri 2 desktop app for macOS, Windows, and Linux | 9 | Flag: F-1-5 |
| Read-only `git worktree list`, `git rev-parse`, and `git status` scans | 10 | Pass |
| Dirty, ahead, behind, detached, working, idle, and blocked states | 9 | Flag: F-1-6, F-1-12 |
| Optional status-file adapters for any CLI agent | 7 | Flag: F-1-18 |
| A user-triggered action that opens the exact worktree in a terminal | 11 | Pass |
| A separate, offline-ready browser demo with five sample worktrees | 9 | Pass |
| Free monitoring for five worktrees | 5 | Pass |
| Pulse Pro for $19 once, with unlimited worktrees and 10-second refresh | 11 | Pass |
| Run the site | 3 | Pass |
| Requires Node.js 22 or newer. | 5 | Pass |
| Open `http://localhost:4173`. | 2 | Pass |
| The demo route is `/demo`. | 5 | Pass |
| Run the desktop app | 4 | Pass |
| Install the Tauri 2 prerequisites for your system, then run: | 10 | Pass |
| The app stores repository paths in local WebView storage. | 9 | Pass |
| Use Remove repository in the desktop app to forget a saved path without changing repository files. | 16 | Pass |
| Clearing browser/app storage also removes saved paths. | 7 | Pass |
| Agent adapter | 2 | Pass after the section explains the term |
| An adapter is opt-in. | 4 | Pass |
| Create `.worktree-agent-pulse/status.json` inside a worktree: | 5 | Pass |
| `state` accepts `working`, `blocked`, or `idle`. | 6 | Pass |
| Other fields, including prompt and output text, are ignored. | 9 | Pass |
| Test and build | 3 | Pass |
| `npm run build` writes the deployable site to `dist/site`. | 9 | Pass |
| GitHub Actions builds desktop bundles when a `v*` tag is pushed. | 11 | Pass as repository documentation |
| Release artifacts are unsigned until the operator adds platform certificates. | 10 | Flag: F-1-3 |
| Install | 1 | Pass |
| Use the detected download on the site, or choose a release asset manually. | 13 | Pass |
| One-line installers verify the release SHA-256 before opening or installing the file: | 12 | Pass |
| On macOS, right-click the unsigned app and choose Open. | 9 | Flag: F-1-4 |
| On Windows, confirm the unsigned publisher warning. | 7 | Flag: F-1-4 |
| Linux provides AppImage and Debian packages. | 6 | Flag: F-1-5 |
| Privacy and billing | 3 | Pass |
| Repository paths and board state stay in local app storage. | 10 | Pass |
| The public site contacts GitHub only after you request a download. | 11 | Pass |
| License checkout and daily verification use `api.sociobot.in`; the license token stays in local storage. | 14 | Flag: F-1-7 |
| Sociobot and Dodo handle checkout and refunds. | 7 | Flag: F-1-8 |
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

- One click from the landing action opened `/demo` at both 390×844 and 1440×900.
- The first demo viewport already showed the `northstar` repository, counts, filters, and realistic rows including `checkout-retry`, `search-index`, and `invoice-export`.
- The persistent banner read “Demo — sample data, nothing is saved” and exposed **Reset demo** and **Start for real**.
- Reset removed an open detail panel, restored the All filter, and restored all five rows.
- A real-data sentinel at `localStorage['pulse:repositories']` was byte-for-byte unchanged through entry, reset, and exit.
- Demo data used only `sessionStorage['demo:worktree-agent-pulse:repository']`; Start for real removed it.
- The complete live flow made same-origin requests only. No console or page errors occurred.
- After a first live visit, Chromium was put offline and `/demo` reloaded with HTTP 200 from the service worker, five rows, and the banner intact.

The core demo path therefore passes. F-1-10 concerns its scan wording, and F-1-11 concerns the separate desktop walkthrough requirement.

## Claims audit

A fresh clone of the reviewed commit was created at `/tmp/pulse-review-clean.7tM9KV/repo`, followed by `npm ci`. The first native invocation stopped at missing host `glib-2.0`; after installing the same Ubuntu Tauri prerequisites documented by the repository (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`), the exact command passed unchanged. This is a host bootstrap condition, not a failed assertion.

| Claim | Exact command | Result |
| --- | --- | --- |
| `sample-five` | `npm run test:e2e -- --grep @claim:sample-five` | PASS — 2 projects |
| `attention` | `npm run test:e2e -- --grep @claim:attention` | PASS — 2 projects; insufficient for F-1-1 ordering copy |
| `first-screen-demo` | `npm run test:e2e -- --grep @claim:first-screen-demo` | PASS — 2 projects and all three requested viewport sizes |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | PASS — 2 projects |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | PASS — 2 projects |
| `metadata-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only -- --nocapture` | PASS — 1 native test |
| `free-price` | `npm run test:e2e -- --grep @claim:free-price` | PASS — 2 projects |
| `no-account` | `npm run test:e2e -- --grep @claim:no-account` | PASS — 2 projects |
| `pro-capacity-refresh` | `npm run test:unit -- -t @claim:pro-capacity-refresh` | PASS — 1 test |
| `site-network` | `npm run test:e2e -- --grep @claim:site-network` | PASS — 2 projects |
| `license-local` | `npm run test:e2e -- --grep @claim:license-local` | PASS — 2 projects; does not cover “daily” in F-1-7 |
| `mac-download-architecture` | `npm run test:e2e -- --grep @claim:mac-download-architecture` | PASS — 2 projects with mocked releases |
| `exact-terminal-path` | `cargo test --manifest-path src-tauri/Cargo.toml claim_exact_terminal_path -- --nocapture` | PASS — 1 native test |
| `installer-checksum` | `npm run test:unit -- -t @claim:installer-checksum` | PASS — valid and invalid checksum fixtures |
| `native-no-tracking` | `npm run test:unit -- -t @claim:native-no-tracking` | PASS — 1 source inspection test |
| `repository-delete` | `npm run test:unit -- -t @claim:repository-delete` | PASS — 1 storage test |
| `checkout-live` | `npm run test:checkout` | PASS — HTTP 303 to `https://checkout.dodopayments.com/session/<redacted>` |

The principal unlisted landing/README claims are recorded individually as F-1-1 through F-1-8; F-1-10 records an additional misleading demo label. There was no failed final claim command and no declared claim left unrun.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. The existing `.factory/handoff.md` listed repaired defects; each was checked rather than accepted from its status text:

- Demo Reset is at least 44 px and works live.
- Intel/Apple-silicon selection tests pass.
- Remove repository exists in code and its tagged storage test passes.
- Native sample paths are guarded by `isSampleProject` and cannot open a terminal.
- Unknown routes return HTTP 404 with the designed page.
- Mobile operational text and all visible controls pass the repository’s regression tests.
- The 17 recorded claims pass under the documented prerequisites.

No earlier finding regressed.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, and an unknown route have route-specific titles, one h1, one main, `lang="en"`, descriptions, canonical URLs, Open Graph/Twitter metadata, favicon, and apple-touch icon.
- The unknown route returned HTTP 404 and a designed broken-rail page with a way home. Its metaphorical h1 is F-1-19.
- SPA navigation moves focus to the destination h1. Back restored the landing scroll position from 1200 px and focused its h1; forward restored Privacy at the top and focused its h1.
- `robots.txt`, `sitemap.xml`, favicon, social card, all internal routes, and GitHub Releases returned 200. The checkout action passed its separate 303 test. Mail links were treated as explicit external actions.
- The response sent CSP, `X-Content-Type-Options`, and `Referrer-Policy` headers. There were no CSP/page errors on successful routes.
- Live Axe WCAG 2/2.1 A/AA scans found zero violations in desktop and mobile contexts on all five routes. The factory URL verifier passed with one h1, one main, alt text present, labelled buttons, and no landing console errors.
- Reduced motion was requested during route checks; the CSS disables transitions and animations.
- `npm test` passed from the clean clone: 9 unit tests and 42 Playwright checks. `npm run build` passed and produced `dist/site`; main JS was 10.00 kB gzip and CSS 5.77 kB gzip.
- The graphite commit lattice, clipped geometry, mint/amber/coral status language, and asymmetric instrument layout are product-specific and do not resemble a generic centered SaaS hero or three-card template.
- `/demo` alone breaks the required consistent header/footer contract; see F-1-9.

## Missed leverage

No AI feature is warranted. The core job is deterministic local Git/status inspection, and sending repository metadata to a model would weaken the privacy proposition without improving the basic task. No decorative AI or provider key was found.

No import/export or sync feature is obviously required by the researched smallest useful product. The concrete missing presentation leverage is the desktop walkthrough in F-1-11.

## What would make this perfect

Resolve every finding above: make urgency ordering true and tested, list and test every release/runtime promise, replace simulated scan wording, restore Privacy/Terms on the demo, add the desktop walkthrough, and remove the metaphor/slogan/terminology drift. Then rerun this entire review from a fresh browser and clean clone. The acceptance target is zero findings, not a reduced count.
