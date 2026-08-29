// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasCachedLicense, storeLicense, verifyLicense } from "../../src/license";

describe("license verification interval", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-29T09:00:00Z"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

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

  it("keeps an uncached license locked when verification fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network unavailable")));
    storeLicense("unverified-network-token");

    await expect(verifyLicense(true)).resolves.toBe(false);
    expect(hasCachedLicense()).toBe(false);
    expect(localStorage.getItem("sb_license:worktree-agent-pulse:verdict")).toBeNull();
  });

  it("keeps an uncached license locked after a 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Slow down", { status: 429, headers: { "Retry-After": "4" } })));
    storeLicense("unverified-rate-limit-token");

    await expect(verifyLicense(true)).resolves.toBe(false);
    expect(hasCachedLicense()).toBe(false);
    expect(localStorage.getItem("sb_license:worktree-agent-pulse:verdict")).toBeNull();
  });
});
