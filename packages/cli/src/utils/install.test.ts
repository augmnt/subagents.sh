import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import {
  parseSubagent,
  installSubagent,
  uninstallSubagent,
  updateAllSubagents,
} from './install.js';
import * as fetchModule from './fetch.js';
import * as manifestModule from './manifest.js';
import * as pathsModule from './paths.js';
import * as telemetryModule from './telemetry.js';

vi.mock('node:fs');
vi.mock('./fetch.js');
vi.mock('./manifest.js');
vi.mock('./paths.js');
vi.mock('./telemetry.js');

describe('parseSubagent', () => {
  it('parses valid YAML frontmatter', () => {
    const content = `---
name: Test Agent
description: A test agent
tools:
  - Bash
  - Read
---

# Test Agent

This is the agent content.`;

    const result = parseSubagent(content);

    expect(result.frontmatter).toEqual({
      name: 'Test Agent',
      description: 'A test agent',
      tools: ['Bash', 'Read'],
    });
    expect(result.content).toBe('# Test Agent\n\nThis is the agent content.');
    expect(result.raw).toBe(content);
  });

  it('parses frontmatter with minimal fields', () => {
    const content = `---
name: Minimal Agent
---

Content here`;

    const result = parseSubagent(content);

    expect(result.frontmatter.name).toBe('Minimal Agent');
    expect(result.frontmatter.description).toBeUndefined();
    expect(result.frontmatter.tools).toBeUndefined();
  });

  it('throws when name is missing', () => {
    const content = `---
description: Missing name
---

Content`;

    expect(() => parseSubagent(content)).toThrow(
      'Subagent is missing required "name" field in frontmatter'
    );
  });

  it('throws when frontmatter is empty', () => {
    const content = `---
---

Content`;

    expect(() => parseSubagent(content)).toThrow(
      'Subagent is missing required "name" field in frontmatter'
    );
  });

  it('throws when no frontmatter present', () => {
    const content = '# Just content without frontmatter';

    expect(() => parseSubagent(content)).toThrow(
      'Subagent is missing required "name" field in frontmatter'
    );
  });

  it('trims content whitespace', () => {
    const content = `---
name: Test
---

  Content with leading/trailing whitespace

`;

    const result = parseSubagent(content);

    expect(result.content).toBe('Content with leading/trailing whitespace');
  });

  it('preserves additional frontmatter fields', () => {
    const content = `---
name: Extended Agent
description: Has extra fields
customField: custom value
version: 1.0.0
---

Content`;

    const result = parseSubagent(content);

    expect(result.frontmatter.customField).toBe('custom value');
    expect(result.frontmatter.version).toBe('1.0.0');
  });
});

