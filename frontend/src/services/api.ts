import { API_BASE_URL } from '@/config';
import { ApiError, errorCodeFor, type ApiContext } from './errors';
import { sessionStore } from './session';
import type {
  AnalyzeEndpoint,
  AnalyzeResponse,
  AuthResponse,
  LoginBody,
  RegisterBody,
  ReviewResponse,
  Scan,
  User,
} from './types';

/** Long enough for a sleeping free-tier backend (Render) to wake up, which can take about a minute. */
const DEFAULT_TIMEOUT_MS = 75_000;
/** The backend can retry Gemini three times at 60 s each, on top of a Cloud Run cold start. */
export const ANALYZE_TIMEOUT_MS = 180_000;

let unauthorizedHandler: (() => void) | null = null;

/** AuthProvider registers this; any 401 on an authenticated call ends the session. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  auth?: boolean;
  context?: ApiContext;
  timeoutMs?: number;
  signal?: AbortSignal;
}

async function readDetail(res: Response): Promise<unknown> {
  try {
    const data: unknown = await res.json();
    return data && typeof data === 'object' && 'detail' in data ? (data as { detail: unknown }).detail : data;
  } catch {
    return undefined;
  }
}

function fail(context: ApiContext, status: number, detail: unknown, authenticated: boolean): never {
  if (status === 401 && authenticated && context !== 'login') unauthorizedHandler?.();
  throw new ApiError(errorCodeFor(context, status, detail), status, detail);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, context = 'default', timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? sessionStore.getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) throw new ApiError('timeout');
    if (signal?.aborted) throw new ApiError('aborted');
    throw new ApiError('network', 0, error);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }

  if (!res.ok) fail(context, res.status, await readDetail(res), auth);
  if (res.status === 204) return undefined as T;
  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new ApiError('server', res.status, error);
  }
}

/** GET /users/scans may return an array or `{ scans: [...] }`. */
export function normalizeScans(data: unknown): Scan[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { scans?: unknown }).scans)
      ? (data as { scans: unknown[] }).scans
      : [];
  return list.filter((s): s is Scan => !!s && typeof s === 'object' && typeof (s as Scan).id === 'number');
}

export const api = {
  login: (body: LoginBody) =>
    request<AuthResponse>('/users/login', { method: 'POST', body, auth: false, context: 'login' }),
  register: (body: RegisterBody) =>
    request<AuthResponse>('/users/register', { method: 'POST', body, auth: false, context: 'register' }),
  me: () => request<User>('/users/me'),
  myScans: async () => normalizeScans(await request<unknown>('/users/scans')),
  pendingScans: async () => normalizeScans(await request<unknown>('/users/doctor/pending-scans')),
  allScans: async () => normalizeScans(await request<unknown>('/users/doctor/all-scans')),
  approveScan: (id: number, doctorNotes: string) =>
    request<ReviewResponse>(`/users/doctor/approve-scan/${id}`, { method: 'PUT', body: { doctor_notes: doctorNotes } }),
  rejectScan: (id: number, doctorNotes: string) =>
    request<ReviewResponse>(`/users/doctor/reject-scan/${id}`, { method: 'PUT', body: { doctor_notes: doctorNotes } }),
};

export interface UploadOptions {
  /** 0..1 while the file is being sent. */
  onUploadProgress?: (fraction: number) => void;
  /** The file has fully reached the server; the AI is now working. */
  onUploaded?: () => void;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Multipart upload through XHR, because fetch can't report upload progress. */
export function uploadForAnalysis(endpoint: AnalyzeEndpoint, file: File, options: UploadOptions = {}) {
  const { onUploadProgress, onUploaded, signal, timeoutMs = ANALYZE_TIMEOUT_MS } = options;
  return new Promise<AnalyzeResponse>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError('aborted'));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/analyze/${endpoint}`);
    xhr.timeout = timeoutMs;
    xhr.setRequestHeader('Accept', 'application/json');
    const token = sessionStore.getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onUploadProgress?.(event.loaded / event.total);
    };
    xhr.upload.onload = () => {
      onUploadProgress?.(1);
      onUploaded?.();
    };
    xhr.onload = () => {
      let data: unknown;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        data = undefined;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data && typeof data === 'object') {
        resolve(data as AnalyzeResponse);
        return;
      }
      const detail = data && typeof data === 'object' && 'detail' in data ? (data as { detail: unknown }).detail : data;
      if (xhr.status === 401) unauthorizedHandler?.();
      reject(new ApiError(errorCodeFor('analyze', xhr.status, detail), xhr.status, detail));
    };
    xhr.onerror = () => reject(new ApiError('network'));
    xhr.ontimeout = () => reject(new ApiError('timeout'));
    xhr.onabort = () => reject(new ApiError('aborted'));
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });

    const form = new FormData();
    form.append('file', file, file.name);
    xhr.send(form);
  });
}

let warmUpSent = false;

/** Wakes a sleeping Cloud Run instance. GET / is cheap; /health calls Gemini, so it isn't used. */
export function warmUpBackend() {
  if (warmUpSent) return;
  warmUpSent = true;
  const origin = new URL(API_BASE_URL).origin;
  fetch(`${origin}/`, { cache: 'no-store' }).catch(() => {
    warmUpSent = false;
  });
}
