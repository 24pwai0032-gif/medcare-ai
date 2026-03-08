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
        let n = 0; const step = Math.ceil(end / 60);
        const t = setInterval(() => { n += step; if (n >= end) { setCount(end); clearInterval(t); } else setCount(n); }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end, started]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Scroll Reveal ─── */
const Reveal = ({ children, delay = 0, from = 'bottom' }: { children: React.ReactNode; delay?: number; from?: 'bottom' | 'left' | 'right' }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.07 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const init = from === 'left' ? 'translate(-40px,0)' : from === 'right' ? 'translate(40px,0)' : 'translate(0,36px)';
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translate(0,0)' : init, transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeMod, setActiveMod] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [subDone, setSubDone] = useState(false);
  const [mobileCtaVis, setMobileCtaVis] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) { const u = getUser(); if (u) { setUser(u); setPage(u.role === 'doctor' ? 'doctor' : 'dashboard'); } }
  }, []);
  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 24); setScrollY(window.scrollY); setMobileCtaVis(window.scrollY > 400); };
    window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { const t = setInterval(() => setActiveMod(p => (p + 1) % 9), 2000); return () => clearInterval(t); }, []);

  const go = (p: string) => setPage(p);
  const handleSub = () => { if (email.includes('@')) setSubDone(true); };

  if (page === 'login') return <Login onLogin={(u: any) => { setUser(u); setPage(u.role === 'doctor' ? 'doctor' : 'dashboard'); }} />;
  if (page === 'dashboard') return <PatientDashboard user={user} onLogout={() => { logout(); setUser(null); setPage('home'); }} />;
  if (page === 'doctor')    return <DoctorDashboard  user={user} onLogout={() => { logout(); setUser(null); setPage('home'); }} />;

  const modules = [
    { e: '🫁', t: 'X-Ray Analysis',  d: 'Chest X-ray, MRI & CT scan with radiologist-level accuracy', c: '#2563EB', bg: '#DBEAFE', light: '#EFF6FF' },
    { e: '🦴', t: 'Bone Scan',        d: 'Fracture & bone disease detection with orthopedic precision', c: '#7C3AED', bg: '#EDE9FE', light: '#F5F3FF' },
    { e: '💓', t: 'ECG Analyzer',     d: 'Heart rhythm & cardiac condition detection in real-time',     c: '#DC2626', bg: '#FEE2E2', light: '#FEF2F2' },
    { e: '🧪', t: 'Blood Tests',      d: 'Full blood report with abnormal value detection & flagging',  c: '#059669', bg: '#D1FAE5', light: '#F0FDF4' },
    { e: '🧠', t: 'Mental Health',    d: 'PHQ-9 & GAD-7 validated depression & anxiety screening',     c: '#D97706', bg: '#FEF3C7', light: '#FFFBEB' },
    { e: '🔍', t: 'Diagnosis AI',     d: 'Symptom-based differential diagnosis with confidence scores',c: '#0891B2', bg: '#CFFAFE', light: '#F0F9FF' },
    { e: '💊', t: 'Prescription',     d: 'Handwritten prescription reader in Urdu & English',          c: '#DB2777', bg: '#FCE7F3', light: '#FDF2F8' },
    { e: '📊', t: 'Vital Signs',      d: 'BP, blood sugar & oxygen level monitoring & tracking',       c: '#0D9488', bg: '#CCFBF1', light: '#F0FDFA' },
    { e: '🚨', t: 'Emergency Aid',    d: 'Instant first aid guidance for critical situations',         c: '#EA580C', bg: '#FFEDD5', light: '#FFF7ED' },
  ];

  return (
    <div style={{ fontFamily: "'Sora', 'Plus Jakarta Sans', -apple-system, sans-serif", background: '#060A14', color: '#fff', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }

        /* Grain texture overlay */
        body::before {
          content:''; position:fixed; top:0; left:0; right:0; bottom:0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events:none; z-index:9998; opacity:.55;
        }

        @keyframes blobFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(.97)} }
        @keyframes blobFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,40px) scale(1.04)} 66%{transform:translate(25px,-15px) scale(.98)} }
        @keyframes blobFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,30px) scale(1.06)} }
        @keyframes heroTextIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mockupIn  { from{opacity:0;transform:translateY(40px) rotate(-2deg)} to{opacity:1;transform:translateY(0) rotate(0deg)} }
        @keyframes pulse3    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.6)} }
        @keyframes scanLine  { from{top:0%} to{top:100%} }
        @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes badgeIn   { from{opacity:0;transform:scale(.8) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060A14; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }

        .section-light { background: #fff; color: #0F172A; }
        .section-light h2, .section-light h3 { color: #0F172A; }
        .section-light p { color: #64748B; }

        .card-hover { transition: all .28s cubic-bezier(.22,1,.36,1); }
        .card-hover:hover { transform: translateY(-6px); }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .hide-mobile { display: none !important; }
          .mobile-full { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* ════════════════════════════════════
          ANIMATED MESH BACKGROUND
      ════════════════════════════════════ */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Blob 1 — blue */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'blobFloat1 14s ease-in-out infinite' }} />
        {/* Blob 2 — purple */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '45vw', height: '45vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'blobFloat2 18s ease-in-out infinite' }} />
        {/* Blob 3 — teal */}
        <div style={{ position: 'absolute', bottom: '-5%', left: '25%', width: '40vw', height: '40vw', maxWidth: 550, maxHeight: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 65%)', filter: 'blur(80px)', animation: 'blobFloat3 22s ease-in-out infinite' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ════════════════════════════════════
          NAVBAR
      ════════════════════════════════════ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6%', background: scrolled ? 'rgba(6,10,20,0.88)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 4px 16px rgba(37,99,235,.5)' }}>🏥</div>
          <span style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: '-.5px', color: '#fff' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
        </div>

        {/* Nav links — desktop */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 28, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {[['Features','#modules'],['Process','#process'],['FAQ','#faq']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: 'rgba(255,255,255,.55)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', transition: 'color .2s', letterSpacing: '-.2px' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,.55)'; }}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => go('login')} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)', padding: '8px 18px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.13)'; el.style.color = '#fff'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.07)'; el.style.color = 'rgba(255,255,255,.8)'; }}
          >Login</button>
          <button onClick={() => go('login')} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(37,99,235,.45)', transition: 'all .2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 8px 24px rgba(37,99,235,.55)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 4px 16px rgba(37,99,235,.45)'; }}
          >Get Started →</button>
        </div>
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '110px 6% 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6%', flexWrap: 'wrap' }} className="hero-grid">

          {/* ── LEFT ── */}
          <div style={{ flex: '1 1 460px', maxWidth: 600 }} className="mobile-full">

            {/* Urgency badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,.15)', border: '1px solid rgba(37,99,235,.35)', borderRadius: 100, padding: '7px 16px', marginBottom: 28, animation: 'badgeIn .6s .1s ease both', backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse3 2s infinite', boxShadow: '0 0 6px #22C55E' }} />
              <span style={{ fontSize: 12.5, color: '#93C5FD', fontWeight: 700, letterSpacing: '.02em' }}>🇵🇰 Pakistan's First AI Medical Platform — Live Now</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(40px,5.8vw,76px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-3px', marginBottom: 22, animation: 'heroTextIn .8s .2s ease both', opacity: 0 }}>
              <span style={{ color: '#fff' }}>Your Doctor</span><br />
              <span style={{ color: '#fff' }}>is Now </span>
              <span style={{ background: 'linear-gradient(130deg,#60A5FA 0%,#A78BFA 50%,#F472B6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradShift 5s ease infinite' }}>Always Home</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px,1.7vw,18px)', color: 'rgba(255,255,255,.6)', lineHeight: 1.82, marginBottom: 36, maxWidth: 500, animation: 'heroTextIn .8s .35s ease both', opacity: 0 }}>
              AI-powered X-ray, ECG & blood test analysis in <strong style={{ color: '#fff' }}>2-3 minutes</strong>. Free forever. In Urdu & English. No waiting rooms — no bills.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44, animation: 'heroTextIn .8s .45s ease both', opacity: 0 }}>
              <button onClick={() => go('login')} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '15px 30px', borderRadius: 12, cursor: 'pointer', fontSize: 15.5, fontWeight: 700, boxShadow: '0 8px 28px rgba(37,99,235,.5)', transition: 'all .25s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 14px 36px rgba(37,99,235,.6)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 8px 28px rgba(37,99,235,.5)'; }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>Start Free Analysis →</span>
                {/* shimmer */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite' }} />
              </button>
              <button style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', color: 'rgba(255,255,255,.8)', padding: '15px 24px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all .25s', backdropFilter: 'blur(8px)' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.11)'; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,.25)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.06)'; el.style.color = 'rgba(255,255,255,.8)'; el.style.borderColor = 'rgba(255,255,255,.14)'; }}
              >▶ Watch Demo</button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26, animation: 'heroTextIn .8s .55s ease both', opacity: 0 }}>
              <div style={{ display: 'flex' }}>
                {(['#FCA5A5','#86EFAC','#93C5FD','#C4B5FD','#FCD34D'] as string[]).map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${c},${c}99)`, border: '2.5px solid #060A14', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                    {['👨‍⚕️','👩','👨','👩‍⚕️','🧑'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 1, marginBottom: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: '#FBBF24', fontSize: 12 }}>★</span>)}</div>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>Trusted by <strong style={{ color: '#fff' }}>10,000+</strong> Pakistanis</span>
              </div>
            </div>

            {/* Trust chips */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'heroTextIn .8s .65s ease both', opacity: 0 }}>
              {[['🔒','Encrypted & Private'],['⚡','2-3 min results'],['🌐','Urdu & English'],['💚','Always Free']].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Floating App Mockup ── */}
          <div style={{ flex: '1 1 340px', maxWidth: 400, animation: 'mockupIn .9s .3s cubic-bezier(.22,1,.36,1) both', opacity: 0 }} className="mobile-full">
            {/* Glow behind mockup */}
            <div style={{ position: 'absolute', width: '110%', height: '110%', borderRadius: 28, background: 'radial-gradient(ellipse, rgba(37,99,235,.2) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translateY(10%)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, background: 'rgba(15,23,42,.85)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)' }}>
              {/* Chrome */}
              <div style={{ background: 'rgba(255,255,255,.04)', padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {['#EF4444','#F59E0B','#22C55E'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .8 }} />)}
                <div style={{ flex: 1, margin: '0 8px', background: 'rgba(255,255,255,.06)', borderRadius: 5, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 9.5 }}>🔒</span>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', fontFamily: 'monospace' }}>medcareai.app</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E', animation: 'pulse3 2s infinite' }} />
                  <span style={{ fontSize: 9.5, color: '#22C55E', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              {/* Module list */}
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.25)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>AI MODULES</div>
                {modules.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, marginBottom: 2, transition: 'all .32s', background: activeMod === i ? `${m.c}22` : 'transparent', border: `1px solid ${activeMod === i ? m.c+'44' : 'transparent'}`, transform: activeMod === i ? 'translateX(6px)' : 'translateX(0)' }}>
                    <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0 }}>{m.e}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: activeMod === i ? m.c : 'rgba(255,255,255,.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</div>
                      {activeMod === i && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.d}</div>}
                    </div>
                    {activeMod === i && <div style={{ width: 5, height: 5, borderRadius: '50%', background: m.c, flexShrink: 0, boxShadow: `0 0 6px ${m.c}` }} />}
                  </div>
                ))}
              </div>
              {/* Scan line animation */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,99,235,.6),transparent)', animation: 'scanLine 3s linear infinite', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: .4 }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom,rgba(255,255,255,.5),transparent)' }} />
        </div>
      </section>

      {/* ════════════════════════════════════
          PRESS BAR
      ════════════════════════════════════ */}
      <div style={{ background: 'rgba(255,255,255,.03)', borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '22px 6%', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', flexShrink: 0 }}>As seen in</span>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)', flexShrink: 0 }} className="hide-mobile" />
            {['Dawn News','Geo TV','ARY Digital','Express Tribune','The News'].map((outlet, i) => (
              <div key={i} style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.22)', letterSpacing: '-.3px', transition: 'color .2s', cursor: 'default', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.22)'; }}
              >{outlet}</div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ════════════════════════════════════
          STATS — with visual context
      ════════════════════════════════════ */}
      <section style={{ padding: '96px 6%', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 2 }}>
            {[
              { n: 10000, s: '+', label: 'Patients Served',   e: '🏥', col: '#60A5FA', desc: 'Across all of Pakistan' },
              { n: 9,     s: '',  label: 'AI Modules',        e: '🤖', col: '#A78BFA', desc: 'Covering all major scans' },
              { n: 98,    s: '%', label: 'Accuracy Rate',     e: '🎯', col: '#FBBF24', desc: 'Radiologist-level results' },
              { n: 100,   s: '%', label: 'Free for Patients', e: '💚', col: '#34D399', desc: 'No hidden charges. Ever.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '36px 28px', textAlign: 'center', transition: 'all .28s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.06)'; el.style.borderColor = 'rgba(255,255,255,.1)'; el.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.03)'; el.style.borderColor = 'rgba(255,255,255,.06)'; el.style.transform = ''; }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.e}</div>
                <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-3px', color: s.col, lineHeight: 1, marginBottom: 6 }}><Counter end={s.n} suffix={s.s} /></div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 12 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          DIAGONAL DIVIDER + LIGHT SECTION
      ════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Diagonal cut top */}
        <div style={{ height: 80, background: '#fff', clipPath: 'polygon(0 100%, 100% 0, 100% 100%)', marginBottom: -1 }} />
      </div>

      {/* ════════════════════════════════════
          9 MODULES (Light section)
      ════════════════════════════════════ */}
      <section id="modules" style={{ padding: '80px 6% 100px', background: '#fff', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ display: 'inline-block', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '5px 15px', fontSize: 11, color: '#2563EB', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Capabilities</span>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-2px', color: '#0F172A', marginBottom: 12 }}>9 Medical AI Modules</h2>
              <p style={{ color: '#64748B', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>Powered by LLaVA-Med — Nature Medicine 2024 by Microsoft Research</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {modules.map((m, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="card-hover" style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 18, padding: '22px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 15, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = m.c+'44'; el.style.boxShadow = `0 20px 44px ${m.c}18`; el.style.background = m.light; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#F1F5F9'; el.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; el.style.background = '#fff'; }}
                  onClick={() => go('login')}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23 }}>{m.e}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0F172A', marginBottom: 4 }}>{m.t}</div>
                    <div style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>{m.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          DIAGONAL DIVIDER back to dark
      ════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: 80, background: '#fff', clipPath: 'polygon(0 0, 100% 0, 0 100%)', marginBottom: -1 }} />
      </div>

      {/* ════════════════════════════════════
          HOW IT WORKS (Dark)
      ════════════════════════════════════ */}
      <section id="process" style={{ padding: '80px 6% 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ display: 'inline-block', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 100, padding: '5px 15px', fontSize: 11, color: '#34D399', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Process</span>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff' }}>How It Works</h2>
            </div>
          </Reveal>

          {/* Step flow with connector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, position: 'relative' }}>
            {[
              { n:'01', e:'📤', t:'Upload Scan',    d:'Drag & drop your X-ray, ECG, or blood report',       c:'#60A5FA', border:'rgba(96,165,250,.3)' },
              { n:'02', e:'⚡', t:'AI Analyzes',    d:'LLaVA-Med processes with precision in 2-3 min',      c:'#A78BFA', border:'rgba(167,139,250,.3)' },
              { n:'03', e:'📋', t:'Get Report',     d:'Detailed findings in Urdu & English instantly',     c:'#34D399', border:'rgba(52,211,153,.3)' },
              { n:'04', e:'👨‍⚕️', t:'Doctor Approves', d:'Certified physician verifies & signs off',         c:'#FBBF24', border:'rgba(251,191,36,.3)' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="card-hover" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${s.border}`, borderRadius: 20, padding: '30px 20px', textAlign: 'center', backdropFilter: 'blur(10px)', height: '100%' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.07)'; el.style.boxShadow = `0 20px 50px ${s.c}18`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.04)'; el.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: s.c, letterSpacing: '.15em', marginBottom: 14, opacity: .7 }}>{s.n}</div>
                  <div style={{ width: 62, height: 62, borderRadius: 18, margin: '0 auto 18px', background: `${s.c}18`, border: `1px solid ${s.c}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{s.e}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>{s.t}</div>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, lineHeight: 1.65 }}>{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PAKISTAN COVERAGE (Light)
      ════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: 80, background: '#F8FAFC', clipPath: 'polygon(0 100%, 100% 0, 100% 100%)', marginBottom: -1 }} />
      </div>
      <section style={{ padding: '72px 6%', background: '#F8FAFC', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>🇵🇰</div>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 10 }}>Serving All of Pakistan</h2>
            <p style={{ color: '#64748B', fontSize: 15, marginBottom: 30 }}>Free AI medical analysis — every city, every village, 24/7</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad','Hyderabad','Sialkot'].map((city, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #BFDBFE', borderRadius: 100, padding: '8px 18px', fontSize: 13.5, color: '#1D4ED8', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,.08)', transition: 'all .22s', cursor: 'default' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#EFF6FF'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 18px rgba(37,99,235,.16)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#fff'; el.style.transform = ''; el.style.boxShadow = '0 2px 8px rgba(37,99,235,.08)'; }}
                >{city}</div>
              ))}
              <div style={{ background: '#2563EB', borderRadius: 100, padding: '8px 18px', fontSize: 13.5, color: '#fff', fontWeight: 700 }}>+ 200 more cities</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          TESTIMONIALS (Light)
      ════════════════════════════════════ */}
      <section style={{ padding: '96px 6%', background: '#fff', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ display: 'inline-block', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: 100, padding: '5px 15px', fontSize: 11, color: '#DB2777', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Testimonials</span>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-2px', color: '#0F172A' }}>Trusted by Doctors & Patients</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
            {[
              { n:'Dr. Ahmed Khan',   r:'Cardiologist, Lahore',    t:'The ECG analysis is remarkably accurate. It saves our entire team hours of manual review every single day.',  e:'👨‍⚕️', c:'#2563EB', bg:'#EFF6FF' },
              { n:'Fatima Malik',     r:'Patient, Karachi',         t:'Got my X-ray analyzed in 3 minutes. The Urdu report was a complete game changer for me and my family.',      e:'👩',    c:'#059669', bg:'#F0FDF4' },
              { n:'Dr. Sara Hussain', r:'Radiologist, Islamabad',   t:'LLaVA-Med integration is genuinely impressive. Every rural clinic across Pakistan should be using this.',    e:'👩‍⚕️', c:'#7C3AED', bg:'#F5F3FF' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="card-hover" style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '26px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = '0 18px 44px rgba(0,0,0,.08)'; el.style.borderColor = '#E2E8F0'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; el.style.borderColor = '#F1F5F9'; }}
                >
                  {/* Quote mark */}
                  <div style={{ fontSize: 36, color: t.c, opacity: .2, lineHeight: 1, marginBottom: 8, fontFamily: 'Georgia, serif' }}>"</div>
                  <div style={{ color: '#FBBF24', fontSize: 13, marginBottom: 12, letterSpacing: 3 }}>★★★★★</div>
                  <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.78, marginBottom: 22, fontStyle: 'italic', flex: 1 }}>"{t.t}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `2px solid ${t.c}22` }}>{t.e}</div>
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

      {/* ════════════════════════════════════
          COMPARISON (Light)
      ════════════════════════════════════ */}
      <section style={{ padding: '96px 6%', background: '#F8FAFC', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span style={{ display: 'inline-block', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 100, padding: '5px 15px', fontSize: 11, color: '#DC2626', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>Why MedCare AI</span>
              <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 800, letterSpacing: '-2px', color: '#0F172A', marginBottom: 10 }}>Traditional vs AI-Powered</h2>
              <p style={{ color: '#64748B', fontSize: 15 }}>The choice is obvious</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ borderRadius: 22, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 8px 36px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', background: 'linear-gradient(135deg,#0F172A,#1E293B)' }}>
                <div style={{ padding: '18px 22px', fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Feature</div>
                <div style={{ padding: '18px 22px', fontSize: 12, color: '#94A3B8', fontWeight: 700, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,.06)', letterSpacing: '.02em' }}>Traditional Hospital</div>
                <div style={{ padding: '18px 22px', fontSize: 12, color: '#60A5FA', fontWeight: 800, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  🏥 MedCare AI <span style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 8, padding: '2px 7px', borderRadius: 100, fontWeight: 800 }}>BEST</span>
                </div>
              </div>
              {[
                { f:'Report Time',    bad:'2–5 days',             good:'2–3 minutes' },
                { f:'Cost',           bad:'Rs. 2,000–10,000',     good:'Completely Free' },
                { f:'Urdu Reports',   bad:'Rarely available',     good:'Always included' },
                { f:'Available 24/7', bad:'No (office hours)',    good:'Yes, always' },
                { f:'Doctor Review',  bad:'Sometimes delayed',    good:'Certified — guaranteed' },
                { f:'Rural Access',   bad:'Very limited',         good:'Anywhere in Pakistan' },
                { f:'AI Accuracy',    bad:'Human only',           good:'LLaVA-Med (Nature Medicine)' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', borderTop: '1px solid #F1F5F9', background: i % 2 ? '#FAFAFA' : '#fff', transition: 'background .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0F9FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 ? '#FAFAFA' : '#fff'; }}
                >
                  <div style={{ padding: '14px 22px', fontSize: 13.5, color: '#374151', fontWeight: 600 }}>{r.f}</div>
                  <div style={{ padding: '14px 22px', fontSize: 13, color: '#9CA3AF', textAlign: 'center', borderLeft: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <span style={{ color: '#EF4444', fontWeight: 900 }}>✕</span> {r.bad}
                  </div>
                  <div style={{ padding: '14px 22px', fontSize: 13, color: '#16A34A', textAlign: 'center', borderLeft: '1px solid #F1F5F9', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <span style={{ color: '#16A34A', fontWeight: 900 }}>✓</span> {r.good}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ (Dark)
      ════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: 80, background: '#F8FAFC', clipPath: 'polygon(0 0, 100% 0, 0 100%)', marginBottom: -1 }} />
      </div>
      <section id="faq" style={{ padding: '80px 6% 96px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span style={{ display: 'inline-block', background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 100, padding: '5px 15px', fontSize: 11, color: '#FBBF24', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>FAQ</span>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff' }}>Common Questions</h2>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q:'Is MedCare AI really free?',       a:'Yes — completely free for all patients. We believe every Pakistani deserves access to quality healthcare, regardless of income or location.' },
              { q:'How accurate is the AI?',           a:'Powered by LLaVA-Med, published in Nature Medicine 2024 by Microsoft Research. It achieves radiologist-level accuracy on X-rays, ECGs, and blood reports.' },
              { q:'Is my medical data safe?',          a:'Absolutely. We use end-to-end encryption. Your scans and reports are never shared with any third parties. You own your data — always.' },
              { q:'Do I still need a real doctor?',    a:'All AI reports are reviewed and approved by certified Pakistani physicians before being finalized. AI assists — doctors decide. It is a collaboration.' },
              { q:'Which languages are supported?',    a:'All reports are available in both Urdu and English. Our Urdu support is specifically optimised for Pakistani patients including regional medical terminology.' },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{ background: openFaq === i ? 'rgba(37,99,235,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${openFaq === i ? 'rgba(96,165,250,.35)' : 'rgba(255,255,255,.08)'}`, borderRadius: 15, overflow: 'hidden', transition: 'all .28s', backdropFilter: 'blur(10px)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: openFaq === i ? '#93C5FD' : 'rgba(255,255,255,.85)' }}>{faq.q}</span>
                    <span style={{ fontSize: 22, color: '#60A5FA', flexShrink: 0, transition: 'transform .28s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', lineHeight: 1, display: 'inline-block' }}>+</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 22px 18px', color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.76 }}>{faq.a}</div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          POWERED BY
      ════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '52px 6%', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 28 }}>Powered by world-class technology</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {[
                { n:'Microsoft Research', e:'💻', c:'#60A5FA', b:'rgba(96,165,250,.2)' },
                { n:'Nature Medicine',    e:'🔬', c:'#34D399', b:'rgba(52,211,153,.2)' },
                { n:'Google Cloud',       e:'☁️',  c:'#93C5FD', b:'rgba(147,197,253,.2)' },
                { n:'LLaVA-Med AI',       e:'🧠', c:'#A78BFA', b:'rgba(167,139,250,.2)' },
                { n:'Atomcamp Cohort 15', e:'🚀', c:'#FCD34D', b:'rgba(252,211,77,.2)' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: p.b, border: `1px solid ${p.b}`, borderRadius: 12, padding: '10px 18px', transition: 'all .22s', cursor: 'default', backdropFilter: 'blur(8px)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 8px 24px ${p.c}22`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
                >
                  <span style={{ fontSize: 18 }}>{p.e}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: p.c }}>{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ════════════════════════════════════
          NEWSLETTER (Dark)
      ════════════════════════════════════ */}
      <section style={{ padding: '80px 6%', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📬</div>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', marginBottom: 10 }}>Get Health Tips in Urdu</h2>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14.5, marginBottom: 28, lineHeight: 1.7 }}>Weekly medical insights, AI health updates, and free guides — delivered to your inbox in Urdu & English.</p>
            {subDone ? (
              <div style={{ background: 'rgba(52,211,153,.15)', border: '1px solid rgba(52,211,153,.3)', borderRadius: 12, padding: '16px 24px', color: '#34D399', fontWeight: 700, fontSize: 15 }}>
                ✅ Subscribed! Health tips coming your way.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(10px)', maxWidth: 440, margin: '0 auto' }}>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSub()}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '14px 18px', color: '#fff', fontSize: 14, fontFamily: 'inherit' }}
                />
                <button onClick={handleSub} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '14px 22px', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, transition: 'all .22s', flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.85'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >Subscribe →</button>
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,.22)', fontSize: 11.5, marginTop: 12 }}>No spam. Unsubscribe anytime. 100% free.</p>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          CTA — Full bleed gradient
      ════════════════════════════════════ */}
      <section style={{ padding: '80px 6% 100px', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg,rgba(37,99,235,.3) 0%,rgba(124,58,237,.3) 100%)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 28, padding: '72px 36px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
            {/* Spinning ring */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)', animation: 'rotateSlow 30s linear infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,.04)', animation: 'rotateSlow 40s linear infinite reverse', pointerEvents: 'none' }} />
            {/* Glow spot */}
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse,rgba(37,99,235,.25) 0%,transparent 70%)', pointerEvents: 'none', filter: 'blur(30px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 52, marginBottom: 18 }}>🇵🇰</div>
              <h2 style={{ fontSize: 'clamp(26px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-2.5px', color: '#fff', marginBottom: 14, lineHeight: 1.08 }}>Healthcare for<br />Every Pakistani</h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 16.5, marginBottom: 38, lineHeight: 1.74 }}>
                Join 10,000+ Pakistanis getting AI-powered medical insights.<br />No cost. No barriers. Always free.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => go('login')} style={{ background: '#fff', border: 'none', color: '#1D4ED8', padding: '15px 36px', borderRadius: 13, cursor: 'pointer', fontSize: 16, fontWeight: 800, boxShadow: '0 8px 28px rgba(0,0,0,.25)', transition: 'all .25s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,.35)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '0 8px 28px rgba(0,0,0,.25)'; }}
                >Start Free Analysis →</button>
                <button style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '15px 26px', borderRadius: 13, cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all .25s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.18)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.1)'; }}
                >▶ Watch Demo</button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '52px 6% 30px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 36, marginBottom: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏥</div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, lineHeight: 1.74, maxWidth: 190 }}>Pakistan's first AI-powered medical platform. Free for everyone, always.</p>
            </div>
            {[
              { title: 'Product',  links: ['X-Ray Analysis','ECG Analyzer','Blood Tests','All 9 Modules'] },
              { title: 'Company',  links: ['About Us','Blog','Careers','Contact'] },
              { title: 'Legal',    links: ['Privacy Policy','Terms of Use','Data Policy'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: 'rgba(255,255,255,.5)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.07em' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, marginBottom: 9, cursor: 'pointer', transition: 'color .18s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,.7)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,.3)'; }}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 12 }}>© 2026 MedCare AI — Built with ❤️ by Syed Hassan Tayyab — Atomcamp Cohort 15</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['𝕏','in','⚕️'].map((icon, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,.3)', transition: 'all .18s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.1)'; el.style.color = 'rgba(255,255,255,.7)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.05)'; el.style.color = 'rgba(255,255,255,.3)'; }}
                >{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════
          MOBILE STICKY CTA
      ════════════════════════════════════ */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9997, padding: '12px 16px', background: 'rgba(6,10,20,.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,.08)', transform: mobileCtaVis ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .35s cubic-bezier(.22,1,.36,1)', display: 'none' }}
        className="mobile-sticky"
      >
        <button onClick={() => go('login')} style={{ width: '100%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '14px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 800, boxShadow: '0 6px 20px rgba(37,99,235,.45)' }}>
          Start Free Analysis — It's Free →
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky { display: block !important; }
        }
      `}</style>

    </div>
  );
}