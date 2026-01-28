import * as fs from 'node:fs';
import matter from 'gray-matter';
import { getSubagentPath, subagentExists, findSubagentScope } from './paths.js';
import { addToManifest, getFromManifest, removeFromManifest, listManifestSubagents } from './manifest.js';
import { fetchFromGitHub, parseIdentifier, getDefaultBranch } from './fetch.js';
import { sendTelemetry } from './telemetry.js';
import type { ParsedSubagent, InstalledSubagent, SubagentFrontmatter, StorageScope } from '../types.js';

/**
 * Parse a subagent markdown file content
 */
export function parseSubagent(content: string): ParsedSubagent {
  const { data, content: body } = matter(content);
  const frontmatter = data as SubagentFrontmatter;

  if (!frontmatter.name) {
    throw new Error('Subagent is missing required "name" field in frontmatter');
  }

  return {
    frontmatter,
    content: body.trim(),
    raw: content,
  };
}

export interface InstallOptions {
  force?: boolean;
  scope?: StorageScope;
  category?: string;
}

/**
 * Install a subagent from an identifier (owner/repo/name or GitHub URL)
 * @param identifier - The subagent identifier
 * @param options - Installation options including scope ('global' or 'local')
 */
export async function installSubagent(
  identifier: string,
  options: InstallOptions = {}
): Promise<{ name: string; path: string; isUpdate: boolean; scope: StorageScope }> {
  const { owner, repo, name } = parseIdentifier(identifier);
  const scope = options.scope ?? 'global';

  // Check if already installed in the target scope
  const existing = getFromManifest(name, scope);
  const fileExists = subagentExists(name, scope);

  if ((existing || fileExists) && !options.force) {
    throw new Error(
      `Subagent "${name}" is already installed in ${scope} scope. Use --force to overwrite.`
    );
  }

  const isUpdate = !!existing;

  // Get default branch
  const branch = await getDefaultBranch(owner, repo);

  // Fetch the subagent content
  const result = await fetchFromGitHub(owner, repo, name, branch);

  // Parse and validate the content
  const parsed = parseSubagent(result.content);

  // Write the file
  const filePath = getSubagentPath(name, scope);
  fs.writeFileSync(filePath, result.content);

  // Update manifest
  const now = new Date().toISOString();
  const subagentInfo: InstalledSubagent = {
    name: parsed.frontmatter.name,
    path: filePath,
    source: `${owner}/${repo}/${name}`,
    description: parsed.frontmatter.description,
    tools: parsed.frontmatter.tools,
    category: options.category || parsed.frontmatter.category,
    installedAt: existing?.installedAt || now,
    updatedAt: now,
  };

  addToManifest(name, subagentInfo, scope);

  // Send telemetry (fire and forget)
  const subagentId = `${owner}/${repo}/${name}`;
  sendTelemetry(subagentId, 'download', {
    owner,
    repo,
    name,
    isUpdate,
    scope,
  });

  return {
    name,
    path: filePath,
    isUpdate,
    scope,
  };
}

export interface UninstallOptions {
  scope?: StorageScope;
}

/**
 * Uninstall a subagent
 * @param name - Subagent name
 * @param options - Uninstall options including scope ('global' or 'local')
 *                  If scope is not specified, auto-detects the location
 */
export function uninstallSubagent(
  name: string,
  options: UninstallOptions = {}
): { path: string; scope: StorageScope } {
  // Auto-detect scope if not specified
  let scope: StorageScope | undefined = options.scope;

  if (!scope) {
    const foundScope = findSubagentScope(name);
    if (!foundScope) {
      throw new Error(`Subagent "${name}" is not installed.`);
    }
    scope = foundScope;
  }

  const filePath = getSubagentPath(name, scope);
  const existing = getFromManifest(name, scope);
  const fileExists = subagentExists(name, scope);

  if (!existing && !fileExists) {
    throw new Error(`Subagent "${name}" is not installed in ${scope} scope.`);
  }

  // Remove file if it exists
  if (fileExists) {
    fs.unlinkSync(filePath);
  }

  // Remove from manifest
  removeFromManifest(name, scope);

  return { path: filePath, scope };
}

export interface UpdateOptions {
  scope?: StorageScope;
}

/**
 * Update all installed subagents in a given scope
 * @param options - Update options including scope ('global' or 'local')
 * @param onProgress - Progress callback
 */
export async function updateAllSubagents(
  options: UpdateOptions = {},
  onProgress?: (name: string, status: 'updating' | 'updated' | 'error', error?: string) => void
): Promise<{ updated: string[]; errors: Array<{ name: string; error: string }> }> {
  const scope = options.scope ?? 'global';
  const installed = listManifestSubagents(scope);

  const updated: string[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (const subagent of installed) {
    onProgress?.(subagent.name, 'updating');

    try {
      await installSubagent(subagent.source, { force: true, scope });
      updated.push(subagent.name);
      onProgress?.(subagent.name, 'updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      errors.push({ name: subagent.name, error: errorMessage });
      onProgress?.(subagent.name, 'error', errorMessage);
    }
  }

  return { updated, errors };
}

/**
 * Update all subagents in both scopes
 */
export async function updateAllScopesSubagents(
  onProgress?: (name: string, scope: StorageScope, status: 'updating' | 'updated' | 'error', error?: string) => void
): Promise<{
  global: { updated: string[]; errors: Array<{ name: string; error: string }> };
  local: { updated: string[]; errors: Array<{ name: string; error: string }> };
}> {
  const globalResult = await updateAllSubagents(
    { scope: 'global' },
    onProgress ? (name, status, error) => onProgress(name, 'global', status, error) : undefined
  );

  const localResult = await updateAllSubagents(
    { scope: 'local' },
    onProgress ? (name, status, error) => onProgress(name, 'local', status, error) : undefined
  );

  return {
    global: globalResult,
    local: localResult,
  };
}
