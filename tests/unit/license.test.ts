// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storeLicense, verifyLicense } from "../../src/license";

describe("license verification interval", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-29T09:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("@claim:license-daily verifies once, waits 24 hours, then verifies again", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    storeLicense("fixture-token");

    await expect(verifyLicense()).resolves.toBe(true);
    vi.advanceTimersByTime(86_399_999);
    await expect(verifyLicense()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    await expect(verifyLicense()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("https://api.sociobot.in/api/v1/products/worktree-agent-pulse/verify?license=fixture-token");
  });
});
