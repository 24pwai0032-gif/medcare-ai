import React, { useState, useEffect } from 'react';
import { getAllScansDoctor, approveScan, rejectScan } from '../services/api';
import {
  LungsIcon, BoneIcon, HeartPulseIcon, TestTubeIcon, BrainIcon,
  StethoscopeIcon, PillIcon, ActivityIcon, SirenIcon,
  HomeIcon, ClipboardIcon, CheckCircleIcon, ClockIcon,
  AlertTriangleIcon, LogOutIcon, ModuleIcon, XIcon, RefreshIcon,
  ChevronRightIcon, LogoIcon, SparklesIcon, FilterIcon,
} from '../components/Icons';

interface DoctorDashboardProps { user: any; onLogout: () => void; }

const modules = [
  { icon: LungsIcon,       t: 'X-Ray',        route: 'xray',         c: '#2563EB', bg: 'rgba(37,99,235,.15)',  border: 'rgba(37,99,235,.3)' },
  { icon: BoneIcon,        t: 'Bone Scan',    route: 'bone',         c: '#7C3AED', bg: 'rgba(124,58,237,.15)', border: 'rgba(124,58,237,.3)' },
  { icon: HeartPulseIcon,  t: 'ECG',          route: 'ecg',          c: '#DC2626', bg: 'rgba(220,38,38,.15)',  border: 'rgba(220,38,38,.3)' },
  { icon: TestTubeIcon,    t: 'Blood Test',   route: 'blood',        c: '#059669', bg: 'rgba(5,150,105,.15)',  border: 'rgba(5,150,105,.3)' },
  { icon: BrainIcon,       t: 'Mental',       route: 'mental',       c: '#D97706', bg: 'rgba(217,119,6,.15)',  border: 'rgba(217,119,6,.3)' },
  { icon: StethoscopeIcon, t: 'Diagnosis',    route: 'diagnosis',    c: '#0891B2', bg: 'rgba(8,145,178,.15)',  border: 'rgba(8,145,178,.3)' },
  { icon: PillIcon,        t: 'Prescription', route: 'prescription', c: '#DB2777', bg: 'rgba(219,39,119,.15)', border: 'rgba(219,39,119,.3)' },
  { icon: ActivityIcon,    t: 'Vitals',       route: 'vitals',       c: '#0D9488', bg: 'rgba(13,148,136,.15)', border: 'rgba(13,148,136,.3)' },
  { icon: SirenIcon,       t: 'Emergency',    route: 'emergency',    c: '#EA580C', bg: 'rgba(234,88,12,.15)',  border: 'rgba(234,88,12,.3)' },
];

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  normal:   { color: '#34D399', bg: 'rgba(52,211,153,.12)',  border: 'rgba(52,211,153,.25)' },
  mild:     { color: '#FBBF24', bg: 'rgba(251,191,36,.12)',  border: 'rgba(251,191,36,.25)' },
  moderate: { color: '#FB923C', bg: 'rgba(251,146,60,.12)',  border: 'rgba(251,146,60,.25)' },
  severe:   { color: '#F87171', bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.25)' },
};

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab]     = useState<'home' | 'queue' | 'approved' | 'rejected'>('home');
  const [scans, setScans]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [notes, setNotes]             = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg]     = useState('');
  const [filter, setFilter]           = useState('all');

  const load = async () => {
    setLoading(true);
    try { const data = await getAllScansDoctor(); setScans(Array.isArray(data) ? data : []); }
    catch { setScans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    if (!selectedScan) return;
    setActionLoading(true);
    try {
      await approveScan(selectedScan.id, notes);
      setActionMsg('approved');
      setScans(p => p.map(s => s.id === selectedScan.id ? { ...s, status: 'approved', doctor_notes: notes } : s));
      setSelectedScan((p: any) => ({ ...p, status: 'approved', doctor_notes: notes }));
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('error-approve'); setTimeout(() => setActionMsg(''), 3000); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedScan || !notes.trim()) { setActionMsg('needs-notes'); setTimeout(() => setActionMsg(''), 3000); return; }
    setActionLoading(true);
    try {
      await rejectScan(selectedScan.id, notes);
      setActionMsg('flagged');
      setScans(p => p.map(s => s.id === selectedScan.id ? { ...s, status: 'rejected', doctor_notes: notes } : s));
      setSelectedScan((p: any) => ({ ...p, status: 'rejected', doctor_notes: notes }));
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('error-flag'); setTimeout(() => setActionMsg(''), 3000); }
    finally { setActionLoading(false); }
  };

  const pending  = scans.filter(s => s.status === 'pending');
  const approved = scans.filter(s => s.status === 'approved');
  const rejected = scans.filter(s => s.status === 'rejected');

  const tabScans = activeTab === 'queue' ? pending : activeTab === 'approved' ? approved : activeTab === 'rejected' ? rejected : [];
  const filtered = filter === 'all' ? tabScans : tabScans.filter(s => s.scan_type === filter);

  const firstName = user?.full_name?.split(' ')[0] || 'Doctor';
  const initials  = (user?.full_name || 'Dr').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const getSeverity = (scan: any) => {
    const key = (scan.severity || '').toLowerCase().replace(/[^a-z]/g, '');
    return severityConfig[key] || severityConfig.normal;
  };

  const msgConfig: Record<string, { text: string; color: string; bg: string }> = {
    approved:       { text: 'Report approved successfully!',  color: '#34D399', bg: 'rgba(52,211,153,.12)' },
    flagged:        { text: 'Report flagged for attention.',   color: '#FBBF24', bg: 'rgba(251,191,36,.12)' },
    'needs-notes':  { text: 'Please add notes before flagging.', color: '#FBBF24', bg: 'rgba(251,191,36,.12)' },
    'error-approve':{ text: 'Failed to approve. Try again.',  color: '#F87171', bg: 'rgba(248,113,113,.12)' },
    'error-flag':   { text: 'Failed to flag. Try again.',     color: '#F87171', bg: 'rgba(248,113,113,.12)' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora','Plus Jakarta Sans',-apple-system,sans-serif", display: 'flex', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes blobA   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 10px; }
        .nav-item:hover { background: rgba(255,255,255,.07) !important; color: #fff !important; }
        .scan-card:hover { background: rgba(255,255,255,.07) !important; border-color: rgba(255,255,255,.12) !important; transform: translateY(-2px); }
        .scan-card { transition: all .25s; }
        textarea { resize: vertical; }
        textarea::placeholder { color: rgba(255,255,255,.2); }
      `}</style>

      {/* Bg blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'blobA 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,.08) 0%,transparent 65%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* SIDEBAR */}
      <aside style={{ width: 240, flexShrink: 0, background: 'rgba(255,255,255,.03)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)' }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,.45)', color: '#fff' }}>
              <LogoIcon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-.3px' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.28)', marginTop: 1 }}>Doctor Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {([
            { id: 'home',     Icon: HomeIcon,          label: 'Dashboard' },
            { id: 'queue',    Icon: ClockIcon,          label: 'Review Queue', badge: pending.length },
            { id: 'approved', Icon: CheckCircleIcon,    label: 'Approved' },
            { id: 'rejected', Icon: AlertTriangleIcon,  label: 'Flagged' },
          ] as const).map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveTab(item.id as any)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 14px', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'left', transition: 'all .2s', background: activeTab === item.id ? 'rgba(124,58,237,.2)' : 'transparent', color: activeTab === item.id ? '#A78BFA' : 'rgba(255,255,255,.45)', borderLeft: `2px solid ${activeTab === item.id ? '#7C3AED' : 'transparent'}` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <item.Icon size={16} />
                {item.label}
              </span>
              {'badge' in item && (item as any).badge > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 100, padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>{(item as any).badge}</span>}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '8px 0' }} />
          <div style={{ padding: '4px 8px' }}>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.25)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Overview</div>
            {[
              { label: 'Pending',  val: pending.length,  c: '#FBBF24' },
              { label: 'Approved', val: approved.length, c: '#34D399' },
              { label: 'Flagged',  val: rejected.length, c: '#F87171' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.35)' }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.val}</span>
              </div>
            ))}
          </div>
        </nav>

        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 12, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {user?.full_name || 'Doctor'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>Certified Physician</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', color: '#F87171', padding: '9px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,.1)'; }}>
            <LogOutIcon size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,10,20,.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>
              {activeTab === 'home' ? `Welcome, Dr. ${firstName}` : activeTab === 'queue' ? 'Review Queue' : activeTab === 'approved' ? 'Approved Reports' : 'Flagged Reports'}
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pending.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 100, padding: '5px 12px', cursor: 'pointer' }} onClick={() => setActiveTab('queue')}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24', display: 'inline-block', animation: 'pulse 1.5s infinite', boxShadow: '0 0 5px #FBBF24' }} />
                <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 700 }}>{pending.length} Pending</span>
              </div>
            )}
            <button onClick={load} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>
              <RefreshIcon size={13} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: '28px', flex: 1, animation: 'fadeUp .6s ease both' }}>

          {/* HOME */}
          {activeTab === 'home' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Total Reports',  val: scans.length,    Icon: ClipboardIcon, c: '#60A5FA',  desc: 'All time' },
                  { label: 'Pending Review',  val: pending.length,  Icon: ClockIcon,     c: '#FBBF24',  desc: 'Awaiting action' },
                  { label: 'Approved',        val: approved.length, Icon: CheckCircleIcon, c: '#34D399', desc: 'Cleared reports' },
                  { label: 'Flagged',         val: rejected.length, Icon: AlertTriangleIcon, c: '#F87171', desc: 'Need attention' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px', transition: 'all .25s', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.transform = ''; }}>
                    <div style={{ color: s.c, marginBottom: 10, display: 'flex' }}><s.Icon size={24} /></div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: s.c, letterSpacing: '-2px', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 13, color: '#fff', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 3 }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              {pending.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF24', animation: 'pulse 1.5s infinite', boxShadow: '0 0 6px #FBBF24' }} />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Requires Your Review</h2>
                    <span style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', color: '#FBBF24', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 10px' }}>{pending.length} pending</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pending.slice(0, 3).map((scan, i) => {
                      const mod = modules.find(m => m.route === scan.scan_type);
                      const sv  = getSeverity(scan);
                      return (
                        <div key={i} className="scan-card" onClick={() => { setSelectedScan(scan); setNotes(''); }} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(251,191,36,.15)', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: mod?.bg || 'rgba(255,255,255,.08)', border: `1px solid ${mod?.border || 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mod?.c || '#60A5FA', flexShrink: 0 }}>
                            <ModuleIcon type={scan.scan_type} size={21} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff', marginBottom: 2 }}>{scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase()) || 'Medical Scan'}</div>
                            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)' }}>Patient: <span style={{ color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{scan.patient_name || scan.user_email || 'Unknown'}</span> &middot; {new Date(scan.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'short' })}</div>
                            {scan.report && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280, display: 'flex', alignItems: 'center', gap: 4 }}><SparklesIcon size={10} /> {scan.report}</div>}
                          </div>
                          {scan.severity && <div style={{ fontSize: 11.5, color: sv.color, background: sv.bg, border: `1px solid ${sv.border}`, borderRadius: 8, padding: '4px 10px', flexShrink: 0, fontWeight: 700 }}>{scan.severity}</div>}
                          <div style={{ background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)', color: '#FBBF24', fontSize: 11.5, fontWeight: 700, borderRadius: 100, padding: '4px 12px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>Review <ChevronRightIcon size={12} /></div>
                        </div>
                      );
                    })}
                    {pending.length > 3 && (
                      <button onClick={() => setActiveTab('queue')} style={{ background: 'none', border: '1px dashed rgba(255,255,255,.1)', borderRadius: 12, padding: '12px', color: 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.35)'; }}>
                        View {pending.length - 3} more pending &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {pending.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '56px 20px', background: 'rgba(52,211,153,.05)', border: '1px solid rgba(52,211,153,.15)', borderRadius: 20, marginBottom: 28 }}>
                  <div style={{ color: '#34D399', marginBottom: 14, display: 'flex', justifyContent: 'center' }}><CheckCircleIcon size={52} /></div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#34D399', marginBottom: 8 }}>All caught up!</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>No reports pending review right now.</div>
                </div>
              )}

              {approved.length + rejected.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Recent Activity</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...approved, ...rejected].slice(0, 5).map((scan, i) => {
                      const mod = modules.find(m => m.route === scan.scan_type);
                      const isApproved = scan.status === 'approved';
                      return (
                        <div key={i} className="scan-card" onClick={() => { setSelectedScan(scan); setNotes(scan.doctor_notes || ''); }} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 13, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: mod?.bg || 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mod?.c || '#60A5FA', flexShrink: 0 }}>
                            <ModuleIcon type={scan.scan_type} size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase())}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{new Date(scan.created_at).toLocaleDateString('en-PK',{ day:'numeric', month:'short', year:'numeric' })}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: isApproved ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', border: `1px solid ${isApproved ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`, borderRadius: 100, padding: '4px 11px', flexShrink: 0 }}>
                            <span style={{ color: isApproved ? '#34D399' : '#F87171', display: 'flex' }}>{isApproved ? <CheckCircleIcon size={11} /> : <AlertTriangleIcon size={11} />}</span>
                            <span style={{ fontSize: 10, color: isApproved ? '#34D399' : '#F87171', fontWeight: 700 }}>{isApproved ? 'Approved' : 'Flagged'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* QUEUE / APPROVED / REJECTED */}
          {activeTab !== 'home' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? 'rgba(167,139,250,.2)' : 'rgba(255,255,255,.04)', border: `1px solid ${filter === 'all' ? 'rgba(167,139,250,.4)' : 'rgba(255,255,255,.08)'}`, color: filter === 'all' ? '#A78BFA' : 'rgba(255,255,255,.45)', padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FilterIcon size={12} /> All ({tabScans.length})
                </button>
                {modules.filter(m => tabScans.some(s => s.scan_type === m.route)).map(m => (
                  <button key={m.route} onClick={() => setFilter(m.route)} style={{ background: filter === m.route ? m.bg : 'rgba(255,255,255,.04)', border: `1px solid ${filter === m.route ? m.border : 'rgba(255,255,255,.08)'}`, color: filter === m.route ? m.c : 'rgba(255,255,255,.45)', padding: '7px 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <m.icon size={13} />{m.t}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: 12 }}>
                  <div style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#A78BFA', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Loading reports...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 20 }}>
                  <div style={{ color: 'rgba(255,255,255,.15)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                    {activeTab === 'queue' ? <ClockIcon size={52} /> : activeTab === 'approved' ? <CheckCircleIcon size={52} /> : <AlertTriangleIcon size={52} />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>No reports here</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.28)' }}>
                    {activeTab === 'queue' ? 'No reports pending review' : activeTab === 'approved' ? 'No approved reports yet' : 'No flagged reports'}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((scan, i) => {
                    const mod = modules.find(m => m.route === scan.scan_type);
                    const sv  = getSeverity(scan);
                    const isApproved = scan.status === 'approved';
                    return (
                      <div key={i} className="scan-card" onClick={() => { setSelectedScan(scan); setNotes(scan.doctor_notes || ''); }} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: mod?.bg || 'rgba(255,255,255,.08)', border: `1px solid ${mod?.border || 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mod?.c || '#60A5FA', flexShrink: 0 }}>
                          <ModuleIcon type={scan.scan_type} size={23} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>{scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase()) || 'Medical Scan'}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                            Patient: <span style={{ color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{scan.patient_name || scan.user_email || 'Unknown'}</span>
                            {' \u00B7 '}{new Date(scan.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                          </div>
                          {scan.report && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.28)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320, display: 'flex', alignItems: 'center', gap: 4 }}><SparklesIcon size={10} /> {scan.report}</div>}
                        </div>
                        {scan.severity && <div style={{ fontSize: 12, color: sv.color, background: sv.bg, border: `1px solid ${sv.border}`, borderRadius: 8, padding: '4px 10px', flexShrink: 0, fontWeight: 700 }}>{scan.severity}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: activeTab === 'queue' ? 'rgba(251,191,36,.1)' : isApproved ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', border: `1px solid ${activeTab === 'queue' ? 'rgba(251,191,36,.25)' : isApproved ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`, borderRadius: 100, padding: '5px 12px', flexShrink: 0 }}>
                          <span style={{ color: activeTab === 'queue' ? '#FBBF24' : isApproved ? '#34D399' : '#F87171', display: 'flex' }}>
                            {activeTab === 'queue' ? <ClockIcon size={11} /> : isApproved ? <CheckCircleIcon size={11} /> : <AlertTriangleIcon size={11} />}
                          </span>
                          <span style={{ fontSize: 12, color: activeTab === 'queue' ? '#FBBF24' : isApproved ? '#34D399' : '#F87171', fontWeight: 700 }}>
                            {activeTab === 'queue' ? 'Pending' : isApproved ? 'Approved' : 'Flagged'}
                          </span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,.2)', display: 'flex', flexShrink: 0 }}><ChevronRightIcon size={18} /></span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* REVIEW MODAL */}
      {selectedScan && (
        <div onClick={() => setSelectedScan(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(10px)', animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0D1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, width: '100%', maxWidth: 600, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,.7)', animation: 'fadeUp .3s ease' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0D1526', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: modules.find(m => m.route === selectedScan.scan_type)?.bg || 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: modules.find(m => m.route === selectedScan.scan_type)?.c || '#60A5FA' }}>
                  <ModuleIcon type={selectedScan.scan_type} size={23} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{selectedScan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase())}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
                    Patient: {selectedScan.patient_name || selectedScan.user_email || 'Unknown'}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedScan(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XIcon size={14} />
              </button>
            </div>

            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: selectedScan.status === 'approved' ? 'rgba(52,211,153,.12)' : selectedScan.status === 'rejected' ? 'rgba(248,113,113,.12)' : 'rgba(251,191,36,.12)',
                  border: `1px solid ${selectedScan.status === 'approved' ? 'rgba(52,211,153,.3)' : selectedScan.status === 'rejected' ? 'rgba(248,113,113,.3)' : 'rgba(251,191,36,.3)'}`,
                  borderRadius: 100, padding: '5px 13px' }}>
                  <span style={{ color: selectedScan.status === 'approved' ? '#34D399' : selectedScan.status === 'rejected' ? '#F87171' : '#FBBF24', display: 'flex' }}>
                    {selectedScan.status === 'approved' ? <CheckCircleIcon size={13} /> : selectedScan.status === 'rejected' ? <AlertTriangleIcon size={13} /> : <ClockIcon size={13} />}
                  </span>
                  <span style={{ fontSize: 12.5, color: selectedScan.status === 'approved' ? '#34D399' : selectedScan.status === 'rejected' ? '#F87171' : '#FBBF24', fontWeight: 700 }}>
                    {selectedScan.status === 'approved' ? 'Approved' : selectedScan.status === 'rejected' ? 'Flagged' : 'Pending Review'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{new Date(selectedScan.created_at).toLocaleString('en-PK')}</span>
              </div>

              {selectedScan.report && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA', display: 'inline-block' }} />
                    AI Analysis Report
                  </div>
                  <div style={{ background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.15)', borderRadius: 14, padding: '16px' }}>
                    <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 13.5, lineHeight: 1.82, whiteSpace: 'pre-wrap' }}>{selectedScan.report}</p>
                  </div>
                </div>
              )}

              {selectedScan.severity && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Severity Level</div>
                  {(() => { const sv = getSeverity(selectedScan); return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: sv.bg, border: `1px solid ${sv.border}`, borderRadius: 10, padding: '8px 16px' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sv.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 14, color: sv.color, fontWeight: 700 }}>{selectedScan.severity}</span>
                    </div>
                  )})()}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
                  Doctor Notes
                  {selectedScan.status === 'pending' && <span style={{ color: '#F87171', fontSize: 10 }}>*Required for flagging</span>}
                </div>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  disabled={selectedScan.status !== 'pending'}
                  placeholder="Add clinical notes, observations, or recommendations for the patient..."
                  rows={4}
                  style={{ width: '100%', background: selectedScan.status !== 'pending' ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '13px 15px', color: selectedScan.status !== 'pending' ? 'rgba(255,255,255,.5)' : '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none', transition: 'all .2s', lineHeight: 1.7, cursor: selectedScan.status !== 'pending' ? 'default' : 'text' }}
                  onFocus={e => { if (selectedScan.status === 'pending') { e.target.style.borderColor = 'rgba(96,165,250,.5)'; e.target.style.background = 'rgba(255,255,255,.08)'; } }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.background = selectedScan.status !== 'pending' ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; }}
                />
              </div>

              {actionMsg && msgConfig[actionMsg] && (
                <div style={{ marginBottom: 16, padding: '11px 16px', background: msgConfig[actionMsg].bg, border: `1px solid ${msgConfig[actionMsg].color}40`, borderRadius: 10, fontSize: 13.5, color: msgConfig[actionMsg].color, fontWeight: 600 }}>
                  {msgConfig[actionMsg].text}
                </div>
              )}

              {selectedScan.status === 'pending' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={handleApprove} disabled={actionLoading} style={{ background: actionLoading ? 'rgba(52,211,153,.2)' : 'linear-gradient(135deg,#059669,#10B981)', border: 'none', color: '#fff', padding: '13px', borderRadius: 12, cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .22s', boxShadow: '0 4px 16px rgba(5,150,105,.3)' }}
                    onMouseEnter={e => { if (!actionLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(5,150,105,.4)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,.3)'; }}>
                    {actionLoading ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> : <CheckCircleIcon size={16} />}
                    Approve Report
                  </button>
                  <button onClick={handleReject} disabled={actionLoading} style={{ background: 'rgba(248,113,113,.12)', border: '1.5px solid rgba(248,113,113,.3)', color: '#F87171', padding: '13px', borderRadius: 12, cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .22s' }}
                    onMouseEnter={e => { if (!actionLoading) { e.currentTarget.style.background = 'rgba(248,113,113,.2)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.5)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.3)'; }}>
                    <AlertTriangleIcon size={16} /> Flag for Attention
                  </button>
                </div>
              )}

              {selectedScan.status !== 'pending' && selectedScan.doctor_notes && (
                <div style={{ background: selectedScan.status === 'approved' ? 'rgba(52,211,153,.08)' : 'rgba(248,113,113,.08)', border: `1px solid ${selectedScan.status === 'approved' ? 'rgba(52,211,153,.2)' : 'rgba(248,113,113,.2)'}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: selectedScan.status === 'approved' ? '#34D399' : '#F87171', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your Notes</div>
                  <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 13.5, lineHeight: 1.75 }}>{selectedScan.doctor_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
