import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("release manifest provenance", () => {
  it("records the exact source commit and every advertised desktop artifact", () => {
    const directory = mkdtempSync(join(tmpdir(), "pulse-release-manifest-"));
    const commit = "a".repeat(40);
    const assets = [
      "Worktree.Agent.Pulse_0.1.6_aarch64.dmg",
      "Worktree.Agent.Pulse_0.1.6_x64.dmg",
      "Worktree.Agent.Pulse_0.1.6_x64-setup.exe",
      "Worktree.Agent.Pulse_0.1.6_amd64.AppImage",
      "Worktree.Agent.Pulse_0.1.6_amd64.deb",
    ];
    try {
      for (const asset of assets) writeFileSync(join(directory, asset), "fixture");
      execFileSync("node", [join(process.cwd(), "scripts/release-manifest.mjs"), "v0.1.6", "B-Divyesh/sf-worktree-agent-pulse", commit], { cwd: directory });
      const manifest = JSON.parse(readFileSync(join(directory, "latest.json"), "utf8"));
      expect(manifest).toMatchObject({ version: "v0.1.6", source_commit: commit });
      expect(Object.values(manifest.platforms)).toHaveLength(5);
      expect(Object.values(manifest.platforms).join("\n")).toContain("_x64.dmg");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects a manifest when an advertised platform artifact is absent", () => {
    const directory = mkdtempSync(join(tmpdir(), "pulse-release-manifest-"));
    try {
      writeFileSync(join(directory, "Worktree.Agent.Pulse_0.1.6_amd64.deb"), "fixture");
      expect(() => execFileSync("node", [join(process.cwd(), "scripts/release-manifest.mjs"), "v0.1.6", "B-Divyesh/sf-worktree-agent-pulse", "b".repeat(40)], { cwd: directory, stdio: "pipe" })).toThrow(/missing one or more advertised desktop artifacts/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
