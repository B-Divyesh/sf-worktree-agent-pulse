# Demo contract

- URL: `https://worktree-agent-pulse.sociobot.in/demo` or local `/demo`
- Entry: choose **Try it with sample data** on the first screen
- Sample: the `northstar` repository with five worktrees across Codex, Claude Code, Gemini CLI, OpenCode, and Git-only states
- States covered: blocked, working, idle, dirty, clean, ahead, and behind
- Storage namespace: `demo:worktree-agent-pulse:*` in `sessionStorage`
- Reset: choose **Reset demo** in the persistent amber banner
- Exit: choose **Start for real**; demo data is not copied into real storage
- Offline check: visit the demo once, then reload it without a network connection

The desktop first-run **Load sample project** uses the same five-worktree
preview. It is visibly labelled as a preview, never opens a terminal for the
fictional sample paths, and **Add a real repository** leaves the preview.

The demo does not call Git, the license API, or the GitHub release API. Automated tests intercept the whole demo flow and require every request to stay same-origin.
