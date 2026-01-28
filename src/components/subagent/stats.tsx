import { Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsProps {
  downloads: number;
  views?: number;
  className?: string;
  showViews?: boolean;
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

export function Stats({
  downloads,
  views = 0,
  className,
  showViews = false,
}: StatsProps) {
  return (
    <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      <div className="flex items-center gap-1">
        <Download className="h-4 w-4" />
        <span>{formatNumber(downloads)}</span>
      </div>
      {showViews && (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{formatNumber(views)}</span>
        </div>
      )}
    </div>
  );
}
