// CLI Types

export type StorageScope = 'global' | 'local';

export interface SubagentFrontmatter {
  name: string;
  description?: string;
  tools?: string[];
  category?: string;
  [key: string]: unknown;
}

export interface ParsedSubagent {
  frontmatter: SubagentFrontmatter;
  content: string;
  raw: string;
}

export interface InstalledSubagent {
  name: string;
  path: string;
  source: string; // owner/repo/name or GitHub URL
  description?: string;
  tools?: string[] | string;
  category?: string;
  installedAt: string;
  updatedAt: string;
}

export interface Manifest {
  version: string;
  subagents: Record<string, InstalledSubagent>;
}

export interface FetchResult {
  content: string;
  source: {
    owner: string;
    repo: string;
    name: string;
    branch: string;
    path: string;
  };
}

export interface TelemetryPayload {
  subagentId: string;
  event: 'download' | 'view' | 'copy';
  metadata?: Record<string, unknown>;
}
