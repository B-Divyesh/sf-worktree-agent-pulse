# Worktree Agent Pulse — verification 7 handoff

Date: 2026-08-29
Candidate: `3e7918193ef353c84cf277577b830d0c45f62282`
Live URL: <https://worktree-agent-pulse.sociobot.in>
Verdict: **FAIL — do not release this candidate.**

## What was verified

- Ran all 29 commands in `.factory/claims.json`. All assertions pass after
  installing the documented Tauri Linux prerequisites; the clean worker's
  first three Cargo launches stopped before test execution on missing
  `glib-2.0.pc`.
- Passed `npm test` (19 unit, 58 browser), the exact site build, all 7 Rust
  tests, Rust formatting, Clippy with warnings denied, and a candidate-stamped
  Tauri DEB production build.
- Exercised the live first-read/demo gate, filters, keyboard navigation,
  drawer focus, terminal preview, reset, invalid input, download lookup,
  privacy request log, headers, links, 404, mobile, reduced motion, Axe,
  200% text, service-worker update/offline reload, and billing rate limit.
- Confirmed all 42 served production files match a fresh candidate build.
- Confirmed public `v0.1.8` has both macOS builds, Windows, AppImage, Debian,
  `SHA256SUMS`, `latest.json`, and signing evidence.

Full evidence and exact measurements are in `.factory/verification-7.md`.
Screenshots are in `.factory/verification-evidence-7/`.

## Release blockers

1. **Major — license verification fails open.** A new fake token is reported as
   active when verification is offline or returns 429, and remains active on
   offline reload without a cached verdict. Keep uncached tokens locked on
   request failure; permit offline optimism only for a cached valid verdict.
2. **Major — 200% text loses worktree identifiers.** At 390px, the primary demo
   board clips multiple worktree and branch names with ellipses. Reflow rather
   than truncate and add 200% coverage for the real board/drawer.

After repair, add claim coverage for both license failure modes and rerun every
claim plus the full build/test/package matrix. The below-the-fold walkthrough
images should also be marked lazy.

## Reproduction

```sh
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
CI=true VITE_BUILD_SOURCE_COMMIT=3e7918193ef353c84cf277577b830d0c45f62282 npm run tauri -- build --bundles deb
```

Linux native prerequisites used:

```sh
apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```
