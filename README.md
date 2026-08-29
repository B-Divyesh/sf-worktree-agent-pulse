# Worktree Agent Pulse

See blocked agents and worktrees that need attention in one local desktop board.

Pulse is for solo developers and tiny teams running several CLI agents in Git worktrees. It discovers linked worktrees, reads Git status, shows opt-in agent state, and opens the selected worktree in a terminal. It ignores source, prompt, output, and terminal content. Scans do not run Git writes.

Live site: <https://worktree-agent-pulse.sociobot.in>

One-click demo: <https://worktree-agent-pulse.sociobot.in/demo>

## What ships

- Desktop downloads for macOS, Windows, and Linux
- Read-only `git worktree list`, `git rev-parse`, and `git status` scans
- Optional status files let each CLI agent report working, blocked, or idle
- A user-triggered action that opens the exact worktree in a terminal
- A separate, offline-ready browser demo with five sample worktrees
- Free monitoring for five worktrees
- Pulse Pro for $19 once, with unlimited worktrees and 10-second refresh

## Run the site

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. The demo route is `/demo`.

## Run the desktop app

Install the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your system, then run:

```sh
npm ci
npm run tauri dev
```

The app stores repository paths in local WebView storage. Use **Remove repository** in the desktop app to forget a saved path without changing repository files. Clearing browser/app storage also removes saved paths.

## Optional agent status file

The status file is opt-in. Create `.worktree-agent-pulse/status.json` inside a worktree:

```json
{
  "agent": "Codex",
  "state": "working",
  "updatedAt": "2026-08-28T14:31:00Z"
}
```

`state` accepts `working`, `blocked`, or `idle`. Other fields, including prompt and output text, are ignored.

## Test and build

```sh
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

`npm run build` writes the deployable site to `dist/site`. GitHub Actions builds desktop bundles when a `v*` tag is pushed.

## Install

Use the detected download on the site, or choose a release asset manually. One-line installers verify the release SHA-256 before opening or installing the file:

```sh
curl -fsSL https://worktree-agent-pulse.sociobot.in/install.sh | sh
```

```powershell
irm https://worktree-agent-pulse.sociobot.in/install.ps1 | iex
```

Choose the macOS, Windows, AppImage, or Debian package from the release page.

## Privacy and billing

Repository paths and board state stay in local app storage. The public site contacts GitHub only after you request a download. License checkout and verification use `api.sociobot.in`; the license token stays in local storage. Verification runs at most once every 24 hours. Request a refund at <hello@sociobot.in>.

See `/privacy` and `/terms` on the site. The sample board works offline after its first visit.

## Project records

- [Visual system](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Tested claims](.factory/claims.json)
- [Build handoff](.factory/handoff.md)

MIT licensed. Built by Param Factory.
