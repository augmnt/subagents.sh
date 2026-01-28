import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { StorageScope } from '../types.js';

/**
 * Get the global agents directory path (~/.claude/agents/)
 * Creates it if it doesn't exist
 */
export function getGlobalAgentsDir(): string {
  const homeDir = os.homedir();
  const agentsDir = path.join(homeDir, '.claude', 'agents');

  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  return agentsDir;
}

/**
 * Get the local/project agents directory path (./.claude/agents/)
 * Creates it if it doesn't exist
 */
export function getLocalAgentsDir(): string {
  const cwd = process.cwd();
  const agentsDir = path.join(cwd, '.claude', 'agents');

  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  return agentsDir;
}

/**
 * Get the agents directory path for a given scope
 * Creates it if it doesn't exist
 * @param scope - 'global' (default) or 'local'
 */
export function getAgentsDir(scope: StorageScope = 'global'): string {
  return scope === 'global' ? getGlobalAgentsDir() : getLocalAgentsDir();
}

/**
 * Get the manifest file path for a given scope
 * @param scope - 'global' (default) or 'local'
 */
export function getManifestPath(scope: StorageScope = 'global'): string {
  const agentsDir = getAgentsDir(scope);
  return path.join(agentsDir, '.subagents.json');
}

/**
 * Check if a subagent file exists in the given scope
 * @param name - Subagent name
 * @param scope - 'global' (default) or 'local'
 */
export function subagentExists(name: string, scope: StorageScope = 'global'): boolean {
  const agentsDir = getAgentsDir(scope);
  const filePath = path.join(agentsDir, `${name}.md`);
  return fs.existsSync(filePath);
}

/**
 * Check if a subagent exists in either scope and return the scope
 * Returns null if not found in either location
 */
export function findSubagentScope(name: string): StorageScope | null {
  if (subagentExists(name, 'local')) {
    return 'local';
  }
  if (subagentExists(name, 'global')) {
    return 'global';
  }
  return null;
}

/**
 * Get the full path for a subagent file
 * @param name - Subagent name
 * @param scope - 'global' (default) or 'local'
 */
export function getSubagentPath(name: string, scope: StorageScope = 'global'): string {
  const agentsDir = getAgentsDir(scope);
  return path.join(agentsDir, `${name}.md`);
}

/**
 * List all .md files in the agents directory for a given scope
 * @param scope - 'global' (default) or 'local'
 */
export function listSubagentFiles(scope: StorageScope = 'global'): string[] {
  const agentsDir = getAgentsDir(scope);

  if (!fs.existsSync(agentsDir)) {
    return [];
  }

  return fs
    .readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));
}

/**
 * Check if local agents directory exists (without creating it)
 */
export function localAgentsDirExists(): boolean {
  const cwd = process.cwd();
  const agentsDir = path.join(cwd, '.claude', 'agents');
  return fs.existsSync(agentsDir);
}
