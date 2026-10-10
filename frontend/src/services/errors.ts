/**
 * Every failure is reduced to one of these codes; the UI shows `t('errors.<code>')`.
 * The backend's own `detail` strings are Roman Urdu and are never shown to users.
 */
export type ApiErrorCode =
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'invalidCredentials'
  | 'emailTaken'
  | 'pmdcRequired'
  | 'invalidInput'
  | 'sessionExpired'
  | 'forbidden'
  | 'notFound'
  | 'rateLimited'
  | 'server'
  | 'invalidFile'
  | 'emptyFile'
  | 'fileTooLarge'
  | 'aiUnavailable'
  | 'unknown';

export type ApiContext = 'login' | 'register' | 'analyze' | 'default';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly detail?: unknown;

  constructor(code: ApiErrorCode, status = 0, detail?: unknown) {
    super(`ApiError: ${code}`);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

const detailText = (detail: unknown) => (typeof detail === 'string' ? detail.toLowerCase() : '');

export function errorCodeFor(context: ApiContext, status: number, detail: unknown): ApiErrorCode {
  const text = detailText(detail);

  if (context === 'login' && (status === 401 || status === 404)) return 'invalidCredentials';
  if (context === 'register' && status === 400) return text.includes('pmdc') ? 'pmdcRequired' : 'emailTaken';
  if (context === 'analyze') {
    if (status === 400) return text.includes('empty') ? 'emptyFile' : 'invalidFile';
    if (status === 413 || text.includes('too large')) return 'fileTooLarge';
    if (status === 502 || status === 503) return 'aiUnavailable';
    if (status === 504) return 'timeout';
  }

  if (status === 401) return 'sessionExpired';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 422) return 'invalidInput';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError('unknown', 0, error);
}

export const errorKey = (error: unknown) => `errors.${toApiError(error).code}` as const;

/** Client errors (other than timeouts and rate limits) won't succeed on retry. */
export function isRetryable(error: unknown): boolean {
  const { code } = toApiError(error);
  return code === 'network' || code === 'timeout' || code === 'server' || code === 'rateLimited';
}
