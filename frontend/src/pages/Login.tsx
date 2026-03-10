import React, { useState } from 'react';
import { registerUser, loginUser, saveToken, saveUser } from '../services/api';
import {
  LogoIcon, UserIcon, DoctorIcon, ShieldCheckIcon,
  CheckCircleIcon, AlertTriangleIcon, EyeIcon,
} from '../components/Icons';

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

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

        .login-card { animation: fadeIn 0.5s ease both; }

        .field-group input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-group input::placeholder { color: rgba(255,255,255,0.2); }
        .field-group input:focus {
          border-color: rgba(99,179,237,0.6);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(99,179,237,0.1);
        }
        .field-group input.err { border-color: rgba(252,129,74,0.7) !important; }

        .tab { background: none; border: none; cursor: pointer; padding: 9px 20px; border-radius: 8px; font-family: inherit; font-size: 13.5px; font-weight: 600; transition: all 0.2s; }
        .tab.active { background: rgba(255,255,255,0.1); color: #fff; }
        .tab.inactive { color: rgba(255,255,255,0.35); }
        .tab.inactive:hover { color: rgba(255,255,255,0.65); }

        .role-btn { cursor: pointer; border-radius: 10px; padding: 12px; text-align: center; border: 1.5px solid; transition: all 0.2s; }
        .role-btn:hover { transform: translateY(-1px); }

        .submit-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.22s; position: relative; overflow: hidden; }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); }
        .submit-btn:disabled { cursor: not-allowed; }

        .demo-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: inherit; transition: all 0.2s; width: 100%; }
        .demo-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.15); }

        .switch-link { background: none; border: none; color: #63B3ED; font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.2s; }
        .switch-link:hover { color: #90CDF4; }

        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,179,237,0.1); border: 1px solid rgba(99,179,237,0.2); border-radius: 100px; padding: 4px 12px; }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #48BB78; animation: glow 2s ease infinite; box-shadow: 0 0 6px #48BB78; }

        .trust-pill { display: flex; align-items: center; gap: 6px; }

        .field-err { font-size: 12px; color: #FC814A; margin-top: 5px; display: flex; align-items: center; gap: 4px; animation: slide-in 0.2s ease; }

        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; }

        /* BG orbs */
        .orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }

        @media (max-width: 480px) {
          .card-inner { padding: 28px 22px !important; }
          .role-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(49,130,206,0.12) 0%, transparent 70%)', top: '-15%', left: '-10%' }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(128,90,213,0.1) 0%, transparent 70%)', bottom: '-10%', right: '-5%' }} />

      {/* Card */}
      <div className="login-card" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3182CE, #805AD5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(49,130,206,0.4)', color: '#fff' }}><LogoIcon size={18} /></div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>MedCare <span style={{ background: 'linear-gradient(135deg,#63B3ED,#B794F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
          <div className="badge" style={{ marginLeft: 4 }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: 11, color: '#90CDF4', fontWeight: 600 }}>&#127477;&#127472; Pakistan</span>
          </div>
        </div>

        {/* Main card */}
        <div className="card-inner" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} className={`tab ${mode === m ? 'active' : 'inactive'}`} style={{ flex: 1 }}
                onClick={() => { setMode(m); setError(''); setFieldErr({}); }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', marginBottom: 4 }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login' ? 'Access your medical dashboard' : 'Free forever — no credit card needed'}
            </p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>I am a</div>
            <div className="role-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                ['patient', 'patient', 'Patient'],
                ['doctor',  'doctor', 'Doctor'],
              ] as const).map(([r, emoji, label]) => (
                <div key={r} className="role-btn"
                  onClick={() => { setRole(r); setPmdc(''); }}
                  style={{
                    background: role === r ? 'rgba(49,130,206,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: role === r ? 'rgba(99,179,237,0.5)' : 'rgba(255,255,255,0.07)',
                  }}>
                  <div style={{ marginBottom: 4, color: role === r ? '#63B3ED' : 'rgba(255,255,255,0.4)' }}>{emoji === 'patient' ? <UserIcon size={22} /> : <DoctorIcon size={22} />}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: role === r ? '#63B3ED' : 'rgba(255,255,255,0.6)' }}>{label}</div>
                  {role === r && (
                    <div style={{ fontSize: 10.5, color: '#63B3ED', fontWeight: 600, marginTop: 4, opacity: 0.8 }}>✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'register' && (
              <div className="field-group">
                <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 7, letterSpacing: '0.02em' }}>Full Name</label>
                <input
                  className={fieldErr.name ? 'err' : ''}
                  value={name} onChange={e => { setName(e.target.value); setFieldErr(p => ({ ...p, name: '' })); }}
                  placeholder="Your full name"
                />
                {fieldErr.name && <div className="field-err"><AlertTriangleIcon size={12} /> {fieldErr.name}</div>}
              </div>
            )}

            <div className="field-group">
              <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 7, letterSpacing: '0.02em' }}>Email</label>
              <input
                type="email"
                className={fieldErr.email ? 'err' : ''}
                value={email} onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })); }}
                placeholder="you@example.com"
              />
              {fieldErr.email && <div className="field-err"><AlertTriangleIcon size={12} /> {fieldErr.email}</div>}
            </div>

            <div className="field-group">
              <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 7, letterSpacing: '0.02em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={fieldErr.password ? 'err' : ''}
                  style={{ paddingRight: 44 }}
                  value={password} onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })); }}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', padding: 0, lineHeight: 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
                ><EyeIcon size={15} /></button>
              </div>
              {fieldErr.password && <div className="field-err"><AlertTriangleIcon size={12} /> {fieldErr.password}</div>}
            </div>

            {mode === 'register' && role === 'doctor' && (
              <div className="field-group">
                <label style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 7, letterSpacing: '0.02em' }}>
                  PMDC Number <span style={{ color: '#FC814A' }}>*</span>
                </label>
                <input
                  className={fieldErr.pmdc ? 'err' : ''}
                  value={pmdc} onChange={e => { setPmdc(e.target.value); setFieldErr(p => ({ ...p, pmdc: '' })); }}
                  placeholder="e.g. PMDC-12345-P"
                />
                {fieldErr.pmdc
                  ? <div className="field-err"><AlertTriangleIcon size={12} /> {fieldErr.pmdc}</div>
                  : <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>Required for doctor verification</div>
                }
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: '11px 14px', background: 'rgba(252,129,74,0.1)', border: '1px solid rgba(252,129,74,0.25)', borderRadius: 9, fontSize: 13, color: '#FBD38D', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', flexShrink: 0 }}><AlertTriangleIcon size={14} /></span> {error}
            </div>
          )}

          {/* Submit */}
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 20, background: loading ? 'rgba(49,130,206,0.4)' : 'linear-gradient(135deg, #3182CE 0%, #805AD5 100%)', color: '#fff', boxShadow: loading ? 'none' : '0 4px 18px rgba(49,130,206,0.4)' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Free Account'
            )}
          </button>

          {/* Divider + demo buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>or try a demo</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Patient Demo', 'patient@demo.com', 'patient'], ['Doctor Demo', 'doctor@demo.com', 'doctor']].map(([label, hint, r], i) => (
              <button key={i} className="demo-btn"
                onClick={() => { setEmail(hint); setPassword('demo123'); setRole(r as any); setMode('login'); }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{r === 'patient' ? <UserIcon size={13} /> : <DoctorIcon size={13} />} {label}</span>
              </button>
            ))}
          </div>

          {/* Switch */}
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button className="switch-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFieldErr({}); }}>
              {mode === 'login' ? 'Register free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Trust footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 18, flexWrap: 'wrap' }}>
          {[['lock', 'Encrypted'], ['check', 'Free Forever'], ['globe', 'Urdu & English']].map(([e, t]) => (
            <div key={t} className="trust-pill">
              <span style={{ display: 'flex', color: 'rgba(255,255,255,0.35)' }}>{e === 'lock' ? <ShieldCheckIcon size={13} /> : e === 'check' ? <CheckCircleIcon size={13} /> : <span style={{ fontSize: 12 }}>&#127760;</span>}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}




















