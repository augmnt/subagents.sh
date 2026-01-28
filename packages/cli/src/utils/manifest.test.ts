import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as paths from './paths.js';
import {
  loadManifest,
  saveManifest,
  addToManifest,
  removeFromManifest,
  getFromManifest,
  listManifestSubagents,
} from './manifest.js';
import type { Manifest, InstalledSubagent } from '../types.js';

vi.mock('node:fs');
vi.mock('./paths.js');

describe('loadManifest', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty manifest when file missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const manifest = loadManifest();

    expect(manifest).toEqual({
      version: '1',
      subagents: {},
    });
  });

  it('parses existing manifest JSON', () => {
    const existingManifest: Manifest = {
      version: '1',
      subagents: {
        'test-agent': {
          name: 'Test Agent',
          path: '/test/.claude/agents/test-agent.md',
          source: 'owner/repo/test-agent',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    const manifest = loadManifest();

    expect(manifest).toEqual(existingManifest);
  });

  it('handles corrupted JSON gracefully', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json');

    const manifest = loadManifest();

    expect(manifest).toEqual({
      version: '1',
      subagents: {},
    });
  });

  it('handles empty file gracefully', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('');

    const manifest = loadManifest();

    expect(manifest).toEqual({
      version: '1',
      subagents: {},
    });
  });
});

describe('saveManifest', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('writes JSON to correct path', () => {
    const manifest: Manifest = {
      version: '1',
      subagents: {
        'my-agent': {
          name: 'My Agent',
          path: '/test/.claude/agents/my-agent.md',
          source: 'owner/repo/my-agent',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    saveManifest(manifest);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/test/.claude/agents/.subagents.json',
      JSON.stringify(manifest, null, 2)
    );
  });

  it('formats JSON with 2-space indentation', () => {
    const manifest: Manifest = { version: '1', subagents: {} };

    saveManifest(manifest);

    const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(writtenContent).toBe('{\n  "version": "1",\n  "subagents": {}\n}');
  });
});

describe('addToManifest', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('adds new subagent to empty manifest', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const subagent: InstalledSubagent = {
      name: 'New Agent',
      path: '/test/.claude/agents/new-agent.md',
      source: 'owner/repo/new-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    addToManifest('new-agent', subagent);

    expect(fs.writeFileSync).toHaveBeenCalled();
    const writtenContent = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
    expect(writtenContent.subagents['new-agent']).toEqual(subagent);
  });

  it('adds subagent to existing manifest', () => {
    const existingManifest: Manifest = {
      version: '1',
      subagents: {
        'existing-agent': {
          name: 'Existing Agent',
          path: '/test/.claude/agents/existing-agent.md',
          source: 'owner/repo/existing-agent',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    const newSubagent: InstalledSubagent = {
      name: 'New Agent',
      path: '/test/.claude/agents/new-agent.md',
      source: 'owner/repo/new-agent',
      installedAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    addToManifest('new-agent', newSubagent);

    const writtenContent = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
    expect(Object.keys(writtenContent.subagents)).toHaveLength(2);
    expect(writtenContent.subagents['existing-agent']).toBeDefined();
    expect(writtenContent.subagents['new-agent']).toEqual(newSubagent);
  });

  it('updates existing subagent', () => {
    const existingManifest: Manifest = {
      version: '1',
      subagents: {
        'my-agent': {
          name: 'My Agent',
          path: '/test/.claude/agents/my-agent.md',
          source: 'owner/repo/my-agent',
          description: 'Old description',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    const updatedSubagent: InstalledSubagent = {
      name: 'My Agent',
      path: '/test/.claude/agents/my-agent.md',
      source: 'owner/repo/my-agent',
      description: 'New description',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    addToManifest('my-agent', updatedSubagent);

    const writtenContent = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
    expect(writtenContent.subagents['my-agent'].description).toBe('New description');
    expect(writtenContent.subagents['my-agent'].updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });
});

describe('removeFromManifest', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('removes subagent from manifest', () => {
    const existingManifest: Manifest = {
      version: '1',
      subagents: {
        'agent-a': {
          name: 'Agent A',
          path: '/test/.claude/agents/agent-a.md',
          source: 'owner/repo/agent-a',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        'agent-b': {
          name: 'Agent B',
          path: '/test/.claude/agents/agent-b.md',
          source: 'owner/repo/agent-b',
          installedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    removeFromManifest('agent-a');

    const writtenContent = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
    expect(writtenContent.subagents['agent-a']).toBeUndefined();
    expect(writtenContent.subagents['agent-b']).toBeDefined();
  });

  it('handles removing non-existent subagent gracefully', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    removeFromManifest('nonexistent');

    const writtenContent = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
    expect(writtenContent.subagents).toEqual({});
  });
});

describe('getFromManifest', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns subagent when it exists', () => {
    const subagent: InstalledSubagent = {
      name: 'My Agent',
      path: '/test/.claude/agents/my-agent.md',
      source: 'owner/repo/my-agent',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const existingManifest: Manifest = {
      version: '1',
      subagents: { 'my-agent': subagent },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    const result = getFromManifest('my-agent');

    expect(result).toEqual(subagent);
  });

  it('returns undefined when subagent does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = getFromManifest('nonexistent');

    expect(result).toBeUndefined();
  });
});

describe('listManifestSubagents', () => {
  beforeEach(() => {
    vi.mocked(paths.getManifestPath).mockReturnValue('/test/.claude/agents/.subagents.json');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns array of installed subagents', () => {
    const agentA: InstalledSubagent = {
      name: 'Agent A',
      path: '/test/.claude/agents/agent-a.md',
      source: 'owner/repo/agent-a',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    const agentB: InstalledSubagent = {
      name: 'Agent B',
      path: '/test/.claude/agents/agent-b.md',
      source: 'owner/repo/agent-b',
      installedAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    const existingManifest: Manifest = {
      version: '1',
      subagents: { 'agent-a': agentA, 'agent-b': agentB },
    };

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingManifest));

    const result = listManifestSubagents();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(agentA);
    expect(result).toContainEqual(agentB);
  });

  it('returns empty array when no subagents installed', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = listManifestSubagents();

    expect(result).toEqual([]);
  });
});
