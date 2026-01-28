import { cn } from '@/lib/utils';

interface ToolsBadgeProps {
  tools: string[] | null;
  className?: string;
  limit?: number;
}

export function ToolsBadge({ tools, className, limit = 10 }: ToolsBadgeProps) {
  if (!tools || tools.length === 0) return null;

  const displayedTools = tools.slice(0, limit);
  const remainingCount = tools.length - limit;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayedTools.map((tool) => (
        <span
          key={tool}
          className="inline-flex items-center px-2 py-0.5 text-xs font-mono
                     rounded-md text-text-secondary
                     bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.2)]"
        >
          {tool}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs text-text-tertiary">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
