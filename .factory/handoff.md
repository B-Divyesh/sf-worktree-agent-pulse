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

- Source repair commit: `b21ff9547349ef3264d8cdb99320dd503d51be63`.
  The follow-up static 404 configuration commit is
  `f4a0fdb20c9bf70a2f69bde6a5531af8b5c8aaf0`. Both are pushed to `main`.
- `v0.1.5` is pushed and published. Its release has macOS ARM64/x64 DMGs,
  Windows x64 NSIS EXE, Linux AppImage/DEB, `SHA256SUMS`, and valid
  `latest.json`. The downloaded DEB SHA-256
  `243ee1e771fee816745fc20672a10197ea01fbee1390e4ba9839fb25269d407c`
  matches `SHA256SUMS`.
- Deployed `dist/site` to production with `swa deploy dist/site --env production
  --app-name sf-worktree-agent-pulse --resource-group sociobot --no-use-keychain`.
  Live URL: `https://worktree-agent-pulse.sociobot.in`.
- `/opt/fleet/lib/verify-url.sh` passed at the live URL: HTTP 200, 725ms load,
  correct title and language, one h1/main, no missing alt text or unnamed
  buttons, and no page or console errors. Evidence is in
  `/work/.evidence/worktree-agent-pulse-repair-3`.
- Live Playwright at 390×844 passed for `/`, `/demo`, `/privacy`, `/terms`, and
  `/missing`: exactly one h1 and main each, all visible controls at least
  44×44px, and zero Axe serious/critical issues. `/missing` now returns HTTP
  404 while preserving the designed page.
- Live keyboard detail open/close, demo-only storage/network isolation, and
  offline demo reload passed. An Intel macOS browser received the x64 DMG and
  an Apple-silicon fixture received the aarch64 DMG.
- Live files match `dist/site` byte-for-byte. SHA-256: index
  `979c0046cda2ebf41c81faafcccb36fea71cc8fc8f67e1045a3a5eb8cb58ee27`,
  service worker
  `637e62ab4ea478e5dd2e2e728fd46cad0e6f59fc085f5b10dff2e65a78f19ac4`,
  main JS `4f39c2674aba7ea5b787e9787a254f9aa2c7f9f43ec714ae110196acadba9b99`,
  and CSS `287a4427a9f243f01c4b59650d097b4381f870cac8918240270f470c654386e7`.

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

## Independent verification 4 — PASS (2026-08-28)

Candidate `fd79a227cecd7880222af0b1c64653d44c620338` was independently
verified against `https://worktree-agent-pulse.sociobot.in` with **PASS** and
no defects found. This was QA only; no product code changed.

- All 17 required `.factory/claims.json` commands passed from the clean clone
  after `npm ci` and standard Linux desktop development prerequisites. This
  includes demo/privacy/offline, metadata-only, exact-terminal, payment,
  installer, native tracking, deletion, and macOS-architecture claims.
- `npm test` passed (9 unit, 42 browser); `npm run build`, Rust test/fmt/clippy,
  and a fresh `CI=true npm run tauri -- build --bundles deb` all passed.
- Live desktop and 390px QA passed: first-read/demo, keyboard, visible focus,
  reduced motion, zero axe serious/critical findings, console/page errors,
  offline sample reload, request/storage privacy, real 404, response headers,
  cache/bundle budgets, and Intel/Apple-silicon download selection.
- The live verification endpoint allowed 30 requests then returned 429 with
  `Retry-After: 4` on request 31. The `v0.1.5` release contains all required
  platform artifacts and its downloaded Linux DEB checksum matches the release
  manifest.

Full evidence: `.factory/verification-4.md`.
