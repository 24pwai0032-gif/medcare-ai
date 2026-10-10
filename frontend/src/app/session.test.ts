import { describe, expect, it } from 'vitest';
import { currentUser, homeFor, safeNext } from './session';

describe('safeNext', () => {
  it('accepts same-origin relative paths', () => {
    expect(safeNext('/app/scans/3')).toBe('/app/scans/3');
    expect(safeNext('/doctor?status=pending')).toBe('/doctor?status=pending');
  });

  it('rejects absolute, protocol-relative and empty values', () => {
    expect(safeNext('https://evil.example')).toBeNull();
    expect(safeNext('//evil.example')).toBeNull();
    expect(safeNext('/\\evil.example')).toBeNull();
    expect(safeNext('')).toBeNull();
    expect(safeNext(null)).toBeNull();
  });
});

describe('session', () => {
  it('maps roles to their home routes', () => {
    expect(homeFor('patient')).toBe('/app');
    expect(homeFor('doctor')).toBe('/doctor');
  });

  it('returns null without a token, and the stored user with one', () => {
    expect(currentUser()).toBeNull();
    localStorage.setItem('medcare_token', 'token');
    localStorage.setItem('medcare_user', JSON.stringify({ id: 1, role: 'doctor', full_name: 'Ayesha' }));
    expect(currentUser()?.role).toBe('doctor');
  });

  it('ignores a stored user with an unknown role', () => {
    localStorage.setItem('medcare_token', 'token');
    localStorage.setItem('medcare_user', JSON.stringify({ role: 'admin' }));
    expect(currentUser()).toBeNull();
  });
});
