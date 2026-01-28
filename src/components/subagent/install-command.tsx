'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstallCommandProps {
  owner: string;
  repo: string;
  slug: string;
  subagentId?: string;
  className?: string;
  size?: 'default' | 'large';
  onCopy?: () => void;
}

export function InstallCommand({
  owner,
  repo,
  slug,
  subagentId,
  className,
  size = 'default',
  onCopy,
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const command = `npx subagents-sh add ${owner}/${repo}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);

      // Track copy event if we have the subagent ID
      if (subagentId) {
        fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subagentId,
            event: 'copy',
          }),
        }).catch(() => {});
      }

      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={cn(
        'terminal-box flex items-center gap-3 group',
        size === 'large' ? 'px-4 py-3' : 'px-3 py-2',
        className
      )}
    >
      <span className="text-text-secondary select-none">$</span>
      <code
        className={cn(
          'flex-1 text-text-primary overflow-x-auto whitespace-nowrap no-scrollbar',
          size === 'large' ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-sm'
        )}
      >
        {command}
      </code>
      <button
        onClick={handleCopy}
        className={cn(
          'flex-shrink-0 p-1.5 rounded transition-all',
          'text-text-tertiary hover:text-text-primary',
          'hover:bg-surface',
          copied && 'text-accent'
        )}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
