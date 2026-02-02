<p align="center">
  <img src="https://raw.githubusercontent.com/augmnt/subagents.sh/main/assets/banner.png" alt="SUBAGENTS - Discover and install Claude Code subagents">
</p>

[![npm version](https://img.shields.io/npm/v/@augmnt-sh/subagents)](https://npmjs.com/package/@augmnt-sh/subagents)
[![npm downloads](https://img.shields.io/npm/dm/@augmnt-sh/subagents)](https://npmjs.com/package/@augmnt-sh/subagents)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI for discovering and installing Claude Code subagents.

Agents are saved to `.claude/agents/` and automatically used by Claude Code when relevant.

## Installation

No installation required! Use directly with npx:

```bash
npx @augmnt-sh/subagents add owner/repo/agent-name
```

Or install globally:

```bash
npm install -g @augmnt-sh/subagents
```

## Commands

### Add a subagent

```bash
npx @augmnt-sh/subagents add owner/repo/agent-name
```

### Search for subagents

```bash
npx @augmnt-sh/subagents search <query>
```

### List installed subagents

```bash
npx @augmnt-sh/subagents list
```

### Remove a subagent

```bash
npx @augmnt-sh/subagents remove <name>
```

### Update all subagents

```bash
npx @augmnt-sh/subagents update
```

## Learn More

Visit [subagents.sh](https://subagents.sh) to browse available subagents.

## License

MIT
