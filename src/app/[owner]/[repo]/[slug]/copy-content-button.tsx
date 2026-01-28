'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyContentButtonClientProps {
  content: string;
  subagentId: string;
}

export function CopyContentButtonClient({
  content,
  subagentId,
}: CopyContentButtonClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      // Track copy event
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subagentId,
          event: 'copy',
          metadata: { type: 'full_content' },
        }),
      }).catch(() => {});

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-accent" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy full content
        </>
      )}
    </button>
  );
}
