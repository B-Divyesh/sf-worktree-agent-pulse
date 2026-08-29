# Adversarial first-read review 2 — Worktree Agent Pulse

Date: 2026-08-29

Live target: <https://worktree-agent-pulse.sociobot.in>

Reviewed commit: `562f65f59e33bd99f64720608f007d596a524249`

Verdict: **FAIL**

The first screen and isolated demo are clear, and all 22 declared claim commands pass. The candidate still has five release-blocking accessibility and download-honesty defects, incomplete claim coverage, a weak claim test, a demo action with no visible result, and plain-language/product-leverage findings. The zero-finding standard is not met.

## First screen, before scrolling

Fresh browser contexts had no cookies or storage. No scrolling occurred before these observations.

| Viewport | What does this do? | For whom? | What should I click first? | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Shows blocked coding agents and Git worktrees that need attention in one desktop board. | Developers running several command-line coding agents in Git worktrees. | **Try it with sample data**; the adjacent text says it loads five worktrees and saves nothing as real data. | Clear. The action, explanation, and facts are all visible initially. |
| 1440×900 | Same answer. | Same answer. | Same action. | Clear. |

The exact text supplying those answers is “See blocked agents and worktrees that need attention”, “For developers running several CLI agents who need one view of worktree activity and Git state”, and “Try it with sample data”. This is not a blocking first-read failure.

## Findings

### Blocking

#### F-2-1 — The worktree drawer loses keyboard focus

- Exact location: live `/demo`; focus `checkout-retry`, press Enter, then Escape.
- Observed result: focus starts on the row button, moves to the page h1 “Worktree pulse” instead of the open drawer, and remains on that h1 after Escape. In source, `#detail-title` has no `tabindex`, so its `.focus()` call cannot work. The current test checks only visibility.
- Why this blocks use: a keyboard or screen-reader user loses context and must traverse the board again.
- Concrete fix: remember the invoking row, make the drawer heading focusable with `tabindex="-1"` (or focus its close button), announce the selected worktree, and restore the row on close. Assert `document.activeElement` after open and close.

#### F-2-2 — Privacy clips at 200% text size on a 390px viewport

- Exact location: live `/privacy`, 390×844 with the root font size at 200%; h1 “Your repository data stays local”.
- Observed result: the document becomes 422px wide. The h1 has a 350px client width but 402px scroll width, and “repository” is visibly cut off.
- Why this blocks use: enlarged text is unreadable without horizontal panning.
- Concrete fix: reduce the mobile h1 minimum, allow safe breaks, and test that `scrollWidth <= innerWidth` at 390px with 200% text.

#### F-2-3 — The direct download omits the unsigned-build warning

- Exact location: landing “Install for Linux”. It says “Check GitHub Releases for available downloads.” After **Check download for Linux**, it says “v0.1.6 is ready” and exposes a direct AppImage download.
- Evidence: the current GitHub release says “Unsigned desktop builds for macOS, Windows, and Linux. See the README for install notes.” The landing page gives no warning before direct download, and README has no unsigned-build notes.
- Why this blocks use: an unexpected OS security warning looks like tampering, and the release sends readers to missing instructions.
- Concrete fix: disclose unsigned macOS/Windows builds before download, link exact open/install steps, and add an artifact-backed signing claim. Make the release-body README reference true.

#### F-2-4 — Empty license verification fails silently

- Exact location: landing **Restore a license** → empty “License token” → **Verify license**.
- Observed result: no request occurs, but the status remains “Paste the token from your purchase email.” The input has no `required`, `aria-invalid`, or `aria-describedby`; focus stays on Verify.
- Why this blocks use: the action appears broken and gives no correction.
- Concrete fix: show and announce “Enter the license token from your purchase email”, mark/associate the error, focus the input, and test that no request occurs.

#### F-2-5 — Desktop links miss the 44px target-size contract

- Exact live measurements at 1440×900: header **Demo** 38×22, **How it works** 87×22, **Privacy** 50×22; footer **Privacy** 50×22 and **Terms** 39×22; demo **Start for real** 82×21; demo header **Privacy** 46×20 and **Terms** 38×20. The wordmark is 141×32.
- Why this blocks use: these controls are difficult to acquire for users with limited dexterity. The contract has no desktop exception.
- Concrete fix: give every header/footer/banner/inline action at least a 44×44 box at all viewports, and run the current target-size test on desktop too.

### Major

#### F-2-6 — Native data-locality wording is unlisted and imprecise

