// Production backend (Render), used when VITE_API_URL is not set at build time.
const DEFAULT_API_URL = 'https://medcare-backend-1dqd.onrender.com/api/v1';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
