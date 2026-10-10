import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, signInAs } from '@/test/render';
import { toPdfText } from './pdf';
import { reportFromScan } from './reportData';
import { ReportView } from './ReportView';

const scan = {
  id: 9,
  scan_type: 'blood-test',
  status: 'rejected',
  severity: 'Mild',
  report: '**IMPRESSION**: Low haemoglobin.\n\n**SEVERITY**: Moderate',
  doctor_notes: 'Repeat the CBC in two weeks.',
  created_at: '2026-10-01 08:30:00.000000',
  patient_name: 'Bilal Ahmed',
};

describe('ReportView', () => {
  it('shows a flagged report with the doctor notes and no invented confidence', async () => {
    signInAs('patient');
    renderWithProviders(<ReportView data={reportFromScan(scan)} audience="patient" />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Blood test report' })).toBeInTheDocument();
    expect(screen.getByText('Flagged by a doctor')).toBeInTheDocument();
    expect(screen.getByText('Repeat the CBC in two weeks.')).toBeInTheDocument();
    expect(screen.getByText('Model confidence: not stated in this report')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument();
  });

  it('tells the doctor when the stored severity disagrees with the report text', async () => {
    signInAs('doctor');
    renderWithProviders(<ReportView data={reportFromScan(scan)} audience="doctor" />);
    expect(await screen.findByText('The report text states Moderate; the stored severity is Mild.')).toBeInTheDocument();
    expect(screen.getByText(/Patient: Bilal Ahmed/)).toBeInTheDocument();
  });

  it('opens on the Urdu tab for Urdu users when a summary exists', async () => {
    signInAs('patient');
    const { default: i18n } = await import('@/i18n');
    await i18n.changeLanguage('ur');
    const withUrdu = { ...scan, report: `${scan.report}

**اردو خلاصہ**: خون کی کمی ہے۔` };
    renderWithProviders(<ReportView data={reportFromScan(withUrdu)} audience="patient" />);
    const summary = await screen.findByText('خون کی کمی ہے۔');
    expect(summary.closest('[lang="ur"]')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('tab', { name: 'اردو خلاصہ' })).toHaveAttribute('aria-selected', 'true');
  });

  it('explains a missing Urdu summary', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<ReportView data={reportFromScan(scan)} audience="patient" />);
    await user.click(await screen.findByRole('tab', { name: 'Urdu summary' }));
    expect(await screen.findByText('This report has no Urdu summary.')).toBeInTheDocument();
  });
});

describe('toPdfText', () => {
  it('maps typography the PDF fonts lack and drops unsupported characters', () => {
    expect(toPdfText('“Mild” – 5 ≥ 3 → ok…')).toBe('"Mild" - 5 >= 3 -> ok...');
    expect(toPdfText('Temp 38.5°C ± 0.2')).toBe('Temp 38.5°C ± 0.2');
    expect(toPdfText('Note ✓ اردو')).toBe('Note  ');
  });
});