- Exact quotes: README “Repository paths and board state stay in local app storage.” Privacy “Repository paths, Git state, status-file state, and your license token stay in local app storage.” README also says clearing browser/app storage removes saved paths.
- Evidence: no claim tests the real desktop app’s full storage/network boundary. `src/storage.ts` persists repository paths, demo data, and license/release data, while scanned board state stays in the runtime `repository` variable rather than local storage.
- Why this misleads: readers cannot distinguish persisted paths from in-memory scan results, and the central native privacy promise is undeclared.
- Concrete fix: write “Repository paths and your license token stay in local app storage. Git and status-file results stay in memory and are rebuilt by local scans.” Add a `native-data-local` storage/network claim.

#### F-2-7 — The repository-removal claim does not test repository files

- Exact claim: “Remove repository forgets a saved path without changing repository files.”
- Evidence: `@claim:repository-delete` saves two strings in jsdom localStorage, removes one, and checks the other. It never creates a repository, records file/Git canaries, invokes removal, or compares files.
- Why this is incomplete: the highest-risk half of the promise is not observed.
- Concrete fix: use a temporary Git repository with tracked/untracked canaries and compare bytes and Git status before/after while asserting only the selected path is forgotten.

#### F-2-8 — One declared claim has no required `@claim` tag

- Exact location: `release-source-provenance` in `.factory/claims.json` and `scripts/verify-release-provenance.mjs`.
- Evidence: its command passes, but repository search finds zero `@claim:release-source-provenance` occurrences. Every other declared id has exactly one.
- Why this matters: tag-based discovery cannot prove the declared check exists.
- Concrete fix: add the exact tag to the executable test or one wrapper test, plus a manifest check for exactly one tag per id.

#### F-2-9 — The advertised status-file states are not fully claimed

- Exact quotes: README “Optional status files let each CLI agent report working, blocked, or idle” and “`state` accepts `working`, `blocked`, or `idle`.”
- Evidence: native `metadata-only` exercises only `blocked`. Web sample values do not prove the native parser accepts `working` and `idle`.
- Why this misleads: two of three documented integration values lack a declared native test.
- Concrete fix: add a `status-values` claim for working, blocked, idle, invalid, and missing state, or narrow the README.

#### F-2-10 — The Node.js minimum is an unlisted claim

- Exact quote: README “Requires Node.js 22 or newer.”
- Evidence: `package.json` has no `engines` entry and no claim tests 22 as the minimum.
- Why this misleads: contributors cannot tell whether 22 is enforced or merely used by CI.
- Concrete fix: add `engines.node`, enforce it in CI, and register a setup test; otherwise say “The release workflow currently uses Node.js 22.”

#### F-2-11 — README build/release-process promises are unlisted

- Exact quotes: “`npm run build` writes the deployable site to `dist/site`.” and “GitHub Actions builds desktop bundles when a `v*` tag is pushed.”
- Evidence: both are currently true and the build passed, but neither appears in `claims.json`.
- Why this matters: maintainers rely on these operational promises without inventory coverage.
- Concrete fix: add tagged build-output and workflow-contract tests, or recast them as descriptions linked to the current workflow.

#### F-2-12 — The terminal preview action has no visible result

- Exact location: `/demo`, open a worktree, choose **Preview terminal action**.
- Observed result: no visible content changes; only the screen-reader-only live region receives “Preview action: terminal would open …”.
- Why this weakens the demo: a sighted visitor sees a dead primary action.
- Concrete fix: show a visible inline confirmation naming the sample path and what the installed app would do; keep the live announcement and test the visible result.

### Minor

#### F-2-13 — “Remote-behind” is invented and inconsistent terminology

- Exact quote: “Blocked worktrees, remote-behind worktrees, and changed worktrees appear before routine worktrees.” The board says only “behind”.
- Why this slows the read: visitors must infer both labels mean the same Git condition.
- Concrete rewrite: “Worktrees with blocked agents, remote changes to pull, or local file changes appear before routine worktrees.”

#### F-2-14 — “WebView storage” is unnecessary implementation jargon

- Exact quote: README “The app stores repository paths in local WebView storage.”
- Why this slows the read: users need location/privacy, not embedded-browser implementation.
- Concrete rewrite: “The app stores repository paths on this device.”

#### F-2-15 — “BOUNDARIES” is a decorative section label

- Exact location: landing label before “What Pulse reads and ignores”.
- Why this adds noise: it could label any product and adds nothing beyond the heading.
- Concrete fix: remove it or use “DATA ACCESS”.

#### F-2-16 — The tray app does not notify when an agent becomes blocked

