const SLUG = "worktree-agent-pulse";
const KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${KEY}:verdict`;
const API = "https://api.sociobot.in/api/v1";
const DAY = 86_400_000;

interface CachedVerdict {
  valid: boolean;
  checkedAt: number;
  expiresAt: number | null;
  token: string;
}

export function checkoutUrl(): string {
  return `${API}/products/${SLUG}/checkout`;
}

export function captureReturnedLicense(): void {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  // A return URL may replace a previous license. Clear its verdict too so a
  // valid verdict can never be reused for a different token.
  storeLicense(token);
  url.searchParams.delete("license");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

function cachedVerdict(token: string): CachedVerdict | null {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as Partial<CachedVerdict> | null;
    if (!value || typeof value.valid !== "boolean" || typeof value.checkedAt !== "number" || !Number.isFinite(value.checkedAt)) return null;
    if (value.token !== token || (value.expiresAt !== null && (typeof value.expiresAt !== "number" || !Number.isFinite(value.expiresAt)))) return null;
    return value as CachedVerdict;
  } catch {
    return null;
  }
}

function verdictIsActive(verdict: CachedVerdict): boolean {
  return verdict.valid && (verdict.expiresAt === null || verdict.expiresAt > Date.now());
}

function expiresAt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function hasCachedLicense(): boolean {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  const cache = cachedVerdict(token);
  return Boolean(cache && verdictIsActive(cache));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  const cache = cachedVerdict(token);
  if (!force && cache && Date.now() - cache.checkedAt < DAY && (!cache.valid || verdictIsActive(cache))) return verdictIsActive(cache);
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("verify failed");
    const data = await response.json() as { valid?: unknown; expires_at?: unknown };
    const licenseExpiresAt = expiresAt(data.expires_at);
    const valid = data.valid === true && (licenseExpiresAt === null || licenseExpiresAt > Date.now());
    localStorage.setItem(CACHE_KEY, JSON.stringify({ valid, checkedAt: Date.now(), expiresAt: licenseExpiresAt, token } satisfies CachedVerdict));
    return valid;
  } catch {
    // A request failure must never activate an unverified token. Only a prior,
    // still-valid verdict for this exact token can keep Pro available offline.
    return hasCachedLicense();
  }
}
