# Polish 2 — cumulative finding closure

Target candidate: `562f65f59e33bd99f64720608f007d596a524249`  
Review source: `dbfcc19e3babe7e9e784c525c75d5189b913352e`

Every review-1 finding was regression-tested. Every review-2 finding was changed and tested below. Live checks use <https://worktree-agent-pulse.sociobot.in> and <https://worktree-agent-pulse.sociobot.in/?demo=1>.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept deterministic blocked → behind → changed → routine ordering. | `@claim:attention`; live demo row order |
| F-1-2 | Kept action-only release copy and current checksum coverage. | `@claim:release-available`; live download check |
| F-1-3 | Reintroduced signing status only with current-artifact evidence. | `@claim:unsigned-builds`; `signing-status.json` |
| F-1-4 | Added exact macOS, Windows, and Linux install steps instead of an untested warning outcome. | README “Install an unsigned build”; browser link crawl |
| F-1-5 | Kept all five platform artifacts and checksums under a live claim. | `@claim:platform-artifacts`; `@claim:release-source-provenance` |
| F-1-6 | Kept visitor-facing states within declared claims and added native status-value coverage. | `@claim:attention`; `@claim:status-values` |
| F-1-7 | Kept the fake-clock 24-hour verification boundary. | `@claim:license-daily` |
| F-1-8 | Kept the exact refund email and route. | `@claim:refund-contact` |
| F-1-9 | Preserved demo Privacy, Terms, attribution, version, and skip navigation. | `demo keeps legal navigation and sample semantics visible`; live `/demo` |
| F-1-10 | Preserved “Sample snapshot · no Git scan ran.” | `@claim:sample-five`; live `/demo` |
| F-1-11 | Preserved three captioned, self-hosted desktop walkthrough frames. | `landing provides three captioned desktop walkthrough frames` |
| F-1-12 | Preserved **changed** and **needs attention** terminology. | `.factory/copy-audit.md` terminology table |
| F-1-13 | Preserved the job-first h1. | `@claim:first-screen-demo`; `polish-2-evidence/landing-mobile.png` |
| F-1-14 | Preserved “LOCAL DESKTOP APP.” | `.factory/copy-audit.md` |
| F-1-15 | Preserved the concrete five-worktree preview caption. | `.factory/copy-audit.md` |
| F-1-16 | Preserved the descriptive three-step heading. | `.factory/copy-audit.md` |
| F-1-17 | Preserved “What Pulse reads and ignores.” | `.factory/copy-audit.md`; `@claim:metadata-only` |
| F-1-18 | Preserved the plain “status file” wording. | README optional status-file section |
| F-1-19 | Preserved the literal missing-page h1 and broken-rail treatment. | Axe `/missing`; live unknown-route HTTP 404 |
| F-2-1 | Made the drawer heading focusable, stopped internal renders from focusing h1, remembered the invoking row, and restored it on button/Escape close. The skip link now sits inside the app header landmark. | `keyboard opens and closes worktree details`; drawer Axe scan |
| F-2-2 | Added safe heading breaks and a mobile legal-page scale that reflows at 200%. | `privacy reflows at 200 percent text on a 390px viewport`; `polish-2-evidence/privacy-200-percent.png` |
| F-2-3 | Added pre-download unsigned disclosure, exact install steps, and runner-generated signing evidence for shipped DMGs/EXE. | `@claim:unsigned-builds`; `download disclosure links to exact unsigned install steps`; release `signing-status.json` |
| F-2-4 | Empty verification now announces a direct error, sets `required`/`aria-invalid`/`aria-describedby`, focuses the input, and sends no request. | `empty license validation explains the error and focuses the field` |
| F-2-5 | Applied 44×44 minimum hit areas to links in headers, footers, banners, legal copy, and navigation at every viewport. | `desktop controls have 44px targets on every public route`; mobile target test |
| F-2-6 | Corrected storage copy: paths and token persist; Git/status results remain in memory. Added the native boundary claim. | `@claim:native-data-local`; Privacy and README |
| F-2-7 | Replaced the string-only deletion test with a temporary Git repository, tracked/untracked byte canaries, and before/after Git status. | `@claim:repository-delete` |
| F-2-8 | Added the exact provenance tag and a manifest guard requiring exactly one executable `@claim:<id>` tag for every claim. | `@claim:release-source-provenance`; unit manifest guard |
| F-2-9 | Added native fixtures for working, blocked, idle, invalid, absent, and missing status files; unsupported values now map to no state. | `@claim:status-values` |
| F-2-10 | Added `engines.node >=22` and verified package, runtime, and release workflow agreement. | `@claim:node-setup` |
| F-2-11 | Registered observable build-output and release-matrix claims. | `@claim:build-output`; `@claim:release-workflow` |
| F-2-12 | The preview action now renders the full sample path and explains what installed Pulse does. | `terminal preview gives a visible result`; `polish-2-evidence/demo-terminal-confirmation.png` |
| F-2-13 | Replaced “remote-behind” with “remote changes to pull.” | `.factory/copy-audit.md` |
| F-2-14 | Replaced “WebView storage” with “on this device.” | README desktop section |
| F-2-15 | Replaced decorative “BOUNDARIES” with “DATA ACCESS.” | `.factory/copy-audit.md` |
| F-2-16 | Added explicit opt-in local notifications for transitions into blocked, deduplication, private text, and action routing to the affected row. | `@claim:blocked-notifications`; native notification capability/build |

## Evidence files

- `polish-2-evidence/landing-desktop.png`
- `polish-2-evidence/landing-mobile.png`
- `polish-2-evidence/demo-terminal-confirmation.png`
- `polish-2-evidence/privacy-200-percent.png`

The final clean-clone commands, release identifiers, deployment command, Lighthouse scores, URL verifier result, and live cold checks are recorded in `.factory/handoff.md`.
