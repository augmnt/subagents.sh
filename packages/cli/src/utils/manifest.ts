import * as fs from 'node:fs';
import { getManifestPath } from './paths.js';
import type { Manifest, InstalledSubagent, StorageScope } from '../types.js';

const MANIFEST_VERSION = '1';

/**
 * Load the manifest file for a given scope
 * @param scope - 'global' (default) or 'local'
 */
export function loadManifest(scope: StorageScope = 'global'): Manifest {
  const manifestPath = getManifestPath(scope);

  if (!fs.existsSync(manifestPath)) {
    return {
      version: MANIFEST_VERSION,
      subagents: {},
    };
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as Manifest;
  } catch {
    return {
      version: MANIFEST_VERSION,
      subagents: {},
    };
  }
}

/**
 * Save the manifest file for a given scope
 * @param manifest - The manifest to save
 * @param scope - 'global' (default) or 'local'
 */
export function saveManifest(manifest: Manifest, scope: StorageScope = 'global'): void {
  const manifestPath = getManifestPath(scope);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Add a subagent to the manifest for a given scope
 * @param name - Subagent name
 * @param subagent - Subagent info
 * @param scope - 'global' (default) or 'local'
 */
export function addToManifest(name: string, subagent: InstalledSubagent, scope: StorageScope = 'global'): void {
  const manifest = loadManifest(scope);
  manifest.subagents[name] = subagent;
  saveManifest(manifest, scope);
}

/**
 * Remove a subagent from the manifest for a given scope
 * @param name - Subagent name
 * @param scope - 'global' (default) or 'local'
 */
export function removeFromManifest(name: string, scope: StorageScope = 'global'): void {
  const manifest = loadManifest(scope);
  delete manifest.subagents[name];
  saveManifest(manifest, scope);
}

/**
 * Get a subagent from the manifest for a given scope
 * @param name - Subagent name
 * @param scope - 'global' (default) or 'local'
 */
export function getFromManifest(name: string, scope: StorageScope = 'global'): InstalledSubagent | undefined {
  const manifest = loadManifest(scope);
  return manifest.subagents[name];
}

/**
 * List all subagents in the manifest for a given scope
 * @param scope - 'global' (default) or 'local'
 */
export function listManifestSubagents(scope: StorageScope = 'global'): InstalledSubagent[] {
  const manifest = loadManifest(scope);
  return Object.values(manifest.subagents);
}
