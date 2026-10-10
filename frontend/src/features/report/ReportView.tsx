import { Download, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Disclaimer } from '@/components/Disclaimer';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, Spinner } from '@/components/ui/feedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/authContext';
import { useFormatters } from '@/lib/format';
import { ReportBody } from './ReportBody';
import { parseReport } from './parseReport';
import { resolveSeverity, scanKind, type ReportData } from './reportData';
import { ReviewPanel } from './ReviewPanel';
import { usePdfDownload } from './usePdfDownload';

interface ReportViewProps {
  data: ReportData;
  audience: 'patient' | 'doctor';
  /** e.g. the X-ray sub-type chosen before the analysis. */
  subtitle?: string;
  /** Extra buttons next to "Download PDF". */
  actions?: ReactNode;
  /** Rendered above the buttons, e.g. the doctor's review form. */
  children?: ReactNode;
  /** Move focus to the title when the report replaces another step. */
  focusOnMount?: boolean;
}

export function ReportView({ data, audience, subtitle, actions, children, focusOnMount = false }: ReportViewProps) {
  const { t, i18n } = useTranslation(['report', 'common']);
  const { user } = useAuth();
  const fmt = useFormatters();
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const parsed = useMemo(() => parseReport(data.report), [data.report]);
  const urdu = data.urduReport ?? parsed.urdu;
  const severity = resolveSeverity(parsed, data.severity);
  const kind = scanKind(data.scanType);
  const patientName = audience === 'doctor' ? data.patientName : user?.full_name;
  const pdf = usePdfDownload({ data, parsed, urdu, level: severity.level, patientName });

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <article aria-labelledby={titleId} className="space-y-6">
      <header className="space-y-3">
        <h1 id={titleId} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-3xl">
          {t(`common:reportTitles.${kind}`)}
          {subtitle ? <span className="text-muted-foreground"> · {subtitle}</span> : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('report:createdAt', { date: fmt.dateTime(data.createdAt) })}
          {audience === 'doctor' && data.patientName ? ` · ${t('report:patient', { name: data.patientName })}` : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <SeverityBadge level={severity.level} />
          <StatusBadge status={data.status} />
        </div>
        {audience === 'doctor' && severity.mismatch && severity.level && severity.storedLevel ? (
          <p className="text-sm text-warning-foreground">
            {t('report:severityMismatch', {
              stated: t(`common:severity.${severity.level}`),
              stored: t(`common:severity.${severity.storedLevel}`),
            })}
          </p>
        ) : null}
        <p className="text-sm">
          {parsed.statedConfidence === null ? (
            t('report:confidenceNotStated')
          ) : (
            <Trans
              t={t}
              i18nKey="report:confidence"
              values={{ value: fmt.number(parsed.statedConfidence / 100, { style: 'percent' }) }}
              components={{ strong: <strong className="font-semibold" /> }}
            />
          )}
        </p>
        {data.saved ? null : (
          <Alert variant="warning" role="status">
            <TriangleAlert aria-hidden="true" />
            <p>{t('report:notSaved')}</p>
          </Alert>
        )}
      </header>

      <Disclaimer />
      <ReviewPanel status={data.status} notes={data.doctorNotes} />

      <Card>
        <CardContent>
          <Tabs defaultValue={i18n.language === 'ur' && urdu ? 'ur' : 'en'}>
            <TabsList aria-label={t('report:tabsLabel')}>
              <TabsTrigger value="en">{t('report:tabEnglish')}</TabsTrigger>
              <TabsTrigger value="ur">{t('report:tabUrdu')}</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              {i18n.language === 'ur' ? <p className="mb-4 text-sm text-muted-foreground">{t('report:englishNote')}</p> : null}
              <div lang="en" dir="ltr" className="text-base">
                {parsed.sections.length ? <ReportBody sections={parsed.sections} /> : <p>{t('report:emptyReport')}</p>}
              </div>
            </TabsContent>
            <TabsContent value="ur">
              {urdu ? (
                <div lang="ur" dir="rtl" className="urdu-block space-y-2">
                  {urdu.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>{t('report:noUrdu')}</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {children}

      <div className="flex flex-wrap gap-3">
        <Button onClick={pdf.download} disabled={pdf.pending} aria-busy={pdf.pending}>
          {pdf.pending ? <Spinner className="size-4" /> : <Download aria-hidden="true" />}
          {pdf.pending ? t('report:preparingPdf') : t('report:downloadPdf')}
        </Button>
        {actions}
      </div>
    </article>
  );
}
