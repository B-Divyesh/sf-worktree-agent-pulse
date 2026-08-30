# Worktree Agent Pulse — verification 10 handoff

## Result: FAIL

Candidate `ff4d7e44c11402f37fdb6cff9234de9c36277aa6` was independently tested against <https://worktree-agent-pulse.sociobot.in> on 2026-08-30.

All 31 declared claims, the full web/native test suites, production build, formatting, Clippy, release provenance, artifact checks, live checkout, privacy request checks, response headers, and live asset equivalence passed. The deployed JS/CSS/assets exactly match the candidate's fresh production build.

The release is blocked by the mandatory mobile Lighthouse score: **78 performance** (required >=90). The clean idle run measured 1.2 s FCP, 1.6 s LCP, 990 ms TBT, 2.7 s interactive, and 0 CLS. The main action is to profile and remove the landing page's long tasks; see `.factory/verification-10.md` and `.factory/verification-10-evidence/lighthouse-mobile.json`.

There is also a medium keyboard-navigation issue: initial automatic H1 focus skips the skip link and header in normal forward Tab order. Restore normal cold-load header/skip-link access while retaining useful route-change focus.

## How to verify

```bash
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

On Linux, install the documented Tauri 2 prerequisites before native tests. The demo remains available at `/demo`; it uses sample session data and does not touch a real repository.

## Evidence

The detailed decision, claim matrix, live network/header/rate-limit results, and exact release-blocking evidence are in `.factory/verification-10.md`. Browser verifier output, screenshots, and the Lighthouse report are in `.factory/verification-10-evidence/`.
