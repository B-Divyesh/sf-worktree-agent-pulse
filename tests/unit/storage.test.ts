// @vitest-environment jsdom
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

  it("@claim:repository-delete forgets only the selected saved repository path", () => {
    saveRepositoryPath("/code/keep");
    saveRepositoryPath("/code/remove");
    removeRepositoryPath("/code/remove");
    expect(loadRepositoryPaths()).toEqual(["/code/keep"]);
    expect(sessionStorage.length).toBe(0);
  });
});