describe('installSubagent', () => {
  beforeEach(() => {
    vi.mocked(pathsModule.getSubagentPath).mockReturnValue('/test/.claude/agents/test-agent.md');
    vi.mocked(pathsModule.subagentExists).mockReturnValue(false);
    vi.mocked(manifestModule.getFromManifest).mockReturnValue(undefined);
    vi.mocked(fetchModule.getDefaultBranch).mockResolvedValue('main');
    vi.mocked(telemetryModule.sendTelemetry).mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches from GitHub and saves to disk', async () => {
    const agentContent = `---
name: Test Agent
description: A test agent
---

Agent content`;

    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    await installSubagent('owner/repo/test-agent');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/test/.claude/agents/test-agent.md',
      agentContent
    );
  });

  it('creates manifest entry with metadata and scope', async () => {
    const agentContent = `---
name: Test Agent
description: A test agent
tools:
  - Bash
---

Content`;

    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    await installSubagent('owner/repo/test-agent');

    expect(manifestModule.addToManifest).toHaveBeenCalledWith(
      'test-agent',
      expect.objectContaining({
        name: 'Test Agent',
        path: '/test/.claude/agents/test-agent.md',
        source: 'owner/repo/test-agent',
        description: 'A test agent',
        tools: ['Bash'],
      }),
      'global' // Default scope
    );
  });

  it('sends telemetry event with scope', async () => {
    const agentContent = `---
name: Test Agent
---

Content`;

    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    await installSubagent('owner/repo/test-agent');

    expect(telemetryModule.sendTelemetry).toHaveBeenCalledWith(
      'owner/repo/test-agent',
      'download',
      expect.objectContaining({
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        isUpdate: false,
        scope: 'global',
      })
    );
  });

  it('respects force flag for overwrites', async () => {
    const agentContent = `---
name: Test Agent
---

Content`;

    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    const result = await installSubagent('owner/repo/test-agent', { force: true });

    expect(result.isUpdate).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('throws if subagent exists without force', async () => {
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });

    await expect(installSubagent('owner/repo/test-agent')).rejects.toThrow(
      'Subagent "test-agent" is already installed in global scope. Use --force to overwrite.'
    );
  });

  it('throws if file exists on disk without manifest entry', async () => {
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);
    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });

    await expect(installSubagent('owner/repo/test-agent')).rejects.toThrow(
      'Subagent "test-agent" is already installed in global scope. Use --force to overwrite.'
    );
  });

  it('returns install result with path, update status, and scope', async () => {
    const agentContent = `---
name: Test Agent
---

Content`;

    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    const result = await installSubagent('owner/repo/test-agent');

    expect(result).toEqual({
      name: 'test-agent',
      path: '/test/.claude/agents/test-agent.md',
      isUpdate: false,
      scope: 'global',
    });
  });

  it('preserves installedAt date on update', async () => {
    const originalDate = '2024-01-01T00:00:00.000Z';
    const agentContent = `---
name: Test Agent
---

Content`;

    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: originalDate,
      updatedAt: originalDate,
    });
    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    await installSubagent('owner/repo/test-agent', { force: true });

    expect(manifestModule.addToManifest).toHaveBeenCalledWith(
      'test-agent',
      expect.objectContaining({
        installedAt: originalDate,
      }),
      'global'
    );
  });

  it('installs to local scope when specified', async () => {
    const agentContent = `---
name: Test Agent
---

Content`;

    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: agentContent,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'test-agent',
        branch: 'main',
        path: '.claude/agents/test-agent.md',
      },
    });

    const result = await installSubagent('owner/repo/test-agent', { scope: 'local' });

    expect(result.scope).toBe('local');
    expect(pathsModule.getSubagentPath).toHaveBeenCalledWith('test-agent', 'local');
    expect(pathsModule.subagentExists).toHaveBeenCalledWith('test-agent', 'local');
    expect(manifestModule.getFromManifest).toHaveBeenCalledWith('test-agent', 'local');
    expect(manifestModule.addToManifest).toHaveBeenCalledWith(
      'test-agent',
      expect.anything(),
      'local'
    );
  });
});

describe('uninstallSubagent', () => {
  beforeEach(() => {
    vi.mocked(pathsModule.getSubagentPath).mockReturnValue('/test/.claude/agents/test-agent.md');
    vi.mocked(pathsModule.findSubagentScope).mockReturnValue('global');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('removes file and manifest entry', () => {
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);

    const result = uninstallSubagent('test-agent');

    expect(fs.unlinkSync).toHaveBeenCalledWith('/test/.claude/agents/test-agent.md');
    expect(manifestModule.removeFromManifest).toHaveBeenCalledWith('test-agent', 'global');
    expect(result.path).toBe('/test/.claude/agents/test-agent.md');
    expect(result.scope).toBe('global');
  });

  it('removes manifest entry even if file is missing', () => {
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(pathsModule.subagentExists).mockReturnValue(false);

    uninstallSubagent('test-agent');

    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(manifestModule.removeFromManifest).toHaveBeenCalledWith('test-agent', 'global');
  });

  it('removes file even if manifest entry is missing', () => {
    vi.mocked(manifestModule.getFromManifest).mockReturnValue(undefined);
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);

    uninstallSubagent('test-agent');

    expect(fs.unlinkSync).toHaveBeenCalledWith('/test/.claude/agents/test-agent.md');
    expect(manifestModule.removeFromManifest).toHaveBeenCalledWith('test-agent', 'global');
  });

  it('throws when subagent is not installed', () => {
    vi.mocked(pathsModule.findSubagentScope).mockReturnValue(null);

    expect(() => uninstallSubagent('nonexistent')).toThrow(
      'Subagent "nonexistent" is not installed.'
    );
  });

  it('auto-detects scope when not specified', () => {
    vi.mocked(pathsModule.findSubagentScope).mockReturnValue('local');
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);

    const result = uninstallSubagent('test-agent');

    expect(result.scope).toBe('local');
    expect(pathsModule.findSubagentScope).toHaveBeenCalledWith('test-agent');
  });

  it('uses specified scope when provided', () => {
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Test Agent',
      path: '/test/.claude/agents/test-agent.md',
      source: 'owner/repo/test-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);

    const result = uninstallSubagent('test-agent', { scope: 'local' });

    expect(result.scope).toBe('local');
    expect(pathsModule.findSubagentScope).not.toHaveBeenCalled();
  });
});

