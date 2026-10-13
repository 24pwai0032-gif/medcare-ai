import type { BrowserContext, Route } from '@playwright/test';

/**
 * The e2e build points at this made-up origin (see playwright.config.ts), so even a request
 * the mock forgot about can never reach the real backend.
 */
export const API_ORIGIN = 'http://api.medcare.test';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
};

type Role = 'patient' | 'doctor';
export interface MockUser {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  password: string;
  pmdc?: string;
}
export interface MockScan {
  id: number;
  user_id: number;
  scan_type: string;
  filename: string;
  report: string;
  severity: string;
  confidence: number;
  time_seconds: number;
  status: 'pending' | 'approved' | 'rejected';
  doctor_notes: string | null;
  created_at: string;
}

/** Shaped like a Gemini report: bold section headings, a SEVERITY line and the Urdu summary. */
export const sampleReport = (severity: string) =>
  [
    '**FINDINGS**: The lung fields are clear. No consolidation or effusion is seen.',
    '**IMPRESSION**: No acute abnormality on this image.',
    `**SEVERITY**: ${severity}`,
    '**CONFIDENCE**: 82%',
    '**RECOMMENDATIONS**: Discuss the result with your doctor.',
    '**اردو خلاصہ**: یہ نمونے کی رپورٹ کا اردو خلاصہ ہے۔ پھیپھڑے صاف نظر آتے ہیں۔',
  ].join('\n\n');

export const PATIENT: MockUser = { id: 1, full_name: 'Bilal Ahmed', email: 'bilal@example.com', role: 'patient', password: 'patient123' };
export const DOCTOR: MockUser = { id: 2, full_name: 'Ayesha Khan', email: 'ayesha@example.com', role: 'doctor', password: 'doctor123', pmdc: '12345-P' };
const OTHER_PATIENT: MockUser = { id: 3, full_name: 'Sana Iqbal', email: 'sana@example.com', role: 'patient', password: 'sana1234' };

const seedScans = (): MockScan[] => [
  { id: 41, user_id: 1, scan_type: 'xray', filename: 'chest.png', report: sampleReport('Moderate'), severity: 'Severe', confidence: 82, time_seconds: 9.1, status: 'pending', doctor_notes: null, created_at: '2026-10-09T08:15:00' },
  { id: 37, user_id: 1, scan_type: 'blood-test', filename: 'cbc.jpg', report: sampleReport('Mild'), severity: 'Mild', confidence: 82, time_seconds: 12.4, status: 'approved', doctor_notes: 'Mild anaemia. Eat iron-rich food and repeat the CBC in 3 months.', created_at: '2026-09-28T11:40:00' },
  { id: 30, user_id: 3, scan_type: 'ecg', filename: 'ecg.jpg', report: sampleReport('Severe'), severity: 'Severe', confidence: 82, time_seconds: 15.2, status: 'rejected', doctor_notes: 'The image is cropped. Please repeat the ECG and upload all 12 leads.', created_at: '2026-09-15T16:05:00' },
];

const publicUser = ({ password: _password, pmdc: _pmdc, ...user }: MockUser) => user;
/** The doctor endpoints use a space and microseconds; the patient endpoint uses ISO without a zone. */
const doctorTimestamp = (iso: string) => `${iso.replace('T', ' ')}.000000`;

/** An in-memory FastAPI stand-in, one per test, with the same paths and payloads as backend/routers. */
export class MockApi {
  users: MockUser[] = [PATIENT, DOCTOR, OTHER_PATIENT].map((u) => ({ ...u }));
  scans: MockScan[] = seedScans();
  /** "METHOD /path" of every API call, for assertions. */
  calls: string[] = [];
  /** Calls the mock doesn't implement; the fixture fails the test if any happen. */
  unexpected: string[] = [];

  async attach(context: BrowserContext) {
    await context.route((url) => url.origin === API_ORIGIN, (route) => this.handle(route));
    // Nothing else may leave the machine: no fonts, analytics or real APIs.
    await context.route(
      (url) => url.origin !== API_ORIGIN && url.hostname !== 'localhost' && url.protocol.startsWith('http'),
      (route) => route.abort('blockedbyclient'),
    );
  }

