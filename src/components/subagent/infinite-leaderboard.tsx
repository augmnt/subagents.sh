'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubagentListItem, TimeFilter } from '@/lib/supabase/subagents';
import { CategoryBadge, CATEGORIES } from './category-badge';

interface InfiniteLeaderboardProps {
  initialSubagents: SubagentListItem[];
  initialHasMore?: boolean;
  className?: string;
  pageSize?: number;
}

const FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'This Week' },
  { value: '24h', label: 'Today' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function InfiniteLeaderboard({
  initialSubagents,
  initialHasMore = true,
  className,
  pageSize = 20,
}: InfiniteLeaderboardProps) {
  const [subagents, setSubagents] = useState<SubagentListItem[]>(initialSubagents);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(initialSubagents.length);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Fetch subagents with current filters
  const fetchSubagents = useCallback(async (timeFilter: TimeFilter, category: string | null) => {
    setFilterLoading(true);

    try {
      let url = `/api/subagents?limit=${pageSize}&offset=0&filter=${timeFilter}`;
      if (category) {
        url += `&category=${category}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newSubagents = data.data || [];
        setSubagents(newSubagents);
        setOffset(newSubagents.length);
        setHasMore(newSubagents.length >= pageSize);
      }
    } catch (error) {
      console.error('Error fetching filtered subagents:', error);
    } finally {
      setFilterLoading(false);
    }
  }, [pageSize]);

  // Handle time filter change
  const handleFilterChange = useCallback(async (filter: TimeFilter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    await fetchSubagents(filter, activeCategory);
  }, [activeFilter, activeCategory, fetchSubagents]);

  // Handle category filter change
  const handleCategoryChange = useCallback(async (category: string | null) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    await fetchSubagents(activeFilter, category);
  }, [activeFilter, activeCategory, fetchSubagents]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let url = `/api/subagents?limit=${pageSize}&offset=${offset}&filter=${activeFilter}`;
      if (activeCategory) {
        url += `&category=${activeCategory}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newSubagents = data.data || [];

        if (newSubagents.length === 0) {
          setHasMore(false);
        } else {
          setSubagents((prev) => [...prev, ...newSubagents]);
          setOffset((prev) => prev + newSubagents.length);
          if (newSubagents.length < pageSize) {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading more subagents:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, pageSize, activeFilter, activeCategory]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  return (
    <div className={cn('w-full', className)}>
      {/* Time Filter Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            disabled={filterLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors relative',
              'hover:text-text-primary',
              activeFilter === filter.value
                ? 'text-text-primary'
                : 'text-text-tertiary',
              filterLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {filter.label}
            {activeFilter === filter.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryChange(null)}
          disabled={filterLoading}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full transition-colors border',
            activeCategory === null
              ? 'bg-text-primary text-background border-text-primary'
              : 'text-text-secondary border-border hover:border-text-tertiary',
            filterLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            disabled={filterLoading}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors border',
              activeCategory === cat.value
                ? 'bg-text-primary text-background border-text-primary'
                : 'text-text-secondary border-border hover:border-text-tertiary',
              filterLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading state for filter change */}
      {filterLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
        </div>
      )}

      {/* Empty state */}
      {!filterLoading && subagents.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <p>No subagents found{activeCategory ? ` in ${activeCategory}` : ''}{activeFilter !== 'all' ? ` for ${FILTERS.find(f => f.value === activeFilter)?.label.toLowerCase()}` : ''}.</p>
        </div>
      )}

      {/* Desktop Table */}
      {!filterLoading && subagents.length > 0 && (
        <>
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary group-hover:text-accent transition-colors">
                            {subagent.name}
                          </span>
                          {subagent.category && (
                            <CategoryBadge category={subagent.category} />
                          )}
                        </div>
                        {subagent.description && (
                          <div className="text-sm text-text-secondary line-clamp-1 mt-0.5">
                            {subagent.description}
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-text-tertiary font-mono">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-text-primary truncate">
                          {subagent.name}
                        </span>
                        {subagent.category && (
                          <CategoryBadge category={subagent.category} />
                        )}
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
                </div>
              </Link>
            ))}
          </div>

          {/* Loading indicator and intersection observer target */}
          <div ref={observerRef} className="py-8 flex justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
            {!hasMore && subagents.length > 0 && (
              <p className="text-sm text-text-tertiary">No more subagents to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
