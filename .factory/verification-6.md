# Independent verification 6 — FAIL

- Candidate commit: `9d19a0a9d1ac523f16f9658ced2476bab9c9e11e`
- Live URL: <https://worktree-agent-pulse.sociobot.in>
- Verified: 2026-08-29 from the supplied clean checkout
- Verdict: **FAIL** — the shipped product works, but accessibility, invalid-input, and installer-disclosure requirements are not met.

No product code was changed. Evidence is under `.factory/verification-evidence-6/`.

## Required first-read gate — PASS

A cold, storage-free visit at 1440×900 and 390×844 says:

- What it does: **“See blocked agents and worktrees that need attention.”**
- Who it is for: developers running several CLI agents who need one view of worktree activity and Git state.
- What to click: **“Try it with sample data.”**
- What happens: **“Loads five worktrees. Nothing is saved.”**

The action and explanation are fully visible in both initial viewports and open
the populated five-worktree demo in one click. Evidence:
`first-read-desktop.png` and `first-read-mobile.png`.

## Claims gate — PASS after documented native prerequisites

`.factory/claims.json` exists with 22 entries. Every listed command was run
separately. The first two Cargo invocations encountered the clean worker's
missing `glib-2.0.pc`; after installing the exact Linux packages declared in
`.github/workflows/release.yml`, both exact commands were rerun and their claim
assertions passed. This was a verifier-host prerequisite, not a failed product
assertion.

| Claim | Result and evidence |
| --- | --- |
| `sample-five` | PASS — both Playwright projects loaded five rows through the one-click demo. |
| `attention` | PASS — exact order was checkout, invoices, main, search, auth; attention filter returned four. |
| `first-screen-demo` | PASS — action and explanation fit 1440×900, 1280×800, and 390×844. |
| `demo-private` | PASS — demo flow made only same-origin requests and used only the `demo:` session key. |
| `offline-demo` | PASS — service-worker-controlled reload returned five rows offline. |
| `metadata-only` | PASS — Rust canaries stayed out of serialized data and Git/file state was unchanged. |
| `free-price` | PASS — five-worktree free limit and `$19 once` were present. |
| `no-account` | PASS — fresh storage/cookies reached the board without sign-in. |
| `pro-capacity-refresh` | PASS — free returned five, Pro eight, scheduler 10,000 ms. |
| `site-network` | PASS — no external landing request; download check requested only the GitHub Releases API. |
| `license-local` | PASS — fixture token was URL-stripped, namespaced locally, and sent only to Sociobot. |
| `license-daily` | PASS — verification was suppressed until the 24-hour boundary. |
| `mac-download-architecture` | PASS — Intel and Apple silicon fixtures selected their matching DMGs. |
| `release-available` | PASS — public `v0.1.6` and `SHA256SUMS` exist. |
| `platform-artifacts` | PASS — both DMGs, Windows EXE, AppImage, DEB, and checksums exist. |
| `release-source-provenance` | PASS — all five downloads hashed correctly and metadata identifies source `9f2e77f…`. |
| `exact-terminal-path` | PASS — the terminal probe received the selected worktree as its working directory. |
| `installer-checksum` | PASS — both installers reject a bad hash before opening/copying/starting an asset. |
| `native-no-tracking` | PASS — source inspection found no analytics/crash tracking clients or endpoints. |
| `repository-delete` | PASS — removing one saved path left the other and did not touch repository files. |
| `checkout-live` | PASS — live checkout returned HTTP 303 to `checkout.dodopayments.com`. |
| `refund-contact` | PASS — Terms exposes the exact refund `mailto:`. |

## Clean build and package evidence — PASS

- `npm ci`: passed; 105 packages installed and 0 audit vulnerabilities.
- `npm test`: passed — 14 Vitest tests and 48 Playwright checks.
- `npm run build`: passed, including `tsc --noEmit`; `dist/site` exists.
- No separate JavaScript lint script is declared.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 6 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `CI=true VITE_BUILD_SOURCE_COMMIT=9d19a0a… npm run tauri -- build --bundles deb`: passed.
- The generated DEB was 2,088,248 bytes with SHA-256
  `2691256f886f12e9822e7e43f1eeb23fb57f90657f0db9ff67f6ceaa7deca85e`.
- A clean extraction had no missing `ldd` dependency. The executable stayed
  alive for the eight-second Xvfb smoke window (expected timeout 124); output
  contained only headless GPU/session-bus warnings.

The web build is within budget: initial JS 31.54 KB raw / 10.39 KB gzip; CSS
24.37 KB raw / 5.93 KB gzip; loaded fonts total 52.62 KB; hero WebP 63.85 KB.
Mobile Lighthouse scored performance 95, accessibility 100, best practices
100, and SEO 100; LCP was 1.583 s, CLS 0, and TBT 230 ms. Evidence:
`lighthouse-mobile.json`.

