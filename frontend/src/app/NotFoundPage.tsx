import { Component, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

function Screen({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  useDocumentTitle(title);
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <LogoMark className="size-12" />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {action}
    </main>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Screen
      title={t('notFound.title')}
      description={t('notFound.description')}
      action={
        <Button asChild>
          <Link to="/">{t('actions.goHome')}</Link>
        </Button>
      }
    />
  );
}

function CrashScreen() {
  const { t } = useTranslation();
  return (
    <Screen
      title={t('routeError.title')}
      description={t('routeError.description')}
      action={<Button onClick={() => window.location.reload()}>{t('actions.reload')}</Button>}
    />
  );
}

/** Router errorElement (e.g. a route chunk failed to download on a flaky connection). */
export function RouteError() {
  return <CrashScreen />;
}

/** Last-resort boundary around the whole app. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Suspense fallback={null}>
        <CrashScreen />
      </Suspense>
    );
  }
}
