import { Tabs as TabsPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex w-full flex-wrap items-end gap-1 border-b', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px inline-flex min-h-11 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=active]:border-primary data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('pt-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring', className)}
      {...props}
    />
  );
}
