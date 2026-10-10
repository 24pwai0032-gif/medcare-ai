import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const fieldClasses =
  'w-full min-w-0 rounded-md border border-input bg-surface px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive';

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn('h-11', fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn('min-h-28 py-2.5', fieldClasses, className)} {...props} />;
}
