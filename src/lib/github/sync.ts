import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import crypto from 'crypto';
import {
  getActiveSources,
  upsertSubagent,
  updateSourceSyncStatus,
  type Source,
} from '@/lib/supabase/subagents';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface SubagentFrontmatter {
  name?: string;
  description?: string;
  tools?: string[] | string;
  category?: string;
  [key: string]: unknown;
}

// Valid categories for subagents
const VALID_CATEGORIES = [
  'backend',
  'frontend',
  'fullstack',
  'testing',
  'security',
  'devops',
  'documentation',
  'refactoring',
  'database',
  'api',
  'ai-ml',
  'other',
] as const;

type Category = typeof VALID_CATEGORIES[number];

// Parse and validate category from frontmatter
function parseCategory(category: unknown): Category | null {
  if (typeof category !== 'string') return null;
  const normalized = category.toLowerCase().trim();
  return VALID_CATEGORIES.includes(normalized as Category) ? (normalized as Category) : null;
}

// Parse tools from frontmatter - handles both arrays and comma-separated strings
function parseTools(tools: unknown): string[] | null {
  if (Array.isArray(tools)) {
    return tools.map((t) => String(t).trim()).filter((t) => t);
  }
  if (typeof tools === 'string' && tools.trim()) {
    return tools.split(',').map((t) => t.trim()).filter((t) => t);
  }
  return null;
}

interface ParsedSubagent {
  name: string;
  slug: string;
  description: string | null;
  content: string;
  tools: string[] | null;
  category: Category | null;
  file_path: string;
  content_hash: string;
  github_url: string;
}

// Parse a markdown file with YAML frontmatter
function parseSubagentFile(
  content: string,
  filePath: string,
  owner: string,
  repo: string,
  branch: string
): ParsedSubagent | null {
  try {
    const { data: frontmatter, content: markdownContent } = matter(content);
    const fm = frontmatter as SubagentFrontmatter;

    // Extract slug from filename (e.g., "backend-architect.md" -> "backend-architect")
    const fileName = filePath.split('/').pop() || '';
    const slug = fileName.replace(/\.md$/, '');

    if (!slug) {
      console.warn(`Could not extract slug from file path: ${filePath}`);
      return null;
    }

    // Use frontmatter name or derive from slug
    const name = fm.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // Generate content hash for change detection
    const contentHash = crypto.createHash('md5').update(content).digest('hex');

    return {
      name,
      slug,
      description: fm.description || null,
      content: content, // Store full content including frontmatter
      tools: parseTools(fm.tools),
      category: parseCategory(fm.category),
      file_path: filePath,
      content_hash: contentHash,
      github_url: `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
    };
  } catch (error) {
    console.error(`Error parsing subagent file ${filePath}:`, error);
    return null;
  }
}

// Get contents of a directory from GitHub
async function getDirectoryContents(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ name: string; path: string; type: string; download_url: string | null }[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        download_url: item.download_url,
      }));
    }

    return [];
  } catch (error: unknown) {
    const githubError = error as { status?: number };
    if (githubError.status === 404) {
      console.warn(`Directory not found: ${owner}/${repo}/${path}`);
      return [];
    }
    throw error;
  }
}

// Get file content from GitHub
async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return null;
  } catch (error: unknown) {
    const githubError = error as { status?: number };
    if (githubError.status === 404) {
      return null;
    }
    throw error;
  }
}

// Sync a single source repository
async function syncSource(source: Source): Promise<{
  synced: number;
  errors: number;
}> {
  let synced = 0;
  let errors = 0;

  try {
    // Get list of files in the agents directory
    const files = await getDirectoryContents(
      source.owner,
      source.repo,
      source.agents_path,
      source.branch
    );

    // Filter to only .md files, excluding README and LICENSE
    const excludeFiles = ['README.md', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
    const mdFiles = files.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md') && !excludeFiles.includes(f.name)
    );

    console.log(
      `Found ${mdFiles.length} markdown files in ${source.owner}/${source.repo}/${source.agents_path}`
    );

    // Process each file
    for (const file of mdFiles) {
      try {
        const content = await getFileContent(
          source.owner,
          source.repo,
          file.path,
          source.branch
        );

        if (!content) {
          console.warn(`Could not read content for ${file.path}`);
          errors++;
          continue;
        }

        const parsed = parseSubagentFile(
          content,
          file.path,
          source.owner,
          source.repo,
          source.branch
        );

        if (!parsed) {
          errors++;
          continue;
        }

        // Upsert to database
        await upsertSubagent({
          name: parsed.name,
          slug: parsed.slug,
          description: parsed.description,
          content: parsed.content,
          owner: source.owner,
          repo: source.repo,
          file_path: parsed.file_path,
          tools: parsed.tools,
          category: parsed.category,
          github_url: parsed.github_url,
          content_hash: parsed.content_hash,
          last_synced_at: new Date().toISOString(),
        });

        synced++;
        console.log(`Synced: ${source.owner}/${source.repo}/${parsed.slug}`);
      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error);
        errors++;
      }
    }

    // Update source sync status
    await updateSourceSyncStatus(source.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error syncing source ${source.owner}/${source.repo}:`, error);
    await updateSourceSyncStatus(source.id, errorMessage);
    throw error;
  }

  return { synced, errors };
}

// Sync all active sources
export async function syncAllSources(): Promise<{
  totalSynced: number;
  totalErrors: number;
  sourcesProcessed: number;
}> {
  const sources = await getActiveSources();

  let totalSynced = 0;
  let totalErrors = 0;

  console.log(`Starting sync for ${sources.length} active sources`);

  for (const source of sources) {
    try {
      const { synced, errors } = await syncSource(source);
      totalSynced += synced;
      totalErrors += errors;
    } catch (error) {
      console.error(`Failed to sync source ${source.owner}/${source.repo}:`, error);
      totalErrors++;
    }
  }

  console.log(
    `Sync complete: ${totalSynced} synced, ${totalErrors} errors across ${sources.length} sources`
  );

  return {
    totalSynced,
    totalErrors,
    sourcesProcessed: sources.length,
  };
}

// Sync a specific source by owner/repo
export async function syncSpecificSource(
  owner: string,
  repo: string
): Promise<{ synced: number; errors: number }> {
  const sources = await getActiveSources();
  const source = sources.find((s) => s.owner === owner && s.repo === repo);

  if (!source) {
    throw new Error(`Source not found: ${owner}/${repo}`);
  }

  return syncSource(source);
}
