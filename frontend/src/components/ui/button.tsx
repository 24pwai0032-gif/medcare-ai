import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// shadcn/ui button. Every size keeps a 44 px touch target; xl is for page-level calls to action.
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 ease-out select-none active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      variant: {
        // Indigo with a light top edge; white text passes AA on every stop, in both themes.
        default: 'bg-button text-white shadow-button hover:-translate-y-px hover:shadow-button-hover hover:brightness-[1.06]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        outline:
          'border border-border-strong bg-surface text-foreground shadow-soft hover:border-primary/50 hover:bg-secondary hover:text-secondary-foreground',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_14px_-6px_rgb(190_18_60/0.55)] hover:brightness-110',
        emergency:
          'bg-emergency text-emergency-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_14px_-6px_rgb(190_18_60/0.55)] hover:brightness-110',
        link: 'h-auto px-0 text-primary underline underline-offset-4 hover:no-underline',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 rounded-2xl px-7 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    />
  );
}
