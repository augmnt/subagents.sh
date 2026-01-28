import chalk from 'chalk';
import * as p from '@clack/prompts';
import { listManifestSubagents } from '../utils/manifest.js';
import { listSubagentFiles, localAgentsDirExists } from '../utils/paths.js';
import type { StorageScope, InstalledSubagent } from '../types.js';

export interface ListOptions {
  global?: boolean;
  local?: boolean;
  all?: boolean;
}

function displaySubagents(
  manifestSubagents: InstalledSubagent[],
  fileSubagents: string[],
  scopeLabel: string
): void {
  // Combine both sources, preferring manifest data
  const manifestNames = new Set(manifestSubagents.map((s) => s.name));
  const orphanFiles = fileSubagents.filter((f) => !manifestNames.has(f));

  if (manifestSubagents.length === 0 && orphanFiles.length === 0) {
    console.log(chalk.dim(`  No subagents installed in ${scopeLabel}`));
    console.log();
    return;
  }

  // Show tracked subagents
  for (const subagent of manifestSubagents) {
    const name = chalk.green(subagent.name);
    const source = chalk.dim(`(${subagent.source})`);
    const desc = subagent.description
      ? chalk.gray(` - ${subagent.description}`)
      : '';

    console.log(`  ${name} ${source}${desc}`);

    if (subagent.tools) {
      // Handle both array and comma-separated string formats
      const toolsList = Array.isArray(subagent.tools)
        ? subagent.tools
        : String(subagent.tools).split(',').map((t) => t.trim());

      if (toolsList.length > 0) {
        const tools = toolsList.map((t) => chalk.cyan(t)).join(', ');
        console.log(`    ${chalk.dim('Tools:')} ${tools}`);
      }
    }

    console.log();
  }

  // Show orphan files (files without manifest entry)
  if (orphanFiles.length > 0) {
    console.log(chalk.dim('  Untracked files:'));
    for (const file of orphanFiles) {
      console.log(`    ${chalk.yellow(file)} ${chalk.dim('(not in manifest)')}`);
    }
    console.log();
  }
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  // Determine which scopes to show
  const showGlobal = options.global || options.all || (!options.local);
  const showLocal = options.local || options.all;

  let totalCount = 0;

  if (showGlobal) {
    const globalManifest = listManifestSubagents('global');
    const globalFiles = listSubagentFiles('global');
    const globalManifestNames = new Set(globalManifest.map((s) => s.name));
    const globalOrphans = globalFiles.filter((f) => !globalManifestNames.has(f));

    console.log();
    console.log(chalk.bold('Global agents') + chalk.dim(' (~/.claude/agents/)'));
    console.log();
    displaySubagents(globalManifest, globalFiles, 'global scope');
    totalCount += globalManifest.length + globalOrphans.length;
  }

  if (showLocal) {
    const localManifest = listManifestSubagents('local');
    const localFiles = listSubagentFiles('local');
    const localManifestNames = new Set(localManifest.map((s) => s.name));
    const localOrphans = localFiles.filter((f) => !localManifestNames.has(f));

    console.log();
    console.log(chalk.bold('Local/Project agents') + chalk.dim(' (./.claude/agents/)'));
    console.log();
    displaySubagents(localManifest, localFiles, 'local scope');
    totalCount += localManifest.length + localOrphans.length;
  }

  if (totalCount === 0) {
    p.log.info('No subagents installed.');
    p.log.info(
      `Run ${chalk.cyan('npx subagents-sh add owner/repo/name')} to install one.`
    );
    return;
  }

  console.log(chalk.dim(`Total: ${totalCount} subagent(s)`));
}
