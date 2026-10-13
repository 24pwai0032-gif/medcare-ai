import '@fontsource-variable/inter/wght.css';
// Arabic-script subset only; the browser downloads it when Urdu text is on screen.
import '@fontsource/noto-nastaliq-urdu/arabic-400.css';
import './index.css';
import './i18n';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppErrorBoundary } from './app/NotFoundPage';
import { AppProviders } from './app/providers';
import { router } from './app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<div aria-busy="true" className="min-h-dvh" />}>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
);
