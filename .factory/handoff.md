# Worktree Agent Pulse v0.1.4 repair handoff — PASS

Repair work order: `worktree-agent-pulse-repair-1`

Repair implementation commit: `73c4c70224c4c1eb7c3e4eacaafa433593749783`

Independent report repaired: `a7244b1d9df58361d23c8f425a1a1590ecdce522`

Candidate repaired: `ca6dc3dee5e95d6ad0d89b72150b8fea21d95c9c`

## Release blockers repaired

1. The advertised Pro checkout is now registered in the live Sociobot billing service. A request to `https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout` returns HTTP 303 to an HTTPS Dodo checkout session. `npm run test:checkout` is the exact live regression.
2. The hero type scale now keeps the complete sample action and its explanation above the fold. The exact claim test measures 1440×900, 1280×800, and 390×844 viewports.
3. `.factory/claims.json` now lists 12 claims. New tests cover the initial viewport, native content boundaries, Pro capacity and 10-second refresh, public-site network timing, local license handling, and the live checkout.
4. The unavailable Param Factory footer URL was removed. The attribution remains visible as text and has an accessibility regression.

The privacy root cause was also closed in the Rust core: adapter deserialization now admits only state, tool name, and time. The real-repository regression plants source, prompt, output, and terminal canaries, scans the repository, proves no canary enters serialized board data, and proves Git/file state is unchanged.

## Local verification

- `npm ci` — passed from a clean dependency tree; 0 vulnerabilities reported.
- `npm test` — passed: 4 Vitest tests and 36 Playwright tests across desktop Chromium and Chromium at 390×844.
- `npm run build` — passed; production site written to `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml` — passed: 4 Rust tests.
- `npm run test:checkout` — passed against the live API: HTTP 303 to `checkout.dodopayments.com/session/<redacted>`.
- `npm audit --omit=dev` — 0 vulnerabilities.
- `npm run tauri build -- --bundles deb` — passed. The 0.1.4 amd64 package installs a 5,180,392-byte binary with no missing shared libraries; an Xvfb consumer launch remained alive through the 8-second smoke window.
- Local DEB SHA-256: `b6860d7fad6d5b9ecc1b668b24cb780eb293d7d48596504cd81ef3a1dbfe1125`.
- Initial main JavaScript: 28,053 bytes raw / 9.56 KB gzip. CSS: 23,230 bytes raw / 5.73 KB gzip. Hero: 63,848 bytes.
- Local Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.85 s, TBT 0 ms, CLS 0.
- `.factory/copy-audit.md` has no sentence over 22 words and no banned term.

## Deployed verification

- Static deployment: `https://worktree-agent-pulse.sociobot.in` (Azure deployment `34595dcf-a78f-41fb-a38f-6238ad049565`).
- `/opt/fleet/lib/verify-url.sh` final rerun — HTTP 200 in 674 ms; correct title/lang/main; one h1; no missing alt or unnamed buttons; no console errors.
- `/`, `/demo`, `/privacy`, `/terms`, and the designed `/missing` fallback all return HTTP 200, have route-specific titles and one h1, and produce zero serious/critical Axe findings and zero console errors.
- Live CTA positions: 1440×900 action bottom 632.52 px; 1280×800 action bottom 587.08 px; 390×844 action bottom 670.75 px. Each explanation is also fully inside its viewport.
- Keyboard smoke: skip link has visible focus and targets main; Enter opens the demo; five rows load.
- Privacy smoke: zero cross-origin requests on landing. A visitor-triggered download check makes only the documented GitHub Releases API request.
- Offline/update smoke: a seeded `worktree-agent-pulse-v2` cache is removed, v3 owns the shell, and the five-row demo reloads offline.
- Response policy: HTTPS/HSTS, `nosniff`, strict referrer policy, restricted permissions policy, and the declared CSP are present.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.58 s, TBT 48 ms, CLS 0.
- Live/local SHA-256 values match for the main JavaScript (`223bda5…273a7`), CSS (`438f93f…f37d`), and service worker (`fb12516…39373`).

## Release

- Source tag: `v0.1.4`.
- GitHub Actions run `33176294109` completed successfully: macOS arm64 DMG, macOS x64 DMG, Windows x64 NSIS EXE, Linux x64 AppImage, and Linux x64 DEB.
- Published `latest.json` names v0.1.4 and has non-empty URLs for all five bundles plus `SHA256SUMS`.
- A fresh download of the published DEB passed `sha256sum -c` with SHA-256 `29d2dc70055a2e19c715b39180e658c70d2fbfef74f33d53da902a2dfacfbf0d`. Its 5,181,992-byte consumer binary has no missing shared libraries and remained alive through the 8-second Xvfb smoke window.
- The live detected-platform action resolves to the v0.1.4 Linux AppImage with no console error.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
npm run test:checkout
npm run tauri dev
```

The static build lands in `dist/site`. The one-click sandbox is `/demo`; it uses `demo:worktree-agent-pulse` in session storage and does not enter the real-data namespace.

## Known gaps

No release-blocking gap remains. Pulse does not send background notifications in v0.1.4; its tray provides Show and Quit. Linux terminal opening uses `$TERMINAL` or a known installed terminal.

## Needs operator action

- Current desktop artifacts are unsigned. Add Apple notarization and Windows Authenticode when certificates are available. The workflow expects `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` when signing is implemented.
