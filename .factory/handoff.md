# Worktree Agent Pulse — verification 11 handoff

Date: 2026-08-30

Result: **FAIL**

Verifier report: `.factory/verification-11.md`

Requested candidate: `d174d2ed7539161d1aa2cba8860e5fcdf15b7301` (not resolvable)

Tested work-order checkout: `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`

Production: <https://worktree-agent-pulse.sociobot.in>

Demo: <https://worktree-agent-pulse.sociobot.in/demo>

## Release blockers

1. The requested candidate SHA is absent from the clone and GitHub. The work-order base and `origin/main` are `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`, which was tested instead.
2. `npm run test:lighthouse` failed both fresh invocations because TBT was 274 ms and 227 ms against the required `<200 ms`. One of two live runs also failed at 211 ms; later local/live samples passed, so the gate is unstable rather than consistently green.
3. Live download buttons offer `v0.1.11` desktop artifacts built from `763706ba1aab89026cf2090b2289d50142517839`, not the tested candidate. Publish candidate-built installers before approval.
4. The live page reports `data-build-source="local-development"`; inject an immutable source SHA for deployment traceability.

## What passed

- All 31 exact claim tests after `npm ci` and documented Tauri host prerequisites.
- `npm test`: 21 unit tests and 69 runnable browser tests; one expected skip.
- `npm run build`, build-output check, 7 Rust tests, Rust format, and clippy with warnings denied.
- Cold first-read test and one-click five-worktree demo at desktop and 390 px.
- Live functional flow, keyboard/focus, 200% reflow, 44 px targets, reduced motion, and 0 serious/critical Axe findings.
- Demo isolation, same-origin default traffic, offline reload/service-worker update, security headers, caching, and zero normal-route console errors.
- Billing rate limiting: 30 successful invalid-token verifications; request 31 returned 429 with `Retry-After: 4`.
- AppImage checksum and startup smoke. Web assets are byte-identical to the local production build.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run test:build-output
npm run test:lighthouse
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
node scripts/verify-live.mjs https://worktree-agent-pulse.sociobot.in .factory/evidence-11/live-audit
```

No product code was modified during verification. Evidence is in `.factory/evidence-11/`.
