# Worktree Agent Pulse — repair 10 handoff

> ## Independent verification 12 verdict — **FAIL** (2026-08-30)
>
> Candidate `ad42962c171af8abff1878ac6ce19be94d8bc570` and live site `https://worktree-agent-pulse.sociobot.in` were independently checked. Do not release this candidate.
>
> - **P0 checkout:** `npm run test:checkout` and three direct probes of the advertised Sociobot checkout endpoint returned HTTP 500, not the required Dodo 303 redirect.
> - **P0 performance:** `npm run test:lighthouse` failed its first cold mobile sample at 222.7328 ms total blocking time (hard limit: under 200 ms).
>
> Otherwise the full unit/browser/native suites, native Debian production build, demo isolation/offline behavior, accessibility checks, headers, rate limit, and release provenance passed. See `.factory/verification-12.md` and `.factory/verification-12-evidence/` for exact commands and evidence.

Date: 2026-08-30

Repair target: verifier report at `0b60c4f5b651c8e4b901af7f4a52177ec4fdb852`

Reviewed product candidate: `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`

## What changed

### Release-blocking verifier findings

1. **Bad requested SHA record** — the report's `d174d2ed7539161d1aa2cba8860e5fcdf15b7301` cannot be resolved locally or at GitHub and cannot safely be fabricated. The actual work-order candidate, `d174d2614ff9aaf31684d6b5eb21bbb8a9dd3a3e`, resolves and is the reviewed base. The repair is published from a real tag/source commit; the post-release evidence below records it.
2. **Intermittent Lighthouse TBT** — removed the full-viewport masked grid and sticky `backdrop-filter`, retained the commit-lattice character with a light CSS grid, and contained deferred below-the-fold sections. `npm run test:lighthouse` now runs **three independent cold mobile samples** and requires every sample to meet the unchanged score, TBT, LCP, and CLS gates. This is regression coverage, not a relaxed threshold.
3. **Desktop artifacts were older than the reviewed source** — advanced all package surfaces to `0.1.13` (`package.json`, Tauri config, Cargo manifest/lock, UI version) and updated the release-provenance claim and live check to require `v0.1.13`. The tag-triggered matrix builds five artifacts and publishes their checksums, manifest, and signing evidence. The first repaired tag exposed a Windows-only Actions shell mismatch: PowerShell did not populate `$GITHUB_OUTPUT` from Bash syntax, so the source SHA was empty. The release workflow now declares `shell: bash` for that source step, and the final `v0.1.13` matrix passed on all four runners.
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
- `npm run test:lighthouse`: PASS — final cold samples: performance 99/99/99; accessibility, best practices, and SEO 100/100/100; TBT 0/0/0 ms; LCP 2,182/2,182/1,811 ms; CLS 0.0168 on every sample. JSON evidence: `.factory/repair-10-evidence/lighthouse-mobile.{1,2,3}.json`.
- Native Rust: PASS — 7 tests, `cargo fmt --check`, and Clippy with warnings denied. The disposable container initially lacked Linux Tauri headers; installing the same `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf` prerequisites used by the release workflow resolved that host setup issue.
- Linux consumer package: PASS — `CI=true VITE_BUILD_SOURCE_COMMIT=558dbe87daed69bab7f064b46bdfc0ccc45b3e91 npm run tauri -- build --bundles deb` produced `Worktree Agent Pulse_0.1.13_amd64.deb` (2,476,656 bytes); `dpkg-deb --info` reports package `worktree-agent-pulse`, version `0.1.13`, architecture `amd64`, and the installed `usr/bin/worktree-agent-pulse` executable.
- Local production `verify-url.sh`: PASS — HTTP 200; title, language, single H1, main landmark, image alt coverage, and zero browser console/page errors. Evidence: `.factory/repair-10-evidence/verify-url/`.
- Playwright Axe integration: PASS — no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, or the real 404 in desktop and 390 px projects. The standalone `@axe-core/cli` was also attempted, but its Selenium Chrome driver exits before navigation in this container; the installed Playwright Chromium and the project’s Axe integration run successfully.
- Response policy: `public/staticwebapp.config.json` retains CSP `frame-ancestors 'none'` as a response header, same-origin default `connect-src`, explicit GitHub/Sociobot allowlists, `nosniff`, strict referrer policy, and denied camera/microphone/geolocation.
- Live billing/release baseline: `npm run test:checkout` passed with a redacted Dodo HTTPS 303; `npm run test:signing-status` and `npm run test:release-provenance -- v0.1.11` passed for the prior published baseline.

## Release and deployment evidence

- **Published desktop release:** [`v0.1.13`](https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/tag/v0.1.13), source commit `558dbe87daed69bab7f064b46bdfc0ccc45b3e91`. The successful four-platform matrix and checksum job are recorded at <https://github.com/B-Divyesh/sf-worktree-agent-pulse/actions/runs/33290067899>.
- **Artifacts:** `Worktree.Agent.Pulse_0.1.13_aarch64.dmg`, `Worktree.Agent.Pulse_0.1.13_x64.dmg`, `Worktree.Agent.Pulse_0.1.13_x64-setup.exe`, `Worktree.Agent.Pulse_0.1.13_amd64.AppImage`, and `Worktree.Agent.Pulse_0.1.13_amd64.deb`, plus `SHA256SUMS`, `latest.json`, and `signing-status.json`.
- **Artifact provenance and integrity:** PASS — `npm run test:release-provenance -- v0.1.13` verified the release source commit and all five checksummed artifacts. `npm run test:signing-status` passed against runner-generated macOS/Windows status evidence.
- **Static deployment:** deployed `dist/site` with `VITE_BUILD_SOURCE_COMMIT=558dbe87daed69bab7f064b46bdfc0ccc45b3e91` to <https://worktree-agent-pulse.sociobot.in>. The live bundle embeds exactly that SHA in `#app[data-build-source]`; it contains no `local-development` fallback.
- **Live browser verification:** PASS — `node scripts/verify-live.mjs https://worktree-agent-pulse.sociobot.in .factory/repair-10-evidence/live-audit` at 2026-08-30T03:27:38Z checked landing, demo, Privacy, Terms, 404, desktop keyboard/drawer behavior, 390 px first screen/history, 200% reflow, target sizes, offline demo reload, same-origin demo requests, release download, license input error behavior, no browser console errors, and serious/critical Axe findings. Screenshots and `live-check.json` are retained in that evidence directory.
- **Live response policy:** PASS — `verify-url.sh` returned HTTP 200 with title/lang/single H1/main/alt coverage and zero browser errors. Headers provide HSTS, `nosniff`, strict referrer policy, denied camera/microphone/geolocation, and CSP `frame-ancestors 'none'` with only the required GitHub and Sociobot connect allowlists. Evidence: `.factory/repair-10-evidence/live-verify-url/`.
- **Live mobile Lighthouse:** PASS — three independent runs scored performance/accessibility/best-practices/SEO 100/100/100/100. TBT was 52.5/0/0 ms, LCP 1,530/1,373/1,362 ms, and CLS 0.0168 in each run. Evidence: `.factory/repair-10-evidence/lighthouse-live.{1,2,3}.json`.

## Known gaps / operator action

- macOS and Windows releases remain intentionally unsigned and disclose that before download. If signing is required later, the release workflow needs owner-managed `APPLE_CERTIFICATE`/notarization credentials and `WINDOWS_CERT_PFX`; no signing credentials are stored in this repository.
- No telemetry, analytics, crash reporting, or runtime AI endpoint is present.
