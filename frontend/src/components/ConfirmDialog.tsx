import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/feedback';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  variant?: ButtonProps['variant'];
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  variant = 'default',
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent>
        <div className="flex flex-col gap-1.5 text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </div>
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={pending}>
              {t('actions.cancel')}
            </Button>
          </AlertDialogCancel>
          {/* Not an AlertDialog.Action: the dialog stays open until the request finishes. */}
          <Button variant={variant} onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? <Spinner className="size-4" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
