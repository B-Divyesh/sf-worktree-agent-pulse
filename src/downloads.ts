export type Platform = "mac-arm64" | "mac-x64" | "windows" | "linux";

interface ReleaseAsset { name: string; browser_download_url: string }
interface ReleaseData { html_url: string; tag_name: string; assets: ReleaseAsset[] }

const API_URL = "https://api.github.com/repos/B-Divyesh/sf-worktree-agent-pulse/releases/latest";
const RELEASES_URL = "https://github.com/B-Divyesh/sf-worktree-agent-pulse/releases";
const CACHE_KEY = "pulse:latest-release";

export function platformFromUserAgent(value: string): Platform {
  const normalized = value.toLowerCase();
  if (normalized.includes("mac")) return /arm|aarch64/.test(normalized) ? "mac-arm64" : "mac-x64";
  if (normalized.includes("win")) return "windows";
  return "linux";
}

type UserAgentData = { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };

export async function detectPlatform(): Promise<Platform> {
  const fallback = platformFromUserAgent(`${navigator.userAgent} ${navigator.platform}`);
  const clientHints = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (!clientHints?.getHighEntropyValues || !fallback.startsWith("mac-")) return fallback;
  try {
    const { architecture } = await clientHints.getHighEntropyValues(["architecture"]);
    return /arm|aarch64/i.test(architecture ?? "") ? "mac-arm64" : fallback;
  } catch {
    return fallback;
  }
}

export function findAsset(release: ReleaseData, platform: Platform): ReleaseAsset | undefined {
  const tests: Record<Platform, RegExp[]> = {
    "mac-arm64": [/(aarch64|arm64).*\.dmg$/i, /(aarch64|arm64).*\.app\.tar\.gz$/i],
    "mac-x64": [/(x86_64|x64|amd64).*\.dmg$/i, /(x86_64|x64|amd64).*\.app\.tar\.gz$/i],
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
