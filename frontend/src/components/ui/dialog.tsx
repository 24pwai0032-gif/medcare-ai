import { X } from 'lucide-react';
import { AlertDialog as AlertPrimitive, Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const overlayClasses =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0';
const contentClasses =
  'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-surface p-6 text-surface-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  const { t } = useTranslation();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content className={cn(contentClasses, className)} {...props}>
        {children}
        <DialogPrimitive.Close
          className="absolute end-3 top-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={t('actions.close')}
        >
          <X className="size-5" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pe-10 text-start', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export const AlertDialog = AlertPrimitive.Root;
export const AlertDialogCancel = AlertPrimitive.Cancel;
export const AlertDialogAction = AlertPrimitive.Action;

export function AlertDialogContent({ className, ...props }: ComponentProps<typeof AlertPrimitive.Content>) {
  return (
    <AlertPrimitive.Portal>
      <AlertPrimitive.Overlay className={overlayClasses} />
      <AlertPrimitive.Content className={cn(contentClasses, className)} {...props} />
    </AlertPrimitive.Portal>
  );
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertPrimitive.Title>) {
  return <AlertPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<typeof AlertPrimitive.Description>) {
  return <AlertPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