describe('updateAllSubagents', () => {
  beforeEach(() => {
    vi.mocked(pathsModule.getSubagentPath).mockImplementation(
      (name) => `/test/.claude/agents/${name}.md`
    );
    vi.mocked(pathsModule.subagentExists).mockReturnValue(true);
    vi.mocked(fetchModule.getDefaultBranch).mockResolvedValue('main');
    vi.mocked(telemetryModule.sendTelemetry).mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('updates all installed subagents', async () => {
    vi.mocked(manifestModule.listManifestSubagents).mockReturnValue([
      {
        name: 'Agent A',
        path: '/test/.claude/agents/agent-a.md',
        source: 'owner/repo/agent-a',
        installedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        name: 'Agent B',
        path: '/test/.claude/agents/agent-b.md',
        source: 'owner/repo/agent-b',
        installedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
    vi.mocked(manifestModule.getFromManifest).mockImplementation((name) => ({
      name: `Agent ${name.charAt(name.length - 1).toUpperCase()}`,
      path: `/test/.claude/agents/${name}.md`,
      source: `owner/repo/${name}`,
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }));
    vi.mocked(fetchModule.parseIdentifier).mockImplementation((id) => {
      const parts = id.split('/');
      return { owner: parts[0], repo: parts[1], name: parts[2] };
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockImplementation(async (_, __, name) => ({
      content: `---\nname: ${name}\n---\nContent`,
      source: {
        owner: 'owner',
        repo: 'repo',
        name,
        branch: 'main',
        path: `.claude/agents/${name}.md`,
      },
    }));

    const result = await updateAllSubagents();

    expect(result.updated).toEqual(['Agent A', 'Agent B']);
    expect(result.errors).toHaveLength(0);
  });

  it('calls progress callback with status updates', async () => {
    vi.mocked(manifestModule.listManifestSubagents).mockReturnValue([
      {
        name: 'Agent A',
        path: '/test/.claude/agents/agent-a.md',
        source: 'owner/repo/agent-a',
        installedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
    vi.mocked(manifestModule.getFromManifest).mockReturnValue({
      name: 'Agent A',
      path: '/test/.claude/agents/agent-a.md',
      source: 'owner/repo/agent-a',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(fetchModule.parseIdentifier).mockReturnValue({
      owner: 'owner',
      repo: 'repo',
      name: 'agent-a',
    });
    vi.mocked(fetchModule.fetchFromGitHub).mockResolvedValue({
      content: `---\nname: agent-a\n---\nContent`,
      source: {
        owner: 'owner',
        repo: 'repo',
        name: 'agent-a',
        branch: 'main',
        path: '.claude/agents/agent-a.md',
      },
    });

    const onProgress = vi.fn();
    await updateAllSubagents({}, onProgress);

    expect(onProgress).toHaveBeenCalledWith('Agent A', 'updating');
    expect(onProgress).toHaveBeenCalledWith('Agent A', 'updated');
  });

  it('collects errors and continues updating', async () => {
    vi.mocked(manifestModule.listManifestSubagents).mockReturnValue([
      {
        name: 'Agent A',
        path: '/test/.claude/agents/agent-a.md',
        source: 'owner/repo/agent-a',
        installedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        name: 'Agent B',
        path: '/test/.claude/agents/agent-b.md',
        source: 'owner/repo/agent-b',
        installedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
    vi.mocked(manifestModule.getFromManifest).mockImplementation((name) => ({
      name: `Agent ${name.charAt(name.length - 1).toUpperCase()}`,
      path: `/test/.claude/agents/${name}.md`,
      source: `owner/repo/${name}`,
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }));
    vi.mocked(fetchModule.parseIdentifier).mockImplementation((id) => {
      const parts = id.split('/');
      return { owner: parts[0], repo: parts[1], name: parts[2] };
    });

    // First agent fails, second succeeds
    vi.mocked(fetchModule.fetchFromGitHub)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        content: `---\nname: agent-b\n---\nContent`,
        source: {
          owner: 'owner',
          repo: 'repo',
          name: 'agent-b',
          branch: 'main',
          path: '.claude/agents/agent-b.md',
        },
      });

    const onProgress = vi.fn();
    const result = await updateAllSubagents({}, onProgress);

    expect(result.updated).toEqual(['Agent B']);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual({
      name: 'Agent A',
      error: 'Network error',
    });
    expect(onProgress).toHaveBeenCalledWith('Agent A', 'error', 'Network error');
  });

  it('returns empty arrays when no subagents installed', async () => {
    vi.mocked(manifestModule.listManifestSubagents).mockReturnValue([]);

    const result = await updateAllSubagents();

    expect(result.updated).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it('uses specified scope for updates', async () => {
    vi.mocked(manifestModule.listManifestSubagents).mockReturnValue([]);

    await updateAllSubagents({ scope: 'local' });

    expect(manifestModule.listManifestSubagents).toHaveBeenCalledWith('local');
  });
});
