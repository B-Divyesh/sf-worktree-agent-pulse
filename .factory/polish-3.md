# Polish 3 — cumulative finding closure

Date: 2026-08-29

Base review commit: `8e76227be56027e26df0d132c2aa64fb73ceec60`

Repair release: `v0.1.11`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved deterministic blocked → changes to pull → changed → routine ordering. | `@claim:attention`; `.factory/polish-3-evidence/live-check.json` |
| F-1-2 | Kept release copy action-based and the current checksum claim. | `@claim:release-available`; `@claim:release-source-provenance` |
| F-1-3 | Kept current unsigned status tied to generated artifact evidence. | `@claim:unsigned-builds`; release `signing-status.json` |
| F-1-4 | Kept exact macOS, Windows, and Linux install steps. | `download disclosure links to exact unsigned install steps`; README install section |
| F-1-5 | Kept both macOS builds, Windows, AppImage, Debian, and checksums in the release contract. | `@claim:platform-artifacts`; `@claim:release-source-provenance` |
| F-1-6 | Kept visitor-facing status promises within native fixture coverage. | `@claim:attention`; `@claim:status-values` |
| F-1-7 | Preserved the tested 24-hour license verification boundary. | `@claim:license-daily` |
| F-1-8 | Preserved the exact refund email and Terms route. | `@claim:refund-contact` |
| F-1-9 | Preserved demo skip navigation, Privacy, Terms, attribution, and build id. | `demo keeps legal navigation and sample semantics visible`; live `/demo` |
| F-1-10 | Preserved “Sample snapshot · no Git scan ran.” for bundled data. | `@claim:sample-five`; `.factory/polish-3-evidence/live-demo-terminal.png` |
| F-1-11 | Preserved three self-hosted, captioned desktop walkthrough frames. | `landing provides three captioned desktop walkthrough frames`; live landing |
| F-1-12 | Preserved **changed** and **needs attention** as the public risk terms. | `.factory/copy-audit.md` terminology table |
| F-1-13 | Preserved the direct job-first h1. | `@claim:first-screen-demo`; `.factory/polish-3-evidence/live-landing-mobile.png` |
| F-1-14 | Preserved the factual “LOCAL DESKTOP APP” eyebrow. | `.factory/copy-audit.md` |
| F-1-15 | Preserved the factual five-worktree preview caption. | `.factory/copy-audit.md` |
| F-1-16 | Preserved “Monitor and open worktrees in three steps.” | `.factory/copy-audit.md` |
| F-1-17 | Preserved “What Pulse reads and ignores.” | `.factory/copy-audit.md`; `@claim:metadata-only` |
| F-1-18 | Preserved the plain “status file” wording in README. | README optional status-file section; `@claim:status-values` |
| F-1-19 | Preserved the literal missing-page h1 and product-specific broken rail. | route metadata/history test; live HTTP 404 in `.factory/polish-3-evidence/live-check.json` |
| F-2-1 | Preserved drawer heading focus and Escape focus restoration. | `keyboard opens and closes worktree details`; live drawer check |
| F-2-2 | Preserved mobile legal and board reflow at 200% text. | `all public routes reflow at 200 percent text`; `200 percent mobile text preserves worktree identifiers`; `.factory/polish-3-evidence/live-privacy-200-percent.png` |
| F-2-3 | Preserved pre-download unsigned disclosure and linked instructions. | `@claim:unsigned-builds`; disclosure browser test |
| F-2-4 | Preserved required-field error text, announcement, invalid state, focus, and zero-request behavior. | `empty license validation explains the error and focuses the field` |
| F-2-5 | Preserved 44×44 minimum targets on every public route. | desktop and mobile target-size browser tests |
| F-2-6 | Preserved exact persistent-path/token and in-memory-scan wording. | `@claim:native-data-local`; Privacy and README |
| F-2-7 | Preserved real temporary-repository canaries around path removal. | `@claim:repository-delete` |
| F-2-8 | Preserved exactly-one-tag validation for every claim id. | `lists every declared claim exactly once in an executable test or verifier` |
| F-2-9 | Preserved working, blocked, idle, invalid, absent, and missing native status fixtures. | `@claim:status-values` |
| F-2-10 | Preserved Node.js 22 metadata and workflow agreement. | `@claim:node-setup` |
| F-2-11 | Preserved tested `dist/site` output and tag-triggered platform matrix. | `@claim:build-output`; `@claim:release-workflow` |
| F-2-12 | Preserved visible sample-terminal feedback with the full path. | `terminal preview gives a visible result`; `.factory/polish-3-evidence/live-demo-terminal.png` |
| F-2-13 | Preserved “remote changes to pull” instead of invented terminology. | `.factory/copy-audit.md` |
| F-2-14 | Preserved “on this device” instead of implementation jargon. | README desktop section |
| F-2-15 | Preserved the factual “DATA ACCESS” section label. | `.factory/copy-audit.md` |
| F-2-16 | Preserved opt-in, deduplicated local alerts only on transitions into blocked. | `@claim:blocked-notifications` |
| F-3-1 | Demo mode is now determined before any license operation. Direct demo entry bypasses real token reads, return-token capture, verification, and verdict writes; a demo `license` query is stripped without storage. The claim now instruments storage reads, seeds byte-for-byte repository/license/verdict/session sentinels, blocks Sociobot, covers both direct URLs, exercises preview/reset/exit, and checks the namespace boundary. | `@claim:demo-private`; `.factory/polish-3-evidence/live-check.json`; `.factory/polish-3-evidence/live-demo-terminal.png` |

## Acceptance hardening found during verification

- The hero image is preloaded from the HTML shell so the product-specific artwork remains intact while meeting the mobile performance budget. Evidence: `.factory/polish-3-evidence/lighthouse-mobile.json`.
- The offline precache now deduplicates shell assets and uses cache version `worktree-agent-pulse-v4`. Offline claim tests create and close their own contexts, acquire service-worker control explicitly, and reload the five-worktree demo with the network disabled. Evidence: `@claim:offline-demo`, `@claim:license-uncached-network-lock`, and the live offline check.

## Verification evidence

Every row above was rechecked at <https://worktree-agent-pulse.sociobot.in> where it has a browser-visible outcome. The exact clean-clone claim matrix, full suite counts, release run, deployment command, and URL verifier result are recorded in `.factory/handoff.md`.

- All 31 claim commands passed from a clean clone of release source `763706ba1aab89026cf2090b2289d50142517839`.
- `npm test` passed 21 unit and 66 desktop/mobile browser tests. Rust passed 7 tests plus formatting and Clippy.
- Production report: `.factory/polish-3-evidence/live-check.json` — 14 checks, both demo URLs, offline reload, exact routing, focus, mobile, legal, v0.1.11 download, 404, Axe, and zero unexpected console errors.
- Screenshots: `.factory/polish-3-evidence/live-landing-desktop.png`, `.factory/polish-3-evidence/live-landing-mobile.png`, `.factory/polish-3-evidence/live-demo-terminal.png`, and `.factory/polish-3-evidence/live-privacy-200-percent.png`.
- Lighthouse: `.factory/polish-3-evidence/lighthouse-mobile.json` — 99 performance, 100 accessibility, 100 best practices, 100 SEO, 1.726-second LCP.
- Release: <https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.11> — five checksummed desktop artifacts built from the release source.
