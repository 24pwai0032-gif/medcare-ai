import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, normalizeScans, setUnauthorizedHandler } from './api';
import { ApiError, errorCodeFor, isRetryable } from './errors';

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

afterEach(() => setUnauthorizedHandler(null));

describe('errorCodeFor', () => {
  it.each([
    ['login', 401, 'Galat password! Dobara try karo.', 'invalidCredentials'],
    ['login', 401, 'Email registered nahi hai!', 'invalidCredentials'],
    ['register', 400, 'Yeh email pehle se registered hai! Login karo.', 'emailTaken'],
    ['register', 400, 'Doctor ke liye PMDC number zaroori hai!', 'pmdcRequired'],
    ['register', 422, [{ msg: 'Value error' }], 'invalidInput'],
    ['analyze', 400, 'Invalid file type. Allowed: JPEG, PNG, WEBP, BMP', 'invalidFile'],
    ['analyze', 400, 'Empty file uploaded', 'emptyFile'],
    ['analyze', 503, 'Image too large (25 MB). Max: 20 MB.', 'fileTooLarge'],
    ['analyze', 502, 'AI model temporarily unavailable.', 'aiUnavailable'],
    ['default', 401, 'Invalid or expired token', 'sessionExpired'],
    ['default', 403, 'Doctors only', 'forbidden'],
    ['default', 404, 'Scan not found', 'notFound'],
    ['default', 500, null, 'server'],
  ] as const)('%s %i → %s', (context, status, detail, expected) => {
    expect(errorCodeFor(context, status, detail)).toBe(expected);
  });

  it('only retries transient failures', () => {
    expect(isRetryable(new ApiError('network'))).toBe(true);
    expect(isRetryable(new ApiError('server', 500))).toBe(true);
    expect(isRetryable(new ApiError('sessionExpired', 401))).toBe(false);
  });
});

describe('request', () => {
  it('reports a network failure as "network"', async () => {
    await expect(api.me()).rejects.toMatchObject({ code: 'network' });
  });

  it('ends the session on a 401 from an authenticated call', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal('fetch', vi.fn(() => json(401, { detail: 'Invalid or expired token' })));
    await expect(api.myScans()).rejects.toMatchObject({ code: 'sessionExpired', status: 401 });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not end the session when a login attempt fails', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal('fetch', vi.fn(() => json(401, { detail: 'Galat password!' })));
    await expect(api.login({ email: 'a@b.pk', password: 'x' })).rejects.toMatchObject({ code: 'invalidCredentials' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('sends the bearer token and JSON body for doctor actions', async () => {
    localStorage.setItem('medcare_token', 'abc');
    const fetchMock = vi.fn(() => json(200, { message: 'ok', scan_id: 7 }));
    vi.stubGlobal('fetch', fetchMock);
    await api.approveScan(7, 'Looks fine');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/users\/doctor\/approve-scan\/7$/);
    expect(init.method).toBe('PUT');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
    expect(JSON.parse(String(init.body))).toEqual({ doctor_notes: 'Looks fine' });
  });
});

describe('normalizeScans', () => {
  it('accepts an array or { scans }', () => {
    const scan = { id: 1, scan_type: 'xray', status: 'pending', created_at: '2026-10-10T09:00:00' };
    expect(normalizeScans([scan])).toHaveLength(1);
    expect(normalizeScans({ scans: [scan] })).toHaveLength(1);
    expect(normalizeScans(null)).toEqual([]);
    expect(normalizeScans([{ nope: true }])).toEqual([]);
  });
});
