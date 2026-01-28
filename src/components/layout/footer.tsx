import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and attribution */}
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Link href="/" className="flex items-center">
              <span className="font-mono text-text-primary">subagents</span>
              <span className="font-mono text-text-primary">.sh</span>
            </Link>
            <span className="text-text-tertiary">·</span>
            <span>
              by{' '}
              <a
                href="https://augmnt.sh/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-accent transition-colors"
              >
                augmnt
              </a>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/docs"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </Link>
            <a
              href="https://github.com/augmnt/subagents.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
