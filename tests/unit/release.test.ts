import { describe, expect, it } from "vitest";

const releaseApi = "https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest";

type Asset = { name: string; browser_download_url: string };
type Release = { tag_name: string; assets: Asset[] };

async function currentRelease(): Promise<Release> {
  const response = await fetch(releaseApi, { headers: { Accept: "application/vnd.github+json" } });
  expect(response.ok, `GitHub Releases returned ${response.status}`).toBe(true);
  return response.json() as Promise<Release>;
}

async function checksums(release: Release): Promise<string> {
  const sums = release.assets.find((asset) => asset.name === "SHA256SUMS");
  expect(sums, "current release includes SHA256SUMS").toBeDefined();
  const response = await fetch(sums!.browser_download_url);
  expect(response.ok, `SHA256SUMS returned ${response.status}`).toBe(true);
  return response.text();
}

describe("published desktop release", () => {
  it("@claim:release-available publishes a current release with a checksum file", async () => {
    const release = await currentRelease();
    expect(release.tag_name).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(release.assets.some((asset) => asset.name === "SHA256SUMS")).toBe(true);
    expect(await checksums(release)).toContain("Worktree.Agent.Pulse");
  }, 30_000);

  it("@claim:platform-artifacts publishes macOS, Windows, AppImage, and Debian artifacts with checksums", async () => {
    const release = await currentRelease();
    const names = release.assets.map((asset) => asset.name);
    const required = [
      /(?:aarch64|arm64).*\.dmg$/i,
      /(?:x64|x86_64|amd64).*\.dmg$/i,
      /(?:x64|x86_64|amd64).*(?:setup)?\.exe$/i,
      /\.appimage$/i,
      /\.deb$/i,
    ];
    const sums = await checksums(release);
    for (const expression of required) {
      const name = names.find((candidate) => expression.test(candidate));
      expect(name, `missing asset matching ${expression}`).toBeDefined();
      expect(sums).toContain(name!);
    }
  }, 30_000);
});
