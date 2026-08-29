# Worktree Agent Pulse — repair 7 handoff

Date: 2026-08-29

Base verified candidate: `3e7918193ef353c84cf277577b830d0c45f62282`

Repair commit: `5bc7c15f01fe352b4bf4ea4c658e651782c062d8`

Release: [`v0.1.9`](https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.9)

Live site: <https://worktree-agent-pulse.sociobot.in>

## Repaired release blockers

1. **Unverified licenses no longer activate Pulse Pro.** `src/license.ts` now
   treats a token and a verified verdict as separate states. A license is
   active only when a token-matched cached verdict is `valid: true` and has
   not expired. Return URLs clear any old verdict before storing a new token.
   Network errors and HTTP 429 keep uncached tokens locked; a previously valid,
   unexpired verdict is the only offline fallback.
2. **The 390px board now reflows at 200% text.** Mobile rows use a single
   column, and worktree names, branch identifiers, repository paths, and
   drawer headings wrap instead of truncating. There is no horizontal overflow.
3. **Walkthrough captures are lazy-loaded** below the fold.

New exact browser claim coverage:

- `@claim:license-uncached-network-lock` aborts the first verification, reloads
  offline, and requires the Buy action with no active verdict.
- `@claim:license-uncached-rate-limit-lock` returns HTTP 429 and requires the
  same locked state.

The accessibility suite now covers all public routes at 390px/200% text plus
all board and open-drawer identifiers.

## Verification

### Clean install, build, tests, and package

- `npm ci`: passed with Node `v22.23.2`; 106 packages and zero audit
  vulnerabilities.
- `npm test`: passed — 21 Vitest tests and 64 Playwright tests across desktop
  Chromium and 390px mobile Chromium.
- All 31 manifest commands in `.factory/claims.json` passed. After publishing
  the patch release, the final provenance command
  `npm run test:release-provenance -- v0.1.9 5bc7c15f01fe352b4bf4ea4c658e651782c062d8`
  also passed.
- `npm run build`: passed. `dist/site` contains 39,754 bytes of raw JavaScript
  (11.42 KB gzip) and 25,040 bytes of CSS (6.04 KB gzip).
- Installed the documented clean-worker Tauri prerequisites:
  `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 7 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`:
  passed.
- `CI=true VITE_BUILD_SOURCE_COMMIT=5bc7c15f01fe352b4bf4ea4c658e651782c062d8 npm run tauri -- build --bundles deb`:
  passed. The local package is
  `Worktree Agent Pulse_0.1.9_amd64.deb`, SHA-256
  `e2354a660f89764dd8b34aa446d0890997aa7a5b356db42eaad2af031ba01441`.
  Fresh extraction found no missing `ldd` dependencies; the extracted app
  stayed alive for an eight-second Xvfb smoke run.

### Published desktop release

- GitHub Actions release run
  [`33272885314`](https://github.com/B-Divyesh/sf-worktree-agent-pulse/actions/runs/33272885314)
  completed successfully for macOS arm64, macOS x64, Windows, Linux AppImage,
  Linux Debian, checksums, `latest.json`, and signing evidence.
- `v0.1.9` targets `5bc7c15…`; the provenance test downloaded and validated all
  five advertised desktop artifacts against `SHA256SUMS`.
- `npm run test:signing-status` passed. macOS and Windows builds remain
  intentionally unsigned and are disclosed on the site and in the README.

### Live site, accessibility, privacy, and update checks

- Deployed the static build with
  `/opt/fleet/lib/deploy-static.sh worktree-agent-pulse /work/repo/dist/site`.
  The deployed main asset `assets/main-CLzlZuAS.js` has matching local and live
  SHA-256 `806fbd6083b3669d0c3ac631ab4b7fa1f1c7afb41d81530e695d2fdbe6c795a1`.
- The worker verifier passed at the live URL: HTTPS 200, zero console errors,
  title/lang/main/one-h1 checks, complete image alt text, and labeled buttons.
  Its screenshots and JSON are in `.factory/repair-7-evidence/`.
- Live Playwright + AxeBuilder checks passed on `/`, `/demo`, `/privacy`, and
  `/terms`: every route returned 200, had zero serious/critical violations,
  and had zero console errors. The live 390px/200% check measured every sample
  board identifier at 294px scroll/client width and every drawer value at
  286px scroll/client width, so none was clipped.
- The exact live network-failure and 429 license flows each made one mocked
  verification attempt, showed the Buy action, stored no verdict, and never
  showed active Pro. The network-failure case also remained locked after an
  offline reload.
- The service worker reached `activated`, controlled the page, and preserved
  all five sample rows on a live offline `/demo` reload.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, denied
  camera/microphone/geolocation, and the expected CSP. `/`, `/demo`,
  `/privacy`, and `/terms` return 200; a missing route returns 404.
- A live Linux download check selected the real `v0.1.9` AppImage with no
  console error.
- Mobile Lighthouse: Performance 95, Accessibility 100, Best Practices 100,
  SEO 100. JSON evidence is
  `.factory/repair-7-evidence/lighthouse-mobile.json`.
- `@axe-core/cli` was attempted. Its bundled ChromeDriver targets Chrome 152
  while the supplied Playwright Chromium is 145, so the CLI could not start a
  matching WebDriver session. The product was instead audited live with the
  repository's pinned `@axe-core/playwright` 4.10.2 integration; all four
  routes passed with zero serious/critical findings.

## How to run

```sh
npm ci
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

For the desktop app, install the Linux Tauri prerequisites above and run
`npm run tauri dev`. The deployable static site is `dist/site`.

## Known gaps and next steps

No known product gaps from verification 7 remain. The current macOS and
Windows releases are unsigned by design; users must follow the documented
checksum and operating-system install steps.
