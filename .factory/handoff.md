# Worktree Agent Pulse — release provenance repair

Date: 2026-08-29
Work order: `worktree-agent-pulse-repair-5`
Release: `v0.1.6` (published from this tagged repair commit)
Live URL: <https://worktree-agent-pulse.sociobot.in>

## Repair

Verification 5's failure was reproduced before the repair with:

```sh
npm run test:release-provenance -- v0.1.5 debdba854e60249b53e0bf7e0f85ab914981e3f4
```

It failed as required: GitHub reported `v0.1.5` targeting
`b21ff9547349ef3264d8cdb99320dd503d51be63`, not the candidate webview commit.

`v0.1.6` fixes that identity gap. The release workflow checks out the exact tag
commit, injects that commit into the bundled WebView, and writes it as
`source_commit` in `latest.json`. It refuses to write metadata if any advertised
macOS ARM64/x64 DMG, Windows installer, Linux AppImage, or Debian package is
missing. `SHA256SUMS` and `latest.json` are uploaded only after all matrix builds
finish.

`npm run test:release-provenance -- v0.1.6` is the regression and release gate.
It resolves the local tag commit, verifies GitHub's release target and
`latest.json.source_commit`, then downloads and SHA-256 checks both DMGs, the
Windows installer, AppImage, and DEB. The fixture unit tests cover the metadata
shape and missing-platform rejection.

## Local verification before publish

- `npm ci` completed with 0 audit vulnerabilities.
- `npm test` passed: 14 Vitest tests and 48 Playwright checks across desktop and
  390×844 mobile, including keyboard, route, demo privacy, offline service
  worker, reduced-motion, accessibility, and checkout coverage.
- `npm run build` passed. The deployable static site is `dist/site`; main JS is
  31.54 KB raw / 10.39 KB gzip and CSS is 24.37 KB raw / 5.93 KB gzip.
- After installing the exact release-workflow Linux prerequisites,
  `cargo test --manifest-path src-tauri/Cargo.toml`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `CI=true npm run tauri -- build --bundles deb` passed. The local consumer
  package is `Worktree Agent Pulse_0.1.6_amd64.deb`, package version `0.1.6`,
  SHA-256 `0de6a181a2caf4e65b48f1c987bcfa820babea8855e2a678bc317a7e94eef148`.

## Publish and deploy verification

After pushing the tag, run the exact provenance gate above and verify the
matching static build is deployed with `VITE_BUILD_SOURCE_COMMIT` set to the
tag's commit. The release workflow is the cross-platform builder; it produces
the unsigned macOS DMGs, Windows NSIS installer, Linux AppImage, and DEB. No
signing credentials are configured. Operator signing secrets, if later needed,
are `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
