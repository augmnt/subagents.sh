import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  getAgentsDir,
  getGlobalAgentsDir,
  getLocalAgentsDir,
  getManifestPath,
  subagentExists,
  getSubagentPath,
  listSubagentFiles,
  findSubagentScope,
  localAgentsDirExists,
} from './paths.js';

vi.mock('node:fs');
vi.mock('node:os');

describe('getGlobalAgentsDir', () => {
  beforeEach(() => {
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns correct global agents directory path', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = getGlobalAgentsDir();

    expect(result).toBe(path.join('/Users/test', '.claude', 'agents'));
  });

  it('creates directory if missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    getGlobalAgentsDir();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join('/Users/test', '.claude', 'agents'),
      { recursive: true }
    );
  });
});

describe('getLocalAgentsDir', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns correct local agents directory path', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = getLocalAgentsDir();

    expect(result).toBe(path.join('/test/project', '.claude', 'agents'));
  });

  it('creates directory if missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    getLocalAgentsDir();

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join('/test/project', '.claude', 'agents'),
      { recursive: true }
    );
  });
});

describe('getAgentsDir', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns global directory by default', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = getAgentsDir();

    expect(result).toBe(path.join('/Users/test', '.claude', 'agents'));
  });

  it('returns global directory when scope is global', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = getAgentsDir('global');

    expect(result).toBe(path.join('/Users/test', '.claude', 'agents'));
  });

  it('returns local directory when scope is local', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = getAgentsDir('local');

    expect(result).toBe(path.join('/test/project', '.claude', 'agents'));
  });

  it('creates directory if missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    getAgentsDir('local');

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join('/test/project', '.claude', 'agents'),
      { recursive: true }
    );
  });

  it('does not create directory if it exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    getAgentsDir('local');

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});

describe('getManifestPath', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns global manifest path by default', () => {
    const result = getManifestPath();

    expect(result).toBe(path.join('/Users/test', '.claude', 'agents', '.subagents.json'));
  });

  it('returns local manifest path when scope is local', () => {
    const result = getManifestPath('local');

    expect(result).toBe(path.join('/test/project', '.claude', 'agents', '.subagents.json'));
  });
});

describe('subagentExists', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns true when subagent file exists in global scope', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = subagentExists('my-agent', 'global');

    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join('/Users/test', '.claude', 'agents', 'my-agent.md')
    );
  });

  it('returns true when subagent file exists in local scope', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = subagentExists('my-agent', 'local');

    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join('/test/project', '.claude', 'agents', 'my-agent.md')
    );
  });

  it('returns false when subagent file does not exist', () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // getAgentsDir check
      .mockReturnValueOnce(false); // subagentExists check

    const result = subagentExists('nonexistent', 'local');

    expect(result).toBe(false);
  });

  it('appends .md extension to name', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    subagentExists('agent-name', 'local');

    expect(fs.existsSync).toHaveBeenLastCalledWith(
      expect.stringContaining('agent-name.md')
    );
  });
});

describe('findSubagentScope', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns local if subagent exists in local scope', () => {
    // Local check succeeds
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // getLocalAgentsDir exists
      .mockReturnValueOnce(true); // local file exists

    const result = findSubagentScope('my-agent');

    expect(result).toBe('local');
  });

  it('returns global if subagent exists only in global scope', () => {
    // Local check fails, global check succeeds
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true) // getLocalAgentsDir exists
      .mockReturnValueOnce(false) // local file doesn't exist
      .mockReturnValueOnce(true) // getGlobalAgentsDir exists
      .mockReturnValueOnce(true); // global file exists

    const result = findSubagentScope('my-agent');

    expect(result).toBe('global');
  });

  it('returns null if subagent does not exist in either scope', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = findSubagentScope('nonexistent');

    expect(result).toBe(null);
  });
});

describe('getSubagentPath', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns global path by default', () => {
    const result = getSubagentPath('my-agent');

    expect(result).toBe(path.join('/Users/test', '.claude', 'agents', 'my-agent.md'));
  });

  it('returns local path when scope is local', () => {
    const result = getSubagentPath('my-agent', 'local');

    expect(result).toBe(path.join('/test/project', '.claude', 'agents', 'my-agent.md'));
  });

  it('appends .md extension', () => {
    const result = getSubagentPath('test', 'local');

    expect(result).toMatch(/test\.md$/);
  });
});

describe('listSubagentFiles', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
    vi.mocked(os.homedir).mockReturnValue('/Users/test');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('lists all .md files in agents directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'agent-a.md',
      'agent-b.md',
      'agent-c.md',
    ] as unknown as ReturnType<typeof fs.readdirSync>);

    const result = listSubagentFiles('local');

    expect(result).toEqual(['agent-a', 'agent-b', 'agent-c']);
  });

  it('excludes non-.md files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'agent-a.md',
      '.subagents.json',
      'readme.txt',
      '.DS_Store',
    ] as unknown as ReturnType<typeof fs.readdirSync>);

    const result = listSubagentFiles('local');

    expect(result).toEqual(['agent-a']);
  });

  it('returns empty array when directory does not exist', () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(false) // getAgentsDir creates it
      .mockReturnValueOnce(false); // listSubagentFiles check

    const result = listSubagentFiles('local');

    expect(result).toEqual([]);
  });

  it('returns empty array when directory is empty', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([] as unknown as ReturnType<typeof fs.readdirSync>);

    const result = listSubagentFiles('local');

    expect(result).toEqual([]);
  });

  it('strips .md extension from returned names', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'test-agent.md',
    ] as unknown as ReturnType<typeof fs.readdirSync>);

    const result = listSubagentFiles('local');

    expect(result).toEqual(['test-agent']);
    expect(result[0]).not.toContain('.md');
  });
});

describe('localAgentsDirExists', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns true when local agents directory exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = localAgentsDirExists();

    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join('/test/project', '.claude', 'agents')
    );
  });

  it('returns false when local agents directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = localAgentsDirExists();

    expect(result).toBe(false);
  });
});
