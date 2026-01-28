'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track if we had a query param initially
  const hadQueryParam = useRef(!!searchParams.get('q'));

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`, {
          scroll: false,
        });
        hadQueryParam.current = true;
      } else if (hadQueryParam.current) {
        router.push('/', { scroll: false });
        hadQueryParam.current = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(
          (e.target as HTMLElement)?.tagName || ''
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background border-border">
            <SheetHeader>
              <SheetTitle className="text-left">
                <span className="font-mono text-text-primary">subagents</span>
                <span className="font-mono text-text-primary">.sh</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/docs"
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://github.com/augmnt/subagents.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-mono font-semibold text-text-primary">
            subagents
          </span>
          <span className="font-mono font-semibold text-text-primary">.sh</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          <Link
            href="/docs"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Search */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search subagents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-9 w-56 lg:w-72 bg-surface border border-border rounded-lg pl-9 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 kbd">⌘K</kbd>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/augmnt/subagents.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// Fallback header for Suspense
function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-mono font-semibold text-text-primary">
            subagents
          </span>
          <span className="font-mono font-semibold text-text-primary">.sh</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-8">
          <Link
            href="/docs"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-3 ml-auto">
          <div className="h-9 w-56 lg:w-72 bg-surface border border-border rounded-lg hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  );
}
