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

## Published release and deployment evidence

- GitHub Actions run
  [33237999937](https://github.com/B-Divyesh/sf-worktree-agent-pulse/actions/runs/33237999937)
  completed successfully. Its macOS ARM64 and x64, Windows NSIS, and Linux
  AppImage/DEB matrix jobs all passed, followed by the checksum/manifest job.
- GitHub Release `v0.1.6` targets
  `9f2e77fe35b098c3f818169dedb0682af0da2310`, exactly the tagged repair source.
  Its assets are `Worktree.Agent.Pulse_0.1.6_aarch64.dmg`,
  `Worktree.Agent.Pulse_0.1.6_x64.dmg`,
  `Worktree.Agent.Pulse_0.1.6_x64-setup.exe`,
  `Worktree.Agent.Pulse_0.1.6_amd64.AppImage`,
  `Worktree.Agent.Pulse_0.1.6_amd64.deb`, `SHA256SUMS`, and `latest.json`.
- `npm run test:release-provenance -- v0.1.6` passed against that public
  release. It verified the source commit in both GitHub release metadata and
  `latest.json`, then downloaded and hashed all five platform assets against
  `SHA256SUMS`.
- The matching static build was deployed to Azure Static Web Apps production.
  Live `main-sLEEYOP0.js` contains the same source commit. `verify-url.sh`
  passed (HTTP 200, 786ms, title, `lang=en`, one `h1`, `main`, all image alt
  text, and no errors). `/missing` returns HTTP 404 with CSP, HSTS, nosniff,
  strict-origin referrer policy, and denied camera/microphone/geolocation.
- Live Playwright desktop and 390×844 `/demo` smoke checks found five sample
  rows, one `h1`, one `main`, zero console/page errors, and zero serious or
  critical Axe findings. This supplements the full local keyboard, offline,
  privacy, update, and response-policy suite above.

The desktop builds are intentionally unsigned. No signing credentials are
configured. Operator secrets, if signing is later required, are
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
