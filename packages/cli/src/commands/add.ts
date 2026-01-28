import * as p from '@clack/prompts';
import chalk from 'chalk';
import { installSubagent, parseSubagent } from '../utils/install.js';
import { parseIdentifier, getDefaultBranch, fetchFromGitHub } from '../utils/fetch.js';
import {
  detectCategory,
  isValidCategory,
  VALID_CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from '../utils/category-detection.js';
import type { StorageScope } from '../types.js';

export interface AddOptions {
  force?: boolean;
  local?: boolean;
}

export async function addCommand(
  identifier: string,
  options: AddOptions
): Promise<void> {
  const s = p.spinner();
  const scope: StorageScope = options.local ? 'local' : 'global';
  const scopeLabel = scope === 'global' ? '~/.claude/agents/' : './.claude/agents/';

  try {
    s.start(`Fetching ${chalk.cyan(identifier)}...`);

    // Parse identifier and fetch content first to analyze it
    const { owner, repo, name } = parseIdentifier(identifier);
    const branch = await getDefaultBranch(owner, repo);
    const result = await fetchFromGitHub(owner, repo, name, branch);
    const parsed = parseSubagent(result.content);

    s.stop(`Fetched ${chalk.green(parsed.frontmatter.name)}`);

    // Determine category
    let category: string | undefined;

    // Check if frontmatter has a valid category
    if (parsed.frontmatter.category && isValidCategory(parsed.frontmatter.category)) {
      category = parsed.frontmatter.category;
      p.log.info(`Category: ${chalk.cyan(CATEGORY_LABELS[category as Category])} (from frontmatter)`);
    } else {
      // Auto-detect category
      const detection = detectCategory({
        name: parsed.frontmatter.name,
        description: parsed.frontmatter.description,
        tools: parsed.frontmatter.tools,
      });

      // Build options for selection
      const categoryOptions = VALID_CATEGORIES.map((cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat],
        hint: cat === detection.category
          ? detection.confidence === 'high'
            ? 'recommended - high confidence'
            : detection.confidence === 'medium'
              ? 'suggested - medium confidence'
              : undefined
          : undefined,
      }));

      // Prompt user to confirm or change category
      const selectedCategory = await p.select({
        message: 'Select a category for this subagent:',
        options: categoryOptions,
        initialValue: detection.category,
      });

      if (p.isCancel(selectedCategory)) {
        p.cancel('Installation cancelled.');
        process.exit(0);
      }

      category = selectedCategory as string;
    }

    // Now install with the selected category
    s.start(`Installing to ${chalk.dim(scopeLabel)}`);

    const installResult = await installSubagent(identifier, {
      force: options.force,
      scope,
      category,
    });

    s.stop(
      installResult.isUpdate
        ? `Updated ${chalk.green(installResult.name)}`
        : `Installed ${chalk.green(installResult.name)}`
    );

    p.note(
      [
        `${chalk.dim('Location:')} ${installResult.path}`,
        `${chalk.dim('Scope:')} ${scope}`,
        `${chalk.dim('Category:')} ${category ? CATEGORY_LABELS[category as Category] || category : 'None'}`,
        '',
        `Claude Code will automatically use this subagent`,
        `when relevant to your tasks.`,
      ].join('\n'),
      'Success'
    );
  } catch (err) {
    s.stop('Installation failed');

    const message = err instanceof Error ? err.message : 'Unknown error';

    p.log.error(chalk.red(message));

    if (message.includes('already installed')) {
      p.log.info(`Run with ${chalk.cyan('--force')} to overwrite.`);
    }

    process.exit(1);
  }
}
