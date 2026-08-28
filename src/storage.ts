import type { RepositoryPulse } from "./types";

const DEMO_KEY = "demo:worktree-agent-pulse:repository";
const REAL_KEY = "pulse:repositories";

export function getDemoRepository(seed: RepositoryPulse): RepositoryPulse {
  const stored = sessionStorage.getItem(DEMO_KEY);
  if (!stored) {
    sessionStorage.setItem(DEMO_KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  try {
    return JSON.parse(stored) as RepositoryPulse;
  } catch {
    sessionStorage.setItem(DEMO_KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
}

export function resetDemo(seed: RepositoryPulse): RepositoryPulse {
  sessionStorage.removeItem(DEMO_KEY);
  return getDemoRepository(seed);
}

export function clearDemo(): void {
  sessionStorage.removeItem(DEMO_KEY);
}

export function loadRepositoryPaths(): string[] {
  try {
    return JSON.parse(localStorage.getItem(REAL_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function saveRepositoryPath(path: string): void {
  const next = Array.from(new Set([...loadRepositoryPaths(), path]));
  localStorage.setItem(REAL_KEY, JSON.stringify(next));
}

/** Removes only the selected repository path; it never touches repository files. */
export function removeRepositoryPath(path: string): void {
  const next = loadRepositoryPaths().filter((stored) => stored !== path);
  if (next.length) localStorage.setItem(REAL_KEY, JSON.stringify(next));
  else localStorage.removeItem(REAL_KEY);
}
