# Independent verification 5 — FAIL

- Candidate commit: `debdba854e60249b53e0bf7e0f85ab914981e3f4`
- Live URL: `https://worktree-agent-pulse.sociobot.in`
- Verified: 2026-08-29
- Verdict: **FAIL** — offered desktop releases do not match the candidate.

No product code was changed. This report was run from the supplied clean
checkout, first using `npm ci`, then installing the same Linux desktop
prerequisite packages declared by the release workflow before Rust/Tauri
checks.

## Required first-read gate — PASS

A storage-free live visit at desktop and 390px showed **“See blocked agents and
worktrees that need attention.”** It immediately says this is for developers
running several CLI agents who need one view of worktree activity and Git
state. The visible first action is **“Try it with sample data”**, with **“Loads
five worktrees. Nothing is saved.”** beside it. This answers what it does, for
whom, and what to click; it reaches the sandbox in one click.

## Claims gate — PASS

`.factory/claims.json` exists with 22 entries. Every listed command was
executed. All passed:

| Claim group | Evidence |
| --- | --- |
| Browser demo, privacy, offline, pricing, release-download, license, and refund claims | The exact `npm run test:e2e -- --grep @claim:…` commands passed; the complete browser suite also passed all 48 desktop/mobile checks. |
| Native metadata and terminal claims | Both exact Cargo commands passed after installation of the release workflow's Linux Tauri packages. The metadata test preserves Git/file state and rejects source/prompt/output canaries; the terminal test confirms the selected working directory. |
| Pro capacity, license daily, release availability/artifacts, installer, native tracking, repository deletion | Each exact `npm run test:unit -- -t @claim:…` command passed. |
| Checkout | `npm run test:checkout` passed: HTTP 303 to an HTTPS Dodo session. |

The bare verifier image initially lacked `glib-2.0.pc`, so the native test
commands could not compile until the documented CI prerequisites were
installed. This was an environment prerequisite, not a failed assertion.

## Local quality gates — PASS

- `npm ci`: passed; 0 audit vulnerabilities.
- `npm test`: passed — 12 Vitest and 48 Playwright tests.
- `npm run build`: passed, including `tsc --noEmit`; `dist/site` exists.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed — 6 tests.
- `CI=true npx tauri build --bundles deb`: passed and produced
  `src-tauri/target/release/bundle/deb/Worktree Agent Pulse_0.1.5_amd64.deb`.
  (The ambient `CI=1` must be normalized to `CI=true` for this Tauri CLI.)
- Build output: main JS 31.48 KB raw / 10.36 KB gzip; CSS 24.37 KB raw / 5.93
  KB gzip. Both are within the stated static budgets.

## Live product QA — PASS except identity

- Cold desktop and 390×844 live loads had one `<h1>` and one `<main>`, no
  console/page errors, zero serious/critical axe violations, and no
  cross-origin request before user action.
- Demo behavior: five rows; **Needs attention** shows 4; **Working** and
  **Clean** each show 1; selecting by keyboard then Enter opens details and
  Escape closes them; Reset returns five rows. With reduced motion, row
  animation duration was `0.00001s`.
- Demo uses only `demo:worktree-agent-pulse:repository` in session storage;
  local storage stayed empty. After a first visit, offline `/demo` reload
  retained five rows without errors.
- The download check called only
  `https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest`
  and then selected the current Linux AppImage. It logged no console errors.
- Live headers: CSP allows only self plus GitHub/Sociobot APIs, HSTS,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy, denied
  camera/microphone/geolocation, and immutable caching for hashed assets.
  `/privacy`, `/terms`, and `/demo` returned 200; an unknown route returned
  404.
- License verification rate limit: requests 1–30 returned 200; requests 31–35
  returned `429` and `Retry-After: 4`. There is no product-owned sign-in flow.

## Release identity — FAIL

The live static site itself matches a fresh candidate build: its
`main-D3XZNici.js` and `main-8yF4jZyI.css` hashes are the candidate output.
However, GitHub Releases API reports the advertised `v0.1.5` release
`target_commitish` as `b21ff9547349ef3264d8cdb99320dd503d51be63`, while this
candidate is `debdba854e60249b53e0bf7e0f85ab914981e3f4`.

The intervening candidate changes include actual Tauri webview source
(`src/main.ts`, `src/styles.css`, `index.html`) and assets/configuration, not
only documentation. Thus every downloadable desktop platform artifact is older
than the website being verified. The Linux DEB was downloaded and its SHA-256
(`243ee1e771fee816745fc20672a10197ea01fbee1390e4ba9839fb25269d407c`) matched
the release `SHA256SUMS`; it is still the wrong candidate build.

### Critical finding: stale desktop artifacts

Release `v0.1.5` must not be treated as a build of `debdba8`. Publish a new
tag/release from the candidate (or final intended commit) with all platform
artifacts, `SHA256SUMS`, and `latest.json`, then re-verify the deployment.
