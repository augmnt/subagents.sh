'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Download, ArrowRight } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from '@/components/ui/command';

interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  owner: string;
  repo: string;
  slug: string;
  download_count: number;
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

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K / Option+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Check if we're already in an input
      const activeEl = document.activeElement;
      const isInputActive = activeEl instanceof HTMLInputElement ||
                           activeEl instanceof HTMLTextAreaElement;

      if (e.key === 'k' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/subagents?q=${encodeURIComponent(query.trim())}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const url = `/${result.owner}/${result.repo}/${result.slug}`;
      setOpen(false);
      setQuery('');
      // Use setTimeout to let dialog close animation complete before navigation
      setTimeout(() => {
        router.push(url);
      }, 10);
    },
    [router]
  );

  return (
    <>
      {/* Trigger button for mobile */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
        aria-label="Search"
      >
        <Terminal className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search subagents..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <CommandLoading>Searching...</CommandLoading>
          )}
          {!loading && query && results.length === 0 && (
            <CommandEmpty>No subagents found.</CommandEmpty>
          )}
          {!loading && results.length > 0 && (
            <CommandGroup heading="Subagents">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.name} ${result.owner}/${result.repo}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                      <span className="font-medium text-text-primary truncate">
                        {result.name}
                      </span>
                    </div>
                    <div className="text-xs text-text-tertiary font-mono ml-6 mt-0.5">
                      {result.owner}/{result.repo}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Download className="h-3 w-3" />
                      {formatNumber(result.download_count)}
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-tertiary" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!loading && !query && (
            <div className="py-6 text-center text-sm text-text-tertiary">
              <p>Type to search subagents...</p>
              <p className="mt-2 text-xs">
                Press <kbd className="kbd mx-1">ESC</kbd> to close
              </p>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
