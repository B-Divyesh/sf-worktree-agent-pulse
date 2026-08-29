// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedAlertsEnabled, listenForBlockedAlertActions, newlyBlocked, notifyBlockedTransitions } from "../../src/blocked-notifications";
import { SAMPLE_REPOSITORY } from "../../src/sample";

const notification = vi.hoisted(() => ({
  send: vi.fn(),
  onAction: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-notification", () => ({
  sendNotification: notification.send,
  onAction: notification.onAction,
}));

describe("blocked-state alerts", () => {
  beforeEach(() => { localStorage.clear(); notification.send.mockReset(); notification.onAction.mockReset(); });

  it("@claim:blocked-notifications sends one opt-in alert for a new blocked transition and routes its action", async () => {
    const current = structuredClone(SAMPLE_REPOSITORY.worktrees);
    const previous = structuredClone(current);
    previous[0].agentState = "working";
    expect(newlyBlocked(previous, current).map((item) => item.id)).toEqual(["wt-checkout"]);
    expect(newlyBlocked(current, current)).toEqual([]);
    expect(blockedAlertsEnabled()).toBe(false);

    localStorage.setItem("pulse:blocked-alerts", "enabled");
    await notifyBlockedTransitions(previous, current);
    await notifyBlockedTransitions(current, current);
    expect(notification.send).toHaveBeenCalledOnce();
    expect(notification.send).toHaveBeenCalledWith(expect.objectContaining({
      title: "checkout-retry is blocked",
      extra: { worktreeId: "wt-checkout" },
    }));

    let action: ((value: { extra?: Record<string, unknown> }) => void) | undefined;
    notification.onAction.mockImplementation(async (callback) => {
      action = callback;
      return { unregister: vi.fn() };
    });
    const select = vi.fn();
    await listenForBlockedAlertActions(select);
    action?.({ extra: { worktreeId: "wt-checkout" } });
    expect(select).toHaveBeenCalledWith("wt-checkout");
  });
});
