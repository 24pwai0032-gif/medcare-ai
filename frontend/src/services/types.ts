// Shapes returned by the FastAPI backend (see backend/schemas.py and backend/routers/*.py).

export type Role = 'patient' | 'doctor';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  full_name: string;
  email: string;
  password: string;
  role: Role;
  pmdc?: string;
}

/** "rejected" is what the API calls a scan a doctor has flagged. */
export type ScanStatus = 'pending' | 'approved' | 'rejected';

export interface Scan {
  id: number;
  user_id?: number | null;
  scan_type: string;
  filename?: string | null;
  report?: string | null;
  severity?: string | null;
  confidence?: number | null;
  time_seconds?: number | null;
  status: string;
  doctor_notes?: string | null;
  created_at: string;
  /** Only on the doctor endpoints. */
  patient_name?: string;
  patient_email?: string;
}

export type AnalyzeEndpoint = 'xray' | 'bone' | 'ecg' | 'blood-test' | 'prescription';

export interface AnalyzeResponse {
  success?: boolean;
  scan_type?: string;
  scan_id?: number | null;
  scan_saved?: boolean;
  filename?: string | null;
  report: string;
  urdu_report?: string | null;
  severity?: string | null;
  confidence?: number | null;
  time?: number | null;
  time_seconds?: number | null;
}

export interface ReviewResponse {
  message?: string;
  scan_id?: number;
}
