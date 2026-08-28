export type Platform = "mac" | "windows" | "linux";

interface ReleaseAsset { name: string; browser_download_url: string }
interface ReleaseData { html_url: string; tag_name: string; assets: ReleaseAsset[] }

const API_URL = "https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest";
const RELEASES_URL = "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases";
const CACHE_KEY = "pulse:latest-release";

export function detectPlatform(): Platform {
  const value = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (value.includes("mac")) return "mac";
  if (value.includes("win")) return "windows";
  return "linux";
}

function findAsset(release: ReleaseData, platform: Platform): ReleaseAsset | undefined {
  const tests: Record<Platform, RegExp[]> = {
    mac: [/\.dmg$/i, /\.app\.tar\.gz$/i],
    windows: [/\.msi$/i, /-setup\.exe$/i, /\.exe$/i],
    linux: [/\.appimage$/i, /\.deb$/i],
  };
  return release.assets.find((asset) => tests[platform].some((test) => test.test(asset.name)));
}

export async function getDownload(platform: Platform): Promise<{ url: string; version: string } | null> {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { at: number; release: ReleaseData } | null;
    const release = cached && Date.now() - cached.at < 3_600_000
      ? cached.release
      : await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } }).then(async (response) => {
          if (!response.ok) throw new Error("release unavailable");
          const data = await response.json() as ReleaseData;
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), release: data }));
          return data;
        });
    const asset = findAsset(release, platform);
    return asset ? { url: asset.browser_download_url, version: release.tag_name } : null;
  } catch {
    return null;
  }
}

export const releasesUrl = RELEASES_URL;
