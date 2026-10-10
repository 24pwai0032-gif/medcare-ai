import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import EmergencyDetailPage from '@/features/emergency/EmergencyDetailPage';
import EmergencyListPage from '@/features/emergency/EmergencyListPage';
import i18n from '@/i18n';
import { renderRoutes, renderWithProviders, signInAs } from '@/test/render';
import MentalHealthPage from './MentalHealthPage';
import { bandFor, scorePhq9, showAdvice } from './phq9';
import SymptomGuidePage from './SymptomGuidePage';
import VitalSignsPage from './VitalSignsPage';
import { overallStatus, parseReading, VITALS, vitalStatus } from './vitals';

describe('PHQ-9 scoring', () => {
  it('uses the standard bands', () => {
    expect([0, 4, 5, 9, 10, 14, 15, 19, 20, 27].map(bandFor)).toEqual([
      'minimal', 'minimal', 'mild', 'mild', 'moderate', 'moderate', 'moderatelySevere', 'moderatelySevere', 'severe', 'severe',
    ]);
  });

  it('flags item 9 above zero as a crisis, whatever the total', () => {
    const result = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(result).toMatchObject({ total: 1, band: 'minimal', crisis: true, complete: true });
    expect(scorePhq9([3, 3, 3, 3, 3, 3, 3, 3, 0]).crisis).toBe(false);
  });

  it('never shows reassuring advice next to a positive item 9', () => {
    expect(showAdvice('minimal', true)).toBe(false);
    expect(showAdvice('mild', true)).toBe(false);
    expect(showAdvice('moderate', true)).toBe(true);
    expect(showAdvice('minimal', false)).toBe(true);
  });
});

describe('MentalHealthPage', () => {
  async function answerAll(user: ReturnType<typeof userEvent.setup>, item9: string) {
    const groups = await screen.findAllByRole('radiogroup');
    expect(groups).toHaveLength(9);
    for (const group of groups.slice(0, 8)) await user.click(within(group).getByRole('radio', { name: 'Not at all' }));
    await user.click(within(groups[8]).getByRole('radio', { name: item9 }));
  }

  it('shows the crisis panel as soon as item 9 is answered above zero, even with a total of 1', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<MentalHealthPage />);
    await answerAll(user, 'Several days');
    const panel = screen.getByRole('alert');
    expect(panel).toHaveTextContent('You mentioned thoughts of harming yourself');
    expect(within(panel).getByRole('link', { name: /0311 7786264/ })).toHaveAttribute('href', 'tel:+923117786264');
    expect(within(panel).getByRole('link', { name: /1166/ })).toHaveAttribute('href', 'tel:1166');
    expect(within(panel).getByRole('link', { name: /Call 1122/ })).toHaveAttribute('href', 'tel:1122');

    await user.click(screen.getByRole('button', { name: 'See my results' }));
    expect(await screen.findByText('Score: 1 out of 27')).toBeInTheDocument();
    expect(screen.getByText(/Minimal/)).toBeInTheDocument();
    expect(screen.queryByText(/appears to be in a good state/)).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('You mentioned thoughts of harming yourself');
  });

  it('shows the band advice without a crisis panel when item 9 is zero', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<MentalHealthPage />);
    await answerAll(user, 'Not at all');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'See my results' }));
    expect(await screen.findByText(/appears to be in a good state/)).toBeInTheDocument();
  });

  it('asks for every answer before showing results', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<MentalHealthPage />);
    await user.click(await screen.findByRole('button', { name: 'See my results' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Answer all 9 questions');
  });
});

describe('SymptomGuidePage', () => {
  it('puts urgent symptoms first with emergency call buttons', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<SymptomGuidePage />);
    await user.click(await screen.findByRole('checkbox', { name: 'Headache' }));
    await user.click(screen.getByRole('checkbox', { name: 'Chest pain' }));
    await user.click(screen.getByRole('button', { name: 'Show information' }));
    expect(screen.getByRole('alert')).toHaveTextContent('can need urgent care');
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Chest pain', 'Headache']);
    expect(screen.getByText(/SEEK IMMEDIATE MEDICAL ATTENTION/)).toBeInTheDocument();
  });

  it('asks for at least one symptom', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<SymptomGuidePage />);
    await user.click(await screen.findByRole('button', { name: 'Show information' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one symptom.');
  });
});

describe('vital signs', () => {
  it('keeps the original thresholds', () => {
    const systolic = VITALS.find((v) => v.id === 'systolic')!;
    expect(vitalStatus(systolic, 118)).toBe('normal');
    expect(vitalStatus(systolic, 135)).toBe('warning');
    expect(vitalStatus(systolic, 141)).toBe('critical');
    expect(overallStatus(['normal', 'warning'])).toBe('warning');
    expect(parseReading('98,6')).toBe(98.6);
    expect(parseReading('abc')).toBeNull();
  });

  it('shows call buttons for a critical reading and catches a °C value in the °F field', async () => {
    signInAs('patient');
    const user = userEvent.setup();
    renderWithProviders(<VitalSignsPage />);
    await user.type(await screen.findByLabelText(/^Temperature/), '37');
    await user.click(screen.getByRole('button', { name: 'Check readings' }));
    expect(screen.getByText('Enter a number between 80 and 115.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/^Temperature/));
    await user.type(screen.getByLabelText(/^Blood oxygen/), '85');
    await user.click(screen.getByRole('button', { name: 'Check readings' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Get medical help immediately!');
    expect(screen.getByRole('link', { name: /Call 115/ })).toHaveAttribute('href', 'tel:115');
  });
});

describe('emergency first aid (public)', () => {
  const routes = [
    { path: '/emergency', element: <EmergencyListPage /> },
    { path: '/emergency/:slug', element: <EmergencyDetailPage /> },
  ];

  it('works signed out and lists six emergencies', async () => {
    renderRoutes(routes, '/emergency');
    expect(await screen.findByRole('heading', { level: 1, name: 'Emergency first aid' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Choose the emergency' })).getAllByRole('link')).toHaveLength(6);
  });

  it('shows the same number of steps in English and Urdu', async () => {
    const { unmount } = renderRoutes(routes, '/emergency/heart-attack');
    const english = within(await screen.findByRole('region', { name: 'Step-by-step first aid' })).getAllByRole('listitem');
    expect(english).toHaveLength(6);
    expect(english[5]).toHaveTextContent('Do NOT leave the person alone');
    unmount();
    await i18n.changeLanguage('ur');
    renderRoutes(routes, '/emergency/heart-attack');
    const urdu = within(await screen.findByRole('region', { name: 'قدم بہ قدم ابتدائی طبی امداد' })).getAllByRole('listitem');
    expect(urdu).toHaveLength(6);
    expect(urdu[5]).toHaveTextContent('مریض کو اکیلا مت چھوڑیں');
  });
});
