# Worktree Agent Pulse — repair 3 handoff

## Repair scope

This repair resolves every release blocker in independent verification 3
(`.factory/verification-3.md`) and also fixes its three medium-severity
defects. The desktop and static-site version is now `0.1.5`.

- The persistent demo Reset control is now 44px high. A 390×844 regression
  measures every visible link and button on `/`, `/demo`, `/privacy`, `/terms`,
  and the not-found route.
- Release selection now distinguishes `mac-x64` and `mac-arm64`. The browser
  uses high-entropy architecture data when available and a clear UA fallback;
  `install.sh` uses `uname -m`. Tests select both DMGs and exercise an Intel
  installer fixture.
- The native board now has a confirmed **Remove repository** action. It removes
  only the saved local path and never changes repository files. The privacy
  page and README describe that actual control.
- Every reported public promise now has a claims entry and tagged regression:
  macOS architecture, exact terminal path, installer checksums, no native
  tracking, and repository deletion.
- Native sample data is now a labelled preview. Its fictional paths cannot
  trigger a real terminal command; leaving the preview returns to the real
  repository chooser. Native terminal errors preserve their actual cause.
- Static Web Apps now serves the designed 404 document with HTTP 404, and
  mobile board data uses a 17px operational-text floor.

## Verification before publish

- `npm ci` — passed; 0 vulnerabilities reported.
- `npm test` — passed: 9 Vitest tests and 42 Playwright checks across desktop
  Chromium and 390×844 mobile Chromium. This includes Axe serious/critical
  checks, keyboard detail navigation, whole-site mobile target measurement,
  offline demo reload, privacy network isolation, and Intel/Apple-silicon
  release selection.
- `npm run build` — passed. `dist/site` contains the static site and designed
  `404.html`; main JS is 29.71 KB raw / 10.01 KB gzip and CSS is 23.45 KB raw /
  5.77 KB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
  — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml` — passed: 6 Rust tests,
  including the exact-terminal working-directory probe and metadata privacy
  fixture.
- `CI=true npm run tauri build -- --bundles deb` — passed. It produced
  `src-tauri/target/release/bundle/deb/Worktree Agent Pulse_0.1.5_amd64.deb`
  (1,955,952 bytes).
- An extracted DEB has no missing linked libraries and stayed alive under Xvfb
  for eight seconds (expected `timeout` exit 124).
- `npm run test:checkout` — passed: live Sociobot checkout returned HTTP 303 to
  an HTTPS Dodo checkout session.
- `npm audit --omit=dev` — passed; 0 vulnerabilities.

## Publish and production verification

The repair commit, `v0.1.5` release tag, static deployment, and live checks are
recorded below after the factory publish steps complete.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
CI=true npm run tauri build -- --bundles deb
```

The web demo is `/demo`; its sample uses only the
`demo:worktree-agent-pulse:*` session-storage namespace. The native first-run
sample is a preview and cannot open a terminal.

## Known gaps / operator action

Desktop artifacts remain unsigned. Apple notarization and Windows
Authenticode require the operator-provided `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX` secrets before signing can be added.
