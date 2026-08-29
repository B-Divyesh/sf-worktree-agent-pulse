# Worktree Agent Pulse — independent verification 5

Date: 2026-08-29
Work order: `worktree-agent-pulse-verify-5`
Candidate: `debdba854e60249b53e0bf7e0f85ab914981e3f4`
Live URL: <https://worktree-agent-pulse.sociobot.in>

## Verdict: FAIL

The public static site matches this candidate, but the product is a desktop app
and its offered desktop downloads do not. The only current release, `v0.1.5`,
was built from `b21ff9547349ef3264d8cdb99320dd503d51be63`, not the candidate.
The candidate changes `src/main.ts` and other shipped webview assets after that
release. A visitor downloading the advertised DEB, AppImage, Windows installer,
or macOS DMG receives an older application while the site presents the newer
candidate. This fails release identity and end-to-end deployment verification.

## What passed

- All 22 entries in `.factory/claims.json` passed. The browser claims ran from
  the one-click demo in Chromium desktop and 390px mobile; both Rust claims
  passed after installing the same Linux prerequisite packages used by the
  release workflow (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`,
  `librsvg2-dev`, `patchelf`). `npm run test:checkout` returned HTTP 303 to an
  HTTPS Dodo checkout session.
- `npm test` passed: 12 Vitest tests and 48 Playwright tests. `npm run build`
  passed and produced `dist/site`. `cargo test --manifest-path
  src-tauri/Cargo.toml` passed: 6 tests. `CI=true npx tauri build --bundles deb`
  passed and produced a candidate Linux DEB.
- Cold live first read passed. It says what it does (shows blocked agents and
  worktrees needing attention), for whom (developers running several CLI
  agents), and what to do first (`Try it with sample data`; it loads five
  worktrees and saves nothing).
- Live desktop and 390px checks passed: five-row sample board; attention,
  working, clean, reset, row-detail, Enter/Escape flows; offline demo reload;
  demo-only session storage; no console/page errors; no serious/critical Axe
  findings; visible reduced-motion behavior; and no pre-click cross-origin
  requests. The live download check makes exactly the GitHub Releases API
  request after the user clicks it.
- Headers include CSP, HSTS, `nosniff`, strict-origin referrer policy,
  restrictive Permissions-Policy, and immutable caching for hashed assets.
  Main JS is 31.48 KB raw / 10.36 KB gzip and CSS 24.37 KB raw / 5.93 KB gzip.
- The documented license verify endpoint allows 30 requests from one client;
  requests 31–35 returned `429` with `Retry-After: 4`. No sign-in exists.

## Release-blocking defect

### Critical — downloadable desktop app is stale relative to candidate

- Evidence: GitHub Releases API reports `v0.1.5.target_commitish` as
  `b21ff9547349ef3264d8cdb99320dd503d51be63`; candidate is
  `debdba854e60249b53e0bf7e0f85ab914981e3f4`.
- `git diff b21ff95..debdba8` includes shipped product changes in `src/main.ts`,
  `src/styles.css`, `index.html`, and static configuration/assets. In
  particular, it adds attention-order behavior, direct demo semantics, legal
  navigation, accessibility elements, and the three walkthrough frames to the
  webview source bundled by Tauri.
- The live site’s current hashes (`main-D3XZNici.js`, `main-8yF4jZyI.css`)
  match a fresh build of `debdba8`; its download button instead selects the
  release artifact from `b21ff95`.
- The downloaded Linux DEB's SHA-256 is
  `243ee1e771fee816745fc20672a10197ea01fbee1390e4ba9839fb25269d407c`, matching
  the release `SHA256SUMS`; checksum correctness does not repair the stale
  build identity.

## Required next step

Create and publish a new version/tag from `debdba8` (or the final intended
commit), let the release workflow build all desktop artifacts plus checksums,
then deploy the matching site and re-run independent verification. Do not
accept the current `v0.1.5` artifacts as the candidate release.
