import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { renderRoutes, signInAs } from '@/test/render';
import { routes } from './routes';

/** A route's chunks are compiled on first use in the test runner, which can take longer than the default second. */
const firstLoad = { timeout: 5000 };

describe('landing page', () => {
  it('states what the app does, with the disclaimer, sign-up and first aid links', async () => {
    renderRoutes(routes, '/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Understand your scans and medical reports, in English and Urdu' }, firstLoad),
    ).toBeInTheDocument();
    const disclaimer = screen.getByRole('complementary', { name: 'Medical disclaimer' });
    expect(disclaimer).toHaveTextContent('AI output is informational, not a diagnosis.');
    expect(within(disclaimer).getByRole('link', { name: '1122' })).toHaveAttribute('href', 'tel:1122');
    expect(screen.getAllByRole('link', { name: /Create an account/ })[0]).toHaveAttribute('href', '/register');
    expect(screen.getAllByRole('link', { name: 'Open the first aid guide' })[0]).toHaveAttribute('href', '/emergency');
    expect(document.title).toBe('Informational AI reports in English and Urdu · MedCare AI');
  });

  it('makes none of the unconfirmed claims of the old page', async () => {
    renderRoutes(routes, '/');
    await screen.findByRole('heading', { level: 1 }, firstLoad);
    const text = document.body.textContent ?? '';
    for (const claim of [/10,000/, /accura/i, /\bfree\b/i, /LLaVA/i, /Nature Medicine/i, /first medical AI/i, /certified/i, /★/, /as seen in/i]) {
      expect(text).not.toMatch(claim);
    }
  });

  it('answers questions in native disclosure widgets and links to the privacy notice', async () => {
    renderRoutes(routes, '/');
    await screen.findByRole('heading', { level: 2, name: 'Questions' }, firstLoad);
    expect(document.querySelectorAll('details')).toHaveLength(6);
    expect(screen.getByRole('link', { name: 'privacy notice' })).toHaveAttribute('href', '/privacy');
    const footer = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(footer).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/emergency',
      '/about',
      '/privacy',
      '/terms',
    ]);
  });

  it('sends signed-in users to their own home', async () => {
    signInAs('doctor');
    const { router } = renderRoutes(routes, '/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/doctor'));
  });
});

describe('legal drafts', () => {
  it('discloses where images go and who can see reports, with the missing details highlighted', async () => {
    renderRoutes(routes, '/privacy');
    expect(await screen.findByRole('heading', { level: 1, name: 'Privacy notice' }, firstLoad)).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Draft for review');
    expect(screen.getByText(/Your image is sent to Google's Gemini API/)).toBeInTheDocument();
    expect(screen.getByText(/Every doctor account on MedCare AI can see every patient's saved reports/)).toBeInTheDocument();
    expect(screen.getByText(/the PMDC number they enter isn't checked yet/)).toBeInTheDocument();
    const placeholders = [...document.querySelectorAll('mark')].map((mark) => mark.textContent);
    expect(placeholders).toContain('To be confirmed: a contact email address');
    expect(placeholders).toContain('To be confirmed: whether production uses the free tier or a paid tier');
    expect(screen.getByRole('link', { name: /Gemini API/ })).toHaveAttribute('href', 'https://ai.google.dev/gemini-api/terms');
  });

  it('renders About and Terms, and the Urdu privacy notice', async () => {
    const about = renderRoutes(routes, '/about');
    expect(await screen.findByRole('heading', { level: 1, name: 'About MedCare AI' }, firstLoad)).toBeInTheDocument();
    about.unmount();
    const terms = renderRoutes(routes, '/terms');
    expect(await screen.findByRole('heading', { level: 1, name: 'Terms of use' }, firstLoad)).toBeInTheDocument();
    terms.unmount();
    await i18n.changeLanguage('ur');
    renderRoutes(routes, '/privacy');
    expect(await screen.findByRole('heading', { level: 1, name: 'رازداری کا نوٹس' }, firstLoad)).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  });
});

describe('unknown URLs', () => {
  it('show a 404 inside the public layout, keeping the emergency numbers', async () => {
    renderRoutes(routes, '/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' }, firstLoad)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Call 1122' })[0]).toHaveAttribute('href', 'tel:1122');
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });
});
