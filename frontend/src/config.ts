// Production backend, used when VITE_API_URL is not set (e.g. before the Vercel env var is renamed).
const DEFAULT_API_URL = 'https://medcare-backend-338080619950.us-central1.run.app/api/v1';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
