import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/feedback';
import { useFormatters } from '@/lib/format';
import type { Scan } from '@/services/types';
import { displaySeverity, SCAN_ICONS, scanKind } from './scans';

interface ScanListProps {
  scans: Scan[];
  hrefFor: (scan: Scan) => string;
  /** Doctors see whose scan it is. */
  showPatient?: boolean;
}

export function ScanList({ scans, hrefFor, showPatient = false }: ScanListProps) {
  const { t } = useTranslation('common');
  const fmt = useFormatters();
  return (
    <ul role="list" className="space-y-3">
      {scans.map((scan) => {
        const kind = scanKind(scan.scan_type);
        const Icon = SCAN_ICONS[kind];
        return (
          <li key={scan.id}>
            {/* Phones: icon, title and chevron on one line, badges below. From sm: all on one line. */}
            <Link
              to={hrefFor(scan)}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-lg border bg-surface p-4 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
            >
              <span className="row-start-1 grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="row-start-1 min-w-0">
                <span className="block font-semibold">{t(`reportTitles.${kind}`)}</span>
                <span className="block text-sm text-muted-foreground">
                  {showPatient && scan.patient_name ? (
                    <>
                      <span dir="auto">{scan.patient_name}</span>
                      {' · '}
                    </>
                  ) : null}
                  {fmt.dateTime(scan.created_at)}
                </span>
              </span>
              <span className="col-span-3 row-start-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:row-start-1">
                <SeverityBadge level={displaySeverity(scan)} />
                <StatusBadge status={scan.status} />
              </span>
              <ChevronRight
                className="col-start-3 row-start-1 size-5 shrink-0 text-muted-foreground sm:col-start-4 rtl:-scale-x-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ScanListSkeleton({ rows = 3 }: { rows?: number }) {
  const { t } = useTranslation('common');
  return (
    <div role="status" aria-label={t('loading')} className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-surface p-4">
          <Skeleton className="size-11" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}
