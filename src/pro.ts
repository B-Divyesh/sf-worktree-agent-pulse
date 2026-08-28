export const FREE_WORKTREE_LIMIT = 5;
export const PRO_REFRESH_INTERVAL_MS = 10_000;

export function worktreesForLicense<T>(worktrees: readonly T[], isPro: boolean): T[] {
  return isPro ? [...worktrees] : worktrees.slice(0, FREE_WORKTREE_LIMIT);
}

export function scheduleProRefresh(
  refresh: () => void,
  canRefresh: () => boolean,
  schedule: (callback: () => void, intervalMs: number) => number = window.setInterval,
): number {
  return schedule(() => {
    if (canRefresh()) refresh();
  }, PRO_REFRESH_INTERVAL_MS);
}
