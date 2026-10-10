import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { Progress as ProgressPrimitive, Separator as SeparatorPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  "flex gap-3 rounded-lg border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-5",
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

export function Separator({ className, ...props }: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return <SeparatorPrimitive.Root className={cn('shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px', className)} {...props} />;
}

/** Determinate progress bar. Fills from the inline start, so it mirrors in RTL. */
export function Progress({ value, className, ...props }: ComponentProps<typeof ProgressPrimitive.Root> & { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${clamped}%` }} />
    </ProgressPrimitive.Root>
  );
}
