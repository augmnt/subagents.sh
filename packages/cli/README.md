<p align="center">
  <img src="../../assets/banner.png" alt="SUBAGENTS - Discover and install Claude Code subagents">
</p>

[![npm version](https://img.shields.io/npm/v/subagents-sh)](https://npmjs.com/package/subagents-sh)
[![npm downloads](https://img.shields.io/npm/dm/subagents-sh)](https://npmjs.com/package/subagents-sh)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI for discovering and installing Claude Code subagents.

Agents are saved to `.claude/agents/` and automatically used by Claude Code when relevant.

## Installation

No installation required! Use directly with npx:

```bash
npx subagents-sh add owner/repo/agent-name
```

Or install globally:

```bash
npm install -g subagents-sh
```

## Commands

### Add a subagent

```bash
npx subagents-sh add owner/repo/agent-name
```

### Search for subagents

```bash
npx subagents-sh search <query>
```

### List installed subagents

```bash
npx subagents-sh list
```

### Remove a subagent

```bash
npx subagents-sh remove <name>
```

### Update all subagents

```bash
npx subagents-sh update
```

## Learn More

Visit [subagents.sh](https://subagents.sh) to browse available subagents.

## License

MIT
