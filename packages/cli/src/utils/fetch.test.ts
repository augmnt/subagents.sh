import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseIdentifier, fetchFromGitHub, checkRepoExists, getDefaultBranch } from './fetch.js';

describe('parseIdentifier', () => {
  it('parses owner/repo/name format', () => {
    const result = parseIdentifier('owner/repo/agent-name');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'agent-name',
    });
  });

  it('parses owner/repo format (name defaults to repo)', () => {
    const result = parseIdentifier('owner/repo');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'repo',
    });
  });

  it('strips .md extension from name', () => {
    const result = parseIdentifier('owner/repo/agent-name.md');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'agent-name',
    });
  });

  it('parses full GitHub URL', () => {
    const result = parseIdentifier('https://github.com/owner/repo');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'repo',
    });
  });

  it('parses GitHub URL with blob path', () => {
    const result = parseIdentifier(
      'https://github.com/owner/repo/blob/main/.claude/agents/my-agent.md'
    );
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'my-agent',
    });
  });

  it('parses GitHub URL with tree path', () => {
    const result = parseIdentifier(
      'https://github.com/owner/repo/tree/main/agents/my-agent.md'
    );
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'my-agent',
    });
  });

  it('parses GitHub URL with path but no blob/tree', () => {
    const result = parseIdentifier('https://github.com/owner/repo/my-agent');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'my-agent',
    });
  });

  it('throws on invalid format (single part)', () => {
    expect(() => parseIdentifier('invalid')).toThrow(
      'Invalid identifier format: "invalid"'
    );
  });

  it('throws on empty string', () => {
    expect(() => parseIdentifier('')).toThrow('Invalid identifier format');
  });
});

describe('fetchFromGitHub', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tries .claude/agents path first', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Agent content'),
    });

    const result = await fetchFromGitHub('owner', 'repo', 'test-agent', 'main');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/owner/repo/main/.claude/agents/test-agent.md'
    );
    expect(result.content).toBe('# Agent content');
    expect(result.source).toEqual({
      owner: 'owner',
      repo: 'repo',
      name: 'test-agent',
      branch: 'main',
      path: '.claude/agents/test-agent.md',
    });
  });

  it('falls back to agents/ path on 404', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 }) // .claude/agents
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# From agents/'),
      }); // agents/

    const result = await fetchFromGitHub('owner', 'repo', 'test-agent', 'main');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://raw.githubusercontent.com/owner/repo/main/agents/test-agent.md'
    );
    expect(result.source.path).toBe('agents/test-agent.md');
  });

  it('falls back to .claude/ path', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 }) // .claude/agents
      .mockResolvedValueOnce({ ok: false, status: 404 }) // agents/
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# From .claude/'),
      }); // .claude/

    const result = await fetchFromGitHub('owner', 'repo', 'test-agent', 'main');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.source.path).toBe('.claude/test-agent.md');
  });

  it('falls back to root path', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 }) // .claude/agents
      .mockResolvedValueOnce({ ok: false, status: 404 }) // agents/
      .mockResolvedValueOnce({ ok: false, status: 404 }) // .claude/
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# From root'),
      }); // root

    const result = await fetchFromGitHub('owner', 'repo', 'test-agent', 'main');

    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect(result.source.path).toBe('test-agent.md');
  });

  it('tries master branch if main fails', async () => {
    // All 4 paths fail for main branch
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      // Then succeeds on master
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# From master'),
      });

    const result = await fetchFromGitHub('owner', 'repo', 'test-agent', 'main');

    expect(mockFetch).toHaveBeenCalledTimes(5);
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://raw.githubusercontent.com/owner/repo/master/.claude/agents/test-agent.md'
    );
    expect(result.source.branch).toBe('master');
  });

  it('returns content and source metadata', async () => {
    const content = '---\nname: Test\n---\n# Content';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(content),
    });

    const result = await fetchFromGitHub('myorg', 'myrepo', 'myagent', 'develop');

    expect(result).toEqual({
      content,
      source: {
        owner: 'myorg',
        repo: 'myrepo',
        name: 'myagent',
        branch: 'develop',
        path: '.claude/agents/myagent.md',
      },
    });
  });

  it('throws descriptive error when not found anywhere', async () => {
    // Fail all paths for both main and master
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(fetchFromGitHub('owner', 'repo', 'missing', 'main')).rejects.toThrow(
      'Could not find subagent "missing" in owner/repo'
    );
  });

  it('collects non-404 HTTP errors', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500 }) // Server error on first path
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValue({ ok: false, status: 404 }); // master fallback

    await expect(fetchFromGitHub('owner', 'repo', 'agent', 'main')).rejects.toThrow();
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(fetchFromGitHub('owner', 'repo', 'agent', 'main')).rejects.toThrow();
  });
});

describe('checkRepoExists', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true for existing repo', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const result = await checkRepoExists('owner', 'repo');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo');
  });

  it('returns false for non-existing repo', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await checkRepoExists('owner', 'nonexistent');

    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await checkRepoExists('owner', 'repo');

    expect(result).toBe(false);
  });
});

describe('getDefaultBranch', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns default_branch from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ default_branch: 'develop' }),
    });

    const result = await getDefaultBranch('owner', 'repo');

    expect(result).toBe('develop');
  });

  it('returns main when API response has no default_branch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await getDefaultBranch('owner', 'repo');

    expect(result).toBe('main');
  });

  it('returns main on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await getDefaultBranch('owner', 'repo');

    expect(result).toBe('main');
  });

  it('returns main on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getDefaultBranch('owner', 'repo');

    expect(result).toBe('main');
  });
});
