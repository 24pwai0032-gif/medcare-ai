import { render } from '@testing-library/react';
import { Suspense, type ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { AppDataProvider } from '@/app/AppDataProvider';
import { AppProviders } from '@/app/providers';
import '@/i18n';

export function renderRoutes(routes: RouteObject[], initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const utils = render(
    <Suspense fallback={<p>suspended</p>}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </Suspense>,
  );
  return { router, ...utils };
}

/** Renders one element with the app providers, a router and a query client. */
export function renderWithProviders(ui: ReactElement, initialPath = '/') {
  return renderRoutes([{ path: '*', element: <AppDataProvider>{ui}</AppDataProvider> }], initialPath);
}

export function signInAs(role: 'patient' | 'doctor', name = role === 'doctor' ? 'Dr Ayesha Khan' : 'Bilal Ahmed') {
  localStorage.setItem('medcare_token', 'test-token');
  localStorage.setItem(
    'medcare_user',
    JSON.stringify({ id: role === 'doctor' ? 2 : 1, full_name: name, email: `${role}@example.com`, role }),
  );
}
