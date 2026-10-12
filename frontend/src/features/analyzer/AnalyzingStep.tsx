import { CircleCheck, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert, Spinner } from '@/components/ui/feedback';
import { Progress } from '@/components/ui/progress';
import { useFormatters } from '@/lib/format';
import { useObjectUrl } from '@/lib/useObjectUrl';
import type { AnalysisState } from './useAnalysis';
import type { ModuleId } from './modules';

type Busy = Extract<AnalysisState, { status: 'uploading' } | { status: 'analyzing' }>;

function useElapsedSeconds(since: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (since === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);
  return since === null ? 0 : Math.max(0, Math.floor((now - since) / 1000));
}

/** Upload percentage first; after that, time-based messages only, never a made-up progress number. */
export function AnalyzingStep({ state, moduleId, file, onCancel }: { state: Busy; moduleId: ModuleId; file: File; onCancel: () => void }) {
  const { t } = useTranslation('analyzer', { keyPrefix: 'analyzing' });
  const { t: tModule } = useTranslation('analyzer');
  const fmt = useFormatters();
  const preview = useObjectUrl(file);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const analyzing = state.status === 'analyzing';
  const seconds = useElapsedSeconds(analyzing ? state.startedAt : null);
  const percent = state.status === 'uploading' ? Math.round(state.progress * 100) : 100;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const stage = !analyzing
    ? t('uploading', { percent: fmt.number(percent / 100, { style: 'percent' }) })
    : seconds < 20
      ? tModule(`modules.${moduleId}.reading`)
      : seconds < 50
        ? t('writing')
        : t('slow');

  const minutes = Math.floor(seconds / 60);
  const clock = `${minutes}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-3xl">
        {t('heading')}
      </h1>

      {preview ? (
        <img src={preview} alt={t('previewAlt')} className="mx-auto max-h-56 rounded-xl border object-contain" />
      ) : null}

      <div className="space-y-4 rounded-2xl border bg-surface p-6 shadow-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {analyzing ? <CircleCheck className="size-4 text-primary" aria-hidden="true" /> : <Spinner className="size-4" />}
            <span>{analyzing ? t('uploaded') : t('uploadLabel')}</span>
          </div>
          <Progress value={percent} aria-label={t('uploadLabel')} />
        </div>

        <div className="flex items-center gap-3">
          {analyzing ? <Spinner /> : null}
          <p role="status" aria-live="polite" className="font-medium">
            {stage}
          </p>
        </div>

        {analyzing ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
            <Clock className="size-4" aria-hidden="true" />
            {t('elapsed', { time: clock })}
          </p>
        ) : null}
      </div>

      <Alert variant="warning" role="note">
        <Clock aria-hidden="true" />
        <p>{t('coldStart')}</p>
      </Alert>

      <Button variant="outline" onClick={onCancel}>
        {t('cancel')}
      </Button>
    </div>
  );
}
