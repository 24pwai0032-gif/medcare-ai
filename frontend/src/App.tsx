import React, { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import { isLoggedIn, getUser, logout } from './services/api';

const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const step = Math.ceil(end / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, started]);
  return <span ref={ref}>{count}{suffix}</span>;
};

function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser();
      if (user) { setCurrentUser(user); setPage(user.role === 'doctor' ? 'doctor' : 'dashboard'); }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveModule(p => (p + 1) % 9), 2500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (user: any) => { setCurrentUser(user); setPage(user.role === 'doctor' ? 'doctor' : 'dashboard'); };
  const handleLogout = () => { logout(); setCurrentUser(null); setPage('home'); };

  if (page === 'login') return <Login onLogin={handleLogin} />;
  if (page === 'dashboard') return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
  if (page === 'doctor') return <DoctorDashboard user={currentUser} onLogout={handleLogout} />;

  const modules = [
    { icon: '🫁', title: 'X-Ray Analysis', desc: 'Chest X-ray, MRI & CT scan analysis with radiologist-level accuracy', color: '#3B82F6' },
    { icon: '🦴', title: 'Bone Scan', desc: 'Fracture detection and bone disease assessment', color: '#8B5CF6' },
    { icon: '💓', title: 'ECG Analyzer', desc: 'Heart rhythm analysis & cardiac condition detection', color: '#EF4444' },
    { icon: '🧪', title: 'Blood Tests', desc: 'Complete blood report interpretation with abnormal value detection', color: '#10B981' },
    { icon: '🧠', title: 'Mental Health', desc: 'PHQ-9 & GAD-7 validated depression & anxiety screening', color: '#F59E0B' },
    { icon: '🔍', title: 'Diagnosis AI', desc: 'Symptom-based differential diagnosis with confidence scores', color: '#06B6D4' },
    { icon: '💊', title: 'Prescription', desc: 'Handwritten prescription reader in Urdu & English', color: '#EC4899' },
    { icon: '📊', title: 'Vital Signs', desc: 'BP, blood sugar & oxygen level monitoring & tracking', color: '#14B8A6' },
    { icon: '🚨', title: 'Emergency Aid', desc: 'Instant first aid guidance for critical situations', color: '#F97316' },
  ];

  const testimonials = [
    { name: 'Dr. Ahmed Khan', role: 'Cardiologist, Lahore', text: 'The ECG analysis is remarkably accurate. Saves hours of manual review every day.', avatar: '👨‍⚕️' },
    { name: 'Fatima Malik', role: 'Patient, Karachi', text: 'Got my X-ray analyzed in 3 minutes. The Urdu report was a complete game changer.', avatar: '👩' },
    { name: 'Dr. Sara Hussain', role: 'Radiologist, Islamabad', text: 'LLaVA-Med integration is impressive. Highly recommend for rural clinics across Pakistan.', avatar: '👩‍⚕️' },
  ];

  const btn = (label: string, primary: boolean, onClick?: () => void) => (
    <button onClick={onClick} style={{
      background: primary ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'rgba(255,255,255,0.05)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      color: primary ? '#fff' : 'rgba(255,255,255,0.75)',
      padding: '14px 30px', borderRadius: 12, cursor: 'pointer',
      fontSize: 16, fontWeight: primary ? 700 : 600,
      boxShadow: primary ? '0 8px 32px rgba(59,130,246,0.45)' : 'none',
      transition: 'all 0.25s',
    }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; if (primary) el.style.boxShadow = '0 14px 40px rgba(59,130,246,0.55)'; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; if (primary) el.style.boxShadow = '0 8px 32px rgba(59,130,246,0.45)'; }}
    >{label}</button>
  );

  return (
    <div style={{ fontFamily: "'Outfit', -apple-system, sans-serif", background: '#060B18', color: '#fff', overflowX: 'hidden' }}>

      {/* Cursor spotlight */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.05), transparent 60%)`, transition: 'background 0.15s' }} />

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6%',
        background: scrolled ? 'rgba(6,11,24,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, boxShadow: '0 0 24px rgba(59,130,246,0.5)' }}>🏥</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' }}>MedCare <span style={{ color: '#3B82F6' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage('login')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(59,130,246,0.5)'; el.style.color = '#fff'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.12)'; el.style.color = 'rgba(255,255,255,0.75)'; }}
          >Login</button>
          <button onClick={() => setPage('login')} style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', color: '#fff', padding: '8px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(59,130,246,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 8px 24px rgba(59,130,246,0.5)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'; }}
          >Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 6% 60px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)`, backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 600, height: 600, borderRadius: '50%', filter: 'blur(120px)', zIndex: 0, background: 'rgba(59,130,246,0.09)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', zIndex: 0, background: 'rgba(139,92,246,0.07)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          {/* LEFT */}
          <div style={{ flex: '1 1 480px', maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 100, padding: '7px 16px', marginBottom: 28, fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 10px #3B82F6', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
              🇵🇰 Pakistan's First AI Medical Platform
            </div>
            <h1 style={{ fontSize: 'clamp(42px, 5.5vw, 74px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-2.5px', marginBottom: 22 }}>
              Medical AI For<br />
              <span style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 40%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Pakistani</span>
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              AI-powered X-ray analysis, ECG reading & blood test interpretation. Free. Fast. In Urdu & English.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              {btn('Start Free Analysis →', true, () => setPage('login'))}
              {btn('▶ Watch Demo', false)}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['🔒 Secure & Private', '⚡ 2-3 min results', '🌐 Urdu & English', '💯 Always Free'].map((t, i) => (
                <span key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — Live preview */}
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.02)' }}>
                {['#EF4444', '#F59E0B', '#10B981'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>medcareai.app</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'livePulse 2s infinite' }} />
                  <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>AI MODULES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {modules.map((mod, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, transition: 'all 0.4s ease',
                      background: activeModule === i ? `${mod.color}18` : 'transparent',
                      border: `1px solid ${activeModule === i ? `${mod.color}30` : 'transparent'}`,
                      transform: activeModule === i ? 'translateX(4px)' : 'translateX(0)',
                    }}>
                      <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{mod.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: activeModule === i ? '#fff' : 'rgba(255,255,255,0.4)' }}>{mod.title}</div>
                        {activeModule === i && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{mod.desc.substring(0, 42)}...</div>}
                      </div>
                      {activeModule === i && <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.color, boxShadow: `0 0 8px ${mod.color}`, flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '64px 6%', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, textAlign: 'center' }}>
          {[{ num: 9, suffix: '', label: 'AI Modules', icon: '🤖' }, { num: 3, suffix: '+', label: 'AI Models', icon: '🧬' }, { num: 24, suffix: '/7', label: 'Always Available', icon: '⚡' }, { num: 100, suffix: '%', label: 'Free for Patients', icon: '💚' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}><Counter end={s.num} suffix={s.suffix} /></div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section style={{ padding: '110px 6%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#60A5FA', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Capabilities</div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14 }}>9 Medical AI Modules</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>Powered by LLaVA-Med — published in Nature Medicine 2024</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {modules.map((mod, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '26px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'flex-start', gap: 18 }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = `${mod.color}0D`; el.style.borderColor = `${mod.color}35`; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 20px 40px ${mod.color}12`; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
                onClick={() => setPage('login')}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${mod.color}15`, border: `1px solid ${mod.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{mod.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5, letterSpacing: '-0.3px' }}>{mod.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.6 }}>{mod.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '110px 6%', background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#34D399', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            {[
              { step: '01', icon: '📤', title: 'Upload Your Scan', desc: 'Drag & drop your X-ray, ECG, or blood report image', color: '#3B82F6' },
              { step: '02', icon: '⚡', title: 'AI Processing', desc: 'LLaVA-Med analyzes with medical precision in 2-3 minutes', color: '#8B5CF6' },
              { step: '03', icon: '📋', title: 'Instant Report', desc: 'Receive detailed findings in Urdu & English', color: '#10B981' },
              { step: '04', icon: '👨‍⚕️', title: 'Doctor Review', desc: 'Certified physicians verify and approve the report', color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '32px 24px', textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.borderColor = `${s.color}30`; el.style.boxShadow = `0 20px 40px ${s.color}10`; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: '0.1em', marginBottom: 18, opacity: 0.7 }}>{s.step}</div>
                <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px', background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, letterSpacing: '-0.3px' }}>{s.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '110px 6%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.18)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#F472B6', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Trusted by Doctors & Patients</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '28px', transition: 'all 0.3s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ color: '#F59E0B', fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 6% 110px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 28, padding: '72px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,92,246,0.08)', filter: 'blur(60px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🇵🇰</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14 }}>Healthcare for Every Pakistani</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, marginBottom: 36, lineHeight: 1.7 }}>Join thousands getting AI-powered medical insights.<br />No cost. No barriers. Always free.</p>
            <button onClick={() => setPage('login')} style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', color: '#fff', padding: '15px 38px', borderRadius: 14, cursor: 'pointer', fontSize: 17, fontWeight: 700, boxShadow: '0 8px 32px rgba(59,130,246,0.45)', transition: 'all 0.25s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 16px 48px rgba(59,130,246,0.55)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 8px 32px rgba(59,130,246,0.45)'; }}
            >Start Free Analysis →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 6%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏥</div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>MedCare <span style={{ color: '#3B82F6' }}>AI</span></span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Built with ❤️ by Syed Hassan Tayyab — Atomcamp Cohort 15 — 2026</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; }}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #060B18; }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #060B18; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.25); border-radius: 10px; }
        @media (max-width: 768px) {
          nav { padding: 0 4% !important; }
          section { padding: 70px 4% !important; }
        }
        @media (max-width: 480px) {
          section { padding: 50px 4% !important; }
          h1 { letter-spacing: -1.5px !important; }
        }
      `}</style>
    </div>
  );
}

export default App;