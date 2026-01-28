import { Suspense } from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { Leaderboard, LeaderboardSkeleton } from '@/components/subagent/leaderboard';
import { InfiniteLeaderboard } from '@/components/subagent/infinite-leaderboard';
import { InstallCommand } from '@/components/subagent/install-command';
import { generateAsciiText } from '@/lib/figlet';
import {
  getSubagentsLeaderboard,
  searchSubagents,
  getPlatformStats,
  getSubagentsCount,
  type SubagentListItem,
} from '@/lib/supabase/subagents';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

// Format number for display (e.g., 1200 -> "1.2K")
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

const INITIAL_LOAD = 20;

async function getSubagents(query?: string): Promise<SubagentListItem[]> {
  try {
    if (query) {
      return await searchSubagents(query);
    }
    return await getSubagentsLeaderboard(INITIAL_LOAD);
  } catch (error) {
    console.error('Error fetching subagents:', error);
    return [];
  }
}

async function getStats() {
  try {
    return await getPlatformStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalSubagents: 0, totalDownloads: 0, totalSources: 0 };
  }
}

// ASCII Art Logo Component - Generated with figlet ANSI Shadow font
function AsciiLogo() {
  const asciiArt = generateAsciiText('SUBAGENTS');
  return (
    <pre className="ascii-art text-center select-none" aria-hidden="true">
      {asciiArt}
    </pre>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q;

  const [subagents, stats, totalCount] = await Promise.all([
    getSubagents(query),
    getStats(),
    query ? Promise.resolve(0) : getSubagentsCount(),
  ]);

  // Get a featured subagent for the install command example
  const featuredSubagent = subagents[0];

  return (
    <div className="container py-12 md:py-20">
      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-24">
        {/* ASCII Logo */}
        <div className="mb-8 overflow-hidden">
          <AsciiLogo />
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto">
          Discover and install Claude Code subagents
        </p>

        {/* Example install command */}
        {featuredSubagent && (
          <div className="max-w-lg mx-auto mb-8">
            <InstallCommand
              owner={featuredSubagent.owner}
              repo={featuredSubagent.repo}
              slug={featuredSubagent.slug}
              subagentId={featuredSubagent.id}
              size="large"
            />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-text-primary font-semibold">
              {formatNumber(stats.totalSubagents)}
            </span>{' '}
            subagents
          </div>
          <div className="text-text-tertiary">·</div>
          <div>
            <span className="font-mono text-text-primary font-semibold">
              {formatNumber(stats.totalDownloads)}
            </span>{' '}
            installs
          </div>
        </div>
      </section>

      {/* Search Results Header */}
      {query && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">
              Results for &ldquo;{query}&rdquo;
            </h2>
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear
            </Link>
          </div>
          <p className="text-sm text-text-tertiary mt-1">
            {subagents.length} result{subagents.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Leaderboard Section */}
      <section>
        <Suspense fallback={<LeaderboardSkeleton />}>
          {query ? (
            <Leaderboard subagents={subagents} />
          ) : (
            <InfiniteLeaderboard
              initialSubagents={subagents}
              initialHasMore={totalCount > INITIAL_LOAD}
              pageSize={INITIAL_LOAD}
            />
          )}
        </Suspense>

        {subagents.length === 0 && !query && (
          <div className="text-center py-20 text-text-secondary">
            <Terminal className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No subagents yet</p>
            <p className="text-sm text-text-tertiary">
              Subagents will appear here once the sync completes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
