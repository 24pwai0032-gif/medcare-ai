// src/services/api.ts

// ── Types ────────────────────────────────

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'patient' | 'doctor';
  created_at: string;
}

export interface Scan {
  id: number;
  user_id: number;
  scan_type: string;
  filename: string;
  report: string;
  severity: string;
  confidence: number;
  time_seconds: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  pmdc?: string;
}

export interface ScanResult {
  report: string;
  urdu_report?: string;
  severity: string;
  confidence: number;
  time: number;
}

// Auth/users + Image analysis → GCP Backend
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Fetch with 10s timeout so UI never hangs forever
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Is the server running?');
    throw err;
  } finally {
    clearTimeout(id);
  }
};

// ── Token Management ──────────────────────

export const saveToken = (token: string) => {
  localStorage.setItem('medcare_token', token);
};

export const getToken = () => {
  return localStorage.getItem('medcare_token');
};

export const removeToken = () => {
  localStorage.removeItem('medcare_token');
};

export const saveUser = (user: any) => {
  localStorage.setItem('medcare_user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('medcare_user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('medcare_user');
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  removeUser();
};

// ── Auth API ──────────────────────────────

export const registerUser = async (data: RegisterData) => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.status === 400) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Registration failed!');
    }
    if (!res.ok)
      throw new Error('Registration failed!');
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError')
      throw new Error('Request timed out. Is the server running?');
    throw err;
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.status === 401)
      throw new Error('Galat email ya password!');
    if (res.status === 404)
      throw new Error('Account nahi mila!');
    if (!res.ok)
      throw new Error('Login failed. Dobara try karo!');
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError')
      throw new Error('Server respond nahi kar raha!');
    throw err;
  }
};

export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to get profile');
  return res.json();
};

// ── Scan API (GCP Backend → Colab) ───────

export const analyzeScan = async (
  scanType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout(
    `${BASE_URL}/analyze/${scanType}`,  // GCP backend → forwards to Colab
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    },
    120000  // 120s timeout — model inference takes time
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis failed');
  }

  return res.json();
};

export const getMyScans = async () => {
  const res = await fetch(`${BASE_URL}/users/scans`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error('Failed to get scans');
  return res.json();
};

// ── Doctor API ────────────────────────────

export const getPendingScans = async () => {
  const res = await fetch(`${BASE_URL}/users/doctor/pending-scans`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

export const approveScan = async (scanId: number, notes?: string) => {
  const res = await fetch(
    `${BASE_URL}/users/doctor/approve-scan/${scanId}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: notes ? JSON.stringify({ notes }) : undefined
    }
  );
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

export const rejectScan = async (scanId: number, notes?: string) => {
  const res = await fetch(
    `${BASE_URL}/users/doctor/reject-scan/${scanId}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: notes ? JSON.stringify({ notes }) : undefined
    }
  );
  if (!res.ok) throw new Error('Failed');
  return res.json();
};