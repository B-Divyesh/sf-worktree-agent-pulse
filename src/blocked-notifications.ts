import type { WorktreePulse } from "./types";

const PREFERENCE_KEY = "pulse:blocked-alerts";

export function newlyBlocked(previous: WorktreePulse[], current: WorktreePulse[]): WorktreePulse[] {
  const priorStates = new Map(previous.map((item) => [item.id, item.agentState]));
  return current.filter((item) => item.agentState === "blocked" && priorStates.get(item.id) !== "blocked");
}

export function blockedAlertsEnabled(): boolean {
  return localStorage.getItem(PREFERENCE_KEY) === "enabled";
}

export async function setBlockedAlertsEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    localStorage.removeItem(PREFERENCE_KEY);
    return false;
  }
  const { isPermissionGranted, requestPermission } = await import("@tauri-apps/plugin-notification");
  const granted = await isPermissionGranted() || await requestPermission() === "granted";
  if (granted) localStorage.setItem(PREFERENCE_KEY, "enabled");
  return granted;
}

export async function notifyBlockedTransitions(previous: WorktreePulse[], current: WorktreePulse[]): Promise<WorktreePulse[]> {
  const blocked = newlyBlocked(previous, current);
  if (!blockedAlertsEnabled() || !blocked.length) return blocked;
  const { sendNotification } = await import("@tauri-apps/plugin-notification");
  for (const item of blocked) {
    sendNotification({
      id: Math.abs(hash(item.id)),
      title: `${item.name} is blocked`,
      body: "Open Worktree Agent Pulse to review this worktree.",
      autoCancel: true,
      extra: { worktreeId: item.id },
    });
  }
  return blocked;
}

export async function listenForBlockedAlertActions(select: (worktreeId: string) => void): Promise<() => void> {
  const { onAction } = await import("@tauri-apps/plugin-notification");
  const listener = await onAction((notification) => {
    const worktreeId = notification.extra?.worktreeId;
    if (typeof worktreeId === "string") select(worktreeId);
  });
  return () => listener.unregister();
}

function hash(value: string): number {
  let result = 0;
  for (const character of value) result = ((result << 5) - result + character.charCodeAt(0)) | 0;
  return result;
}
