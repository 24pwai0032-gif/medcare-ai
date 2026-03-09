import React, { useState } from 'react';
import { registerUser, loginUser, saveToken, saveUser } from '../services/api';

interface LoginProps { onLogin: (user: any) => void; }

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [role, setRole]         = useState<'patient' | 'doctor'>('patient');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [pmdc, setPmdc]         = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !name.trim()) e.name = 'Name is required';
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Minimum 6 characters';
    if (mode === 'register' && role === 'doctor' && !pmdc.trim())
      e.pmdc = 'PMDC number is required for doctors';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await registerUser({ full_name: name, email, password, role, pmdc: pmdc || undefined });
        saveToken(res.access_token);
        saveUser(res.user);
        onLogin(res.user);
      } else {
        const res = await loginUser({ email, password });
        saveToken(res.access_token);
        saveUser(res.user || res);
        onLogin(res.user || res);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', background: 'rgba(255,255,255,.05)', border: `1.5px solid ${fieldErr[field] ? '#EF4444' : 'rgba(255,255,255,.1)'}`,
    borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14.5, fontFamily: 'inherit',
    outline: 'none', transition: 'all .22s', boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#060A14', display: 'flex', fontFamily: "'Sora','Plus Jakarta Sans',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes blobA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(30px,-40px) scale(1.05)} 70%{transform:translate(-20px,20px) scale(.97)} }
        @keyframes blobB { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-40px,30px) scale(1.04)} 70%{transform:translate(25px,-15px) scale(.98)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        input::placeholder { color: rgba(255,255,255,.25); }
        input:focus { border-color: rgba(96,165,250,.6) !important; background: rgba(255,255,255,.08) !important; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
        .tab-btn { transition: all .22s; }
        .tab-btn:hover { color: #fff !important; }
        .role-card { transition: all .22s; cursor: pointer; }
        .role-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* ── Mesh background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,.16) 0%,transparent 65%)', filter: 'blur(60px)', animation: 'blobA 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.13) 0%,transparent 65%)', filter: 'blur(70px)', animation: 'blobB 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Grain */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: .5 }} />
      </div>

      {/* ── LEFT PANEL (desktop only) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 6%', position: 'relative', zIndex: 1, minWidth: 0 }} className="left-panel">
        <div style={{ maxWidth: 480, animation: 'fadeUp .8s ease both' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 16px rgba(37,99,235,.5)' }}>🏥</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
          </a>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,.15)', border: '1px solid rgba(37,99,235,.3)', borderRadius: 100, padding: '6px 14px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#93C5FD', fontWeight: 700 }}>🇵🇰 Pakistan's First AI Medical Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2.5px', marginBottom: 20, color: '#fff' }}>
            Your Health,<br />
            <span style={{ background: 'linear-gradient(130deg,#60A5FA 0%,#A78BFA 50%,#F472B6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'gradShift 5s ease infinite' }}>Powered by AI</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', lineHeight: 1.8, marginBottom: 48, maxWidth: 400 }}>
            Get AI-powered medical analysis in minutes. Free forever. In Urdu & English.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { e: '🫁', t: 'X-Ray & ECG Analysis',   d: 'Radiologist-level accuracy in 2-3 minutes' },
              { e: '🧪', t: 'Blood Test Interpretation', d: 'Abnormal value detection & full report' },
              { e: '🔒', t: 'Secure & Private',          d: 'End-to-end encrypted. You own your data.' },
              { e: '💚', t: 'Always Free',               d: 'No hidden charges. No subscriptions.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.e}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{f.t}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ marginTop: 52, padding: '20px 22px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16 }}>
            <div style={{ color: '#FBBF24', fontSize: 12, marginBottom: 10, letterSpacing: 3 }}>★★★★★</div>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13.5, lineHeight: 1.75, fontStyle: 'italic', marginBottom: 14 }}>"Got my X-ray analyzed in 3 minutes. The Urdu report was a complete game changer for my family."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#86EFAC,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>👩</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Fatima Malik</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.3)' }}>Patient, Karachi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', animation: 'fadeUp .8s .15s ease both', opacity: 0 }}>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: '36px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.07)' }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
              {(['login','register'] as const).map(m => (
                <button key={m} className="tab-btn" onClick={() => { setMode(m); setError(''); setFieldErr({}); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', background: mode === m ? 'rgba(255,255,255,.1)' : 'transparent', color: mode === m ? '#fff' : 'rgba(255,255,255,.4)', boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,.2)' : 'none' }}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-.5px' }}>
              {mode === 'login' ? 'Welcome back 👋' : 'Join MedCare AI 🇵🇰'}
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', marginBottom: 26 }}>
              {mode === 'login' ? 'Sign in to access your medical dashboard' : 'Free forever. No credit card needed.'}
            </p>

            {/* Role selector (register only) */}
            {mode === 'register' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', fontWeight: 700,
                  letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                  I am registering as
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    ['patient', '🙋', 'Patient', 'I want AI health analysis'],
                    ['doctor',  '👨‍⚕️', 'Doctor',  'I will review patient reports'],
                  ] as const).map(([r, e, label, desc]) => (
                    <div key={r} onClick={() => { setRole(r as any); setPmdc(''); }}
                      style={{
                        background: role === r ? 'rgba(37,99,235,.22)' : 'rgba(255,255,255,.04)',
                        border: `2px solid ${role === r ? 'rgba(96,165,250,.6)' : 'rgba(255,255,255,.08)'}`,
                        borderRadius: 14, padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
                        transition: 'all .22s',
                      }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{e}</div>
                      <div style={{ fontWeight: 800, fontSize: 14,
                        color: role === r ? '#60A5FA' : 'rgba(255,255,255,.65)' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
                      {role === r && (
                        <div style={{ marginTop: 8, fontSize: 10, background: 'rgba(96,165,250,.2)',
                          color: '#93C5FD', borderRadius: 100, padding: '2px 10px', fontWeight: 700 }}>
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: '.03em' }}>Full Name</label>
                  <input value={name} onChange={e => { setName(e.target.value); setFieldErr(p => ({ ...p, name: '' })); }} placeholder="Syed Hassan Tayyab" style={inputStyle('name')}
                    onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,.6)'; e.target.style.background = 'rgba(255,255,255,.08)'; }}
                    onBlur={e => { e.target.style.borderColor = fieldErr.name ? '#EF4444' : 'rgba(255,255,255,.1)'; e.target.style.background = 'rgba(255,255,255,.05)'; }}
                  />
                  {fieldErr.name && <div style={{ fontSize: 11.5, color: '#F87171', marginTop: 5 }}>⚠ {fieldErr.name}</div>}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: '.03em' }}>Email Address</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })); }} placeholder="you@example.com" style={inputStyle('email')}
                  onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,.6)'; e.target.style.background = 'rgba(255,255,255,.08)'; }}
                  onBlur={e => { e.target.style.borderColor = fieldErr.email ? '#EF4444' : 'rgba(255,255,255,.1)'; e.target.style.background = 'rgba(255,255,255,.05)'; }}
                />
                {fieldErr.email && <div style={{ fontSize: 11.5, color: '#F87171', marginTop: 5 }}>⚠ {fieldErr.email}</div>}
              </div>

              <div>
                <label style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: 600, display: 'block', marginBottom: 7, letterSpacing: '.03em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })); }} placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'} style={{ ...inputStyle('password'), paddingRight: 46 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,.6)'; e.target.style.background = 'rgba(255,255,255,.08)'; }}
                    onBlur={e => { e.target.style.borderColor = fieldErr.password ? '#EF4444' : 'rgba(255,255,255,.1)'; e.target.style.background = 'rgba(255,255,255,.05)'; }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,.35)', transition: 'color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.35)'; }}
                  >{showPass ? '🙈' : '👁'}</button>
                </div>
                {fieldErr.password && <div style={{ fontSize: 11.5, color: '#F87171', marginTop: 5 }}>⚠ {fieldErr.password}</div>}
              </div>

              {mode === 'register' && role === 'doctor' && (
                <div>
                  <label style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: 600,
                    display: 'block', marginBottom: 7, letterSpacing: '.03em' }}>
                    PMDC Registration Number
                    <span style={{ color: '#F87171', marginLeft: 4 }}>*</span>
                  </label>
                  <input
                    value={pmdc}
                    onChange={e => setPmdc(e.target.value)}
                    placeholder="e.g. PMDC-12345-P"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,.05)',
                      border: `1.5px solid ${fieldErr.pmdc ? '#EF4444' : 'rgba(255,255,255,.1)'}`, borderRadius: 12,
                      padding: '13px 16px', color: '#fff', fontSize: 14.5,
                      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,.6)';
                      e.target.style.background = 'rgba(255,255,255,.08)'; }}
                    onBlur={e => { e.target.style.borderColor = fieldErr.pmdc ? '#EF4444' : 'rgba(255,255,255,.1)';
                      e.target.style.background = 'rgba(255,255,255,.05)'; }}
                  />
                  {fieldErr.pmdc && <div style={{ fontSize: 11.5, color: '#F87171', marginTop: 5 }}>⚠ {fieldErr.pmdc}</div>}
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.28)', marginTop: 6 }}>
                    🏥 Required for doctor verification by MedCare AI team
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, fontSize: 13.5, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: 22, background: loading ? 'rgba(37,99,235,.4)' : 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none', color: '#fff', padding: '14px', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 22px rgba(37,99,235,.45)', transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { if (!loading) { const el = e.currentTarget; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 10px 28px rgba(37,99,235,.55)'; } }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = loading ? 'none' : '0 6px 22px rgba(37,99,235,.45)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Free Account →'
              )}
              {/* shimmer */}
              {!loading && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)', backgroundSize: '200% 100%', animation: 'gradShift 2.5s infinite' }} />}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', fontWeight: 500 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
            </div>

            {/* Demo access */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['👤 Patient Demo', 'patient@demo.com'], ['👨‍⚕️ Doctor Demo', 'doctor@demo.com']].map(([label, hint], i) => (
                <button key={i} onClick={() => { setEmail(hint); setPassword('demo123'); setRole(i === 0 ? 'patient' : 'doctor'); setMode('login'); }} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)', padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.08)'; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,.15)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,.04)'; el.style.color = 'rgba(255,255,255,.55)'; el.style.borderColor = 'rgba(255,255,255,.08)'; }}
                >{label}</button>
              ))}
            </div>

            {/* Switch mode */}
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'rgba(255,255,255,.35)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFieldErr({}); }} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', padding: 0, transition: 'color .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#93C5FD'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#60A5FA'; }}
              >{mode === 'login' ? 'Create free account' : 'Sign in'}</button>
            </p>
          </div>

          {/* Trust footer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {[['🔒','Encrypted'],['💚','Free Forever'],['🌐','Urdu & English']].map(([e, t]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13 }}>{e}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}