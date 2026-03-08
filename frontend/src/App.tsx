import React, { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import { isLoggedIn, getUser, logout } from './services/api';

/* ─── Animated Counter ─── */
const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        let n = 0; const step = Math.ceil(end / 55);
        const t = setInterval(() => { n += step; if (n >= end) { setCount(end); clearInterval(t); } else setCount(n); }, 22);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end, started]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Scroll Reveal ─── */
const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(28px)', transition: `opacity .7s cubic-bezier(.4,0,.2,1) ${delay}s, transform .7s cubic-bezier(.4,0,.2,1) ${delay}s` }}>
      {children}
    </div>
  );
};

/* ─── Tag Label ─── */
const Tag = ({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) => (
  <span style={{ display: 'inline-block', background: bg, border: `1px solid ${border}`, borderRadius: 100, padding: '5px 15px', fontSize: 11, color, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, marginBottom: 18 }}>{label}</span>
);

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeMod, setActiveMod] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn()) { const u = getUser(); if (u) { setUser(u); setPage(u.role === 'doctor' ? 'doctor' : 'dashboard'); } }
  }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveMod(p => (p + 1) % 9), 2000); return () => clearInterval(t);
  }, []);

  const go = (p: string) => setPage(p);

  if (page === 'login') return <Login onLogin={(u: any) => { setUser(u); setPage(u.role === 'doctor' ? 'doctor' : 'dashboard'); }} />;
  if (page === 'dashboard') return <PatientDashboard user={user} onLogout={() => { logout(); setUser(null); setPage('home'); }} />;
  if (page === 'doctor')    return <DoctorDashboard  user={user} onLogout={() => { logout(); setUser(null); setPage('home'); }} />;

  const modules = [
    { e: '🫁', t: 'X-Ray Analysis',   d: 'Chest X-ray, MRI & CT scan with radiologist accuracy',       c: '#2563EB', bg: '#DBEAFE' },
    { e: '🦴', t: 'Bone Scan',         d: 'Fracture & bone disease detection with precision',             c: '#7C3AED', bg: '#EDE9FE' },
    { e: '💓', t: 'ECG Analyzer',      d: 'Heart rhythm & cardiac condition detection in real-time',      c: '#DC2626', bg: '#FEE2E2' },
    { e: '🧪', t: 'Blood Tests',       d: 'Full blood report with abnormal value detection',              c: '#059669', bg: '#D1FAE5' },
    { e: '🧠', t: 'Mental Health',     d: 'PHQ-9 & GAD-7 validated depression & anxiety screening',      c: '#D97706', bg: '#FEF3C7' },
    { e: '🔍', t: 'Diagnosis AI',      d: 'Symptom-based differential diagnosis with confidence scores', c: '#0891B2', bg: '#CFFAFE' },
    { e: '💊', t: 'Prescription',      d: 'Handwritten prescription reader in Urdu & English',           c: '#DB2777', bg: '#FCE7F3' },
    { e: '📊', t: 'Vital Signs',       d: 'BP, blood sugar & oxygen level monitoring & tracking',        c: '#0D9488', bg: '#CCFBF1' },
    { e: '🚨', t: 'Emergency Aid',     d: 'Instant first aid guidance for critical situations',          c: '#EA580C', bg: '#FFEDD5' },
  ];

  return (
    <div style={{ fontFamily: "'Sora','Plus Jakarta Sans',-apple-system,sans-serif", background: '#fff', color: '#0F172A', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes pkPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.65)}}
        @keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#F1F5F9}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:10px}
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6%', background: scrolled ? 'rgba(255,255,255,.95)' : 'transparent', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,.06)' : 'none', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,.055)' : 'none', transition: 'all .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 37, height: 37, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 3px 12px rgba(37,99,235,.36)' }}>🏥</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.5px' }}>MedCare <span style={{ color: '#2563EB' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => go('login')} style={{ background: 'transparent', border: '1.5px solid #E2E8F0', color: '#475569', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#2563EB'; el.style.color = '#2563EB'; el.style.background = '#EFF6FF'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#E2E8F0'; el.style.color = '#475569'; el.style.background = 'transparent'; }}
          >Login</button>
          <button onClick={() => go('login')} style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', border: 'none', color: '#fff', padding: '8px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(37,99,235,.38)', transition: 'all .2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 8px 22px rgba(37,99,235,.48)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 4px 14px rgba(37,99,235,.38)'; }}
          >Get Started →</button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(152deg,#EFF6FF 0%,#FAFFFE 45%,#F0FDF4 100%)', display: 'flex', alignItems: 'center', padding: '112px 6% 72px', position: 'relative', overflow: 'hidden' }}>
        {/* Bg blobs */}
        <div style={{ position: 'absolute', top: '-8%', right: '-12%', width: 580, height: 580, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 70%)', pointerEvents: 'none', animation: 'floatBob 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.055) 0%,transparent 70%)', pointerEvents: 'none', animation: 'floatBob 12s ease-in-out infinite reverse' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', top: '8%', right: '1.5%', opacity: .18, pointerEvents: 'none' }}>
          {[...Array(8)].map((_,r) => <div key={r} style={{ display: 'flex', gap: 18, marginBottom: 18 }}>{[...Array(8)].map((_,c) => <div key={c} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#2563EB' }} />)}</div>)}
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', gap: '5%', flexWrap: 'wrap' }}>

          {/* LEFT TEXT */}
          <div style={{ flex: '1 1 440px', maxWidth: 570, animation: 'heroIn .7s ease both' }}>
            {/* Live badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '6px 16px', marginBottom: 26 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block', animation: 'pkPulse 2s infinite' }} />
              <span style={{ fontSize: 12.5, color: '#1D4ED8', fontWeight: 700 }}>🇵🇰 Pakistan's First AI Medical Platform</span>
            </div>

            <h1 style={{ fontSize: 'clamp(38px,5vw,66px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', marginBottom: 20, color: '#0F172A' }}>
              Medical AI For<br />
              <span style={{ background: 'linear-gradient(128deg,#2563EB 0%,#7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Pakistani</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px,1.6vw,17.5px)', color: '#64748B', lineHeight: 1.8, marginBottom: 32, maxWidth: 480 }}>
              AI-powered X-ray, ECG & blood test analysis.{' '}
              <strong style={{ color: '#0F172A' }}>Free. Fast.</strong>{' '}
              In Urdu & English. No barriers — ever.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 38 }}>
              <button onClick={() => go('login')} style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', border: 'none', color: '#fff', padding: '13px 28px', borderRadius: 11, cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 6px 18px rgba(37,99,235,.38)', transition: 'all .22s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 28px rgba(37,99,235,.46)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 6px 18px rgba(37,99,235,.38)'; }}
              >Start Free Analysis →</button>
              <button style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#475569', padding: '13px 24px', borderRadius: 11, cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all .22s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#2563EB'; el.style.color = '#2563EB'; el.style.background = '#EFF6FF'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#E2E8F0'; el.style.color = '#475569'; el.style.background = '#fff'; }}
              >▶ Watch Demo</button>
            </div>

            {/* Avatars + stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ display: 'flex' }}>
                {(['#FCA5A5','#86EFAC','#93C5FD','#C4B5FD','#FCD34D'] as string[]).map((c,i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${c},${c}BB)`, border: '2.5px solid #fff', marginLeft: i === 0 ? 0 : -9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {['👨‍⚕️','👩','👨','👩‍⚕️','🧑'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 1, marginBottom: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: '#F59E0B', fontSize: 11 }}>★</span>)}</div>
                <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Trusted by <strong style={{ color: '#0F172A' }}>10,000+</strong> Pakistanis</span>
              </div>
            </div>

            {/* Trust chips */}
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {[['🔒','Secure'],['⚡','2-3 min'],['🌐','Urdu & English'],['💚','Always Free']].map(([icon,text],i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — App mockup */}
          <div style={{ flex: '1 1 330px', maxWidth: 395, animation: 'heroIn .7s .18s ease both' }}>
            <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 28px 72px rgba(0,0,0,.1),0 0 0 1px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              {/* Chrome */}
              <div style={{ background: '#F8FAFC', padding: '12px 15px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 6 }}>
                {['#EF4444','#F59E0B','#22C55E'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, margin: '0 8px', background: '#EFF6FF', borderRadius: 5, padding: '3.5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 10 }}>🔒</span>
                  <span style={{ fontSize: 10.5, color: '#64748B', fontFamily: 'monospace' }}>medcareai.app</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pkPulse 2s infinite' }} />
                  <span style={{ fontSize: 9.5, color: '#22C55E', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              {/* Modules */}
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: 9.5, color: '#94A3B8', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>AI MODULES</div>
                {modules.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 9, marginBottom: 2, transition: 'all .3s', background: activeMod === i ? m.bg : 'transparent', border: `1px solid ${activeMod === i ? m.c+'30' : 'transparent'}`, transform: activeMod === i ? 'translateX(5px)' : 'translateX(0)' }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{m.e}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: activeMod === i ? m.c : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</div>
                      {activeMod === i && <div style={{ fontSize: 10, color: '#64748B', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.d}</div>}
                    </div>
                    {activeMod === i && <div style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: m.c, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAND ═══ */}
      <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', padding: '52px 6%' }}>
        <Reveal>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, textAlign: 'center' }}>
            {[
              { n: 10000, s: '+', label: 'Patients Served',   e: '🏥', col: '#60A5FA' },
              { n: 9,     s: '',  label: 'AI Modules',        e: '🤖', col: '#34D399' },
              { n: 98,    s: '%', label: 'Accuracy Rate',     e: '🎯', col: '#FBBF24' },
              { n: 100,   s: '%', label: 'Free for Patients', e: '💚', col: '#F472B6' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.e}</div>
                <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-2px', color: s.col, lineHeight: 1 }}><Counter end={s.n} suffix={s.s} /></div>
                <div style={{ color: '#64748B', fontSize: 13, marginTop: 7, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ═══ 9 MODULES ═══ */}
      <section style={{ padding: '96px 6%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <Tag label="Capabilities" color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 10 }}>9 Medical AI Modules</h2>
              <p style={{ color: '#64748B', fontSize: 15.5, maxWidth: 420, margin: '0 auto' }}>Powered by LLaVA-Med — Nature Medicine 2024 by Microsoft Research</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 13 }}>
            {modules.map((m, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 18, padding: '22px', cursor: 'pointer', transition: 'all .26s', display: 'flex', alignItems: 'flex-start', gap: 15, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = m.c+'44'; el.style.transform = 'translateY(-5px)'; el.style.boxShadow = `0 18px 40px ${m.c}18`; el.style.background = m.bg+'AA'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#F1F5F9'; el.style.transform = ''; el.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; el.style.background = '#fff'; }}
                  onClick={() => go('login')}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23 }}>{m.e}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0F172A', marginBottom: 5 }}>{m.t}</div>
                    <div style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>{m.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: '96px 6%', background: '#fff' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <Tag label="Process" color="#16A34A" bg="#F0FDF4" border="#BBF7D0" />
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A' }}>How It Works</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 13 }}>
            {[
              { n: '01', e: '📤', t: 'Upload Scan',     d: 'Drag & drop your X-ray, ECG, or blood report image',         c: '#2563EB', bg: '#EFF6FF', b: '#BFDBFE' },
              { n: '02', e: '⚡', t: 'AI Analyzes',     d: 'LLaVA-Med processes with medical precision in 2–3 min',      c: '#7C3AED', bg: '#F5F3FF', b: '#DDD6FE' },
              { n: '03', e: '📋', t: 'Get Report',      d: 'Detailed findings in Urdu & English instantly',              c: '#059669', bg: '#F0FDF4', b: '#BBF7D0' },
              { n: '04', e: '👨‍⚕️', t: 'Doctor Reviews',  d: 'Certified physicians verify & approve your report',         c: '#D97706', bg: '#FFFBEB', b: '#FDE68A' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.09}>
                <div style={{ background: s.bg, border: `1.5px solid ${s.b}`, borderRadius: 20, padding: '28px 20px', textAlign: 'center', transition: 'all .26s', height: '100%' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = `0 20px 44px ${s.c}18`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: s.c, letterSpacing: '.12em', marginBottom: 12 }}>{s.n}</div>
                  <div style={{ width: 58, height: 58, borderRadius: 17, margin: '0 auto 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 12px rgba(0,0,0,.07)' }}>{s.e}</div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: '#0F172A', marginBottom: 8 }}>{s.t}</div>
                  <div style={{ color: '#64748B', fontSize: 13, lineHeight: 1.65 }}>{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PAKISTAN COVERAGE ═══ */}
      <section style={{ padding: '72px 6%', background: 'linear-gradient(148deg,#EFF6FF 0%,#F5F3FF 100%)', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <Reveal>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🇵🇰</div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 10 }}>Serving All of Pakistan</h2>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 30 }}>Free AI medical analysis — every city, every village, 24/7</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad','Hyderabad','Sialkot'].map((city,i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #BFDBFE', borderRadius: 100, padding: '8px 18px', fontSize: 13.5, color: '#1D4ED8', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,.08)', cursor: 'default', transition: 'all .2s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.background = '#EFF6FF'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,.16)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.background = '#fff'; el.style.boxShadow = '0 2px 8px rgba(37,99,235,.08)'; }}
                >{city}</div>
              ))}
              <div style={{ background: '#2563EB', border: '1.5px solid #2563EB', borderRadius: 100, padding: '8px 18px', fontSize: 13.5, color: '#fff', fontWeight: 700 }}>+ 200 more cities</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: '96px 6%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <Tag label="Testimonials" color="#DB2777" bg="#FDF2F8" border="#FBCFE8" />
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A' }}>Trusted by Doctors & Patients</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 13 }}>
            {[
              { n: 'Dr. Ahmed Khan',   r: 'Cardiologist, Lahore',    t: 'The ECG analysis is remarkably accurate. Saves our team hours of manual review every single day.', e: '👨‍⚕️', c: '#2563EB', bg: '#EFF6FF' },
              { n: 'Fatima Malik',     r: 'Patient, Karachi',         t: 'Got my X-ray analyzed in 3 minutes. The Urdu report was a complete game changer for our family.', e: '👩',    c: '#059669', bg: '#F0FDF4' },
              { n: 'Dr. Sara Hussain', r: 'Radiologist, Islamabad',   t: 'LLaVA-Med integration is outstanding. Every rural clinic in Pakistan should be using this.',      e: '👩‍⚕️', c: '#7C3AED', bg: '#F5F3FF' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '26px', transition: 'all .26s', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 18px 40px rgba(0,0,0,.07)'; el.style.borderColor = '#E2E8F0'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; el.style.borderColor = '#F1F5F9'; }}
                >
                  <div style={{ color: '#F59E0B', fontSize: 14, marginBottom: 14, letterSpacing: 3 }}>★★★★★</div>
                  <p style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.76, marginBottom: 20, fontStyle: 'italic', flex: 1 }}>"{t.t}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{t.e}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>{t.n}</div>
                      <div style={{ color: '#94A3B8', fontSize: 11.5, marginTop: 2 }}>{t.r}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section style={{ padding: '96px 6%', background: '#fff' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Tag label="Why MedCare AI" color="#DC2626" bg="#FEF2F2" border="#FECACA" />
              <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 10 }}>Traditional vs AI-Powered</h2>
              <p style={{ color: '#64748B', fontSize: 15 }}>See why 10,000+ Pakistanis chose MedCare AI</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ borderRadius: 22, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.055)' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', background: 'linear-gradient(135deg,#0F172A,#1E293B)' }}>
                <div style={{ padding: '17px 22px', fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>Feature</div>
                <div style={{ padding: '17px 22px', fontSize: 12.5, color: '#94A3B8', fontWeight: 700, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,.06)' }}>Traditional Hospital</div>
                <div style={{ padding: '17px 22px', fontSize: 12.5, color: '#60A5FA', fontWeight: 800, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  🏥 MedCare AI
                  <span style={{ background: '#2563EB', color: '#fff', fontSize: 8.5, padding: '2px 7px', borderRadius: 100, fontWeight: 700 }}>BEST</span>
                </div>
              </div>
              {/* Rows */}
              {[
                { f: 'Report Time',    bad: '2–5 days',             good: '2–3 minutes' },
                { f: 'Cost',           bad: 'Rs. 2,000–10,000',     good: 'Completely Free' },
                { f: 'Urdu Reports',   bad: 'Rarely available',     good: 'Always included' },
                { f: 'Available 24/7', bad: 'No (working hours)',   good: 'Yes, always' },
                { f: 'Doctor Review',  bad: 'Sometimes',            good: 'Yes — certified' },
                { f: 'Rural Access',   bad: 'Very limited',         good: 'Anywhere in Pakistan' },
                { f: 'AI Accuracy',    bad: 'Human only',           good: 'LLaVA-Med (Nature Medicine)' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', borderTop: '1px solid #F1F5F9', background: i % 2 ? '#FAFAFA' : '#fff' }}>
                  <div style={{ padding: '14px 22px', fontSize: 13.5, color: '#374151', fontWeight: 600 }}>{r.f}</div>
                  <div style={{ padding: '14px 22px', fontSize: 13, color: '#9CA3AF', textAlign: 'center', borderLeft: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <span style={{ color: '#EF4444', fontWeight: 800, fontSize: 14 }}>✕</span> {r.bad}
                  </div>
                  <div style={{ padding: '14px 22px', fontSize: 13, color: '#16A34A', textAlign: 'center', borderLeft: '1px solid #F1F5F9', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <span style={{ color: '#16A34A', fontWeight: 800, fontSize: 14 }}>✓</span> {r.good}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: '96px 6%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Tag label="FAQ" color="#D97706" bg="#FFFBEB" border="#FDE68A" />
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A' }}>Common Questions</h2>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Is MedCare AI really free?',        a: 'Yes — completely free for all patients. We believe every Pakistani deserves access to quality healthcare regardless of income.' },
              { q: 'How accurate is the AI?',            a: 'Powered by LLaVA-Med, published in Nature Medicine 2024 by Microsoft Research. It achieves radiologist-level accuracy on X-rays and ECGs.' },
              { q: 'Is my medical data safe?',           a: 'Yes. End-to-end encryption is used. Your scans are never shared with third parties. You own your data completely.' },
              { q: 'Do I still need a real doctor?',     a: 'All AI reports are reviewed and approved by certified Pakistani physicians before being finalized. AI assists — doctors decide.' },
              { q: 'Which languages are supported?',     a: 'All reports are available in Urdu & English. Urdu support is optimised specifically for Pakistani patients.' },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{ background: '#fff', border: `1.5px solid ${openFaq === i ? '#BFDBFE' : '#F1F5F9'}`, borderRadius: 15, overflow: 'hidden', transition: 'all .26s', boxShadow: openFaq === i ? '0 4px 18px rgba(37,99,235,.09)' : '0 1px 4px rgba(0,0,0,.04)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '17px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0F172A' }}>{faq.q}</span>
                    <span style={{ fontSize: 22, color: '#2563EB', flexShrink: 0, transition: 'transform .26s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', lineHeight: 1, display: 'inline-block' }}>+</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 22px 17px', color: '#64748B', fontSize: 13.5, lineHeight: 1.74 }}>{faq.a}</div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POWERED BY ═══ */}
      <section style={{ padding: '64px 6%', background: '#fff', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
        <Reveal>
          <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 28 }}>Powered by world-class technology</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {[
                { n: 'Microsoft Research', e: '💻', c: '#0078D4', bg: '#F0F8FF', b: '#BAE0FF' },
                { n: 'Nature Medicine',    e: '🔬', c: '#16A34A', bg: '#F0FDF4', b: '#BBF7D0' },
                { n: 'Google Cloud',       e: '☁️',  c: '#4285F4', bg: '#EFF6FF', b: '#BFDBFE' },
                { n: 'LLaVA-Med AI',       e: '🧠', c: '#7C3AED', bg: '#F5F3FF', b: '#DDD6FE' },
                { n: 'Atomcamp Cohort 15', e: '🚀', c: '#EA580C', bg: '#FFF7ED', b: '#FED7AA' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: p.bg, border: `1.5px solid ${p.b}`, borderRadius: 13, padding: '10px 18px', transition: 'all .22s', cursor: 'default' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 7px 20px ${p.c}18`; el.style.borderColor = p.c+'55'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = p.b; }}
                >
                  <span style={{ fontSize: 19 }}>{p.e}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: p.c }}>{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '80px 6% 96px', background: '#F8FAFC' }}>
        <Reveal>
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg,#1D4ED8 0%,#1E1B4B 100%)', borderRadius: 26, padding: '64px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 28px 72px rgba(37,99,235,.22)' }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 46, marginBottom: 16 }}>🇵🇰</div>
              <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', marginBottom: 12 }}>Healthcare for Every Pakistani</h2>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15.5, marginBottom: 32, lineHeight: 1.74 }}>
                Join 10,000+ Pakistanis getting AI-powered medical insights.<br />No cost. No barriers. Always free.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => go('login')} style={{ background: '#fff', border: 'none', color: '#1D4ED8', padding: '13px 32px', borderRadius: 11, cursor: 'pointer', fontSize: 15.5, fontWeight: 800, boxShadow: '0 6px 20px rgba(0,0,0,.18)', transition: 'all .22s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,.26)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 6px 20px rgba(0,0,0,.18)'; }}
                >Start Free Analysis →</button>
                <button style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', color: '#fff', padding: '13px 24px', borderRadius: 11, cursor: 'pointer', fontSize: 14.5, fontWeight: 600, transition: 'all .22s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.18)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.1)'; }}
                >▶ Watch Demo</button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#0F172A', padding: '52px 6% 30px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 36, marginBottom: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>MedCare <span style={{ color: '#60A5FA' }}>AI</span></span>
              </div>
              <p style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.74, maxWidth: 180 }}>Pakistan's first AI-powered medical platform. Free for everyone.</p>
            </div>
            {[
              { title: 'Product', links: ['X-Ray Analysis','ECG Analyzer','Blood Tests','All Modules'] },
              { title: 'Company', links: ['About Us','Blog','Careers','Contact'] },
              { title: 'Legal',   links: ['Privacy Policy','Terms of Use','Data Policy'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ color: '#475569', fontSize: 12.5, marginBottom: 8, cursor: 'pointer', transition: 'color .18s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#94A3B8'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#475569'; }}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#334155', fontSize: 12 }}>© 2026 MedCare AI — Built with ❤️ by Syed Hassan Tayyab — Atomcamp Cohort 15</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['𝕏','in','⚕️'].map((icon,i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#475569', transition: 'all .18s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.12)'; el.style.color = '#94A3B8'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.06)'; el.style.color = '#475569'; }}
                >{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}