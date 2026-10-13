import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { ReportView } from '@/features/report/ReportView';
import { reportFromAnalysis, type SubtypeId } from '@/features/report/reportData';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { errorKey } from '@/services/errors';
import { warmUpBackend } from '@/services/api';
import { AnalyzingStep } from './AnalyzingStep';
import { getModule, validateFile, type AnalyzerModule, type FileProblem } from './modules';
import { UploadStep } from './UploadStep';
import { useAnalysis } from './useAnalysis';

function Analyzer({ module }: { module: AnalyzerModule }) {
  const { t } = useTranslation(['analyzer', 'report', 'common']);
  const queryClient = useQueryClient();
  const analysis = useAnalysis();
  const { state } = analysis;
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<FileProblem | null>(null);
  const [rejectedSize, setRejectedSize] = useState<number | null>(null);
  const [subtype, setSubtype] = useState<SubtypeId | undefined>(module.subtypes?.[0]?.id);
  useDocumentTitle(t(`analyzer:modules.${module.id}.title`));

  useEffect(() => {
    warmUpBackend();
  }, []);
  // Block bodies on purpose: scrollTo() returns a Promise in current Chrome, and an effect must not return one.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.status]);

  const chooseFile = (next: File) => {
    const issue = validateFile(next);
    setProblem(issue);
    setRejectedSize(issue === 'size' ? next.size : null);
    setFile(issue ? null : next);
    if (state.status !== 'idle') analysis.reset();
  };

  const endpoint = module.subtypes?.find((s) => s.id === subtype)?.endpoint ?? module.endpoint;

  const analyze = async () => {
    if (!file) return;
    const result = await analysis.start(file, endpoint);
    if (result) await queryClient.invalidateQueries({ queryKey: ['scans'] });
  };

  if ((state.status === 'uploading' || state.status === 'analyzing') && file) {
    return <AnalyzingStep state={state} moduleId={module.id} file={file} onCancel={analysis.cancel} />;
  }

  if (state.status === 'done') {
    const data = reportFromAnalysis(state.result, endpoint, module.subtypes ? subtype : undefined);
    const subtitle = module.subtypes && subtype ? t(`analyzer:subtypes.${subtype}.label`) : undefined;
    const startOver = () => {
      setFile(null);
      analysis.reset();
    };
    return (
      <ReportView
        data={data}
        audience="patient"
        subtitle={subtitle}
        focusOnMount
        actions={
          <>
            <Button variant="outline" onClick={startOver}>
              {t('report:newAnalysis')}
            </Button>
            <Button asChild variant="ghost">
              <Link to="/app">{t('report:backToDashboard')}</Link>
            </Button>
          </>
        }
      />
    );
  }

  let notice = null;
  if (state.status === 'cancelled') {
    notice = (
      <Alert variant="info" role="status">
        <Info aria-hidden="true" />
        <p>{state.afterUpload ? t('analyzer:upload.cancelledAfterUpload') : t('analyzer:upload.cancelledDuringUpload')}</p>
      </Alert>
    );
  } else if (state.status === 'error') {
    notice = (
      <Alert variant="destructive" role="alert">
        <CircleAlert aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">{t('analyzer:failed.heading')}</p>
          <p>{t(`common:${errorKey(state.error)}`)}</p>
          {state.afterUpload && (state.error.code === 'timeout' || state.error.code === 'network') ? (
            <p>{t('analyzer:failed.timeoutNote')}</p>
          ) : null}
        </div>
      </Alert>
    );
  }

  return (
    <UploadStep
      module={module}
      file={file}
      problem={problem}
      rejectedSize={rejectedSize}
      subtype={subtype}
      onSubtype={setSubtype}
      onFile={chooseFile}
      onClear={() => {
        setFile(null);
        setProblem(null);
      }}
      onAnalyze={analyze}
      notice={notice}
    />
  );
}

export default function AnalyzerPage() {
  const { t } = useTranslation(['analyzer', 'report', 'common']);
  const { module: moduleId } = useParams();
  const module = getModule(moduleId);
  if (!module) {
    return (
      <EmptyState
        icon={CircleAlert}
        title={t('common:notFound.title')}
        description={t('analyzer:notFound')}
        action={
          <Button asChild>
            <Link to="/app">{t('report:backToDashboard')}</Link>
          </Button>
        }
      />
    );
  }
  // A new key resets the flow when switching between modules.
  return <Analyzer key={module.id} module={module} />;
}
