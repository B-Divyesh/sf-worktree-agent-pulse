# Worktree Agent Pulse v0.1.3 handoff

## What was built

- Tauri 2 desktop app with a Rust core and Vite/TypeScript interface.
- Read-only discovery for linked Git worktrees.
- Dirty, ahead, behind, and detached Git state from porcelain output.
- Opt-in agent state from `.worktree-agent-pulse/status.json` only.
- Blocked, working, idle, and Git-only board states with urgency filters.
- Keyboard row navigation, accessible detail drawer, errors, and empty state.
- User-triggered terminal opening for the exact worktree.
- Tray menu with Show and Quit actions.
- Separate one-click demo at `/demo` with five realistic worktrees.
- Demo reset, demo-only session storage, and offline reload support.
- Landing, privacy, terms, and designed 404 routes.
- Sociobot $19 one-time license capture, restore, daily verification, and offline cached verdict.
- Free limit of five visible worktrees. Pulse Pro adds all worktrees and 10-second refresh.
- OS-aware release lookup using the GitHub API with a calm no-release state.
- SHA-256-checking shell and PowerShell installers.
- GitHub Actions matrix for macOS arm64/x64, Windows, and Linux bundles.
- Original generated commit-lattice hero, 64 KB WebP, with source and provenance.

## How to run

```sh
npm ci
npm run dev
npm run tauri dev
```

The static deploy command is `npm run build`. Output lands in `dist/site`, with `index.html` at that root.

## Verification completed

- `npm test`: passed, 3 unit tests and 26 Playwright tests.
- Browsers: desktop Chromium and Chromium at 390×844.
- Claims: six tagged claims passed, including offline reload and same-origin demo traffic.
- Axe: no serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, or `/missing`.
- Console: no errors while loading the landing page and demo.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed, 3 Rust tests.
- `npm run tauri build -- --bundles deb`: passed; local Debian package was 1,953,676 bytes.
- `npm run build`: passed.
- GitHub release `v0.1.3`: all four platform jobs and checksum job passed.
- Published assets: macOS arm64/x64 DMGs, Windows NSIS EXE, Linux AppImage and DEB.
- Downloaded the Windows installer and verified it against the published `SHA256SUMS`.
- `latest.json`: parsed successfully with a non-empty URL for every platform.
- Initial JavaScript: 9.59 KB gzip. CSS: 5.72 KB gzip. Hero: 64 KB WebP.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse timings: LCP 1.8 s, total blocking time 0 ms, CLS 0.
- `npm audit`: 0 vulnerabilities.
- Copy audit: `.factory/copy-audit.md`; no sentence exceeds 22 words and no banned term remains.

## Known gaps

- The app has no background notifications in v0.1.3; the tray is an open/quit surface.
- Terminal detection uses the system default on macOS and Windows, then common Linux terminals or `$TERMINAL`.

## Needs operator action

- Register `worktree-agent-pulse` with the Sociobot billing service and keep the checkout price at $19.
- Add Apple notarization and Windows Authenticode steps when certificates are available. Expected secret names: `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
- The current release artifacts are unsigned. Keep the signing notice visible until signed builds replace them.
