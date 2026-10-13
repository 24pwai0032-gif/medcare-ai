import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/** The MedCare AI mark (cross, ECG line, rounded square), unchanged from the original logo. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg viewBox="0 0 512 512" className={cn('size-8 shrink-0', className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id={`${id}cross`} x1="196" y1="80" x2="316" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <linearGradient id={`${id}ecg`} x1="100" y1="256" x2="412" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" stopOpacity={0.2} />
          <stop offset="15%" stopColor="#4338ca" />
          <stop offset="85%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill={`url(#${id}bg)`} />
      <rect x="196" y="80" width="120" height="352" rx="28" fill={`url(#${id}cross)`} />
      <rect x="80" y="196" width="352" height="120" rx="28" fill={`url(#${id}cross)`} />
      <path
        d="M100 256 L190 256 L220 200 L244 320 L268 190 L292 310 L316 256 L412 256"
        fill="none"
        stroke={`url(#${id}ecg)`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Mark plus the product name. The name stays in Latin script in both languages. */
export function Logo({ className, nameClassName }: { className?: string; nameClassName?: string }) {
  const { t } = useTranslation();
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span lang="en" dir="ltr" className={cn('text-base font-semibold tracking-tight', nameClassName)}>
        {t('brand')}
      </span>
    </span>
  );
}
