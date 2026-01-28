import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono',
        'rounded-md text-text-secondary',
        'bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.2)]',
        className
      )}
    >
      {category}
    </span>
  );
}

// List of all valid categories for filtering
export const CATEGORIES = [
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'testing', label: 'Testing' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps' },
  { value: 'documentation', label: 'Docs' },
  { value: 'refactoring', label: 'Refactoring' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'ai-ml', label: 'AI/ML' },
  { value: 'other', label: 'Other' },
] as const;
