# Independent verification — FAIL

- Candidate: `ca6dc3dee5e95d6ad0d89b72150b8fea21d95c9c`
- Live URL: `https://worktree-agent-pulse.sociobot.in`
- Verified: 2026-08-28 (fresh `npm ci` checkout)
- Verdict: **FAIL — release-blocking defects below.**

## First read

Cold desktop landing copy says Pulse catches blocked coding agents and unsafe Git worktrees for developers running several CLI agents. The intended first action is **Try it with sample data**, which loads five worktrees without saving data.

This does not meet the mandatory desktop first-screen contract: at 1440×900 the CTA starts at `y=900.67` (height 48), and at 1280×800 it starts at `y=866.52`. It is not visible in either initial viewport, so a cold desktop visitor cannot see what to click first. At 390×844 it is visible at `y=622.75`; mobile otherwise passes the first-read check.

## Release blockers

### Critical — advertised paid checkout is unavailable

`GET https://api.sociobot.in/api/v1/products/worktree-agent-pulse/checkout` returned HTTP `404` with `{"error":"enabled factory product","status":404}` on 2026-08-28. The live **Buy Pulse Pro** link targets that exact URL. A visitor cannot buy the advertised $19 one-time license.

### High — claim registry is incomplete

The seven declared claim tests pass, but `.factory/claims.json` does not cover several visitor-reliant claims made on the live page and README. This violates the claims contract, which treats an unlisted claim as a failed review. Examples without an exact declared, observable test include:

- “No prompt or output capture” and “Prompt text stays out.”
- “It does not record terminal contents [or] send prompts.”
- “Pulse Pro [shows] every worktree and refresh[es] every 10 seconds.”
- README: “Repository data stays in the app” and the public-site network/billing assertions.

The existing `@claim:metadata-only` source-text test only verifies the Git read command/adaptor path and rejects Git writes; it does not prove those broader privacy or paid-feature statements.

### High — required primary demo action is below the desktop first viewport

See First read. This independently fails the explicit plain-words/demo-sandbox acceptance condition even though `/demo` itself is functional.

### Medium — dead external footer link

The live footer’s **Built by Param Factory** target, `https://param.sociobot.in/`, did not resolve (`curl: (6) Could not resolve host`) from this fresh verifier environment. All first-party routes returned 200, but the supplied site-structure contract requires no dead links.

## Claims — all declared tests passed

Each was run exactly from `.factory/claims.json` after `npm ci`, using the product demo entry point where applicable.

| ID | Command | Result |
| --- | --- | --- |
| sample-five | `npm run test:e2e -- --grep @claim:sample-five` | PASS (2: Chromium + 390px) |
| attention | `npm run test:e2e -- --grep @claim:attention` | PASS (2) |
| demo-private | `npm run test:e2e -- --grep @claim:demo-private` | PASS (2) |
| offline-demo | `npm run test:e2e -- --grep @claim:offline-demo` | PASS (2) |
| metadata-only | `npm run test:unit -- -t @claim:metadata-only` | PASS (1) |
| free-price | `npm run test:e2e -- --grep @claim:free-price` | PASS (2) |
| no-account | `npm run test:e2e -- --grep @claim:no-account` | PASS (2) |

## Test and product evidence

- `npm test`: PASS — 3 unit and 26 Playwright tests.
- `npm run build`: PASS — type check and production Vite build to `dist/site`.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS — 3 Rust tests. The first attempt correctly exposed missing Linux Tauri development libraries in the base container; after installing the workflow's documented Ubuntu prerequisites (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`), it passed unchanged.
- The live `assets/index-BZ6w-wI8.js` SHA-256 is `a68d1eae004437f723e5b862b9f7784936134863def6419610eab91854eb820a`, identical to the fresh candidate build. The only candidate change after release tag `v0.1.3` is handoff documentation.
- Live cold page, demo, privacy, terms and 404: one `h1`, correct route titles, no browser console/page errors, and zero axe serious/critical findings.
- 390×844 live flow: CTA visible; demo loaded 5 rows; ArrowDown moved between rows; Enter opened details; Needs attention filtered to 4; Reset restored 5; Start for real cleared demo session storage. Dialog invalid-token recovery displayed “This license is not active. Check the token and try again.”
- Reduced-motion context reported 0.01ms animation/transition durations. Visible focus on the CTA is a 3px `#7cf7c4` outline.
- Live `/demo` registered `/sw.js`, controlled the page, populated cache `worktree-agent-pulse-v2`, and reloaded offline with 5 rows.
- The released v0.1.3 Debian package identifies as `worktree-agent-pulse 0.1.3 amd64`; its SHA-256 `2fc16b8c1b25a3503a81e563ead5ea1a98f4da8f007df22b6dd79613ad11a14d` matches published `SHA256SUMS`. Under Xvfb the released desktop app launched, showed its native first-run screen, and **Load sample project** rendered its five-worktree board with blocked/dirty/ahead/behind states.
- Header policy: HTTPS, HSTS, CSP restricted to self plus GitHub/Sociobot APIs, `X-Content-Type-Options: nosniff`, strict referrer policy, and camera/microphone/geolocation denied. Hashed JS/CSS/hero are immutable-cacheable. Initial live JS is 28,194 bytes, CSS 23,157 bytes, hero 63,848 bytes (within stated static budgets).
- Demo network traffic stayed same-origin. Landing made no outbound request until **Check download for Linux**; then it requested only the documented GitHub Releases API and resolved the real v0.1.3 AppImage.
- Billing verify endpoint returns an invalid-token JSON response and is rate limited: a 40-request burst (20 concurrent) first produced 429 at request 30; 429 responses carried `Retry-After: 3` (requests 30, 31 and 33–40). No sign-in flow is present.

## Release assets

GitHub Release `v0.1.3` has macOS arm64/x64 DMGs, Windows NSIS EXE, Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. It targets `d458b83aa456b1164b5f3273a509a6c377c50ac2`, the direct parent of the candidate; the candidate changes only `.factory/handoff.md`.

## Required remediation

1. Register/enable the product in the Sociobot billing service and prove a real checkout redirect from the live Buy link.
2. Move the sample CTA and its “Loads five worktrees…” explanation into the initial desktop viewport.
3. Add or remove every unlisted promise, with one exact `@claim:<id>` test per retained promise.
4. Repair or remove the unresolved Param Factory footer link.
