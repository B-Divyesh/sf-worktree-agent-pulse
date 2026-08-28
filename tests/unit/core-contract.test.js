import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("desktop core contract", () => {
  it("uses the expected read-only Git commands and adapter path", () => {
    const source = readFileSync("src-tauri/src/lib.rs", "utf8");
    expect(source).toContain('["rev-parse", "--show-toplevel"]');
    expect(source).toContain('["worktree", "list", "--porcelain"]');
    expect(source).toContain('["status", "--porcelain=v2", "--branch"]');
    expect(source).toContain('join(".worktree-agent-pulse").join("status.json")');
    expect(source).not.toMatch(/\b(add|commit|checkout|merge|rebase|reset|clean|push|pull)\b.*Command::new\("git"\)/);
  });

  it("@claim:native-no-tracking contains no native analytics or crash-tracking endpoint", () => {
    const rust = readFileSync("src-tauri/src/lib.rs", "utf8");
    const webview = readFileSync("src/main.ts", "utf8");
    expect(rust).not.toMatch(/reqwest|ureq|https?:\/\/|analytics|telemetry|crash/i);
    expect(webview).not.toMatch(/sentry|google-analytics|plausible|posthog|crashlytics/i);
  });

  it("keeps checksum rejection ahead of every installer launch operation", () => {
    const shell = readFileSync("public/install.sh", "utf8");
    const powershell = readFileSync("public/install.ps1", "utf8");
    expect(shell.indexOf('[ "$expected" = "$actual" ]')).toBeGreaterThan(-1);
    expect(shell.indexOf('[ "$expected" = "$actual" ]')).toBeLessThan(shell.indexOf('open "$tmp_dir/$asset_name"'));
    expect(shell.indexOf('[ "$expected" = "$actual" ]')).toBeLessThan(shell.indexOf('cp "$tmp_dir/$asset_name"'));
    expect(powershell.indexOf('$expected.ToLowerInvariant() -ne $actual')).toBeGreaterThan(-1);
    expect(powershell.indexOf('$expected.ToLowerInvariant() -ne $actual')).toBeLessThan(powershell.indexOf('Start-Process $temp'));
  });

  it("@claim:installer-checksum runs the Unix installer only after a matching checksum", () => {
    const fixture = mkdtempSync(join(tmpdir(), "pulse-installer-"));
    const bin = join(fixture, "bin");
    const copies = join(fixture, "copies.log");
    const writeCommand = (name, contents) => {
      const path = join(bin, name);
      writeFileSync(path, `#!/bin/sh\n${contents}\n`);
      chmodSync(path, 0o755);
    };
    // The mock release has a valid AppImage and SHA256SUMS endpoint. `cp` is
    // deliberately a recorder so this test never writes outside its fixture.
    writeFileSync(join(fixture, "artifact"), "sample-release");
    writeFileSync(join(fixture, "sum"), spawnSync("sha256sum", [join(fixture, "artifact")], { encoding: "utf8" }).stdout.split(" ")[0]);
    mkdirSync(bin);
    writeCommand("uname", 'if [ "$1" = "-s" ]; then echo "${PULSE_TEST_OS:-Linux}"; else echo "${PULSE_TEST_ARCH:-x86_64}"; fi');
    writeCommand("curl", `out=""; previous=""; for value in "$@"; do [ "$previous" = "-o" ] && out="$value"; previous="$value"; done; case "$*" in *api.github.com*) printf '%s\\n' '{' '"browser_download_url": "https://release.invalid/pulse.AppImage",' '"browser_download_url": "https://release.invalid/pulse_aarch64.dmg",' '"browser_download_url": "https://release.invalid/pulse_x64.dmg",' '"browser_download_url": "https://release.invalid/SHA256SUMS"' '}' > "$out" ;; *pulse.AppImage*|*pulse_aarch64.dmg*|*pulse_x64.dmg*) printf 'sample-release' > "$out" ;; *SHA256SUMS*) if [ -n "$PULSE_BAD_SUM" ]; then printf '%s\\n' '0000  pulse.AppImage' > "$out"; else for name in pulse.AppImage pulse_aarch64.dmg pulse_x64.dmg; do printf '%s  %s\\n' "$(cat '${join(fixture, "sum")}')" "$name"; done > "$out"; fi ;; esac`);
    writeCommand("cp", `printf '%s\\n' "$*" >> '${copies}'`);
    writeCommand("chmod", "exit 0");
    writeCommand("open", `printf '%s\\n' "$*" >> '${copies}'`);
    const run = (badChecksum, platform = {}) => {
      const result = spawnSync("sh", ["public/install.sh"], {
        cwd: process.cwd(),
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, PULSE_BAD_SUM: badChecksum ? "1" : "", ...platform },
        encoding: "utf8",
      });
      return result;
    };
    try {
      const good = run(false);
      expect(good.status, good.stderr).toBe(0);
      expect(readFileSync(copies, "utf8")).toContain("worktree-agent-pulse");
      rmSync(copies);
      const intelMac = run(false, { PULSE_TEST_OS: "Darwin", PULSE_TEST_ARCH: "x86_64" });
      expect(intelMac.status, intelMac.stderr).toBe(0);
      expect(readFileSync(copies, "utf8")).toContain("pulse_x64.dmg");
      rmSync(copies);
      const bad = run(true);
      expect(bad.status).not.toBe(0);
      expect(bad.stderr).toContain("Checksum did not match");
      expect(() => readFileSync(copies, "utf8")).toThrow();
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("keeps the bundled native sample in preview mode and configures a real HTTP 404", () => {
    const webview = readFileSync("src/main.ts", "utf8");
    const config = JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8"));
    expect(webview).toContain('isSampleProject = true');
    expect(webview).toContain('if (!isNative || isSampleProject)');
    expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
  });
});
