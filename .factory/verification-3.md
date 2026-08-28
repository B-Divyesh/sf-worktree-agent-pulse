# Independent verification 3 — FAIL

- Candidate commit: `e3a7ed67459f2631799d4dd7624d02b4f55042e4`
- Live URL: `https://worktree-agent-pulse.sociobot.in`
- Verified: 2026-08-28 from a clean checkout
- Product release checked: GitHub Release `v0.1.4`
- Verdict: **FAIL — release-blocking accessibility, installer, privacy, and claims-contract defects remain.**

No product code was changed during this verification.

## First read — PASS

On a cold live visit, the first screen says **“Catch blocked agents before
branches drift.”** It identifies the audience as developers running several CLI
agents and says the board shows worktree activity and Git risk. The first action
is **“Try it with sample data”**, beside **“Loads five worktrees. Nothing is
saved.”** The action opens the working `/demo` board in one click.

The action and explanation were fully inside the live viewport at 1440×900,
1280×800, and 390×844. At 390×844 their bottoms were 671.75px and 708.09px,
respectively. The mandatory first-read gate therefore passes.

## Release-blocking findings

### High — the demo's Reset control is below the mobile touch-target minimum

At 390×844 on the live `/demo` route, **Reset demo** measures **98×36 CSS px**.
The contract requires every touch target to be at least 44×44px. Opening a
worktree detail and remeasuring every visible control produced the same sole
undersized control. The source explicitly sets `.demo-banner button` to a
36px minimum height. The landing-only regression added after verification 2
does not cover `/demo`, so it missed this defect.

### High — Intel macOS visitors receive the ARM64 build

A fresh browser using an Intel macOS user agent showed **Install for macOS**.
After **Check download for macOS**, the live link was:

```text
https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases/download/v0.1.4/Worktree.Agent.Pulse_0.1.4_aarch64.dmg
```

The release also contains the required x64 DMG, but `detectPlatform()` records
only `mac`, and `findAsset()` chooses the first `.dmg`. The shell installer uses
the same first-`.dmg` rule. The current GitHub API asset order puts the ARM64
DMG first. Therefore both advertised one-step macOS paths install an
incompatible artifact on Intel Macs. Windows x64 and Linux x64 selected the
expected EXE and AppImage.

### High — the privacy page promises an in-app deletion feature that does not exist

The live privacy page says **“Remove saved repositories in the app or clear the
app's local storage.”** There is no remove-repository control or implementation.
The desktop UI exposes Refresh, License, and Add repository; storage code only
loads and appends paths to `pulse:repositories`. This is a false privacy/user
control statement for sensitive local repository paths. Clearing WebView
storage outside the app is the only implemented removal path.

### High — public claims are absent from `.factory/claims.json`

The claims contract says every statement a visitor can rely on must be listed
and tested, and that an unlisted claim fails review. The manifest has 12 valid
entries, but at least these public claims are not entries:

- README and landing: selecting a row opens the exact worktree in a terminal.
- README: the one-line installers verify SHA-256 before opening or installing.
- Privacy page: Pulse has no analytics or crash tracking.
- Privacy page: saved repositories can be removed in the app; this claim is
  also false as described above.

The Rust metadata claim does not exercise terminal launching, and no tagged
claim covers installer integrity, native telemetry, or repository deletion.

## Other findings

### Medium — the native sample offers an action that must fail, then reports the wrong cause

The packaged desktop app's first-run **Load sample project** action works and
shows five bundled worktrees. Selecting `checkout-retry` then presents **Open
this terminal** for the fictional path
`/Users/mira/Code/northstar-checkout-retry`. On Linux, clicking it produced:

```text
The terminal did not open.
Set your default terminal and try again.
```

The real cause is that the sample path does not exist. The native sample is
rendered as normal native mode rather than a labelled demo/preview mode, so it
invokes the real terminal command and converts Tauri's string rejection to the
generic, incorrect recovery advice. The web demo correctly says **Preview
terminal action** and announces the simulated result.

### Medium — the designed 404 page is served with HTTP 200

