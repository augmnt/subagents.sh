import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

export { Skeleton, type SkeletonProps };
