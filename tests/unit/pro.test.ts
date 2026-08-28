import { describe, expect, it, vi } from "vitest";
import { FREE_WORKTREE_LIMIT, PRO_REFRESH_INTERVAL_MS, scheduleProRefresh, worktreesForLicense } from "../../src/pro";

describe("Pulse Pro behavior", () => {
  it("@claim:pro-capacity-refresh shows every worktree and schedules 10-second refresh", () => {
    const worktrees = Array.from({ length: 8 }, (_, index) => ({ id: index }));
    expect(worktreesForLicense(worktrees, false)).toHaveLength(FREE_WORKTREE_LIMIT);
    expect(worktreesForLicense(worktrees, true)).toEqual(worktrees);

    const refresh = vi.fn();
    let tick: (() => void) | undefined;
    const schedule = vi.fn((callback: () => void, intervalMs: number) => {
      expect(intervalMs).toBe(PRO_REFRESH_INTERVAL_MS);
      tick = callback;
      return 42;
    });
    const timer = scheduleProRefresh(refresh, () => true, schedule);

    expect(timer).toBe(42);
    expect(schedule).toHaveBeenCalledWith(expect.any(Function), 10_000);
    expect(PRO_REFRESH_INTERVAL_MS).toBe(10_000);
    tick?.();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
