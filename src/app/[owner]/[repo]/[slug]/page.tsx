import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Content } from '@/components/subagent/content';
import { InstallCommand } from '@/components/subagent/install-command';
import { ToolsBadge } from '@/components/subagent/tools-badge';
import { CategoryBadge } from '@/components/subagent/category-badge';
import { SparklineChart } from '@/components/subagent/sparkline-chart';
import { StructuredDataScript } from '@/components/seo/structured-data';
import {
  generateSubagentStructuredData,
  generateBreadcrumbStructuredData,
} from '@/lib/structured-data';
import {
  getSubagent,
  incrementViewCount,
  recordTelemetry,
} from '@/lib/supabase/subagents';
import {
  getWeeklyDownloads,
  shouldShowSparkline,
} from '@/lib/supabase/telemetry';
import { CopyContentButtonClient } from './copy-content-button';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
    slug: string;
  }>;
}

// Format number for display
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo, slug } = await params;
  const subagent = await getSubagent(owner, repo, slug);

  if (!subagent) {
    return {
      title: 'Subagent Not Found',
    };
  }

  const description =
    subagent.description ||
    `${subagent.name} subagent for Claude Code from ${owner}/${repo}`;

  return {
    title: `${subagent.name} - ${owner}/${repo}`,
    description,
    openGraph: {
      title: `${subagent.name} | Subagents.sh`,
      description,
      type: 'article',
      url: `https://subagents.sh/${owner}/${repo}/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${subagent.name} | Subagents.sh`,
      description,
    },
  };
}

export default async function SubagentPage({ params }: PageProps) {
  const { owner, repo, slug } = await params;
  const subagent = await getSubagent(owner, repo, slug);

  if (!subagent) {
    notFound();
  }

  // Fetch sparkline data in parallel with view tracking
  const [showSparkline, weeklyDownloads] = await Promise.all([
    shouldShowSparkline(subagent.id),
    getWeeklyDownloads(subagent.id, 8),
  ]);

  // Track view (fire and forget)
  incrementViewCount(subagent.id).catch(() => {});
  recordTelemetry(subagent.id, 'view').catch(() => {});

  return (
    <>
      <StructuredDataScript
        data={[
          generateSubagentStructuredData(subagent),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://subagents.sh' },
            { name: owner, url: `https://subagents.sh/${owner}` },
            { name: repo, url: `https://subagents.sh/${owner}/${repo}` },
            {
              name: subagent.name,
              url: `https://subagents.sh/${owner}/${repo}/${slug}`,
            },
          ]),
        ]}
      />
      <div className="container py-8 md:py-12 max-w-4xl">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="mb-8">
        {/* Path breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-text-tertiary font-mono mb-3 min-w-0 overflow-hidden">
          <a
            href={`https://github.com/${owner}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors truncate"
          >
            {owner}
          </a>
          <span className="shrink-0">/</span>
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors truncate"
          >
            {repo}
          </a>
          <span className="shrink-0">/</span>
          <span className="text-text-secondary truncate">{slug}</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {subagent.name}
          </h1>
          {subagent.category && <CategoryBadge category={subagent.category} />}
        </div>

        {/* Description */}
        {subagent.description && (
          <p className="text-text-secondary break-words">{subagent.description}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr,240px] gap-6 lg:gap-12 overflow-hidden">
        {/* Main Content - NO card wrapper */}
        <div className="order-2 lg:order-1 min-w-0 overflow-hidden">
          <div className="prose-dark">
            <Content content={subagent.content} />
          </div>
        </div>

        {/* Sidebar - clean sections with dividers */}
        <aside className="order-1 lg:order-2 space-y-6 min-w-0 overflow-hidden">
          {/* Install */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
              Install
            </h3>
            <InstallCommand
              owner={owner}
              repo={repo}
              slug={slug}
              subagentId={subagent.id}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Stats inline */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-text-tertiary block text-xs mb-1">Installs</span>
              <span className="font-mono text-lg text-text-primary">
                {formatNumber(subagent.download_count)}
              </span>
            </div>
            <div>
              <span className="text-text-tertiary block text-xs mb-1">Views</span>
              <span className="font-mono text-lg text-text-primary">
                {formatNumber(subagent.view_count)}
              </span>
            </div>
          </div>

          {/* Download Trend Sparkline */}
          {showSparkline && weeklyDownloads.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
                  Download Trend
                </h3>
                <SparklineChart data={weeklyDownloads} />
                <p className="text-xs text-text-tertiary mt-1">Last 8 weeks</p>
              </div>
            </>
          )}

          {/* Tools */}
          {subagent.tools && subagent.tools.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
                  Tools
                </h3>
                <ToolsBadge tools={subagent.tools} limit={15} />
              </div>
            </>
          )}

          <div className="h-px bg-border" />

          {/* Source link */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
              Source
            </h3>
            <div className="space-y-2">
              <a
                href={`https://github.com/${owner}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors min-w-0"
              >
                <span className="font-mono truncate">
                  {owner}/{repo}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              {subagent.github_url && (
                <a
                  href={subagent.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Quick Actions */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
              Quick Actions
            </h3>
            <CopyContentButtonClient
              content={subagent.content}
              subagentId={subagent.id}
            />
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
