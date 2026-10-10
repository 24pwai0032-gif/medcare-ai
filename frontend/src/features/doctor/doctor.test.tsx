import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataProvider } from '@/app/AppDataProvider';
import type { Scan } from '@/services/types';
import { renderRoutes, signInAs } from '@/test/render';
import AllScansPage from './AllScansPage';
import ReviewPage from './ReviewPage';
import ReviewQueuePage from './ReviewQueuePage';

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

const SCANS: Scan[] = [
  { id: 10, scan_type: 'xray', status: 'pending', severity: 'Normal', report: '**SEVERITY**: Normal', created_at: '2026-10-08 09:00:00.000000', patient_name: 'Bilal Ahmed', patient_email: 'bilal@example.com' },
  { id: 11, scan_type: 'ecg', status: 'pending', severity: 'Severe', report: '**SEVERITY**: Severe', created_at: '2026-10-09 09:00:00.000000', patient_name: 'Sana Iqbal', patient_email: 'sana@example.com' },
  { id: 12, scan_type: 'blood-test', status: 'approved', severity: 'Mild', report: '**SEVERITY**: Mild', doctor_notes: 'Fine.', created_at: '2026-10-01 09:00:00.000000', patient_name: 'Bilal Ahmed', patient_email: 'bilal@example.com' },
];

let calls: Array<{ url: string; init?: RequestInit }> = [];

beforeEach(() => {
  calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.endsWith('/doctor/pending-scans')) return json(200, SCANS.filter((s) => s.status === 'pending'));
      if (url.endsWith('/doctor/all-scans')) return json(200, SCANS);
      if (url.includes('/doctor/approve-scan/') || url.includes('/doctor/reject-scan/')) return json(200, { message: 'ok' });
      if (url.endsWith('/users/me')) return json(200, { id: 2, full_name: 'Dr Ayesha Khan', email: 'doctor@example.com', role: 'doctor' });
      return json(404, {});
    }),
  );
  signInAs('doctor');
});

const routes = [
  { path: '/doctor', element: <AppDataProvider><ReviewQueuePage /></AppDataProvider> },
  { path: '/doctor/scans', element: <AppDataProvider><AllScansPage /></AppDataProvider> },
  { path: '/doctor/scans/:id', element: <AppDataProvider><ReviewPage /></AppDataProvider> },
];

const names = () => screen.getAllByRole('listitem').map((li) => (li.textContent?.includes('Sana') ? 'Sana' : 'Bilal'));

describe('review queue', () => {
  it('lists pending reports oldest first, with patient names', async () => {
    renderRoutes(routes, '/doctor');
    await screen.findByText('2 reports waiting');
    expect(names()).toEqual(['Bilal', 'Sana']);
  });

  it('can sort by severity', async () => {
    const user = userEvent.setup();
    renderRoutes(routes, '/doctor');
    await user.selectOptions(await screen.findByLabelText('Sort'), 'severity');
    expect(names()).toEqual(['Sana', 'Bilal']);
  });
});

describe('all scans', () => {
  it('filters by patient and status through the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routes, '/doctor/scans');
    expect(await screen.findByText('3 scans')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Patient name or email'), 'sana');
    expect(screen.getByText('1 scan')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Patient name or email'));
    await user.selectOptions(screen.getByLabelText('Review status'), 'approved');
    expect(screen.getByText('1 scan')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?status=approved');
  });
});

describe('review', () => {
  it('requires notes to flag a report', async () => {
    const user = userEvent.setup();
    renderRoutes(routes, '/doctor/scans/11');
    await user.click(await screen.findByRole('button', { name: 'Flag for attention' }));
    expect(await screen.findByText('Add notes so the patient knows what to do next.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('approves with notes after confirmation and returns to the queue', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routes, '/doctor/scans/10');
    await user.type(await screen.findByLabelText('Notes for the patient'), 'No acute findings.');
    await user.click(screen.getByRole('button', { name: 'Approve report' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Approve this report?' });
    await user.click(dialog.querySelector('button:last-of-type')!);
    await waitFor(() => expect(router.state.location.pathname).toBe('/doctor'));
    const put = calls.find((c) => c.url.includes('/approve-scan/10'));
    expect(put?.init?.method).toBe('PUT');
    expect(JSON.parse(String(put?.init?.body))).toEqual({ doctor_notes: 'No acute findings.' });
  });

  it('shows reviewed scans read-only with the notes', async () => {
    renderRoutes(routes, '/doctor/scans/12?from=all');
    expect(await screen.findByText('This report has already been reviewed.')).toBeInTheDocument();
    expect(screen.getByText('Fine.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve report' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to all scans' })).toHaveAttribute('href', '/doctor/scans');
  });
});
