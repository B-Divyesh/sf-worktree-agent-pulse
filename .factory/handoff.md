# Worktree Agent Pulse — independent verification 3 handoff

## Result: FAIL

Candidate `e3a7ed67459f2631799d4dd7624d02b4f55042e4` at
`https://worktree-agent-pulse.sociobot.in` is **not release-ready**.

Fresh independent evidence is in `.factory/verification-3.md`. No product code
was changed; this handoff and the verification report are the only intended
repository changes.

## Release blockers

1. Live `/demo` renders **Reset demo** at 98×36 CSS px on a 390×844 viewport,
   below the required 44px touch height.
2. An Intel macOS browser receives the ARM64 DMG. The site and `install.sh`
   choose the first `.dmg` without architecture detection.
3. `/privacy` says saved repositories can be removed in the app, but the app
   has no removal control or storage-delete implementation.
4. Public promises about exact terminal opening, installer checksum
   verification, native no-telemetry behavior, and repository deletion are not
   listed and tested in `.factory/claims.json`.

Additional defects: the native bundled sample offers a real terminal action
for a fictional path and shows misleading recovery text; unknown URLs render a
designed 404 with HTTP 200; essential mobile board text computes to
10.4–13.28px.

## What passed

- The cold first screen clearly explains what Pulse does, for whom, and what to
  click first. The one-click sample action is visible at desktop and 390px.
- All 12 declared claim commands pass after the documented Node and Linux Tauri
  prerequisites are installed.
- `npm test`: 4 unit and 38 browser tests passed.
- `npm run build`: passed; `dist/site` produced.
- Rust format, warning-as-error clippy, and all 4 Rust tests passed.
- Exact Tauri DEB build passed; clean extracted candidate and release packages
  launched under Xvfb with no missing libraries.
- Live static assets match the candidate build byte-for-byte.
- Normal live routes have no console/page errors or axe serious/critical
  findings. Keyboard, focus, reduced motion, privacy isolation, service-worker
  update, and offline demo reload passed.
- Mobile Lighthouse: 94 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1,579ms and CLS 0.
- License API rate limit: first 429 at request 31, `Retry-After: 3`.
- Live Dodo checkout shows Pulse Pro at $19.00.
- Release `v0.1.4` has macOS ARM64/x64, Windows x64, Linux AppImage/DEB,
  checksums, and a valid manifest; a downloaded DEB matched `SHA256SUMS`.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri build -- --bundles deb
npm run test:checkout
```

Linux native checks require the packages declared by
`.github/workflows/release.yml`.

## Next steps

Fix all four release blockers, add regressions for the missed demo and macOS
paths, deploy the new static build, publish desktop artifacts from the repaired
candidate, and request independent verification 4. Signing still needs the
operator's Apple and Windows certificates.
