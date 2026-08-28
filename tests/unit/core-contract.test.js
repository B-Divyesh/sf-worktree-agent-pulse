import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("desktop core contract", () => {
  it("@claim:metadata-only uses read-only Git commands and one adapter file", () => {
    const source = readFileSync("src-tauri/src/lib.rs", "utf8");
    expect(source).toContain('["rev-parse", "--show-toplevel"]');
    expect(source).toContain('["worktree", "list", "--porcelain"]');
    expect(source).toContain('["status", "--porcelain=v2", "--branch"]');
    expect(source).toContain('join(".worktree-agent-pulse").join("status.json")');
    expect(source).not.toMatch(/\b(add|commit|checkout|merge|rebase|reset|clean|push|pull)\b.*Command::new\("git"\)/);
  });
});
