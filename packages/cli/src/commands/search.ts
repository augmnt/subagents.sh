import * as p from '@clack/prompts';
import chalk from 'chalk';

const API_BASE = 'https://subagents.sh';

// Muted teal color matching website accent
const teal = chalk.hex('#14b8a6');

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner: string;
  repo: string;
  download_count: number;
  tools: string[] | null;
  category: string | null;
}

interface SearchResponse {
  data: SearchResult[];
  query: string;
  count: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatDownloads(count: number): string {
  const formatted = formatNumber(count);
  if (count >= 1000) {
    return chalk.green(formatted);  // Popular: green
  } else if (count >= 100) {
    return chalk.yellow(formatted); // Moderate: yellow
  }
  return chalk.dim(formatted);      // New: dim
}

export async function searchCommand(query: string): Promise<void> {
  const s = p.spinner();
  s.start(`Searching for "${teal(query)}"...`);

  try {
    const response = await fetch(
      `${API_BASE}/api/subagents?q=${encodeURIComponent(query)}&limit=10`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: SearchResponse = await response.json();

    s.stop('Search complete');

    if (!data.data?.length) {
      p.note(
        `No subagents found for "${query}".\n\nTry a different search term or browse at ${teal('https://subagents.sh')}`,
        'No Results'
      );
      return;
    }

    console.log('');
    console.log(chalk.bold(`Found ${data.count} subagent${data.count !== 1 ? 's' : ''}:\n`));

    for (const agent of data.data) {
      const id = `${agent.owner}/${agent.repo}/${agent.slug}`;

      // Category badge
      const categoryLabel = agent.category
        ? chalk.dim(`[${agent.category}]`.padEnd(14))
        : ''.padEnd(14);

      // Name, category, and downloads on first line
      console.log(
        `  ${teal(agent.name.padEnd(24))} ${categoryLabel} ${chalk.dim('↓')} ${formatDownloads(agent.download_count).padStart(6)}`
      );

      // Install identifier
      console.log(`  ${chalk.dim(id)}`);

      // Description (truncated)
      if (agent.description) {
        const desc = agent.description.length > 70
          ? agent.description.slice(0, 67) + '...'
          : agent.description;
        console.log(`  ${chalk.gray(desc)}`);
      }

      // Tools
      if (agent.tools && agent.tools.length > 0) {
        const toolsDisplay = agent.tools.slice(0, 4).join(', ');
        const more = agent.tools.length > 4 ? ` +${agent.tools.length - 4} more` : '';
        console.log(`  ${chalk.magenta('Tools:')} ${chalk.dim(toolsDisplay + more)}`);
      }

      console.log('');
    }

    console.log(chalk.dim('─'.repeat(60)));
    console.log('');
    console.log(`  ${chalk.bold('Install:')} npx @augmnt-sh/subagents add ${teal('<owner/repo/name>')}`);
    console.log(`  ${chalk.bold('Browse:')}  ${teal('https://subagents.sh')}`);
    console.log('');
  } catch (err) {
    s.stop('Search failed');

    const message = err instanceof Error ? err.message : 'Unknown error';
    p.log.error(chalk.red(`Failed to search: ${message}`));

    console.log('');
    console.log(`Try browsing at ${teal('https://subagents.sh')}`);

    process.exit(1);
  }
}
