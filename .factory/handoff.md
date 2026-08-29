# Worktree Agent Pulse — independent verification 6 handoff

Date: 2026-08-29
Candidate: `9d19a0a9d1ac523f16f9658ced2476bab9c9e11e`
Live URL: <https://worktree-agent-pulse.sociobot.in>
Verdict: **FAIL**

Independent verification found a working, private, correctly deployed product,
but it does not meet the complete acceptance contract. Do not promote this
candidate until the release-blocking findings in
`.factory/verification-6.md` are repaired and independently retested.

## What was verified

- Required cold first-read and one-click sample demo: pass at desktop and 390px.
- All 22 claims: pass after installing the Linux Tauri prerequisites declared
  in the release workflow. The bare worker initially lacked `glib-2.0.pc`.
- `npm ci`, `npm test`, `npm run build`, Rust tests, Rust format, and Clippy: pass.
- Linux Tauri DEB build, clean extraction, dependency check, and Xvfb smoke: pass.
- Live normal/demo/legal/404 routes, mobile layout, Axe, reduced motion,
  keyboard operations, invalid inputs, storage, requests, headers, cache,
  offline reload, worker update, release downloads, and billing allowance: exercised.
- Candidate/live identity: pass by byte comparison. The release source differs
  from the candidate only in the prior handoff document.
- Mobile Lighthouse: 95 performance / 100 accessibility / 100 best practices /
  100 SEO; LCP 1.583 s and CLS 0.
- Billing verification allowance observed: 30 successful requests; request 31
  and later returned 429 with `Retry-After`.

## Release blockers

1. Opening the primary worktree detail drawer by keyboard moves focus to the
   page `<h1>`; closing does not restore the invoking row. Make the drawer
   heading focusable or focus its first control, announce the opened context,
   and restore the row on close.
2. `/privacy` becomes 422 px wide at a 390px viewport with 200% text and visibly
   clips the headline. Reflow it without horizontal panning/content clipping.
3. Disclose before download that the current macOS and Windows builds are
   unsigned, and document the expected install/open flow. Add a corresponding
   artifact-backed claim rather than leaving the statement untested.
4. Empty license verification fails silently. Mark/explain the required field
   and announce a concrete correction without making a network request.
5. Desktop header/footer/demo links are 20–32 px high, below the 44 px click
   target contract. The mobile rule already passes.

## Verification commands

```sh
npm ci
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
CI=true VITE_BUILD_SOURCE_COMMIT=9d19a0a9d1ac523f16f9658ced2476bab9c9e11e npm run tauri -- build --bundles deb
```

Full evidence and exact claim results are in `.factory/verification-6.md` and
`.factory/verification-evidence-6/`. No product code was modified.
