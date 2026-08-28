export type AgentState = "working" | "blocked" | "idle" | "none";

export interface WorktreePulse {
  id: string;
  name: string;
  path: string;
  branch: string;
  agent: string;
  agentState: AgentState;
  updatedAt: string | null;
  dirty: number;
  ahead: number;
  behind: number;
  detached: boolean;
}

export interface RepositoryPulse {
  root: string;
  name: string;
  scannedAt: string;
  worktrees: WorktreePulse[];
  warnings: string[];
}

export type Filter = "all" | "needs-attention" | "working" | "clean";
