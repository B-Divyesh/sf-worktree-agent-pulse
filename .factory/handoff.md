# Worktree Agent Pulse — repair 10 handoff

Date: 2026-08-30

Repair target: verifier report at `0b60c4f5b651c8e4b901af7f4a52177ec4fdb852`

Reviewed product candidate: `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`

## What changed

### Release-blocking verifier findings

1. **Bad requested SHA record** — the report's `d174d2ed7539161d1aa2cba8860e5fcdf15b7301` cannot be resolved locally or at GitHub and cannot safely be fabricated. The actual work-order candidate, `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`, resolves and is the reviewed base. The repair is published from a real tag/source commit; the post-release evidence below records it.
2. **Intermittent Lighthouse TBT** — removed the full-viewport masked grid and sticky `backdrop-filter`, retained the commit-lattice character with a light CSS grid, and contained deferred below-the-fold sections. `npm run test:lighthouse` now runs **three independent cold mobile samples** and requires every sample to meet the unchanged score, TBT, LCP, and CLS gates. This is regression coverage, not a relaxed threshold.
3. **Desktop artifacts were older than the reviewed source** — advanced all package surfaces to `0.1.12` (`package.json`, Tauri config, Cargo manifest/lock, UI version) and updated the release-provenance claim and live check to require `v0.1.12`. The tag-triggered matrix builds five artifacts and publishes their checksums, manifest, and signing evidence.
4. **Mutable web build identity** — Vite now injects an immutable 40-character commit for every build. CI may provide `VITE_BUILD_SOURCE_COMMIT`; local builds read `git rev-parse HEAD`; invalid/missing values fail the build. There is no `local-development` fallback. `npm run test:build-identity` and a browser test assert the emitted bundle and rendered `#app[data-build-source]` expose an immutable commit.

The service-worker cache was advanced to `worktree-agent-pulse-v5` so an updated build receives a clean offline shell. The exact offline demo regression now checks that cache name and reloads the five-worktree board without a network connection.

## Local verification

Run from a clean Node install:

```sh
npm ci
npm test
npm run build
npm run test:build-output
npm run test:build-identity
npm run test:lighthouse .factory/repair-10-evidence/lighthouse-mobile.json
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed before release publication:

- `npm ci`: PASS — 106 packages, 0 vulnerabilities.
- `npm test`: PASS — 21 Vitest tests and 72 Playwright checks. Both desktop and 390 px projects cover keyboard drawer focus/Escape restoration, mobile route history, 44 px targets, 200% reflow, demo isolation, offline reload, request privacy, and serious/critical Axe findings.
- `npm run build`: PASS — TypeScript and Vite production build to `dist/site`.
- `npm run test:build-output`: PASS — 40,701 bytes raw JavaScript.
- `npm run test:build-identity`: PASS — a fixture build embeds a 40-character commit and contains no development fallback.
- `npm run test:lighthouse`: PASS — cold samples: TBT 0/0/0 ms; LCP 2,190/2,257/1,659 ms; performance 99/98/100; accessibility 100 on every sample. JSON evidence: `.factory/repair-10-evidence/lighthouse-mobile.{1,2,3}.json`.
- Native Rust: PASS — 7 tests, `cargo fmt --check`, and Clippy with warnings denied. The disposable container initially lacked Linux Tauri headers; installing the same `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf` prerequisites used by the release workflow resolved that host setup issue.
- Linux consumer package: PASS — `CI=true VITE_BUILD_SOURCE_COMMIT=<base SHA> npm run tauri -- build --bundles deb` produced `Worktree Agent Pulse_0.1.12_amd64.deb` (2,476,312 bytes); `dpkg-deb --info` reports version `0.1.12` and the installed executable.
- Local production `verify-url.sh`: PASS — HTTP 200; title, language, single H1, main landmark, image alt coverage, and zero browser console/page errors. Evidence: `.factory/repair-10-evidence/verify-url/`.
- Playwright Axe integration: PASS — no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or the real 404 in desktop and 390 px projects. The standalone `@axe-core/cli` was also attempted, but its Selenium Chrome driver exits before navigation in this container; the installed Playwright Chromium and the project’s Axe integration run successfully.
- Response policy: `public/staticwebapp.config.json` retains CSP `frame-ancestors 'none'` as a response header, same-origin default `connect-src`, explicit GitHub/Sociobot allowlists, `nosniff`, strict referrer policy, and denied camera/microphone/geolocation.
- Live billing/release baseline: `npm run test:checkout` passed with a redacted Dodo HTTPS 303; `npm run test:signing-status` and `npm run test:release-provenance -- v0.1.11` passed for the prior published baseline.

## Release and deployment evidence

The final `v0.1.12` artifact, checksum, manifest, signing, static deployment, and live verification evidence are appended after the tag workflow completes. The release must be built from the repair tag's source commit; do not substitute an older release or an unresolvable SHA.

## Known gaps / operator action

- macOS and Windows releases remain intentionally unsigned and disclose that before download. If signing is required later, the release workflow needs owner-managed `APPLE_CERTIFICATE`/notarization credentials and `WINDOWS_CERT_PFX`; no signing credentials are stored in this repository.
- No telemetry, analytics, crash reporting, or runtime AI endpoint is present.
