import { Progress as ProgressPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

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