- Exact scope: the brief’s job is seeing “blocked prompts … without switching terminal tabs”; native code only refreshes the board.
- Why this is missed leverage: a normal tray-app user expects a newly blocked state to reach them without repeatedly opening the board.
- Concrete feature: add optional local notifications on transitions into `blocked` (optionally newly behind), deduplicate per worktree, and open the affected row when selected. Keep content to worktree name/state, request permission, and add a fixture claim. No AI or sync is warranted.

## Copy audit

Counts use whitespace-separated words; code tokens count as one and list numerals do not. Repeated navigation labels are listed once. Sample repository values and table labels are data, not sentences. No sentence exceeds 22 words and no banned marketing adjective appears.

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
| For developers running several CLI agents who need one view of worktree activity and Git state. | 16 | Pass for the intended audience |
| Try it with sample data | 5 | Pass |
| Loads five worktrees. | 3 | Pass |
| Nothing is saved. | 3 | Pass in the demo/real-data sense |
| Prompt and output fields are ignored | 6 | Pass |
| Works without an account | 4 | Pass |
| Five worktrees free | 3 | Pass |
| Pro is $19 once | 4 | Pass |
| Preview: five worktrees, including one blocked agent. | 7 | Pass |
| THE BOARD | 2 | Pass |
| See worktrees in attention order | 5 | Pass |
| Blocked worktrees, remote-behind worktrees, and changed worktrees appear before routine worktrees. | 11 | Flag: F-2-13 |
| HOW IT WORKS | 3 | Pass |
| Monitor and open worktrees in three steps | 7 | Pass |
| Add a repository | 3 | Pass |
| Pulse asks Git for its linked worktrees. | 7 | Pass |
| Opt in agent status | 4 | Pass |
| Your CLI writes state, tool name, and time. | 8 | Pass |
| Prompt and output fields are ignored. | 6 | Pass |
| Open the right terminal | 4 | Pass |
| Select a row to open that exact worktree. | 8 | Pass |
| Add a repository from the first-run screen. | 8 | Pass |
| Inspect a blocked or changed worktree. | 7 | Pass |
| Open the selected worktree in your terminal. | 8 | Pass |
| BOUNDARIES | 1 | Flag: F-2-15 |
| What Pulse reads and ignores | 5 | Pass |
| Pulse reads Git metadata and three status-file fields. | 8 | Pass |
| It ignores source, prompt, output, and terminal content. | 8 | Pass |
| Scans do not change Git state. | 6 | Pass |
| Read the privacy details | 4 | Pass |
| ONE-TIME LICENSE | 2 | Pass |
| Use five worktrees free | 4 | Pass |
| Pay once to show every worktree and refresh every 10 seconds. | 11 | Pass |
| $19 | 1 | Pass |
| one-time purchase | 2 | Pass |
| Buy Pulse Pro | 3 | Pass |
| Restore a license | 3 | Pass; empty behavior fails in F-2-4 |
| DESKTOP APP | 2 | Pass |
| Install for Linux | 3 | Pass; platform-specific at runtime |
| Check GitHub Releases for available downloads. | 6 | Pass; disclosure fails in F-2-3 |
| Check download for Linux | 4 | Pass |
| View all releases | 3 | Pass |
| opens in a new tab | 5 | Pass |
| See blocked agents and worktrees that need attention in one local board. | 12 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.6 | 1 | Pass |
| Generated artwork disclosed | 3 | Pass |

