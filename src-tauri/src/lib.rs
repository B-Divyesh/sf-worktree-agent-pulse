use serde::{Deserialize, Serialize};
#[cfg(target_os = "linux")]
use std::env;
use std::{
    collections::hash_map::DefaultHasher,
    fs,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
struct WorktreePulse {
    id: String,
    name: String,
    path: String,
    branch: String,
    agent: String,
    agent_state: String,
    updated_at: Option<String>,
    dirty: usize,
    ahead: u32,
    behind: u32,
    detached: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RepositoryPulse {
    root: String,
    name: String,
    scanned_at: String,
    worktrees: Vec<WorktreePulse>,
    warnings: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdapterStatus {
    agent: Option<String>,
    state: Option<String>,
    updated_at: Option<String>,
}

#[derive(Default, Debug, PartialEq)]
struct GitState {
    branch: String,
    dirty: usize,
    ahead: u32,
    behind: u32,
    detached: bool,
}

fn git(path: &Path, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(path)
        .args(args)
        .stdin(Stdio::null())
        .output()
        .map_err(|error| format!("Git could not start: {error}"))?;
    if !output.status.success() {
        let message = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        return Err(if message.is_empty() {
            "Git could not read this repository.".into()
        } else {
            message
        });
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

fn parse_worktree_paths(output: &str) -> Vec<PathBuf> {
    output
        .lines()
        .filter_map(|line| line.strip_prefix("worktree ").map(PathBuf::from))
        .collect()
}

fn parse_status(output: &str) -> GitState {
    let mut state = GitState::default();
    for line in output.lines() {
        if let Some(branch) = line.strip_prefix("# branch.head ") {
            state.detached = branch == "(detached)";
            state.branch = if state.detached {
                "Detached HEAD".into()
            } else {
                branch.into()
            };
        } else if let Some(ab) = line.strip_prefix("# branch.ab ") {
            let mut parts = ab.split_whitespace();
            state.ahead = parts
                .next()
                .and_then(|part| part.trim_start_matches('+').parse().ok())
                .unwrap_or(0);
            state.behind = parts
                .next()
                .and_then(|part| part.trim_start_matches('-').parse().ok())
                .unwrap_or(0);
        } else if !line.starts_with('#') && !line.trim().is_empty() {
            state.dirty += 1;
        }
    }
    state
}

fn read_adapter(path: &Path) -> (String, String, Option<String>) {
    let file = path.join(".worktree-agent-pulse").join("status.json");
    let Ok(content) = fs::read_to_string(file) else {
        return ("No adapter".into(), "none".into(), None);
    };
    let Ok(status) = serde_json::from_str::<AdapterStatus>(&content) else {
        return ("Adapter error".into(), "none".into(), None);
    };
    let state = status
        .state
        .filter(|value| matches!(value.as_str(), "working" | "blocked" | "idle"))
        .unwrap_or_else(|| "idle".into());
    (
        status.agent.unwrap_or_else(|| "Agent adapter".into()),
        state,
        status.updated_at,
    )
}

fn stable_id(path: &Path) -> String {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    format!("wt-{:x}", hasher.finish())
}

fn scan(path: &Path) -> Result<RepositoryPulse, String> {
    if !path.is_dir() {
        return Err("The selected repository folder no longer exists.".into());
    }
    let root_text = git(path, &["rev-parse", "--show-toplevel"])?;
    let root = PathBuf::from(root_text.trim());
    let list = git(&root, &["worktree", "list", "--porcelain"])?;
    let mut worktrees = Vec::new();
    let mut warnings = Vec::new();
    for worktree_path in parse_worktree_paths(&list) {
        match git(&worktree_path, &["status", "--porcelain=v2", "--branch"]) {
            Ok(output) => {
                let git_state = parse_status(&output);
                let (agent, agent_state, updated_at) = read_adapter(&worktree_path);
                let name = worktree_path
                    .file_name()
                    .and_then(|value| value.to_str())
                    .unwrap_or("worktree")
                    .to_owned();
                worktrees.push(WorktreePulse {
                    id: stable_id(&worktree_path),
                    name,
                    path: worktree_path.to_string_lossy().into_owned(),
                    branch: git_state.branch,
                    agent,
                    agent_state,
                    updated_at,
                    dirty: git_state.dirty,
                    ahead: git_state.ahead,
                    behind: git_state.behind,
                    detached: git_state.detached,
                });
            }
            Err(error) => warnings.push(format!(
                "Could not scan {}: {error}",
                worktree_path.display()
            )),
        }
    }
    let name = root
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("repository")
        .to_owned();
    let scanned_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .to_string();
    Ok(RepositoryPulse {
        root: root.to_string_lossy().into_owned(),
        name,
        scanned_at,
        worktrees,
        warnings,
    })
}

#[tauri::command]
fn scan_repository(path: String) -> Result<RepositoryPulse, String> {
    scan(Path::new(&path))
}

fn spawn_terminal(path: &Path) -> Result<(), String> {
    if !path.is_dir() {
        return Err("The worktree folder no longer exists.".into());
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Terminal"])
            .arg(path)
            .spawn()
            .map_err(|error| format!("Terminal could not start: {error}"))?;
    }
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", "cmd.exe", "/K", "cd", "/d"])
            .arg(path)
            .spawn()
            .map_err(|error| format!("Terminal could not start: {error}"))?;
    }
    #[cfg(target_os = "linux")]
    {
        if let Ok(terminal) = env::var("TERMINAL") {
            if Command::new(&terminal).current_dir(path).spawn().is_ok() {
                return Ok(());
            }
        }
        let candidates: [(&str, &[&str]); 4] = [
            ("x-terminal-emulator", &[]),
            ("gnome-terminal", &["--working-directory"]),
            ("konsole", &["--workdir"]),
            ("kitty", &["--directory"]),
        ];
        for (program, args) in candidates {
            let mut command = Command::new(program);
            command.args(args);
            if !args.is_empty() {
                command.arg(path);
            } else {
                command.current_dir(path);
            }
            if command.spawn().is_ok() {
                return Ok(());
            }
        }
        Err(
            "No terminal app was found. Set the TERMINAL environment variable and try again."
                .into(),
        )
    }
    #[cfg(any(target_os = "macos", target_os = "windows"))]
    Ok(())
}

#[tauri::command]
fn open_terminal(path: String) -> Result<(), String> {
    spawn_terminal(Path::new(&path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show Pulse", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let mut tray = TrayIconBuilder::new()
                .tooltip("Worktree Agent Pulse")
                .menu(&menu);
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.on_menu_event(|app, event| match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "quit" => app.exit(0),
                _ => {}
            })
            .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![scan_repository, open_terminal])
        .run(tauri::generate_context!())
        .expect("Worktree Agent Pulse failed to start");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run_git(path: &Path, args: &[&str]) {
        let status = Command::new("git")
            .arg("-C")
            .arg(path)
            .args(args)
            .status()
            .expect("git should start in the privacy fixture");
        assert!(status.success(), "git command failed: {args:?}");
    }

    #[test]
    fn reads_worktree_paths_without_touching_other_lines() {
        let output = "worktree /tmp/main\nHEAD aabb\nbranch refs/heads/main\n\nworktree /tmp/feature one\nHEAD ccdd\ndetached\n";
        assert_eq!(
            parse_worktree_paths(output),
            vec![
                PathBuf::from("/tmp/main"),
                PathBuf::from("/tmp/feature one")
            ]
        );
    }

    #[test]
    fn parses_branch_safety_counts() {
        let output = "# branch.oid abc\n# branch.head agent/fix\n# branch.upstream origin/agent/fix\n# branch.ab +3 -2\n1 .M N... file.ts\n? new.ts\n";
        assert_eq!(
            parse_status(output),
            GitState {
                branch: "agent/fix".into(),
                dirty: 2,
                ahead: 3,
                behind: 2,
                detached: false
            }
        );
    }

    #[test]
    fn identifies_detached_head() {
        let output = "# branch.oid abc\n# branch.head (detached)\n";
        assert_eq!(parse_status(output).branch, "Detached HEAD");
        assert!(parse_status(output).detached);
    }

    #[test]
    fn rejects_a_missing_worktree_before_terminal_lookup() {
        let missing = std::env::temp_dir().join("pulse-missing-worktree-path");
        let error =
            spawn_terminal(&missing).expect_err("a missing worktree must not open a terminal");
        assert_eq!(error, "The worktree folder no longer exists.");
    }

    /// @claim:exact-terminal-path
    #[cfg(target_os = "linux")]
    #[test]
    fn claim_exact_terminal_path_starts_the_configured_terminal_in_the_selected_worktree() {
        use std::os::unix::fs::PermissionsExt;
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let fixture = std::env::temp_dir().join(format!("pulse-terminal-{unique}"));
        let worktree = fixture.join("selected-worktree");
        let output = fixture.join("opened-path.txt");
        let terminal = fixture.join("terminal-probe.sh");
        fs::create_dir_all(&worktree).unwrap();
        fs::write(
            &terminal,
            format!("#!/bin/sh\npwd > '{}'\n", output.display()),
        )
        .unwrap();
        fs::set_permissions(&terminal, fs::Permissions::from_mode(0o755)).unwrap();

        let previous = env::var_os("TERMINAL");
        env::set_var("TERMINAL", &terminal);
        spawn_terminal(&worktree).expect("configured terminal should start");
        for _ in 0..30 {
            if output.exists() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(20));
        }
        if let Some(value) = previous {
            env::set_var("TERMINAL", value);
        } else {
            env::remove_var("TERMINAL");
        }

        assert_eq!(
            fs::read_to_string(&output).unwrap().trim(),
            worktree.canonicalize().unwrap().display().to_string()
        );
        fs::remove_dir_all(fixture).unwrap();
    }

    /// @claim:metadata-only
    #[test]
    fn claim_metadata_only_ignores_content_and_preserves_git_state() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("pulse-privacy-{unique}"));
        fs::create_dir_all(root.join(".worktree-agent-pulse")).unwrap();
        run_git(&root, &["init", "--quiet"]);
        run_git(&root, &["config", "user.email", "pulse@example.invalid"]);
        run_git(&root, &["config", "user.name", "Pulse Test"]);

        let source_canary = "SOURCE-CONTENT-MUST-NOT-ENTER-PULSE";
        let prompt_canary = "PROMPT-CONTENT-MUST-NOT-ENTER-PULSE";
        let output_canary = "TERMINAL-OUTPUT-MUST-NOT-ENTER-PULSE";
        fs::write(root.join("private-source.txt"), source_canary).unwrap();
        fs::write(root.join("terminal-output.log"), output_canary).unwrap();
        fs::write(
            root.join(".worktree-agent-pulse/status.json"),
            format!(
                r#"{{"agent":"Codex","state":"blocked","updatedAt":"2026-08-28T13:00:00Z","prompt":"{prompt_canary}","output":"{output_canary}"}}"#
            ),
        )
        .unwrap();

        let before_status = git(&root, &["status", "--porcelain=v2", "--branch"]).unwrap();
        let pulse = scan(&root).unwrap();
        let serialized = serde_json::to_string(&pulse).unwrap();
        let after_status = git(&root, &["status", "--porcelain=v2", "--branch"]).unwrap();

        assert_eq!(pulse.worktrees.len(), 1);
        assert_eq!(pulse.worktrees[0].agent, "Codex");
        assert_eq!(pulse.worktrees[0].agent_state, "blocked");
        assert_eq!(
            pulse.worktrees[0].updated_at.as_deref(),
            Some("2026-08-28T13:00:00Z")
        );
        assert!(!serialized.contains(source_canary));
        assert!(!serialized.contains(prompt_canary));
        assert!(!serialized.contains(output_canary));
        assert_eq!(before_status, after_status);
        assert_eq!(
            fs::read_to_string(root.join("private-source.txt")).unwrap(),
            source_canary
        );
        assert_eq!(
            fs::read_to_string(root.join("terminal-output.log")).unwrap(),
            output_canary
        );

        fs::remove_dir_all(root).unwrap();
    }
}
