import chalk from 'chalk';
import * as p from '@clack/prompts';
import { updateAllSubagents, updateAllScopesSubagents } from '../utils/install.js';
import { listManifestSubagents } from '../utils/manifest.js';
import type { StorageScope } from '../types.js';

export interface UpdateOptions {
  global?: boolean;
  local?: boolean;
  all?: boolean;
}

export async function updateCommand(options: UpdateOptions = {}): Promise<void> {
  // Determine which scopes to update
  const updateAll = options.all;
  const updateLocal = options.local && !options.all;
  const updateGlobal = options.global || (!options.local && !options.all);

  if (updateAll) {
    // Update both scopes
    const globalInstalled = listManifestSubagents('global');
    const localInstalled = listManifestSubagents('local');
    const totalCount = globalInstalled.length + localInstalled.length;

    if (totalCount === 0) {
      p.log.info('No subagents installed in any scope.');
      p.log.info(
        `Run ${chalk.cyan('npx @augmnt-sh/subagents add owner/repo/name')} to install one.`
      );
      return;
    }

    console.log();
    console.log(chalk.bold(`Updating ${totalCount} subagent(s) across all scopes...`));
    console.log();

    const results = await updateAllScopesSubagents((name, scope, status, error) => {
      const scopeLabel = scope === 'global' ? chalk.dim('[global]') : chalk.dim('[local]');
      switch (status) {
        case 'updating':
          console.log(`  ${chalk.dim('Updating')} ${name} ${scopeLabel}...`);
          break;
        case 'updated':
          console.log(`  ${chalk.green('✓')} ${name} ${scopeLabel}`);
          break;
        case 'error':
          console.log(`  ${chalk.red('✗')} ${name} ${scopeLabel}: ${error}`);
          break;
      }
    });

    console.log();

    const totalUpdated = results.global.updated.length + results.local.updated.length;
    const totalErrors = results.global.errors.length + results.local.errors.length;

    if (totalUpdated > 0) {
      p.log.success(`Updated ${totalUpdated} subagent(s)`);
    }

    if (totalErrors > 0) {
      p.log.warning(`Failed to update ${totalErrors} subagent(s)`);
    }
  } else {
    // Update single scope
    const scope: StorageScope = updateLocal ? 'local' : 'global';
    const scopeLabel = scope === 'global' ? '~/.claude/agents/' : './.claude/agents/';
    const installed = listManifestSubagents(scope);

    if (installed.length === 0) {
      p.log.info(`No subagents installed in ${scope} scope.`);
      p.log.info(
        `Run ${chalk.cyan('npx @augmnt-sh/subagents add owner/repo/name')} to install one.`
      );
      return;
    }

    console.log();
    console.log(chalk.bold(`Updating ${installed.length} subagent(s) in ${scope} scope...`));
    console.log(chalk.dim(`  ${scopeLabel}`));
    console.log();

    const { updated, errors } = await updateAllSubagents({ scope }, (name, status, error) => {
      switch (status) {
        case 'updating':
          console.log(`  ${chalk.dim('Updating')} ${name}...`);
          break;
        case 'updated':
          console.log(`  ${chalk.green('✓')} ${name}`);
          break;
        case 'error':
          console.log(`  ${chalk.red('✗')} ${name}: ${error}`);
          break;
      }
    });

    console.log();

    if (updated.length > 0) {
      p.log.success(`Updated ${updated.length} subagent(s)`);
    }

    if (errors.length > 0) {
      p.log.warning(`Failed to update ${errors.length} subagent(s)`);
    }
  }
}
