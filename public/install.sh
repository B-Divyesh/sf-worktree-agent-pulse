#!/bin/sh
set -eu

repo="B-Divyesh/sf-worktree-agent-pulse"
api="https://api.github.com/repos/$repo/releases/latest"
tmp_dir="$(mktemp -d)"
trap 'rm -r "$tmp_dir"' EXIT INT TERM

case "$(uname -s)" in
  Darwin) pattern='\.dmg$' ;;
  Linux) pattern='\.AppImage$' ;;
  *) echo "This installer supports macOS and Linux. Use install.ps1 on Windows." >&2; exit 1 ;;
esac

release_json="$tmp_dir/release.json"
curl -fsSL -H 'Accept: application/vnd.github+json' "$api" -o "$release_json"
asset_url="$(sed -n 's/.*"browser_download_url": *"\([^"]*\)".*/\1/p' "$release_json" | grep -Ei "$pattern" | head -n 1)"
checksums_url="$(sed -n 's/.*"browser_download_url": *"\([^"]*SHA256SUMS\)".*/\1/p' "$release_json" | head -n 1)"
[ -n "$asset_url" ] && [ -n "$checksums_url" ] || { echo "Downloads are still being published. Visit https://github.com/$repo/releases" >&2; exit 1; }

asset_name="${asset_url##*/}"
curl -fL "$asset_url" -o "$tmp_dir/$asset_name"
curl -fsSL "$checksums_url" -o "$tmp_dir/SHA256SUMS"
expected="$(awk -v file="$asset_name" '$2 == file || $2 == "./" file { print $1 }' "$tmp_dir/SHA256SUMS")"
actual="$(sha256sum "$tmp_dir/$asset_name" 2>/dev/null | awk '{print $1}' || shasum -a 256 "$tmp_dir/$asset_name" | awk '{print $1}')"
[ "$expected" = "$actual" ] || { echo "Checksum did not match. Nothing was installed." >&2; exit 1; }

case "$(uname -s)" in
  Darwin) open "$tmp_dir/$asset_name"; echo "Verified and opened $asset_name. Drag Pulse to Applications." ;;
  Linux) mkdir -p "$HOME/.local/bin"; cp "$tmp_dir/$asset_name" "$HOME/.local/bin/worktree-agent-pulse"; chmod +x "$HOME/.local/bin/worktree-agent-pulse"; echo "Verified and installed worktree-agent-pulse in $HOME/.local/bin." ;;
esac
