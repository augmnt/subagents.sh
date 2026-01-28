import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded border px-2 py-0.5 text-xs font-mono w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors duration-150',
  {
    variants: {
      variant: {
        default:
          'border-border bg-surface text-text-secondary',
        accent:
          'border-accent/30 bg-accent-muted text-accent',
        secondary:
          'border-border bg-surface text-text-tertiary',
        outline:
          'border-border text-text-secondary hover:border-border-hover',
        ghost:
          'border-transparent bg-surface/50 text-text-tertiary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
