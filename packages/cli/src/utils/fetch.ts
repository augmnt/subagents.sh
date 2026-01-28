import type { FetchResult } from '../types.js';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const GITHUB_API_BASE = 'https://api.github.com';

// Common paths where subagents might be located
const SEARCH_PATHS = ['.claude/agents', 'agents', '.claude', ''];

/**
 * Parse a subagent identifier (owner/repo/name or full GitHub URL)
 */
export function parseIdentifier(identifier: string): {
  owner: string;
  repo: string;
  name: string;
} {
  // Handle full GitHub URLs
  if (identifier.startsWith('https://github.com/')) {
    const url = new URL(identifier);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      // If there's a blob/tree path, extract the file name
      let name = repo;

      if (parts.length > 4 && (parts[2] === 'blob' || parts[2] === 'tree')) {
        // e.g., /owner/repo/blob/main/.claude/agents/agent-name.md
        const filePath = parts.slice(4).join('/');
        name = filePath.replace(/\.md$/, '').split('/').pop() || repo;
      } else if (parts.length > 2) {
        name = parts[parts.length - 1].replace(/\.md$/, '');
      }

      return { owner, repo, name };
    }
  }

  // Handle owner/repo/name format
  const parts = identifier.split('/');

  if (parts.length === 3) {
    return {
      owner: parts[0],
      repo: parts[1],
      name: parts[2].replace(/\.md$/, ''),
    };
  }

  if (parts.length === 2) {
    // Assume owner/repo, and name is the repo
    return {
      owner: parts[0],
      repo: parts[1],
      name: parts[1],
    };
  }

  throw new Error(
    `Invalid identifier format: "${identifier}". Expected owner/repo/name or GitHub URL.`
  );
}

/**
 * Fetch subagent content from GitHub
 * Tries multiple paths to find the agent file
 */
export async function fetchFromGitHub(
  owner: string,
  repo: string,
  name: string,
  branch = 'main'
): Promise<FetchResult> {
  const errors: string[] = [];

  // Try each search path
  for (const basePath of SEARCH_PATHS) {
    const filePath = basePath ? `${basePath}/${name}.md` : `${name}.md`;
    const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${filePath}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        const content = await response.text();
        return {
          content,
          source: {
            owner,
            repo,
            name,
            branch,
            path: filePath,
          },
        };
      }

      if (response.status !== 404) {
        errors.push(`${filePath}: HTTP ${response.status}`);
      }
    } catch (err) {
      errors.push(`${filePath}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Try with 'master' branch if 'main' didn't work
  if (branch === 'main') {
    try {
      return await fetchFromGitHub(owner, repo, name, 'master');
    } catch {
      // Fall through to error
    }
  }

  throw new Error(
    `Could not find subagent "${name}" in ${owner}/${repo}.\n` +
      `Searched in: ${SEARCH_PATHS.map((p) => p || '(root)').join(', ')}\n` +
      `Make sure the file exists at one of these locations.`
  );
}

/**
 * Check if a GitHub repo exists and is accessible
 */
export async function checkRepoExists(owner: string, repo: string): Promise<boolean> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the default branch for a repository
 */
export async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = (await response.json()) as { default_branch?: string };
      return data.default_branch || 'main';
    }
  } catch {
    // Fall through
  }

  return 'main';
}
