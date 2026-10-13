import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataProvider } from '@/app/AppDataProvider';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import type { Scan } from '@/services/types';
import { renderRoutes, signInAs } from '@/test/render';
import PatientDashboard from './PatientDashboard';
import ScanDetailPage from './ScanDetailPage';
import ScanHistoryPage from './ScanHistoryPage';

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

const SCANS: Scan[] = [
  { id: 1, scan_type: 'xray', status: 'approved', severity: 'Normal', report: '**SEVERITY**: Normal', doctor_notes: 'All clear.', created_at: '2026-09-01T10:00:00' },
  { id: 2, scan_type: 'blood-test', status: 'pending', severity: 'Severe', report: 'No severe issue.\n\n**SEVERITY**: Mild', created_at: '2026-10-05T08:00:00' },
  { id: 3, scan_type: 'ecg', status: 'rejected', severity: 'Moderate', report: '**SEVERITY**: Moderate', doctor_notes: 'Repeat the ECG.', created_at: '2026-09-20T12:00:00' },
];

function mockApi(scans: Scan[] = SCANS) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    if (url.endsWith('/users/scans')) return json(200, scans);
    if (url.endsWith('/users/me')) return json(200, { id: 1, full_name: 'Bilal Ahmed', email: 'patient@example.com', role: 'patient' });
    if (url.endsWith('/users/login')) {
      const body = JSON.parse(String(init?.body));
      return body.password === 'right-password'
        ? json(200, { access_token: 'jwt', token_type: 'bearer', user: { id: 1, full_name: 'Bilal Ahmed', email: body.email, role: 'patient' } })
        : json(401, { detail: 'Galat password! Dobara try karo.' });
    }
    if (url.endsWith('/users/register')) {
      const body = JSON.parse(String(init?.body));
      return json(200, { access_token: 'jwt', token_type: 'bearer', user: { id: 7, full_name: body.full_name, email: body.email, role: body.role } });
    }
    return json(404, { detail: 'not found' });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const withData = (element: React.ReactNode) => <AppDataProvider>{element}</AppDataProvider>;

const appRoutes = [
  { path: '/app', element: withData(<PatientDashboard />) },
  { path: '/app/scans', element: withData(<ScanHistoryPage />) },
  { path: '/app/scans/:id', element: withData(<ScanDetailPage />) },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/doctor', element: <p>doctor home</p> },
];

beforeEach(() => {
  mockApi();
});

describe('patient dashboard', () => {
  it('greets the patient and counts reports by review status', async () => {
    signInAs('patient');
    renderRoutes(appRoutes, '/app');
    expect(await screen.findByRole('heading', { level: 1, name: 'Hello, Bilal' })).toBeInTheDocument();
    const stats = await screen.findByRole('heading', { name: 'Your reports' });
    const list = stats.parentElement!;
    expect(within(list).getByText('Waiting for review').closest('div')).toHaveTextContent('1');
    expect(screen.getAllByRole('link', { name: /report/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Call 1122 Rescue service' })).toHaveAttribute('href', 'tel:1122');
  });
});

describe('scan history', () => {
  it('lists reports newest first, using the severity the report states', async () => {
    signInAs('patient');
    renderRoutes(appRoutes, '/app/scans');
    const items = await screen.findAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('Blood test report'),
      expect.stringContaining('ECG report'),
      expect.stringContaining('X-ray report'),
    ]);
    expect(items[0]).toHaveTextContent('Severity: Mild');
    expect(screen.getByText('3 reports')).toBeInTheDocument();
  });

  it('filters by review status through the URL', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    const { router } = renderRoutes(appRoutes, '/app/scans');
    await user.selectOptions(await screen.findByLabelText('Review status'), 'rejected');
    expect(router.state.location.search).toBe('?status=rejected');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('1 report')).toBeInTheDocument();
  });

  it('shows an empty state for a new account', async () => {
    mockApi([]);
    signInAs('patient');
    renderRoutes(appRoutes, '/app/scans');
    expect(await screen.findByText('No reports yet')).toBeInTheDocument();
  });
});

describe('scan detail', () => {
  it('opens a stored report with the doctor notes', async () => {
    signInAs('patient');
    renderRoutes(appRoutes, '/app/scans/3');
    expect(await screen.findByRole('heading', { level: 1, name: 'ECG report' })).toBeInTheDocument();
    expect(screen.getByText('Repeat the ECG.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to my scans' })).toHaveAttribute('href', '/app/scans');
  });

  it('shows not-found for an unknown id', async () => {
    signInAs('patient');
    renderRoutes(appRoutes, '/app/scans/999');
    expect((await screen.findAllByText('Report not found')).length).toBeGreaterThan(0);
  });
});

describe('sign in and register', () => {
  it('shows a translated error for wrong credentials, never the Roman Urdu detail', async () => {
    const user = userEvent.setup();
    renderRoutes(appRoutes, '/login');
    await user.type(await screen.findByLabelText('Email'), 'patient@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('The email or password is incorrect.')).toBeInTheDocument();
    expect(screen.queryByText(/Galat/)).not.toBeInTheDocument();
  });

  it('validates fields before calling the API', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    renderRoutes(appRoutes, '/login');
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findAllByText('This field is required.')).toHaveLength(2);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/users/login'), expect.anything());
  });

  it('returns to the requested page after signing in', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(appRoutes, '/login?next=%2Fapp%2Fscans%2F3');
    await user.type(await screen.findByLabelText('Email'), 'patient@example.com');
    await user.type(screen.getByLabelText('Password'), 'right-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Repeat the ECG.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/app/scans/3');
  });

  it('requires a PMDC number for doctors and sends them to the doctor area', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(appRoutes, '/register');
    await user.type(await screen.findByLabelText('Full name'), 'Ayesha Khan');
    await user.type(screen.getByLabelText('Email'), 'ayesha@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('radio', { name: /Doctor/ }));
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Doctors must enter a PMDC number.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('PMDC registration number'), '12345-P');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('doctor home')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/doctor');
  });
});
