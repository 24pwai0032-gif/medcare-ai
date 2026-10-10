import { screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderRoutes, signInAs } from '@/test/render';
import { destinationAfterLogin, homeFor, safeNext } from './redirects';
import { RequireRole } from './RequireRole';

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

const routes = [
  { path: '/', element: <Where /> },
  { path: '/login', element: <Where /> },
  { path: '/app', element: <Where /> },
  {
    path: '/doctor',
    element: (
      <RequireRole role="doctor">
        <p>doctor area</p>
      </RequireRole>
    ),
  },
];

describe('redirect helpers', () => {
  it('only accepts same-origin relative paths', () => {
    expect(safeNext('/app/scans/3')).toBe('/app/scans/3');
    expect(safeNext('https://evil.example')).toBeNull();
    expect(safeNext('//evil.example')).toBeNull();
    expect(safeNext('/\\evil.example')).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it('keeps each role in its own area after login', () => {
    expect(homeFor('doctor')).toBe('/doctor');
    expect(destinationAfterLogin('patient', '/app/scans/4')).toBe('/app/scans/4');
    expect(destinationAfterLogin('patient', '/doctor/scans/4')).toBe('/app');
    expect(destinationAfterLogin('doctor', null)).toBe('/doctor');
    expect(destinationAfterLogin('doctor', '/emergency')).toBe('/emergency');
  });
});

describe('RequireRole', () => {
  it('sends signed-out visitors to login with a return path', async () => {
    renderRoutes(routes, '/doctor?tab=queue');
    expect(await screen.findByTestId('where')).toHaveTextContent('/login?next=%2Fdoctor%3Ftab%3Dqueue');
  });

  it('sends the wrong role to its own home', async () => {
    signInAs('patient');
    renderRoutes(routes, '/doctor');
    expect(await screen.findByTestId('where')).toHaveTextContent('/app');
  });

  it('renders the page for the right role', async () => {
    signInAs('doctor');
    renderRoutes(routes, '/doctor');
    expect(await screen.findByText('doctor area')).toBeInTheDocument();
  });
});
