# Independent verification 4 — PASS

- Candidate commit: `fd79a227cecd7880222af0b1c64653d44c620338`
- Live URL: `https://worktree-agent-pulse.sociobot.in`
- Verified: 2026-08-28 from a clean checkout
- Verdict: **PASS** — no release-blocking defects found.

No product code was changed. Linux desktop development prerequisites were
installed in the disposable verifier container before Rust/Tauri checks.

## Required first-read gate — PASS

A cold, storage-free live visit at 1440×900 showed the headline **“Catch
blocked agents before branches drift.”** The next sentence says it is for
developers running several CLI agents and gives them one view of worktree
activity and Git risk. The immediately visible first action is **“Try it with
sample data”**, with **“Loads five worktrees. Nothing is saved.”** beside it.
It opens `/demo` in one click. This plainly answers what it does, for whom, and
what to do first; the required sample demo exists.

## Mandatory claims gate — PASS

`.factory/claims.json` exists and has 17 entries. Every exact command was run
against the shipped demo/test entry point after `npm ci`; all passed.

| Claim | Result |
| --- | --- |
| `sample-five`, `attention`, `first-screen-demo`, `demo-private`, `offline-demo`, `free-price`, `no-account`, `site-network`, `license-local`, `mac-download-architecture` | Each exact `npm run test:e2e -- --grep @claim:…` command passed in desktop and 390px Chromium (2 passed each). |
| `metadata-only`, `exact-terminal-path` | Each exact Cargo claim command passed (1 Rust test each). The metadata test uses content canaries and preserves Git/file state; the terminal test asserts the selected worktree working directory. |
| `pro-capacity-refresh`, `installer-checksum`, `native-no-tracking`, `repository-delete` | Each exact Vitest claim command passed (1 matching test each). |
| `checkout-live` | `npm run test:checkout` passed: HTTP 303 to an HTTPS Dodo checkout session. |

## Local quality and desktop package — PASS

- `npm ci`: passed; audit reported 0 vulnerabilities.
- `npm test`: passed — 9 Vitest tests and 42 Playwright tests.
- `npm run build`: passed, including `tsc --noEmit`; `dist/site` was produced.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 6 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` and `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `CI=true npm run tauri -- build --bundles deb`: passed; produced `Worktree Agent Pulse_0.1.5_amd64.deb` (1,955,924 bytes).
- The DEB was extracted to a fresh temporary consumer directory: `ldd` reported no missing libraries and the executable stayed alive under Xvfb for eight seconds (expected `timeout` status 124). The only output was the expected headless DRI/session-bus warning.

## Fresh live product QA — PASS

- `/`, `/demo`, `/privacy`, `/terms`, and `/missing` at desktop and 390×844 each had one `<h1>` and one `<main>`; `/missing` returned HTTP 404. All visible links/buttons on mobile measured at least 44×44px and there was no horizontal overflow.
- `verify-url.sh` passed: HTTP 200, 1,055ms load, title/lang/main/h1/alt/label checks, no browser console or page errors.
- Fresh axe scans at 390px found zero serious or critical violations on all five routes.
- Keyboard-only demo use passed: focus reached a worktree, Enter opened its details, and Escape closed it. Reduced-motion emulation yielded a `0.00001s` transition duration.
- End-to-end demo behavior passed: five rows initially, four after **Needs attention**, five after **Reset demo**; a worktree detail’s preview action remained sandboxed.
- The full demo request log contained only same-origin HTML, JavaScript, CSS, and self-hosted font requests. It set no local-storage values and used only `demo:worktree-agent-pulse:repository` in session storage. A service-worker cache `worktree-agent-pulse-v3` enabled an offline `/demo` reload with five rows and no errors.
- The live Intel-macOS browser fixture received `…_x64.dmg`; Apple-silicon received `…_aarch64.dmg`.
- The single-client Sociobot verification endpoint allowed 30 requests; request 31 returned HTTP 429 with `Retry-After: 4` (5/35 responses were 429). No sign-in exists, so the Entra requirement is not applicable.

## Deployment, privacy, performance, and release — PASS

- Fresh production assets matched the candidate’s production build byte-for-byte: `index.html`, `sw.js`, both installer scripts, hero/social art, main JS, and CSS. Main JS is 29,711 bytes raw / 10.00KB gzip; CSS is 23,452 bytes raw / 5.77KB gzip; hero art is 63,848 bytes. These pass the stated static budgets.
- Live headers include CSP restricted to self plus GitHub/Sociobot APIs, HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and immutable caching for hashed assets. The initial cold landing request made no cross-origin request.
- GitHub Release `v0.1.5` has ARM64/x64 macOS DMGs, Windows x64 EXE, Linux AppImage and DEB, `SHA256SUMS`, and valid `latest.json`. Downloaded DEB SHA-256 was `243ee1e771fee816745fc20672a10197ea01fbee1390e4ba9839fb25269d407c`, matching `SHA256SUMS`.
- The release tag points to `b21ff9547349ef3264d8cdb99320dd503d51be63`; the candidate’s later changes are static 404 configuration, a related test, ignore rules, and documentation. Its live static deployment matches the candidate exactly; no desktop source changed after the tagged desktop build.

## Defects by severity

None found.
