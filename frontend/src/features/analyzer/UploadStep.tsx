import { CircleAlert, Lightbulb, ShieldCheck, X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { RadioCard, RadioGroup } from '@/components/ui/radio-group';
import { useFormatters } from '@/lib/format';
import { useObjectUrl } from '@/lib/useObjectUrl';
import type { SubtypeId } from '@/features/report/reportData';
import { Dropzone } from './Dropzone';
import type { AnalyzerModule, FileProblem } from './modules';

interface UploadStepProps {
  module: AnalyzerModule;
  file: File | null;
  problem: FileProblem | null;
  rejectedSize: number | null;
  subtype: SubtypeId | undefined;
  onSubtype: (id: SubtypeId) => void;
  onFile: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
  /** Error or cancellation notice from the previous attempt. */
  notice?: ReactNode;
}

export function UploadStep(props: UploadStepProps) {
  const { module, file, problem, rejectedSize, subtype, onSubtype, onFile, onClear, onAnalyze, notice } = props;
  const { t } = useTranslation(['analyzer', 'common']);
  const fmt = useFormatters();
  const preview = useObjectUrl(file);
  const requirementsId = useId();
  const tips = t(`analyzer:modules.${module.id}.tips`, { returnObjects: true }) as string[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(`analyzer:modules.${module.id}.title`)}
        description={t(`analyzer:modules.${module.id}.description`)}
        back={{ to: '/app', label: t('common:actions.back') }}
        icon={{ icon: module.icon, tone: module.tone }}
      />

      {notice}

      {module.subtypes ? (
        <fieldset className="space-y-3">
          <legend className="text-base font-semibold">{t('analyzer:subtypes.label')}</legend>
          <RadioGroup value={subtype} onValueChange={(value) => onSubtype(value as SubtypeId)} className="sm:grid-cols-2">
            {module.subtypes.map((option) => (
              <RadioCard
                key={option.id}
                id={`subtype-${option.id}`}
                value={option.id}
                description={t(`analyzer:subtypes.${option.id}.description`)}
              >
                {t(`analyzer:subtypes.${option.id}.label`)}
              </RadioCard>
            ))}
          </RadioGroup>
        </fieldset>
      ) : null}

      <section aria-labelledby="upload-heading" className="space-y-3">
        <h2 id="upload-heading" className="text-base font-semibold">
          {t('analyzer:upload.heading')}
        </h2>
        {file && preview ? (
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={preview} alt={t('analyzer:upload.previewAlt')} className="max-h-64 w-full rounded-xl border object-contain sm:w-56" />
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-sm break-all" dir="auto">
                  {t('analyzer:upload.fileInfo', { name: file.name, size: fmt.fileSize(file.size) })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={onClear}>
                    <X aria-hidden="true" />
                    {t('analyzer:upload.remove')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Dropzone onFile={onFile} describedBy={requirementsId} />
        )}
        <p id={requirementsId} className="text-sm text-muted-foreground">
          {t('analyzer:upload.requirements')}
        </p>
        <div role="alert" aria-live="assertive">
          {problem ? (
            <Alert variant="destructive" role="presentation">
              <CircleAlert aria-hidden="true" />
              <p>
                {t(`analyzer:upload.errors.${problem}`, {
                  size: rejectedSize ? fmt.fileSize(rejectedSize) : '',
                })}
              </p>
            </Alert>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="tips-heading" className="rounded-2xl border bg-surface p-5 shadow-card">
        <h2 id="tips-heading" className="mb-2 flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="size-5 text-primary" aria-hidden="true" />
          {t('analyzer:upload.tipsHeading')}
        </h2>
        <ul className="list-disc space-y-1 ps-6 text-sm">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t('analyzer:upload.privacy')}
      </p>

      <Button size="lg" className="w-full sm:w-auto" disabled={!file || !!problem} onClick={onAnalyze}>
        {t('analyzer:upload.analyze')}
      </Button>
    </div>
  );
}
