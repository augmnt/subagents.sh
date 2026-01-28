#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as p from '@clack/prompts';
import { addCommand, AddOptions } from './commands/add.js';
import { listCommand, ListOptions } from './commands/list.js';
import { removeCommand, RemoveOptions } from './commands/remove.js';
import { updateCommand, UpdateOptions } from './commands/update.js';
import { searchCommand } from './commands/search.js';

const VERSION = '0.1.0';

// Muted teal color matching website accent
const teal = chalk.hex('#14b8a6');

// Static ASCII banner matching the website
const BANNER = `
███████╗██╗   ██╗██████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝
███████╗██║   ██║██████╔╝███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗
╚════██║██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████║╚██████╔╝██████╔╝██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝`;

function showBanner(): void {
  console.log(teal(BANNER));
  console.log(chalk.dim(`  CLI for Claude Code subagents • v${VERSION}`));
  console.log(chalk.dim(`  https://subagents.sh`));
  console.log();
}

const program = new Command();

program
  .name('subagents-sh')
  .description('CLI for discovering and installing Claude Code subagents')
  .version(VERSION);

// Add command
program
  .command('add <identifier>')
  .description('Install a subagent from the registry or GitHub')
  .option('-f, --force', 'Overwrite existing subagent')
  .option('-l, --local', 'Install to project directory (./.claude/agents/)')
  .addHelpText(
    'after',
    `
Examples:
  $ npx subagents-sh add anthropics/claude-code/backend-architect
  $ npx subagents-sh add user/repo/agent-name
  $ npx subagents-sh add user/repo/agent-name --local

Storage locations:
  Global (default)  ~/.claude/agents/   Available in all projects
  Local (--local)   ./.claude/agents/   Project-specific, shareable via git
`
  )
  .action(async (identifier: string, options: AddOptions) => {
    p.intro(chalk.bgHex('#14b8a6').black(' subagents '));
    await addCommand(identifier, options);
    p.outro('Done!');
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List installed subagents')
  .option('-g, --global', 'Show only global agents (default)')
  .option('-l, --local', 'Show only project agents')
  .option('-a, --all', 'Show agents from both locations')
  .addHelpText(
    'after',
    `
Examples:
  $ npx subagents-sh list           # Show global agents (default)
  $ npx subagents-sh list --local   # Show project agents only
  $ npx subagents-sh list --all     # Show agents from both locations
`
  )
  .action(async (options: ListOptions) => {
    await listCommand(options);
  });

// Remove command
program
  .command('remove <name>')
  .alias('rm')
  .description('Remove an installed subagent')
  .option('-g, --global', 'Remove from global scope')
  .option('-l, --local', 'Remove from local/project scope')
  .addHelpText(
    'after',
    `
Examples:
  $ npx subagents-sh remove agent-name          # Auto-detect location
  $ npx subagents-sh remove agent-name --global # Remove from global
  $ npx subagents-sh remove agent-name --local  # Remove from project
`
  )
  .action(async (name: string, options: RemoveOptions) => {
    await removeCommand(name, options);
  });

// Update command
program
  .command('update')
  .alias('up')
  .description('Update all installed subagents')
  .option('-g, --global', 'Update global agents only (default)')
  .option('-l, --local', 'Update project agents only')
  .option('-a, --all', 'Update agents in both locations')
  .addHelpText(
    'after',
    `
Examples:
  $ npx subagents-sh update         # Update global agents (default)
  $ npx subagents-sh update --local # Update project agents only
  $ npx subagents-sh update --all   # Update all agents
`
  )
  .action(async (options: UpdateOptions) => {
    p.intro(chalk.bgHex('#14b8a6').black(' subagents '));
    await updateCommand(options);
    p.outro('Done!');
  });

// Search command
program
  .command('search <query>')
  .description('Search for subagents in the registry')
  .addHelpText(
    'after',
    `
Examples:
  $ npx subagents-sh search backend
  $ npx subagents-sh search "code review"
  $ npx subagents-sh search testing
`
  )
  .action(async (query: string) => {
    p.intro(chalk.bgHex('#14b8a6').black(' subagents '));
    await searchCommand(query);
    p.outro('');
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(
    chalk.red(`Unknown command: ${program.args.join(' ')}\n`)
  );
  program.help();
});

// Show banner and help if no command provided
if (!process.argv.slice(2).length) {
  showBanner();
  program.outputHelp();
  process.exit(0);
}

// Parse arguments
program.parse();
