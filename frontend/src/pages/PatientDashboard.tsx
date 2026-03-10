import React, { useState, useEffect } from 'react';
import { getMyScans } from '../services/api';
import XrayAnalyzer from './XrayAnalyzer';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

const modules = [
  { e: '🫁', t: 'X-Ray Analysis',    d: 'Chest X-ray, MRI & CT scan',   route: 'xray',         c: '#3B82F6', bg: 'rgba(59,130,246,.12)',  border: 'rgba(59,130,246,.25)' },
  { e: '🦴', t: 'Bone Scan',          d: 'Fracture & bone disease',       route: 'bone',         c: '#8B5CF6', bg: 'rgba(139,92,246,.12)',  border: 'rgba(139,92,246,.25)' },
  { e: '💓', t: 'ECG Analyzer',       d: 'Heart rhythm & cardiac',        route: 'ecg',          c: '#EF4444', bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.25)' },
  { e: '🧪', t: 'Blood Tests',        d: 'Full blood report analysis',    route: 'blood',        c: '#10B981', bg: 'rgba(16,185,129,.12)',  border: 'rgba(16,185,129,.25)' },
  { e: '🧠', t: 'Mental Health',      d: 'PHQ-9 & GAD-7 screening',      route: 'mental',       c: '#F59E0B', bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.25)' },
  { e: '🔍', t: 'Diagnosis AI',       d: 'Symptom-based diagnosis',       route: 'diagnosis',    c: '#06B6D4', bg: 'rgba(6,182,212,.12)',   border: 'rgba(6,182,212,.25)' },
  { e: '💊', t: 'Prescription',       d: 'Handwritten prescription',      route: 'prescription', c: '#EC4899', bg: 'rgba(236,72,153,.12)',  border: 'rgba(236,72,153,.25)' },
  { e: '📊', t: 'Vital Signs',        d: 'BP, sugar & oxygen tracking',   route: 'vitals',       c: '#14B8A6', bg: 'rgba(20,184,166,.12)',  border: 'rgba(20,184,166,.25)' },
  { e: '🚨', t: 'Emergency Aid',      d: 'Instant first aid guidance',    route: 'emergency',    c: '#F97316', bg: 'rgba(249,115,22,.12)',  border: 'rgba(249,115,22,.25)' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',    color: '#FBBF24', bg: 'rgba(251,191,36,.12)' },
  approved:  { label: 'Approved',   color: '#34D399', bg: 'rgba(52,211,153,.12)' },
  rejected:  { label: 'Attention',  color: '#F87171', bg: 'rgba(248,113,113,.12)' },
  completed: { label: 'Completed',  color: '#60A5FA', bg: 'rgba(96,165,250,.12)' },
};

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab]       = useState<'home' | 'scans' | 'modules'>('home');
  const [scans, setScans]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [activeModule, setActiveModule] = useState('');
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try { const data = await getMyScans(); setScans(Array.isArray(data) ? data : []); }
      catch { setScans([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stats = [
    { label: 'Total Scans',    value: scans.length,                                          e: '📋', c: '#60A5FA' },
    { label: 'Approved',       value: scans.filter(s => s.status === 'approved').length,     e: '✅', c: '#34D399' },
    { label: 'Pending',        value: scans.filter(s => s.status === 'pending').length,      e: '⏳', c: '#FBBF24' },
    { label: 'AI Modules',     value: 9,                                                     e: '🤖', c: '#A78BFA' },
  ];

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Patient';
  const initials  = (user?.full_name || 'P').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  if (activeModule === 'xray') return <XrayAnalyzer onBack={() => setActiveModule('')} />;

  const navItems = [
    { id: 'home',    e: '🏠', label: 'Home' },
    { id: 'modules', e: '🤖', label: 'Modules' },
    { id: 'scans',   e: '📋', label: 'My Scans' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-100%); } to { opacity:1; transform:translateX(0); } }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 10px; }

        .mod-card { transition: transform .22s, box-shadow .22s, background .22s, border-color .22s; }
        .mod-card:hover { transform: translateY(-3px); }

        .scan-row { transition: background .18s; }
        .scan-row:hover { background: rgba(255,255,255,.05) !important; }

        .nav-btn { transition: all .2s; border: none; cursor: pointer; font-family: inherit; }
        .nav-btn:hover { background: rgba(255,255,255,.07) !important; }

        .stat-card { transition: transform .2s, background .2s; cursor: default; }
        .stat-card:hover { transform: translateY(-2px); background: rgba(255,255,255,.07) !important; }

        .logout-btn { transition: all .2s; }
        .logout-btn:hover { background: rgba(248,113,113,.2) !important; }

        .overlay-sidebar { display: none; }

        /* Mobile bottom nav */
        .bottom-nav { display: none; }

        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .bottom-nav { display: flex !important; }
          .main-content { padding-bottom: 80px !important; }
          .topbar-title { font-size: 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .modules-grid { grid-template-columns: 1fr 1fr !important; }
          .modules-grid-full { grid-template-columns: 1fr !important; }
          .main-pad { padding: 18px 16px !important; }
        }
      `}</style>

      {/* Bg orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 65%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '15%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="sidebar" style={{ width: 228, flexShrink: 0, background: 'rgba(255,255,255,.03)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 4px 12px rgba(59,130,246,.4)' }}>🏥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '-.3px' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>Patient Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(item => (
            <button key={item.id} className="nav-btn" onClick={() => setActiveTab(item.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: activeTab === item.id ? 'rgba(59,130,246,.18)' : 'transparent', color: activeTab === item.id ? '#60A5FA' : 'rgba(255,255,255,.4)', fontSize: 13.5, fontWeight: 600, textAlign: 'left', borderLeft: `2px solid ${activeTab === item.id ? '#3B82F6' : 'transparent'}` }}>
              <span style={{ fontSize: 15 }}>{item.e}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Patient'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 1 }}>Patient</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout} style={{ width: '100%', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.18)', color: '#F87171', padding: '8px', borderRadius: 9, fontSize: 12.5, fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,15,26,.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 className="topbar-title" style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>
              {activeTab === 'home' ? `Hey, ${firstName} 👋` : activeTab === 'modules' ? 'AI Modules' : 'My Scans'}
            </h1>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.28)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 100, padding: '5px 11px' }}>
              <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 5px #34D399' }} />
              <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700 }}>AI Online</span>
            </div>
            {/* Mobile: initials avatar */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }} className="mobile-avatar">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="main-pad main-content" style={{ padding: '24px', flex: 1, animation: 'fadeUp .5s ease both' }}>

          {/* ── HOME ── */}
          {activeTab === 'home' && (
            <>
              {/* Stats */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
                {stats.map((s, i) => (
                  <div key={i} className="stat-card" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '18px 16px' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{s.e}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: s.c, letterSpacing: '-1.5px', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick modules */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-.2px' }}>Quick Access</h2>
                  <button onClick={() => setActiveTab('modules')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit' }}>View all →</button>
                </div>
                <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 9 }}>
                  {modules.slice(0, 6).map((m, i) => (
                    <div key={i} className="mod-card" onClick={() => setActiveModule(m.route)}
                      style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${m.border}`, borderRadius: 13, padding: '16px 13px', cursor: 'pointer', textAlign: 'center' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = m.bg; el.style.boxShadow = `0 10px 28px ${m.c}20`; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,.04)'; el.style.boxShadow = ''; }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 7 }}>{m.e}</div>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: m.c }}>{m.t}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 3, lineHeight: 1.4 }}>{m.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent scans */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-.2px' }}>Recent Scans</h2>
                  <button onClick={() => setActiveTab('scans')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit' }}>View all →</button>
                </div>
                <ScanList scans={scans} loading={loading} limit={5} onSelect={setSelectedScan} onAction={() => setActiveTab('modules')} />
              </div>
            </>
          )}

          {/* ── MODULES ── */}
          {activeTab === 'modules' && (
            <>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13.5, marginBottom: 20 }}>Choose an AI module to analyze your medical data</p>
              <div className="modules-grid-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
                {modules.map((m, i) => (
                  <div key={i} className="mod-card" onClick={() => setActiveModule(m.route)}
                    style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${m.border}`, borderRadius: 16, padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = m.bg; el.style.boxShadow = `0 14px 36px ${m.c}18`; el.style.borderColor = m.c + '55'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,.04)'; el.style.boxShadow = ''; el.style.borderColor = m.border; }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: m.bg, border: `1px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{m.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: '#fff', marginBottom: 4 }}>{m.t}</div>
                      <div style={{ color: 'rgba(255,255,255,.38)', fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 }}>{m.d}</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 100, padding: '4px 12px', fontSize: 11.5, color: m.c, fontWeight: 700 }}>
                        Analyze Now →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SCANS ── */}
          {activeTab === 'scans' && (
            <>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13.5, marginBottom: 20 }}>Complete history of your AI medical analyses</p>
              <ScanList scans={scans} loading={loading} onSelect={setSelectedScan} onAction={() => setActiveTab('modules')} emptyMsg="Your completed analyses will appear here" emptyBtn="Start First Analysis →" />
            </>
          )}
        </div>
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(11,15,26,.95)', borderTop: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(20px)', padding: '8px 0 12px', display: 'none', justifyContent: 'space-around', alignItems: 'center' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 16px', borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>{item.e}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: activeTab === item.id ? '#60A5FA' : 'rgba(255,255,255,.35)' }}>{item.label}</span>
            {activeTab === item.id && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3B82F6', marginTop: -2 }} />}
          </button>
        ))}
        <button onClick={onLogout} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 16px' }}>
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(248,113,113,.7)' }}>Sign Out</span>
        </button>
      </div>

      {/* ── SCAN DETAIL MODAL ── */}
      {selectedScan && (
        <div onClick={() => setSelectedScan(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', backdropFilter: 'blur(10px)', animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0E1423', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, width: '100%', maxWidth: 540, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,.6)', animation: 'fadeUp .25s ease' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0E1423', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: modules.find(m => m.route === selectedScan.scan_type)?.bg || 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {modules.find(m => m.route === selectedScan.scan_type)?.e || '📄'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: '#fff' }}>{selectedScan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l: string) => l.toUpperCase())}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.28)', marginTop: 1 }}>{new Date(selectedScan.created_at).toLocaleString('en-PK')}</div>
                </div>
              </div>
              <button onClick={() => setSelectedScan(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', color: 'rgba(255,255,255,.5)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 22px' }}>
              {(() => {
                const st = statusConfig[selectedScan.status] || statusConfig.pending;
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 100, padding: '5px 13px', marginBottom: 18 }}>
                    <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: st.color, fontWeight: 700 }}>{st.label}</span>
                  </div>
                );
              })()}

              {selectedScan.ai_result && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 9 }}>AI Analysis</div>
                  <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {typeof selectedScan.ai_result === 'string' ? selectedScan.ai_result : JSON.stringify(selectedScan.ai_result, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {selectedScan.doctor_notes && (
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 9 }}>Doctor's Notes</div>
                  <div style={{ background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ color: '#34D399', fontSize: 13.5, lineHeight: 1.8 }}>{selectedScan.doctor_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile CSS overrides */}
      <style>{`
        @media (max-width: 768px) {
          .bottom-nav { display: flex !important; }
          .mobile-avatar { display: flex !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .modules-grid { grid-template-columns: 1fr 1fr !important; }
          .modules-grid-full { grid-template-columns: 1fr !important; }
          .main-pad { padding: 18px 14px !important; }
          .main-content { padding-bottom: 84px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Reusable scan list component ──
function ScanList({ scans, loading, limit, onSelect, onAction, emptyMsg = "Upload your first medical scan to get started", emptyBtn = "Choose a Module →" }: {
  scans: any[]; loading: boolean; limit?: number; onSelect: (s: any) => void; onAction: () => void; emptyMsg?: string; emptyBtn?: string;
}) {
  const items = limit ? scans.slice(0, limit) : scans;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: 12 }}>
      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 13.5 }}>Loading scans…</span>
    </div>
  );

  if (scans.length === 0) return (
    <div style={{ textAlign: 'center', padding: '52px 20px', background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.07)', borderRadius: 16 }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'rgba(255,255,255,.5)', marginBottom: 7 }}>No scans yet</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.28)', marginBottom: 20 }}>{emptyMsg}</div>
      <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(59,130,246,.35)' }}>
        {emptyBtn}
      </button>
    </div>
  );

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'Pending',   color: '#FBBF24', bg: 'rgba(251,191,36,.12)' },
    approved:  { label: 'Approved',  color: '#34D399', bg: 'rgba(52,211,153,.12)' },
    rejected:  { label: 'Attention', color: '#F87171', bg: 'rgba(248,113,113,.12)' },
    completed: { label: 'Completed', color: '#60A5FA', bg: 'rgba(96,165,250,.12)' },
  };

  const modules = [
    { e: '🫁', route: 'xray' }, { e: '🦴', route: 'bone' }, { e: '💓', route: 'ecg' },
    { e: '🧪', route: 'blood' }, { e: '🧠', route: 'mental' }, { e: '🔍', route: 'diagnosis' },
    { e: '💊', route: 'prescription' }, { e: '📊', route: 'vitals' }, { e: '🚨', route: 'emergency' },
  ];

  return (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
      {items.map((scan, i) => {
        const st  = statusConfig[scan.status] || statusConfig.pending;
        const mod = modules.find(m => m.route === scan.scan_type);
        return (
          <div key={i} className="scan-row" onClick={() => onSelect(scan)}
            style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none', cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              {mod?.e || '📄'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Medical Scan'}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.28)', marginTop: 2 }}>
                {new Date(scan.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, border: `1px solid ${st.color}25`, borderRadius: 100, padding: '4px 11px', flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color, display: 'inline-block', animation: scan.status === 'pending' ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: 11.5, color: st.color, fontWeight: 700 }}>{st.label}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 16, flexShrink: 0 }}>›</span>
          </div>
        );
      })}
    </div>
  );
}
