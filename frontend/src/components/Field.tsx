import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  /** Already translated. */
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
  className?: string;
}

/** Label, control, hint and error, wired together with aria-describedby / aria-invalid. */
export function Field({ id, label, hint, error, children, className }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function PasswordInput(
  { className, ...props },
  ref,
) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? 'text' : 'password'} className={cn('pe-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t('password.hide') : t('password.show')}
        aria-pressed={visible}
        className="absolute end-0 top-0 inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>
    </div>
  );
});
