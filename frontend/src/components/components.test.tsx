import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { Disclaimer } from './Disclaimer';
import { LanguageToggle, ThemeToggle } from './layout/toggles';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

describe('badges', () => {
  it('pairs every severity colour with an icon and a word', async () => {
    renderWithProviders(<SeverityBadge level="moderate" />);
    const badge = (await screen.findByText(/Moderate/)).closest('span')!;
    expect(badge).toHaveTextContent('Severity: Moderate');
    expect(badge.querySelector('svg')).not.toBeNull();
  });

  it('labels a missing severity instead of guessing', async () => {
    renderWithProviders(<SeverityBadge level={null} />);
    expect(await screen.findByText(/Not stated/)).toBeInTheDocument();
  });

  it('shows the API status "rejected" as Flagged', async () => {
    renderWithProviders(<StatusBadge status="rejected" />);
    expect(await screen.findByText(/Flagged/)).toBeInTheDocument();
  });
});

describe('Disclaimer', () => {
  it('states all three required points with tappable emergency numbers', async () => {
    renderWithProviders(<Disclaimer />);
    expect(await screen.findByText('AI output is informational, not a diagnosis.')).toBeInTheDocument();
    expect(screen.getByText(/A doctor must review it/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1122' })).toHaveAttribute('href', 'tel:1122');
    expect(screen.getByRole('link', { name: '115' })).toHaveAttribute('href', 'tel:115');
  });
});

describe('toggles', () => {
  it('switches the document to Urdu, right to left, and back', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageToggle />);
    await user.click(await screen.findByRole('button', { name: /Change language/ }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('dir', 'rtl'));
    expect(document.documentElement).toHaveAttribute('lang', 'ur');
    expect(localStorage.getItem('medcare_lang')).toBe('ur');
    await user.click(await screen.findByRole('button', { name: /زبان تبدیل کریں/ }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('dir', 'ltr'));
  });

  it('switches to the dark theme and remembers it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);
    await user.click(await screen.findByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('medcare_theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });
});
