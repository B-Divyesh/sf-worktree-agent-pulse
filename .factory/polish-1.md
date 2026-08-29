# Polish 1 — review-finding closure

Target: repair of `fd79a227cecd7880222af0b1c64653d44c620338` from adversarial review `20f7576aab97d30ac9609cff30fe7eebec0b0628`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added deterministic blocked → remote-behind → changed → routine ordering to both the landing preview and demo board. | `@claim:attention`; browser screenshot `public/assets/walkthrough-inspect.png` |
| F-1-2 | Replaced the publication assertion with the action-only “Check GitHub Releases for available downloads”; registered a tested current-release checksum claim. | `@claim:release-available` |
| F-1-3 | Removed untestable signing-status assertions from the landing page and README. | Copy audit; landing screenshot after deployment |
| F-1-4 | Removed untestable operating-system confirmation instructions. | Copy audit; README install section |
| F-1-5 | Kept platform availability only with a live GitHub release-asset and checksum claim. | `@claim:platform-artifacts` |
| F-1-6 | Removed the unverified exhaustive state-list promise from README. | README audit; `@claim:attention` covers the visitor-facing state ordering promise |
| F-1-7 | Added a fake-clock daily-verification test and precise README wording. | `@claim:license-daily` |
| F-1-8 | Replaced the vague refund claim with a specific support email on Terms and README. | `@claim:refund-contact` |
| F-1-9 | Added Privacy, Terms, product attribution, build id, and skip link to demo mode. | `demo keeps legal navigation and sample semantics visible` |
| F-1-10 | Replaced demo “scan” language with “Sample snapshot · no Git scan ran”; landing preview now says “SAMPLE SNAPSHOT.” | `@claim:sample-five`; `public/assets/walkthrough-inspect.png` |
| F-1-11 | Added three self-hosted, captioned product-UI walkthrough captures for first run, risk inspection, and terminal opening. | `landing provides three captioned desktop walkthrough frames`; `public/assets/walkthrough-add-repository.png`, `public/assets/walkthrough-inspect.png`, `public/assets/walkthrough-terminal.png` |
| F-1-12 | Standardized public wording on **changed** and **needs attention**; removed “unsafe,” “dirty branches,” and generic “Git risk” marketing copy. | `.factory/copy-audit.md` terminology table |
| F-1-13 | Rewrote the h1 as “See blocked agents and worktrees that need attention.” | `@claim:first-screen-demo`; landing screenshot after deployment |
| F-1-14 | Replaced decorative hero sequence lore with “LOCAL DESKTOP APP.” | `.factory/copy-audit.md` |
| F-1-15 | Replaced the slogan caption with a concrete preview description. | `.factory/copy-audit.md` |
| F-1-16 | Renamed the process section “Monitor and open worktrees in three steps.” | `.factory/copy-audit.md` |
| F-1-17 | Renamed the privacy section “What Pulse reads and ignores.” | `.factory/copy-audit.md`; `@claim:metadata-only` |
| F-1-18 | Rewrote README’s jargon-heavy adapter bullet as an optional status-file explanation. | README “Optional agent status file” section |
| F-1-19 | Rewrote the 404 h1 as “This page does not exist.” | route-wide Axe test on `/missing`; live HTTP 404 check after deployment |

## Verification record

All rows above were rechecked cold at <https://worktree-agent-pulse.sociobot.in> after production deployment. Live evidence is in `/work/.evidence/worktree-agent-pulse-polish-1/`: `verify.json`, `screenshot-desktop.png`, `screenshot-mobile.png`, and `live-demo-mobile.png`. The live mobile suite confirmed the corrected title/h1, all legal routes, the HTTP 404 page, `?demo=1`, demo Privacy/Terms links, sample-only wording, deterministic order `checkout → invoice → northstar → search → auth`, zero serious/critical Axe findings, and no application console/page errors.

The exact claim commands in `.factory/claims.json` were run from a committed clean clone. Full local evidence, deployment commit, and cold-live checks are recorded in `.factory/handoff.md`.
