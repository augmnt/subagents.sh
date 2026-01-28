'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubagentListItem } from '@/lib/supabase/subagents';
import { ToolsBadge } from './tools-badge';

interface LeaderboardProps {
  subagents: SubagentListItem[];
  className?: string;
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

export function Leaderboard({ subagents, className }: LeaderboardProps) {
  if (subagents.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p>No subagents found.</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-text-tertiary uppercase tracking-wider border-b border-border">
              <th className="pb-3 w-12 font-medium">#</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Source</th>
              <th className="pb-3 text-right font-medium">Installs</th>
            </tr>
          </thead>
          <tbody>
            {subagents.map((subagent, index) => (
              <tr
                key={subagent.id}
                className="group border-b border-border/50 last:border-0"
              >
                <td className="py-4 text-text-tertiary font-mono text-sm">
                  {index + 1}
                </td>
                <td className="py-4">
                  <Link
                    href={`/${subagent.owner}/${subagent.repo}/${subagent.slug}`}
                    className="block"
                  >
                    <div className="font-medium text-text-primary group-hover:text-accent transition-colors">
                      {subagent.name}
                    </div>
                    {subagent.description && (
                      <div className="text-sm text-text-secondary line-clamp-1 mt-0.5">
                        {subagent.description}
                      </div>
                    )}
                    {subagent.tools && subagent.tools.length > 0 && (
                      <div className="mt-2">
                        <ToolsBadge tools={subagent.tools} limit={3} />
                      </div>
                    )}
                  </Link>
                </td>
                <td className="py-4">
                  <span className="text-sm text-text-tertiary font-mono">
                    {subagent.owner}/{subagent.repo}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                    <Download className="h-3.5 w-3.5" />
                    <span className="font-mono">
                      {formatNumber(subagent.download_count)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {subagents.map((subagent, index) => (
          <Link
            key={subagent.id}
            href={`/${subagent.owner}/${subagent.repo}/${subagent.slug}`}
            className="block"
          >
            <div className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-tertiary font-mono">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-text-primary truncate">
                      {subagent.name}
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono">
                    {subagent.owner}/{subagent.repo}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Download className="h-3 w-3" />
                  <span className="font-mono">
                    {formatNumber(subagent.download_count)}
                  </span>
                </div>
              </div>
              {subagent.description && (
                <p className="text-sm text-text-secondary line-clamp-2 mt-2">
                  {subagent.description}
                </p>
              )}
              {subagent.tools && subagent.tools.length > 0 && (
                <div className="mt-2">
                  <ToolsBadge tools={subagent.tools} limit={3} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Skeleton loader for the leaderboard
export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg skeleton" />
      ))}
    </div>
  );
}
