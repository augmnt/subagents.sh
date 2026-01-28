import chalk from 'chalk';
import * as p from '@clack/prompts';
import { uninstallSubagent } from '../utils/install.js';
import type { StorageScope } from '../types.js';

export interface RemoveOptions {
  global?: boolean;
  local?: boolean;
}

export async function removeCommand(name: string, options: RemoveOptions = {}): Promise<void> {
  try {
    // Determine scope - if neither specified, auto-detect
    let scope: StorageScope | undefined;
    if (options.global) {
      scope = 'global';
    } else if (options.local) {
      scope = 'local';
    }
    // If neither flag is set, scope remains undefined and uninstallSubagent will auto-detect

    const result = uninstallSubagent(name, { scope });

    p.log.success(`Removed ${chalk.green(name)} from ${result.scope} scope`);
    p.log.info(chalk.dim(`Deleted: ${result.path}`));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    p.log.error(chalk.red(message));
    process.exit(1);
  }
}
