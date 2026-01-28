import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import crypto from 'crypto';
import {
  recordTelemetry,
  incrementDownloadCount,
  incrementViewCount,
  getSubagent,
  upsertSubagent,
} from '@/lib/supabase/subagents';

export const dynamic = 'force-dynamic';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface TelemetryPayload {
  subagentId: string;
  event: 'download' | 'view' | 'copy';
  metadata?: Record<string, unknown>;
}

// Parse subagent ID into owner/repo/name
function parseSubagentId(subagentId: string): { owner: string; repo: string; name: string } | null {
  const parts = subagentId.split('/');
  if (parts.length !== 3) return null;
  return { owner: parts[0], repo: parts[1], name: parts[2] };
}

// Search paths for agent files
const SEARCH_PATHS = [
  (name: string) => `.claude/agents/${name}.md`,
  (name: string) => `agents/${name}.md`,
  (name: string) => `.claude/${name}.md`,
  (name: string) => `${name}.md`,
];

// Fetch agent content from GitHub
async function fetchAgentFromGitHub(
  owner: string,
  repo: string,
  name: string
): Promise<{ content: string; filePath: string; branch: string } | null> {
  // Get default branch
  let branch = 'main';
  try {
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    branch = repoData.default_branch;
  } catch {
    // Use main as fallback
  }

  // Try each search path
  for (const pathFn of SEARCH_PATHS) {
    const path = pathFn(name);
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content, filePath: path, branch };
      }
    } catch {
      // Try next path
    }
  }

  return null;
}

// Parse tools from frontmatter
function parseTools(tools: unknown): string[] | null {
  if (Array.isArray(tools)) {
    return tools.map((t) => String(t).trim()).filter((t) => t);
  }
  if (typeof tools === 'string' && tools.trim()) {
    return tools.split(',').map((t) => t.trim()).filter((t) => t);
  }
  return null;
}

// Register a new agent in the database
async function registerAgent(
  owner: string,
  repo: string,
  name: string
): Promise<boolean> {
  try {
    // Fetch content from GitHub
    const result = await fetchAgentFromGitHub(owner, repo, name);
    if (!result) {
      console.log(`Could not fetch agent ${owner}/${repo}/${name} from GitHub`);
      return false;
    }

    const { content, filePath, branch } = result;

    // Parse frontmatter
    let frontmatter: Record<string, unknown> = {};
    try {
      const parsed = matter(content);
      frontmatter = parsed.data;
    } catch (e) {
      console.error(`Error parsing frontmatter for ${owner}/${repo}/${name}:`, e);
    }

    // Extract fields
    const agentName = (frontmatter.name as string) || name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const description = (frontmatter.description as string) || null;
    const tools = parseTools(frontmatter.tools);
    const contentHash = crypto.createHash('md5').update(content).digest('hex');
    const githubUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;

    // Upsert to database
    await upsertSubagent({
      name: agentName,
      slug: name,
      description,
      content,
      owner,
      repo,
      file_path: filePath,
      tools,
      github_url: githubUrl,
      content_hash: contentHash,
      last_synced_at: new Date().toISOString(),
    });

    console.log(`Registered new agent: ${owner}/${repo}/${name}`);
    return true;
  } catch (error) {
    console.error(`Error registering agent ${owner}/${repo}/${name}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TelemetryPayload;
    const { subagentId, event, metadata = {} } = body;

    if (!subagentId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields: subagentId and event' },
        { status: 400 }
      );
    }

    if (!['download', 'view', 'copy'].includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type. Must be: download, view, or copy' },
        { status: 400 }
      );
    }

    // Record telemetry event
    await recordTelemetry(subagentId, event, metadata);

    // For download events, check if agent exists and register if not
    if (event === 'download') {
      const parsed = parseSubagentId(subagentId);
      if (parsed) {
        const { owner, repo, name } = parsed;

        // Check if agent exists in database
        const existing = await getSubagent(owner, repo, name);

        if (existing) {
          // Agent exists, increment download count
          await incrementDownloadCount(existing.id);
        } else {
          // Agent doesn't exist, register it first
          const registered = await registerAgent(owner, repo, name);
          if (registered) {
            // Now increment download count for the new agent
            const newAgent = await getSubagent(owner, repo, name);
            if (newAgent) {
              await incrementDownloadCount(newAgent.id);
            }
          }
        }
      }
    } else if (event === 'view') {
      const parsed = parseSubagentId(subagentId);
      if (parsed) {
        const existing = await getSubagent(parsed.owner, parsed.repo, parsed.name);
        if (existing) {
          await incrementViewCount(existing.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/telemetry:', error);
    // Return success anyway - telemetry failures shouldn't break the app
    return NextResponse.json({ success: true });
  }
}
