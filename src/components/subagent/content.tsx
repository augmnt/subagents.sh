'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface ContentProps {
  content: string;
  className?: string;
}

/**
 * Strips frontmatter and metadata from markdown content.
 * Only removes specific patterns that are duplicated in header/sidebar.
 */
function cleanContent(content: string): string {
  let cleaned = content;

  // 1. Strip YAML frontmatter (---...---)
  cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '');

  // 2. Strip leading H1 title (# Title) - already shown in header
  cleaned = cleaned.replace(/^#\s+[^\n]+\n*/m, '');

  // 3. Strip specific metadata key-value lines at the start
  // These patterns match "**Key:** value" or "- **Key:** value" format
  const metadataPatterns = [
    /^\*\*Name:\*\*[^\n]*\n*/gm,
    /^\*\*Description:\*\*[^\n]*\n*/gm,
    /^\*\*Tools:\*\*[^\n]*\n*/gm,
    /^-\s*\*\*Name:\*\*[^\n]*\n*/gm,
    /^-\s*\*\*Description:\*\*[^\n]*\n*/gm,
    /^-\s*\*\*Tools:\*\*[^\n]*\n*/gm,
  ];

  for (const pattern of metadataPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 4. Trim leading/trailing whitespace
  return cleaned.trim();
}

export function Content({ content, className }: ContentProps) {
  const cleanedContent = cleanContent(content);

  return (
    <div className={cn('prose-dark', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanedContent}</ReactMarkdown>
    </div>
  );
}
