import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  "flex gap-3 rounded-2xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        info: 'border-info-border bg-info text-info-foreground',
        warning: 'border-warning-border bg-warning text-warning-foreground',
        destructive: 'border-sev-severe-foreground/30 bg-sev-severe text-sev-severe-foreground',
        neutral: 'border-border bg-surface text-foreground',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

export function Alert({ className, variant, ...props }: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden="true" className={cn('size-5 animate-spin', className)} />;
}
