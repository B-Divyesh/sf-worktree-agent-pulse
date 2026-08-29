// @vitest-environment jsdom
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { SAMPLE_REPOSITORY } from "../../src/sample";
import { getDemoRepository, loadRepositoryPaths, removeRepositoryPath, resetDemo, saveRepositoryPath } from "../../src/storage";

describe("separate storage namespaces", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it("keeps demo data in session storage", () => {
    expect(getDemoRepository(SAMPLE_REPOSITORY).worktrees).toHaveLength(5);
    expect(sessionStorage.getItem("demo:worktree-agent-pulse:repository")).toContain("checkout-retry");
    expect(localStorage.length).toBe(0);
  });

  it("resets only the demo", () => {
    saveRepositoryPath("/code/real");
    resetDemo(SAMPLE_REPOSITORY);
    expect(loadRepositoryPaths()).toEqual(["/code/real"]);
  });

  it("@claim:repository-delete forgets a path without changing repository files or Git state", () => {
    const fixture = mkdtempSync(join(tmpdir(), "pulse-remove-"));
    const tracked = join(fixture, "tracked.txt");
    const untracked = join(fixture, "untracked.txt");
    try {
      execFileSync("git", ["init", "--quiet", fixture]);
      execFileSync("git", ["-C", fixture, "config", "user.email", "pulse@example.invalid"]);
      execFileSync("git", ["-C", fixture, "config", "user.name", "Pulse Test"]);
      writeFileSync(tracked, "tracked canary\n");
      execFileSync("git", ["-C", fixture, "add", "tracked.txt"]);
      execFileSync("git", ["-C", fixture, "commit", "--quiet", "-m", "fixture"]);
      writeFileSync(untracked, "untracked canary\n");
      const beforeStatus = execFileSync("git", ["-C", fixture, "status", "--porcelain=v2"], { encoding: "utf8" });

      saveRepositoryPath("/code/keep");
      saveRepositoryPath(fixture);
      removeRepositoryPath(fixture);

      expect(loadRepositoryPaths()).toEqual(["/code/keep"]);
      expect(readFileSync(tracked, "utf8")).toBe("tracked canary\n");
      expect(readFileSync(untracked, "utf8")).toBe("untracked canary\n");
      expect(execFileSync("git", ["-C", fixture, "status", "--porcelain=v2"], { encoding: "utf8" })).toBe(beforeStatus);
      expect(sessionStorage.length).toBe(0);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