`GET` and `HEAD /missing` return HTTP 200 while the client renders **“This branch
ends here.”** The Static Web Apps configuration has a navigation fallback but
no 404 response override. This is a soft 404 and does not meet the required real
404 response behavior.

### Medium — primary mobile board data is rendered far below the typography floor

At 390px, key demo text computes to 10.4–13.28px: branch names are 10.88px,
Git metrics are 10.4px, scan time is 10.88px, and demo actions are 13.28px.
These are operational values users must scan and fall below the supplied mobile
text baseline. There was no clipping or page-level horizontal overflow, and
axe found no contrast failure.

## Mandatory claims gate

`.factory/claims.json` exists and contains 12 entries, each with one tagged
test. I invoked every exact command before broader QA as instructed. On the
literal pre-install invocation, ten JavaScript commands could not start because
the clean clone had no `node_modules`; the Rust command could not compile
because the verifier image lacked GLib/WebKit development packages; the live
checkout command passed. After `npm ci` and the exact Linux prerequisites in
the repository's release workflow were installed, every exact claim command
passed. The final claim results are:

| Claim | Exact command | Fresh result |
| --- | --- | --- |
| `sample-five` | `npm run test:e2e -- --grep @claim:sample-five` | 2 passed |
| `attention` | `npm run test:e2e -- --grep @claim:attention` | 2 passed |
| `first-screen-demo` | `npm run test:e2e -- --grep @claim:first-screen-demo` | 2 passed; desktop and 390px |
| `demo-private` | `npm run test:e2e -- --grep @claim:demo-private` | 2 passed |
| `offline-demo` | `npm run test:e2e -- --grep @claim:offline-demo` | 2 passed |
| `metadata-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only -- --nocapture` | 1 passed; content canaries absent and Git/file state preserved |
| `free-price` | `npm run test:e2e -- --grep @claim:free-price` | 2 passed |
| `no-account` | `npm run test:e2e -- --grep @claim:no-account` | 2 passed |
| `pro-capacity-refresh` | `npm run test:unit -- -t @claim:pro-capacity-refresh` | 1 passed |
| `site-network` | `npm run test:e2e -- --grep @claim:site-network` | 2 passed |
| `license-local` | `npm run test:e2e -- --grep @claim:license-local` | 2 passed |
| `checkout-live` | `npm run test:checkout` | HTTP 303 to HTTPS Dodo session |

The Dodo page was also opened independently. It showed **Worktree Agent Pulse
Pro**, subtotal and total **$19.00**, and no page error.

## Build and desktop package evidence

- `npm ci`: passed; 103 packages installed; 0 vulnerabilities reported.
- `npm test`: passed; 4 Vitest unit tests and 38 Playwright tests.
- `npm run build`: passed, including `tsc --noEmit`; output is `dist/site`.
  There is no separate JavaScript lint script.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`:
  passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed; 4 tests.
- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run tauri build -- --bundles deb`: passed. The candidate DEB is
  1,953,582 bytes with SHA-256
  `86ac67c78bcbb34e50e72a0acf6a1114c37c73e1fee293c4f477362799610f98`.
- The candidate DEB extracted into a fresh temporary consumer, had no missing
  shared libraries, and stayed alive for the full eight-second Xvfb smoke
  window (expected timeout exit 124).
- The separately downloaded release DEB also extracted cleanly, had no missing
  shared libraries, and stayed alive for eight seconds.
- A fresh native first run showed the correct empty state and keyboard loading
  of the five-worktree sample. A real two-worktree Git fixture was created for
  scan-path testing; the shipped metadata test independently passed against a
  temporary real Git repository. File-picker automation in the bare Xvfb
  session did not complete selection, so no UI result is claimed from that
  attempt.

## Live functional, accessibility, privacy, and PWA evidence

- `/opt/fleet/lib/verify-url.sh` passed after its evidence directory was
  created: HTTP 200, 1,031ms load, title, `lang="en"`, one `h1`, one `main`, no
  missing alt text, no unnamed buttons, and no console/page errors.