Landing actions use a result-oriented verb or conventional destination label. The separate demo-action issue is F-2-12.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Worktree Agent Pulse | 3 | Pass |
| See blocked agents and worktrees that need attention in one local desktop board. | 13 | Pass |
| Pulse is for solo developers and tiny teams running several CLI agents in Git worktrees. | 15 | Pass |
| It discovers linked worktrees, reads Git status, shows opt-in agent state, and opens the selected worktree in a terminal. | 19 | Pass |
| It ignores source, prompt, output, and terminal content. | 8 | Pass |
| Scans do not run Git writes. | 6 | Pass |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What ships | 2 | Pass |
| Desktop downloads for macOS, Windows, and Linux | 7 | Pass |
| Read-only `git worktree list`, `git rev-parse`, and `git status` scans | 10 | Pass |
| Optional status files let each CLI agent report working, blocked, or idle | 12 | Flag: F-2-9 |
| A user-triggered action that opens the exact worktree in a terminal | 11 | Pass |
| A separate, offline-ready browser demo with five sample worktrees | 9 | Pass |
| Free monitoring for five worktrees | 5 | Pass |
| Pulse Pro for $19 once, with unlimited worktrees and 10-second refresh | 11 | Pass |
| Run the site | 3 | Pass |
| Requires Node.js 22 or newer. | 5 | Flag: F-2-10 |
| Open `http://localhost:4173`. | 2 | Pass |
| The demo route is `/demo`. | 5 | Pass |
| Run the desktop app | 4 | Pass |
| Install the Tauri 2 prerequisites for your system, then run: | 10 | Pass |
| The app stores repository paths in local WebView storage. | 9 | Flags: F-2-6, F-2-14 |
| Use Remove repository in the desktop app to forget a saved path without changing repository files. | 16 | Flag: F-2-7 |
| Clearing browser/app storage also removes saved paths. | 7 | Flag: F-2-6 |
| Optional agent status file | 4 | Pass |
| The status file is opt-in. | 5 | Pass |
| Create `.worktree-agent-pulse/status.json` inside a worktree: | 5 | Pass |
| `state` accepts `working`, `blocked`, or `idle`. | 6 | Flag: F-2-9 |
| Other fields, including prompt and output text, are ignored. | 9 | Pass |
| Test and build | 3 | Pass |
| `npm run build` writes the deployable site to `dist/site`. | 9 | Flag: F-2-11 |
| GitHub Actions builds desktop bundles when a `v*` tag is pushed. | 11 | Flag: F-2-11 |
| Install | 1 | Pass |
| Use the detected download on the site, or choose a release asset manually. | 13 | Pass; disclosure fails in F-2-3 |
| One-line installers verify the release SHA-256 before opening or installing the file: | 12 | Pass |
| Choose the macOS, Windows, AppImage, or Debian package from the release page. | 12 | Pass |
| Privacy and billing | 3 | Pass |
| Repository paths and board state stay in local app storage. | 10 | Flag: F-2-6 |
| The public site contacts GitHub only after you request a download. | 11 | Pass |
| License checkout and verification use `api.sociobot.in`; the license token stays in local storage. | 14 | Pass |
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

- One click opened `/demo` in fresh mobile and desktop contexts. The first mobile demo viewport already showed the product h1, summary, filters, and two complete realistic rows.
- The persistent banner had **Reset demo** and **Start for real**. After changing filter/opening details, Reset restored five rows, All, and no drawer.
- `localStorage['pulse:repositories']` and an unrelated real-data sentinel remained byte-for-byte unchanged through entry, reset, and exit.
- Demo data used only `sessionStorage['demo:worktree-agent-pulse:repository']`; Start for real removed it rather than copying it.
- The complete flow was same-origin, with no application console/page errors.
- After the first visit, offline `/demo` reload returned 200 with five rows and the banner.
- F-2-12 is the weak interactive result; the one-click sandbox itself passes.

## Claims audit

A clean remote clone at `/tmp/pulse-review2-clean.BBXJGQ/repo` resolved to the reviewed commit and received `npm ci`. The worker initially lacked `glib-2.0`; the documented Linux Tauri prerequisites were installed before native commands. Every exact `test` command passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| `sample-five` | `npm run test:e2e -- --grep @claim:sample-five` | PASS — desktop/mobile |
| `attention` | `npm run test:e2e -- --grep @claim:attention` | PASS — complete order |
| `first-screen-demo` | `npm run test:e2e -- --grep @claim:first-screen-demo` | PASS — declared viewports |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | PASS — supplemented by live sentinel/request check |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | PASS — desktop/mobile |
| `metadata-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only -- --nocapture` | PASS — one native test |
| `free-price` | `npm run test:e2e -- --grep @claim:free-price` | PASS — desktop/mobile |
| `no-account` | `npm run test:e2e -- --grep @claim:no-account` | PASS — desktop/mobile |
| `pro-capacity-refresh` | `npm run test:unit -- -t @claim:pro-capacity-refresh` | PASS — one test |
| `site-network` | `npm run test:e2e -- --grep @claim:site-network` | PASS — desktop/mobile |
| `license-local` | `npm run test:e2e -- --grep @claim:license-local` | PASS — desktop/mobile |
| `license-daily` | `npm run test:unit -- -t @claim:license-daily` | PASS — fake clock |
| `mac-download-architecture` | `npm run test:e2e -- --grep @claim:mac-download-architecture` | PASS — both projects |
| `release-available` | `npm run test:unit -- -t @claim:release-available` | PASS — public release |
| `platform-artifacts` | `npm run test:unit -- -t @claim:platform-artifacts` | PASS — five artifacts/checksums |
| `release-source-provenance` | `npm run test:release-provenance -- v0.1.6` | PASS — source and five hashes; F-2-8 remains |
| `exact-terminal-path` | `cargo test --manifest-path src-tauri/Cargo.toml claim_exact_terminal_path -- --nocapture` | PASS — native Linux |
| `installer-checksum` | `npm run test:unit -- -t @claim:installer-checksum` | PASS |
| `native-no-tracking` | `npm run test:unit -- -t @claim:native-no-tracking` | PASS |
| `repository-delete` | `npm run test:unit -- -t @claim:repository-delete` | PASS assertion; inadequate scope in F-2-7 |
| `checkout-live` | `npm run test:checkout` | PASS — HTTP 303 to redacted Dodo session |
| `refund-contact` | `npm run test:e2e -- --grep @claim:refund-contact` | PASS — desktop/mobile |

