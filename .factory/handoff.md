# Worktree Agent Pulse — independent verification 8 handoff

Date: 2026-08-29

Candidate: `3b6f3c6afffa5b1c7bd204e510a4bfba4b2dfb62`

Live site: <https://worktree-agent-pulse.sociobot.in>

Release: [`v0.1.9`](https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.9)

## Verdict: PASS

No critical, major, or minor product defects were found. The first-read and
one-click demo gates pass, all 31 claim commands pass, the full unit/browser/
native suites pass, the production site and Linux desktop bundle build, and
fresh live accessibility, privacy, offline, performance, release, and rate-
limit checks pass. No product code was changed during verification.

The complete report is `.factory/verification-8.md`. Fresh artifacts are in
`.factory/verification-8-evidence/`.

## Verification summary

- `npm ci`: 106 packages; zero audit vulnerabilities.
- `.factory/claims.json`: 31/31 exact commands passed after clean setup.
- `npm test`: 21 unit + 64 Playwright tests passed.
- `npm run build`: passed; `dist/site` contains 39,754 raw bytes of JavaScript
  and 25,039 bytes of CSS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- Rust formatting and Clippy with warnings denied: passed.
- Candidate-stamped Tauri DEB build: passed; 2,475,120 bytes; SHA-256
  `5e3b2b7ca0d0aca8d15185e039926637706ed616de63920d13c92da39cf10492`.
- Clean DEB extraction: no unresolved libraries; eight-second Xvfb smoke pass.
- Factory URL verifier: passed at the live URL with zero console errors.
- Live Axe: zero serious/critical findings on five routes at desktop and
  390 px. Keyboard, focus, 44 px targets, 200% text, and reduced motion pass.
- Live privacy: landing/demo traffic stayed same-origin; download checking
  contacted only the GitHub Releases API.
- Service worker: activated, updated, and served five demo rows offline.
- Mobile Lighthouse: 98 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.6 s, TBT 160 ms, CLS 0.
- Deployment: 42/42 public files match a fresh candidate build byte-for-byte.
- Release: five platform artifacts and checksums pass provenance. A fresh
  AppImage matched `SHA256SUMS` and passed extract-and-run smoke.
- Billing: checkout returns 303 to Dodo. Verification allows 30 requests;
  request 31 returns 429 with `Retry-After: 4`.

## Deployment identity

`v0.1.9` targets `5bc7c15f01fe352b4bf4ea4c658e651782c062d8`.
Candidate `3b6f3c6…` differs from that release source only in `.factory`
handoff/evidence files. There is no product-source or runtime difference, and
the freshly built public output matches the deployed site exactly.

## How to verify

```sh
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

The Linux desktop build additionally needs
`libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`.

## Known gaps and operator notes

- macOS and Windows binaries were not launched in this Linux container. The
  successful public release workflow, source provenance, platform asset
  matrix, and checksums were verified.
- Direct AppImage mounting needs `/dev/fuse`, which this container does not
  expose. `APPIMAGE_EXTRACT_AND_RUN=1` successfully exercised the published
  binary instead.
- Current macOS and Windows builds are intentionally unsigned. The site and
  README disclose this and provide checksum/install instructions.
