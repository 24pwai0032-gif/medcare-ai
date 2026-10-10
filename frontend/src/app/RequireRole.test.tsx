import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RequireRole } from './RequireRole';

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
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
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe('RequireRole', () => {
  it('sends signed-out visitors to login with a return path', () => {
    renderAt('/doctor?tab=queue');
    expect(screen.getByTestId('where')).toHaveTextContent('/login?next=%2Fdoctor%3Ftab%3Dqueue');
  });

  it('sends the wrong role to its own home', () => {
    localStorage.setItem('medcare_token', 'token');
    localStorage.setItem('medcare_user', JSON.stringify({ role: 'patient' }));
    renderAt('/doctor');
    expect(screen.getByTestId('where')).toHaveTextContent('/app');
  });

  it('renders the page for the right role', () => {
    localStorage.setItem('medcare_token', 'token');
    localStorage.setItem('medcare_user', JSON.stringify({ role: 'doctor' }));
    renderAt('/doctor');
    expect(screen.getByText('doctor area')).toBeInTheDocument();
  });
});