Unlisted live/README claims are F-2-6 and F-2-9 through F-2-11. No command failed, but F-2-7 and F-2-8 keep claim coverage incomplete.

## History verification

Every review-1 finding was checked live and in source rather than accepted from `.factory/polish-1.md`.

| Earlier finding | Status and evidence |
| --- | --- |
| F-1-1 urgency order | Fixed — live/tagged order is checkout, invoice, northstar, search, auth. |
| F-1-2 release publication | Fixed — action-only copy plus passing `release-available`. |
| F-1-3 signing assertion | Fixed as written by removal; F-2-3 is the separate current disclosure failure. |
| F-1-4 OS warning | Fixed as written by removal; tested instructions are now required by F-2-3. |
| F-1-5 platform availability | Fixed — live artifact/checksum claim passes. |
| F-1-6 exhaustive states | Fixed as written; remaining adapter-schema gap is F-2-9. |
| F-1-7 daily verification | Fixed — fake-clock claim passes. |
| F-1-8 refund handling | Fixed — exact mail contact is visible/tested. |
| F-1-9 demo navigation | Fixed — skip, Privacy, Terms, attribution, version. |
| F-1-10 fake scan wording | Fixed — “Sample snapshot · no Git scan ran”. |
| F-1-11 walkthrough | Fixed — three self-hosted captioned frames. |
| F-1-12 terminology | Fixed for earlier terms; new phrase issue is F-2-13. |
| F-1-13 h1 metaphor | Fixed — the h1 names the job. |
| F-1-14 `/ 01` lore | Fixed — “LOCAL DESKTOP APP”. |
| F-1-15 slogan caption | Fixed — concrete five-worktree caption. |
| F-1-16 process heading | Fixed — three-step heading. |
| F-1-17 privacy heading | Fixed — “What Pulse reads and ignores”. |
| F-1-18 adapter jargon | Fixed — optional status file wording. |
| F-1-19 404 metaphor | Fixed — “This page does not exist”. |

The current handoff’s five unnumbered blockers all remain reproducible: drawer focus (F-2-1), 200% privacy reflow (F-2-2), unsigned disclosure (F-2-3), empty license validation (F-2-4), and desktop targets (F-2-5). They remain blocking.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, and an unknown route have route-specific titles, descriptions, canonicals, OG/Twitter metadata, favicon/apple icon, `lang="en"`, one h1, and one main.
- The unknown route returns HTTP 404 with a designed broken-rail page and working home action.
- Route changes focus the h1. Privacy starts at top; Back restores the prior 1200px landing scroll and h1 focus; Forward restores Privacy/top/h1.
- Crawled routes, `/#how`, robots, sitemap, scripts, assets, and GitHub Releases returned 200. Mail links are explicit; checkout passed its expected 303.
- Live headers include CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. Successful routes had no application console/page errors.
- The factory URL verifier passed. Playwright Axe found zero violations on five base routes at desktop/mobile. The open-drawer state adds a moderate `region` issue for the skip link outside landmarks; move it into the app header while fixing F-2-1.
- Reduced motion is respected. `npm test` passed: 14 unit and 48 Playwright tests. `npm run build` produced `dist/site`; main JS is 10.39 kB gzip and CSS 5.93 kB gzip.
- The asymmetric graphite commit lattice, clipped geometry, mint/amber/coral states, and instrument-panel board are distinctive, not a generic SaaS template.

## Missed leverage

No AI feature is appropriate: the core job is deterministic local Git/status inspection, and sending repository metadata to a model would weaken privacy. No decorative AI/provider key exists. Import/export and sync are not implied. The one obvious local addition is the blocked-state notification in F-2-16.

## What would make this perfect

Resolve every finding: repair/test focus, 200% reflow, empty validation, and desktop targets; disclose/test unsigned downloads; make native storage wording exact and claimed; strengthen removal and claim-tag checks; cover status values and documented build prerequisites; show visible terminal-preview feedback; simplify flagged copy; and add optional local blocked notifications. Then repeat the entire cold review, all 22 claim commands, sandbox/request checks, crawl, Axe states, full test, and build from a clean clone. Acceptance remains zero findings.

