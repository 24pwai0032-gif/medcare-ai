import React, { useState, useEffect } from 'react';
import { getMyScans } from '../services/api';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

const modules = [
  { e: '🫁', t: 'X-Ray Analysis',   d: 'Chest X-ray, MRI & CT scan', route: 'xray',        c: '#2563EB', bg: 'rgba(37,99,235,.15)',   border: 'rgba(37,99,235,.3)' },
  { e: '🦴', t: 'Bone Scan',         d: 'Fracture & bone disease',     route: 'bone',        c: '#7C3AED', bg: 'rgba(124,58,237,.15)',  border: 'rgba(124,58,237,.3)' },
  { e: '💓', t: 'ECG Analyzer',      d: 'Heart rhythm & cardiac',      route: 'ecg',         c: '#DC2626', bg: 'rgba(220,38,38,.15)',   border: 'rgba(220,38,38,.3)' },
  { e: '🧪', t: 'Blood Tests',       d: 'Full blood report analysis',  route: 'blood',       c: '#059669', bg: 'rgba(5,150,105,.15)',   border: 'rgba(5,150,105,.3)' },
  { e: '🧠', t: 'Mental Health',     d: 'PHQ-9 & GAD-7 screening',     route: 'mental',      c: '#D97706', bg: 'rgba(217,119,6,.15)',   border: 'rgba(217,119,6,.3)' },
  { e: '🔍', t: 'Diagnosis AI',      d: 'Symptom-based diagnosis',     route: 'diagnosis',   c: '#0891B2', bg: 'rgba(8,145,178,.15)',   border: 'rgba(8,145,178,.3)' },
  { e: '💊', t: 'Prescription',      d: 'Handwritten prescription',    route: 'prescription',c: '#DB2777', bg: 'rgba(219,39,119,.15)',  border: 'rgba(219,39,119,.3)' },
  { e: '📊', t: 'Vital Signs',       d: 'BP, sugar & oxygen tracking', route: 'vitals',      c: '#0D9488', bg: 'rgba(13,148,136,.15)',  border: 'rgba(13,148,136,.3)' },
  { e: '🚨', t: 'Emergency Aid',     d: 'Instant first aid guidance',  route: 'emergency',   c: '#EA580C', bg: 'rgba(234,88,12,.15)',   border: 'rgba(234,88,12,.3)' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'Pending Review', color: '#FBBF24', bg: 'rgba(251,191,36,.12)',  dot: '#FBBF24' },
  approved:  { label: 'Approved',       color: '#34D399', bg: 'rgba(52,211,153,.12)',  dot: '#34D399' },
  rejected:  { label: 'Needs Attention',color: '#F87171', bg: 'rgba(248,113,113,.12)', dot: '#F87171' },
  completed: { label: 'Completed',      color: '#60A5FA', bg: 'rgba(96,165,250,.12)',  dot: '#60A5FA' },
};

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeTab, setActiveTab]   = useState<'home' | 'scans' | 'modules'>('home');
  const [scans, setScans]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try { const data = await getMyScans(); setScans(Array.isArray(data) ? data : []); }
      catch { setScans([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stats = [
    { label: 'Total Scans',     value: scans.length,                                           e: '📋', c: '#60A5FA' },
    { label: 'Approved',        value: scans.filter(s => s.status === 'approved').length,      e: '✅', c: '#34D399' },
    { label: 'Pending Review',  value: scans.filter(s => s.status === 'pending').length,       e: '⏳', c: '#FBBF24' },
    { label: 'AI Modules',      value: 9,                                                      e: '🤖', c: '#A78BFA' },
  ];

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Patient';
  const initials  = (user?.full_name || 'P').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora','Plus Jakarta Sans',-apple-system,sans-serif", display: 'flex', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes gradShift{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes blobA    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 10px; }
        .mod-card:hover { transform: translateY(-4px) !important; }
        .nav-item:hover { background: rgba(255,255,255,.07) !important; color: #fff !important; }
        .scan-row:hover { background: rgba(255,255,255,.04) !important; }
      `}</style>

      {/* ── Bg blobs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'blobA 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 65%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside style={{ width: 240, flexShrink: 0, background: 'rgba(255,255,255,.03)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 14px rgba(37,99,235,.45)' }}>🏥</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-.3px' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.28)', marginTop: 1 }}>Patient Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'home',    e: '🏠', label: 'Dashboard' },
            { id: 'modules', e: '🤖', label: 'AI Modules' },
            { id: 'scans',   e: '📋', label: 'My Scans' },
          ].map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'left', transition: 'all .2s', background: activeTab === item.id ? 'rgba(37,99,235,.2)' : 'transparent', color: activeTab === item.id ? '#60A5FA' : 'rgba(255,255,255,.45)', borderLeft: activeTab === item.id ? '2px solid #2563EB' : '2px solid transparent' }}>
              <span style={{ fontSize: 16 }}>{item.e}</span>
              {item.label}
            </button>
          ))}

          {/* Modules quick links */}
          {activeTab === 'modules' && (
            <div style={{ marginTop: 6, paddingLeft: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {modules.slice(0, 6).map(m => (
                <button key={m.route} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.35)', background: 'transparent', textAlign: 'left', transition: 'all .18s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#fff'; el.style.background = 'rgba(255,255,255,.05)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,.35)'; el.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 13 }}>{m.e}</span>{m.t}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User card at bottom */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 12, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Patient'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>Patient Account</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', color: '#F87171', padding: '9px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(248,113,113,.18)'; el.style.borderColor = 'rgba(248,113,113,.35)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(248,113,113,.1)'; el.style.borderColor = 'rgba(248,113,113,.2)'; }}
          >Sign Out</button>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT
      ══════════════════════════════ */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>

        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>
              {activeTab === 'home' ? `Good day, ${firstName} 👋` : activeTab === 'modules' ? 'AI Modules 🤖' : 'My Scans 📋'}
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 100, padding: '5px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 5px #34D399' }} />
              <span style={{ fontSize: 11.5, color: '#34D399', fontWeight: 700 }}>AI Online</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px', animation: 'fadeUp .6s ease both' }}>

          {/* ══ HOME TAB ══ */}
          {activeTab === 'home' && (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px', transition: 'all .25s', cursor: 'default' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.07)'; el.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.04)'; el.style.transform = ''; }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{s.e}</div>
                    <div style={{ fontSize: 34, fontWeight: 900, color: s.c, letterSpacing: '-2px', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick access modules */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Quick Access</h2>
                  <button onClick={() => setActiveTab('modules')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>View all →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
                  {modules.slice(0, 6).map((m, i) => (
                    <div key={i} className="mod-card" style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 14, padding: '16px 14px', cursor: 'pointer', transition: 'all .25s', textAlign: 'center' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px ${m.c}22`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{m.e}</div>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: m.c }}>{m.t}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4, lineHeight: 1.4 }}>{m.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent scans */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Recent Scans</h2>
                  <button onClick={() => setActiveTab('scans')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>View all →</button>
                </div>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 12 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 13.5 }}>Loading scans...</span>
                  </div>
                ) : scans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 18 }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>🫁</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>No scans yet</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>Upload your first medical scan to get started</div>
                    <button onClick={() => setActiveTab('modules')} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit' }}>
                      Choose a Module →
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden' }}>
                    {scans.slice(0, 5).map((scan, i) => {
                      const st = statusConfig[scan.status] || statusConfig.pending;
                      return (
                        <div key={i} className="scan-row" onClick={() => setSelectedScan(scan)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < scans.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none', cursor: 'pointer', transition: 'background .2s' }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {modules.find(m => m.route === scan.scan_type)?.e || '📄'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Medical Scan'}</div>
                            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{new Date(scan.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 100, padding: '4px 11px', flexShrink: 0 }}>
                            <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                            <span style={{ fontSize: 11.5, color: st.color, fontWeight: 700 }}>{st.label}</span>
                          </div>
                          <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 16 }}>›</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ MODULES TAB ══ */}
          {activeTab === 'modules' && (
            <>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 24 }}>Choose an AI module to analyze your medical data</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 13 }}>
                {modules.map((m, i) => (
                  <div key={i} className="mod-card" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${m.border}`, borderRadius: 18, padding: '24px', cursor: 'pointer', transition: 'all .28s', display: 'flex', alignItems: 'flex-start', gap: 16 }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = m.bg; el.style.boxShadow = `0 16px 40px ${m.c}18`; el.style.borderColor = m.c+'66'; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.04)'; el.style.boxShadow = ''; el.style.borderColor = m.border; }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 15, flexShrink: 0, background: m.bg, border: `1px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{m.e}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 5 }}>{m.t}</div>
                      <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{m.d}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 100, padding: '5px 13px', fontSize: 12, color: m.c, fontWeight: 700 }}>
                        Analyze Now →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ SCANS TAB ══ */}
          {activeTab === 'scans' && (
            <>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 24 }}>Complete history of your AI medical analyses</p>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: 12 }}>
                  <div style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#60A5FA', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Loading your scans...</span>
                </div>
              ) : scans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 20 }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>No scan history yet</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.3)', marginBottom: 24 }}>Your completed analyses will appear here</div>
                  <button onClick={() => setActiveTab('modules')} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '12px 26px', borderRadius: 11, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(37,99,235,.4)' }}>
                    Start First Analysis →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {scans.map((scan, i) => {
                    const st  = statusConfig[scan.status] || statusConfig.pending;
                    const mod = modules.find(m => m.route === scan.scan_type);
                    return (
                      <div key={i} className="scan-row" onClick={() => setSelectedScan(scan)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: mod?.bg || 'rgba(255,255,255,.08)', border: `1px solid ${mod?.border || 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{mod?.e || '📄'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>{scan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l: string) => l.toUpperCase()) || 'Medical Scan'}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{new Date(scan.created_at).toLocaleDateString('en-PK',{ weekday:'short', day:'numeric', month:'short', year:'numeric' })}</div>
                        </div>
                        {scan.severity && (
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>{scan.severity}</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 100, padding: '5px 12px', flexShrink: 0 }}>
                          <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: st.dot, display: 'inline-block', animation: scan.status === 'pending' ? 'pulse 2s infinite' : 'none' }} />
                          <span style={{ fontSize: 12, color: st.color, fontWeight: 700 }}>{st.label}</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 18 }}>›</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ══════════════════════════════
          SCAN DETAIL MODAL
      ══════════════════════════════ */}
      {selectedScan && (
        <div onClick={() => setSelectedScan(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(8px)', animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0D1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: 22, width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,.6)', animation: 'fadeUp .3s ease' }}>
            {/* Modal header */}
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: modules.find(m => m.route === selectedScan.scan_type)?.bg || 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {modules.find(m => m.route === selectedScan.scan_type)?.e || '📄'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{selectedScan.scan_type?.replace(/-/g,' ').replace(/\b\w/g,(l: string) => l.toUpperCase())}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>{new Date(selectedScan.created_at).toLocaleString('en-PK')}</div>
                </div>
              </div>
              <button onClick={() => setSelectedScan(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', color: 'rgba(255,255,255,.6)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            </div>
            {/* Modal body */}
            <div style={{ padding: '22px 24px' }}>
              {/* Status */}
              {(() => { const st = statusConfig[selectedScan.status] || statusConfig.pending; return (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: st.bg, border: `1px solid ${st.color}30`, borderRadius: 100, padding: '6px 14px', marginBottom: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                  <span style={{ fontSize: 12.5, color: st.color, fontWeight: 700 }}>{st.label}</span>
                </div>
              )})()}

              {/* AI Result */}
              {selectedScan.ai_result && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>AI Analysis</div>
                  <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '16px' }}>
                    <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{typeof selectedScan.ai_result === 'string' ? selectedScan.ai_result : JSON.stringify(selectedScan.ai_result, null, 2)}</p>
                  </div>
                </div>
              )}

              {/* Doctor notes */}
              {selectedScan.doctor_notes && (
                <div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Doctor's Notes</div>
                  <div style={{ background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 14, padding: '16px' }}>
                    <p style={{ color: '#34D399', fontSize: 13.5, lineHeight: 1.8 }}>{selectedScan.doctor_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}