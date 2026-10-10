import { RadioGroup as RadioPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn('grid gap-2', className)} {...props} />;
}

/** A full-width option row; the whole row is the click target (min 44 px). Arrow keys move between options. */
export function RadioCard({
  value,
  id,
  children,
  description,
  className,
}: {
  value: string;
  id: string;
  children: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-surface px-3 py-2.5 hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary',
        className,
      )}
    >
      <RadioPrimitive.Item
        id={id}
        value={value}
        className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-primary"
      >
        <RadioPrimitive.Indicator className="size-2.5 rounded-full bg-primary" />
      </RadioPrimitive.Item>
      <span className="flex flex-col">
        <span className="text-sm font-medium">{children}</span>
        {description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  );
}
