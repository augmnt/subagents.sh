import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(
          'flex h-9 w-full min-w-0 rounded-lg border bg-surface px-3 py-1 text-sm text-text-primary',
          'placeholder:text-text-tertiary',
          'border-border focus:border-border-hover focus:outline-none focus:ring-1 focus:ring-accent/20',
          'transition-all duration-150',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