  private userFor(authorization: string | undefined) {
    const id = Number(/^Bearer token-(\d+)$/.exec(authorization ?? '')?.[1]);
    return this.users.find((u) => u.id === id);
  }

  private async handle(route: Route) {
    const request = route.request();
    const method = request.method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    this.calls.push(`${method} ${path}`);
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });

    if (method === 'GET' && url.pathname === '/') return json(200, { status: 'running' });

    if (method === 'POST' && path === '/users/login') {
      const { email, password } = request.postDataJSON() as { email: string; password: string };
      const user = this.users.find((u) => u.email === email);
      if (!user) return json(401, { detail: 'Email registered nahi hai!' });
      if (user.password !== password) return json(401, { detail: 'Galat password! Dobara try karo.' });
      return json(200, { access_token: `token-${user.id}`, token_type: 'bearer', user: publicUser(user) });
    }

    if (method === 'POST' && path === '/users/register') {
      const body = request.postDataJSON() as Omit<MockUser, 'id'>;
      if (this.users.some((u) => u.email === body.email)) return json(400, { detail: 'Yeh email pehle se registered hai! Login karo.' });
      if (body.role === 'doctor' && !body.pmdc) return json(400, { detail: 'Doctor ke liye PMDC number zaroori hai!' });
      const user: MockUser = { ...body, id: Math.max(...this.users.map((u) => u.id)) + 1 };
      this.users.push(user);
      return json(200, { access_token: `token-${user.id}`, token_type: 'bearer', user: publicUser(user) });
    }

    const user = this.userFor(request.headers().authorization);
    if (!user) return json(401, { detail: 'Invalid or expired token' });

    if (method === 'GET' && path === '/users/me') return json(200, publicUser(user));
    if (method === 'GET' && path === '/users/scans') return json(200, this.scans.filter((s) => s.user_id === user.id));

    const analyze = /^\/analyze\/([a-z-]+)$/.exec(path);
    if (method === 'POST' && analyze) {
      const scan: MockScan = {
        id: Math.max(...this.scans.map((s) => s.id)) + 1,
        user_id: user.id,
        scan_type: analyze[1],
        filename: 'upload.png',
        report: sampleReport('Mild'),
        severity: 'Mild',
        confidence: 82,
        time_seconds: 4.2,
        status: 'pending',
        doctor_notes: null,
        created_at: new Date().toISOString().slice(0, 19),
      };
      this.scans.push(scan);
      return json(200, {
        success: true,
        scan_type: scan.scan_type,
        scan_id: scan.id,
        scan_saved: true,
        filename: scan.filename,
        report: scan.report,
        urdu_report: '',
        severity: scan.severity,
        confidence: scan.confidence,
        time: scan.time_seconds,
        time_seconds: scan.time_seconds,
      });
    }

    if (path.startsWith('/users/doctor/')) {
      if (user.role !== 'doctor') return json(403, { detail: 'Doctors only' });
      const withPatient = (scan: MockScan) => {
        const patient = this.users.find((u) => u.id === scan.user_id);
        return { ...scan, created_at: doctorTimestamp(scan.created_at), patient_name: patient?.full_name, patient_email: patient?.email };
      };
      if (method === 'GET' && path === '/users/doctor/pending-scans') {
        return json(200, this.scans.filter((s) => s.status === 'pending').map(withPatient));
      }
      if (method === 'GET' && path === '/users/doctor/all-scans') return json(200, this.scans.map(withPatient));
      const review = /^\/users\/doctor\/(approve|reject)-scan\/(\d+)$/.exec(path);
      if (method === 'PUT' && review) {
        const scan = this.scans.find((s) => s.id === Number(review[2]));
        if (!scan) return json(404, { detail: 'Scan not found' });
        scan.status = review[1] === 'approve' ? 'approved' : 'rejected';
        scan.doctor_notes = (request.postDataJSON() as { doctor_notes: string }).doctor_notes;
        return json(200, { message: review[1] === 'approve' ? 'Scan approved ✅' : 'Scan rejected ❌', scan_id: scan.id });
      }
    }

    this.unexpected.push(`${method} ${path}`);
    return json(404, { detail: 'Not Found' });
  }
}