- Fresh live checks on `/`, `/demo`, `/privacy`, `/terms`, and `/missing` at
  1440×900 and 390×844 found exactly one `h1` and `main`, route-specific titles,
  no horizontal overflow, no missing alt text, no console/page errors, and zero
  axe serious/critical findings.
- Keyboard checks passed for route focus, a visible 3px mint focus outline,
  arrow navigation between worktrees, Enter to open details, Escape to close,
  and license-dialog initial focus, focus wrapping, Escape, and focus return.
- Reduced-motion mode matched and reduced animation and transition durations
  to 0.01ms.
- The demo loaded 5 rows; Needs attention showed 4; Reset restored 5; leaving
  demo removed all `demo:` keys. The full detail/terminal-preview flow made no
  cross-origin requests, set no cookies or local-storage values, and used only
  `demo:worktree-agent-pulse:repository` in session storage.
- The service worker activated from `/sw.js`, `update()` completed, cache
  `worktree-agent-pulse-v3` existed, and an offline `/demo` reload returned the
  five rows with no errors.
- A download-API failure produced the calm release-page fallback. A bogus
  license produced the stated recovery message and was sent only to the
  Sociobot verification endpoint.
- No sign-in flow exists, so the Entra authority requirement is not applicable.

## Deployment identity, policies, performance, and release

- Fresh production output matched live bytes for `index.html`, `sw.js`, both
  installer scripts, main JS, CSS, hero art, and social card. Main JS SHA-256
  is `951b0e8072e8b08676a9530c7ac2aebfb3e9e07241e492146e2315bd593a6c8c`;
  CSS is `19fc9aa3bc451828ba9b5afb2a05f159e0fa37f08f916f47cf2c23ea8470a253`.
- Live security policy includes HTTPS/HSTS, `nosniff`, strict-origin referrer
  policy, camera/microphone/geolocation denial, CSP `frame-ancestors 'none'`,
  and connect restrictions to same-origin, GitHub API, and Sociobot API.
- HTML and service worker cache for 30 seconds with revalidation. Hashed assets
  use one-year immutable caching.
- Initial main JS is 28,053 bytes raw / 9.56KB gzip; CSS is 23,312 bytes raw /
  5.75KB gzip; initially fetched fonts total 36,996 bytes; hero art is 63,848
  bytes. All stated budgets pass.
- Mobile Lighthouse: performance 94, accessibility 100, best practices 100,
  SEO 100; LCP 1,579ms, CLS 0, TBT 278ms, FCP 1,204ms, total bytes 134,103.
- A fresh 50-request burst to the license verification endpoint returned 200
  for requests 1–30. Request 31 was the first 429, with `Retry-After: 3`; 20 of
  50 responses were 429. Rate limiting passes.
- GitHub Release `v0.1.4` contains macOS ARM64/x64 DMGs, Windows x64 NSIS EXE,
  Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. The downloaded DEB
  SHA-256 `29d2dc70055a2e19c715b39180e658c70d2fbfef74f33d53da902a2dfacfbf0d`
  matches the release manifest.
- Release `v0.1.4` points to `73c4c70224c4c1eb7c3e4eacaafa433593749783`.
  The only product-source difference from that tag to the candidate is the
  two-line mobile-link CSS repair. The live site matches the candidate build;
  the downloadable desktop binaries remain built from the earlier tag.

## Required remediation before another verification

1. Make every `/demo` control at least 44×44px and add route-wide mobile target
   tests, not only a landing-page test.
2. Select or offer the correct macOS architecture in both the site and shell
   installer; test Intel and Apple Silicon fixtures.
3. Implement in-app removal of saved repository paths, or remove the false
   privacy statement and provide an accurate, usable deletion path.
4. Add claims and observable tests for every remaining public promise,
   especially exact terminal opening, installer checksum verification, native
   no-telemetry behavior, and repository deletion.
5. Treat the native bundled sample as an explicit sandbox/preview and do not
   invoke a terminal for fictional paths; preserve the actual Tauri error text.
6. Return HTTP 404 for unknown routes and raise essential mobile board text to
   the supplied legibility baseline.
