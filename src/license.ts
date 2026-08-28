const SLUG = "worktree-agent-pulse";
const KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${KEY}:verdict`;
const API = "https://api.sociobot.in/api/v1";
const DAY = 86_400_000;

interface CachedVerdict { valid: boolean; checkedAt: number }

export function checkoutUrl(): string {
  return `${API}/products/${SLUG}/checkout`;
}

export function captureReturnedLicense(): void {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  localStorage.setItem(KEY, token);
  url.searchParams.delete("license");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function hasCachedLicense(): boolean {
  if (!localStorage.getItem(KEY)) return false;
  try {
    return (JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as CachedVerdict | null)?.valid ?? true;
  } catch {
    return true;
  }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as CachedVerdict | null;
    if (!force && cache && Date.now() - cache.checkedAt < DAY) return cache.valid;
  } catch { /* verify below */ }
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("verify failed");
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return data.valid;
  } catch {
    return hasCachedLicense();
  }
}
