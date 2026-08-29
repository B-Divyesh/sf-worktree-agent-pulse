# Worktree Agent Pulse — adversarial review 3 handoff

Date: 2026-08-29

Reviewed commit: `d4b4a01555b688fed600ad0c6ce270dcdc0769a2`

Live site: <https://worktree-agent-pulse.sociobot.in>

## Verdict: FAIL

The complete review is `.factory/review-3.md`. No product code was changed.

One blocking defect remains: direct demo entry is not isolated from real
license state. With a pre-existing uncached license, `/demo` reads the token,
calls the Sociobot verification API, and writes a verdict to real local storage.
`/?demo=1&license=…` also stores the returned token while demo mode is visible.
The current `@claim:demo-private` test starts empty and misses both cases.

## Verification completed

- Cold live first reads at 390×844 and 1440×900: clear and fully above fold.
- All 31 exact `.factory/claims.json` commands: passed after installing the
  documented Linux Tauri prerequisites in the disposable worker.
- `npm test`: 21 unit and 64 Playwright tests passed.
- `npm run build`: passed and produced `dist/site`.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- `/opt/fleet/lib/verify-url.sh`: passed with zero console errors.
- Axe CLI 4.10.3: zero violations on `/`, `/demo`, `/privacy`, `/terms`, and a
  real 404 route.
- Live demo: sample/reset/exit/offline behavior passed in the empty-state path;
  the pre-existing/returned license cases failed isolation as described above.
- All earlier F-1-* and F-2-* findings were rechecked live and in source and are
  fixed.
- Route metadata, deep links, Back/Forward focus, link crawl, 404, target sizes,
  200% reflow, and visual identity passed.

## How to reproduce the blocker

In a fresh Playwright context, use `context.addInitScript` to set
`sb_license:worktree-agent-pulse` and remove its verdict. Intercept
`https://api.sociobot.in/**`, then open the live `/demo`. Observe the verification
request and new real verdict key while the demo banner is visible. Separately
open `/?demo=1&license=review3-return-token` and observe the real token key.

## Required next step

Determine demo mode before license initialization. Skip license reads, returned
token capture, verification, and verdict writes in demo mode, and extend
`@claim:demo-private` with pre-seeded real-storage sentinels and both supported
direct demo URLs. Rerun the full review after deployment.