## Live behavior, privacy, and deployment — PASS where noted

- The complete demo returned row counts 5 / 4 / 1 / 1 for All / Needs
  attention / Working / Clean. The drawer showed the exact sample branch,
  agent, changes, remote state, and path. Its terminal action remained a
  preview and announced the selected worktree.
- Reset restored five rows. Start for real removed the only demo session key
  and returned home. Local storage stayed empty throughout the demo.
- Valid routes at desktop and 390px had one `<h1>`, one `<main>`, `lang=en`,
  complete image alt text, no horizontal overflow at normal size, no
  console/page errors, and zero serious/critical Axe findings.
- The official `verify-url.sh` passed with an 859 ms load and no errors.
  Evidence: `verify-url/verify.json` and screenshots.
- Reduced motion produced `0.00001s` transition and animation durations.
- Service-worker `update()` completed with an activated worker; cache
  `worktree-agent-pulse-v3` contained the shell and current hashed assets;
  offline `/demo` reload returned five rows without errors.
- Initial landing and complete demo flows made no cross-origin request.
  Download checking made only the documented GitHub API request and selected
  the real `v0.1.6` Linux AppImage. Invalid-license verification went only to
  the Sociobot API, which returned a no-store JSON response with correct CORS.
- Browser response headers confirmed CSP, HSTS, `nosniff`, strict-origin
  referrer policy, denied camera/microphone/geolocation, 30-second shell/SW
  revalidation, and one-year immutable caching for hashed assets.
- The Sociobot verification endpoint allowed 30 requests from one client.
  Requests 31–35 returned HTTP 429 with `Retry-After: 0`. The required header
  is present. There is no sign-in flow, so the Entra requirement is not applicable.
- Every checked internal route and the GitHub Releases page resolved. The real
  checkout redirect and refund mail link also resolved as documented.

## Deployment and release identity — PASS

A fresh default production build matched the live `index.html`, `sw.js`, both
installer scripts, main JS, CSS, hero/social art, and all three walkthrough
images byte-for-byte. Live `data-build-source` is `local-development`, so the
runtime marker is not useful, but byte comparison establishes the deployed
web product identity.

Release `v0.1.6` targets `9f2e77fe35b098c3f818169dedb0682af0da2310`.
The only change from that release source to candidate `9d19a0a…` is
`.factory/handoff.md`; no product source, configuration, dependency, or asset
changed. `latest.json` names the same release source and all five advertised
platform assets match `SHA256SUMS`.

## Release-blocking defects

### Major — the worktree detail drawer loses keyboard and screen-reader context

Keyboard focus was placed on the first worktree and Enter opened its detail
drawer. Immediately afterward, `document.activeElement` was the page `<h1>`
(`Worktree pulse`), not the drawer heading or close/action control. The code
attempts to focus `#detail-title`, but that `<h2>` has no `tabindex`, so focus
fails. Escape closes the drawer and again leaves focus on the page `<h1>`
instead of returning it to the invoking worktree. This is the primary job flow
and violates the keyboard/focus-management acceptance baseline.

### Major — 200% text does not reflow at the mobile width

At 390×844 with root text enlarged to 200%, `/privacy` widened to 422 CSS px.
The headline is visibly clipped in the viewport and requires horizontal
panning. Other routes remained 390 px wide. Evidence:
`privacy-200-percent.png`. This violates the explicit requirement that text
resize to 200% without loss.

### Major — unsigned desktop downloads are offered without the required warning

The public release body says the builds are unsigned, and the internal handoff
mentions operator certificates. The landing download section and `README.md`
do not tell users that the macOS and Windows builds are unsigned or explain
the expected OS warning/right-click Open flow. The detected download action
links directly to the asset, bypassing the release note. This violates the
desktop installer contract and is material trust/install information.

### Moderate — empty license input fails silently

In Restore a license, the input receives focus and invalid non-empty tokens get
an announced recovery message. Pressing Verify license with an empty value,
however, leaves the original instruction unchanged. The input is not marked
required and has no error association. This violates the required invalid-input
and announced-error behavior.

### Moderate — desktop click targets are below the 44 px contract

At 1440px, header/footer and demo links measured 20–32 px high; `Demo` was
38×22 px and demo `Privacy` was 46×20 px. The 390px media rule correctly makes
all controls at least 44×44, but the acceptance contract specifies 44px
touch/click targets, not only phone targets.

## Lower-risk observation

The three below-the-fold walkthrough PNGs are fetched on the cold landing load
because they have no `loading="lazy"`. Lighthouse and all byte budgets still
pass, so this is not part of the release verdict.
