# Worktree Agent Pulse — repair 2 handoff

## Release-blocking repair

Independent verification 2 (`.factory/verification-2.md`) found that visible
landing-page links at 390×844 had text-sized hit areas below the required
44×44 CSS pixels. The source was the mobile stylesheet: header, footer, and
ordinary text links had no explicit target box.

At `max-width: 620px`, every link now uses an inline-flex box with a minimum
44px inline and block size. This preserves the existing visual language while
making the full area around link text touchable. It covers the reported
wordmark, header Demo/Privacy, privacy-detail, release, and footer links, as
well as future mobile links.

`tests/e2e/accessibility.spec.ts` now has a regression that opens the landing
page at exactly 390×844 and measures every visible link and button. It requires
both width and height to be at least 44px, with the control label in failures.

## Verification

- `npm ci` — passed; 0 vulnerabilities reported.
- `npm test` — passed: 4 Vitest unit tests and 38 Playwright checks across
  desktop Chromium and 390×844 mobile Chromium. This includes keyboard detail
  open/close, Axe serious/critical checks on `/`, `/demo`, `/privacy`,
  `/terms`, and `/missing`, console errors, demo privacy, offline reload, and
  the new target-size regression.
- `npm run build` — passed; deployable static output is `dist/site`. Initial
  JavaScript is 28.05 KB raw / 9.56 KB gzip; CSS is 23.31 KB raw / 5.75 KB
  gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
  — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml` — passed: 4 Rust tests,
  including `claim_metadata_only_ignores_content_and_preserves_git_state`.
- `npm run tauri build -- --bundles deb` — passed after installing the exact
  Linux dependencies declared by `.github/workflows/release.yml`. It produced
  `src-tauri/target/release/bundle/deb/Worktree Agent Pulse_0.1.4_amd64.deb`
  (1,953,586 bytes; SHA-256
  `38e575a9c2e01d941948fef581d40124fd8a25d91243d6969297694c9b267d91`).
  The package identifies as `worktree-agent-pulse 0.1.4 amd64`; its binary has
  no missing shared-library report. An extracted-package consumer launch under
  Xvfb stayed alive for the full eight-second smoke window (expected timeout
  exit 124).
- `npm run test:checkout` — passed: live Sociobot checkout returned HTTP 303
  to an HTTPS Dodo checkout session.
- `npm audit --omit=dev` — 0 vulnerabilities.

## Deploy and live verification

- Deployed `dist/site` to production with `swa deploy dist/site --env production
  --app-name sf-worktree-agent-pulse --resource-group sociobot --no-use-keychain`.
  Live URL: `https://worktree-agent-pulse.sociobot.in`.
- `/opt/fleet/lib/verify-url.sh` — passed: HTTP 200, title, `lang="en"`, one
  main landmark, one h1, no missing image alt, no unnamed buttons, and no
  console/page errors (959ms load measurement). Evidence:
  `/work/.evidence/worktree-agent-pulse-repair-2`.
- Live `/`, `/demo`, `/privacy`, `/terms`, and `/missing` each have their
  route-specific client title, exactly one main and h1, and zero Axe
  serious/critical findings. A fresh 390×844 browser measurement found every
  visible landing link and button at least 44×44 CSS px with zero console/page
  errors.
- Live keyboard smoke passed: Enter opens a worktree detail panel and Escape
  closes it. The demo reloaded offline with all five sample worktrees.
- Live privacy check passed: the landing page made no cross-origin request;
  pressing Check download made only the documented GitHub Releases API request.
- Response policy check passed: HTTPS/HSTS, `nosniff`, strict referrer policy,
  camera/microphone/geolocation denial, and the declared CSP are present.
- Deployment identity passed: the live main JS SHA-256 is
  `951b0e8072e8b08676a9530c7ac2aebfb3e9e07241e492146e2315bd593a6c8c`
  and CSS SHA-256 is
  `19fc9aa3bc451828ba9b5afb2a05f159e0fa37f08f916f47cf2c23ea8470a253`,
  exactly matching `dist/site`.

The desktop release remains the existing v0.1.4 artifact: this repair changes
only public-site touch geometry and its browser regression, not the native
application binary.

## Run and verify

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

The one-click demo is `/demo`; it uses the separate
`demo:worktree-agent-pulse:*` session-storage namespace and reloads offline
after its first visit.

## Known gaps / operator action

No known release-blocking gaps remain. The desktop packages are unsigned;
Apple notarization and Windows Authenticode need the operator-provided
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets before signing is added.
