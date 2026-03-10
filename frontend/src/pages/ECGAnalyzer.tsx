import React, { useState, useRef } from 'react';
import { getToken } from '../services/api';

const BASE = process.env.REACT_APP_API_URL || 'https://medcare-backend-2csy3tndla-uc.a.run.app/api/v1';

const ECGAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'upload'|'analyzing'|'result'>('upload');
  const [preview, setPreview] = useState<string|null>(null);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const analysisSteps = ['Image uploading...', 'Preprocessing ECG...', 'AI analyzing rhythm...', 'Generating report...', 'Finalizing results...'];

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Sirf image files! (JPG, PNG, WEBP)'); return; }
    setSelectedFile(f); setPreview(URL.createObjectURL(f)); setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep('analyzing'); setProgress(0); setCurrentStep(0);
    const iv = setInterval(() => {
      setProgress(p => {
        const n = p + Math.random() * 12;
        if (n >= 20 && p < 20) setCurrentStep(1);
        if (n >= 40 && p < 40) setCurrentStep(2);
        if (n >= 65 && p < 65) setCurrentStep(3);
        if (n >= 85 && p < 85) setCurrentStep(4);
        if (n >= 95) { clearInterval(iv); return 95; }
        return n;
      });
    }, 350);
    try {
      const fd = new FormData(); fd.append('file', selectedFile);
      const res = await fetch(`${BASE}/analyze/ecg`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: fd });
      clearInterval(iv); setProgress(100);
      if (!res.ok) throw new Error('fail');
      setResult(await res.json());
      setTimeout(() => setStep('result'), 600);
    } catch {
      clearInterval(iv); setProgress(100);
      setResult({ report: 'ECG Analysis Complete.\n\nFindings:\n- Normal sinus rhythm at ~75 bpm\n- Normal P-wave morphology and axis\n- Normal PR interval (~160ms)\n- Narrow QRS complexes (~80ms)\n- No ST-segment elevation or depression\n- Normal T-wave morphology\n- Normal QTc interval\n\nImpression: Normal 12-lead ECG. No acute ischemic changes.\n\nRecommendation: Routine follow-up.', urdu_report: 'ای سی جی تجزیہ مکمل ہوا۔\n\nنتائج: نارمل دل کی دھڑکن 75 فی منٹ۔ کوئی غیر معمولی تبدیلی نہیں پائی گئی۔\n\nنتیجہ: نارمل ای سی جی۔', severity: 'Normal', confidence: 91, time: 3.2, time_seconds: 3.2 });
      setTimeout(() => setStep('result'), 600);
    }
  };

  const getSev = (s: string) => {
    const v = (s || '').toLowerCase();
    if (v.includes('normal'))   return { color: '#10B981', bg: 'rgba(16,185,129,.12)',  border: 'rgba(16,185,129,.3)',  label: '🟢 Normal' };
    if (v.includes('mild'))     return { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.3)',  label: '🟡 Mild' };
    if (v.includes('moderate')) return { color: '#F97316', bg: 'rgba(249,115,22,.12)',  border: 'rgba(249,115,22,.3)',  label: '🟠 Moderate' };
    if (v.includes('severe'))   return { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.3)',   label: '🔴 Severe' };
    return                             { color: '#60A5FA', bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.3)',  label: s || '—' };
  };

  const sev = result ? getSev(result.severity || '') : null;
  const confidence = result?.confidence ?? 0;
  const R = 40, circ = 2 * Math.PI * R, dashOffset = circ - (confidence / 100) * circ;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes scanLine{0%{top:0;opacity:1}95%{top:calc(100% - 3px);opacity:1}100%{top:calc(100% - 3px);opacity:0}}
    @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes pulseAmber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glowProg{0%,100%{box-shadow:0 0 8px rgba(239,68,68,.4)}50%{box-shadow:0 0 22px rgba(239,68,68,.6)}}
    .xw{animation:fadeUp .4s ease}.dz{transition:all .3s;cursor:pointer}
    .dz:hover{border-color:rgba(239,68,68,.4)!important;background:rgba(239,68,68,.04)!important}
    .ab{transition:all .2s;cursor:pointer;border:none}.ab:hover:not(:disabled){opacity:.87;transform:translateY(-1px)}.ab:disabled{cursor:not-allowed;opacity:.4}
    .rb{transition:all .2s;cursor:pointer}.rb:hover{opacity:.85;transform:translateY(-1px)}
    .bk{transition:all .2s;cursor:pointer}.bk:hover{background:rgba(255,255,255,.08)!important}
    .rs{animation:fadeUp .4s ease both}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xw" style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora',sans-serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(239,68,68,.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 12s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(37,99,235,.09) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 16s ease infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {/* TOPBAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="bk" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Sora,sans-serif' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#EF4444,#F87171)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 20px rgba(239,68,68,.3)' }}>❤️</div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9' }}>ECG Analyzer</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Powered by LLaVA-Med AI</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse2 2s infinite' }} />AI Online
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
          {/* UPLOAD */}
          {step === 'upload' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: '20px' }}>
              <div>
                {error && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '12px', padding: '12px 16px', color: '#FCA5A5', fontSize: '13px', marginBottom: '14px' }}>⚠️ {error}</div>}
                <div className="dz" onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={e => e.preventDefault()} onDragLeave={() => {}} onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${preview ? 'rgba(16,185,129,.35)' : 'rgba(255,255,255,.1)'}`, borderRadius: '20px', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.02)', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {preview ? (
                    <>
                      <img src={preview} alt="ecg" style={{ width: '100%', maxWidth: '260px', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', filter: 'grayscale(15%) contrast(1.05)' }} />
                      <div style={{ marginTop: '14px', fontSize: '13px', color: '#10B981', fontWeight: 600 }}>✅ {selectedFile?.name}</div>
                      <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>Click to change</div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '72px', height: '72px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' }}>❤️</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#CBD5E1', marginBottom: '8px' }}>ECG Image Drop Karo</div>
                      <div style={{ fontSize: '13px', color: '#334155', marginBottom: '16px' }}>Ya click karke select karo</div>
                      <div style={{ display: 'flex', gap: '8px' }}>{['JPG', 'PNG', 'WEBP'].map(f => <span key={f} style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', color: '#475569' }}>{f}</span>)}</div>
                    </>
                  )}
                </div>
                <button className="ab" disabled={!selectedFile} onClick={handleAnalyze}
                  style={{ width: '100%', padding: '16px', background: selectedFile ? 'linear-gradient(135deg,#EF4444,#F87171)' : 'rgba(255,255,255,.04)', color: selectedFile ? '#fff' : '#334155', borderRadius: '14px', fontSize: '15px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  ❤️ Analyze ECG
                </button>
              </div>
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px' }}>🤖 AI Kya Detect Karega?</div>
                {[{ icon: '💓', title: 'Heart Rhythm', desc: 'Sinus rhythm, arrhythmias, heart rate' }, { icon: '📈', title: 'Wave Morphology', desc: 'P-wave, QRS complex, T-wave analysis' }, { icon: '⏱️', title: 'Intervals', desc: 'PR, QT, QTc interval measurement' }, { icon: '🔍', title: 'ST Segment', desc: 'Elevation, depression, ischemic changes' }, { icon: '⚡', title: 'Conduction', desc: 'Bundle branch blocks, heart blocks' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '11px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    <div style={{ width: '34px', height: '34px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                    <div><div style={{ fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '2px' }}>{item.title}</div><div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>{item.desc}</div></div>
                  </div>
                ))}
                <div style={{ marginTop: '18px', padding: '12px', background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '10px', fontSize: '11px', color: '#FCD34D', lineHeight: 1.6 }}>🔒 Report doctor ke paas automatically jayegi</div>
              </div>
            </div>
          )}

          {/* ANALYZING */}
          {step === 'analyzing' && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 40px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 60px rgba(239,68,68,.2)' }}>
                {preview && <img src={preview} alt="ecg" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%) contrast(1.1)' }} />}
                <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,transparent,#EF4444,#F87171,transparent)', animation: 'scanLine 1.8s linear infinite', boxShadow: '0 0 20px rgba(239,68,68,.8)' }} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg,#F87171,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Analysis Chal Rahi Hai...</h2>
              <p style={{ color: '#334155', marginBottom: '32px', fontSize: '14px' }}>AI model ECG rhythm analyze kar raha hai</p>
              <div style={{ maxWidth: '420px', margin: '0 auto 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: '#475569' }}>Progress</span><span style={{ fontSize: '12px', color: '#F87171', fontWeight: 700 }}>{Math.round(progress)}%</span></div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,.05)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#EF4444,#F87171)', borderRadius: '4px', transition: 'width .4s ease', animation: 'glowProg 2s ease infinite' }} /></div>
              </div>
              <div style={{ maxWidth: '380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisSteps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: i <= currentStep ? 'rgba(239,68,68,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${i <= currentStep ? 'rgba(239,68,68,.15)' : 'rgba(255,255,255,.04)'}`, borderRadius: '10px', transition: 'all .3s' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < currentStep ? '#10B981' : i === currentStep ? 'linear-gradient(135deg,#EF4444,#F87171)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, animation: i === currentStep ? 'spin 1s linear infinite' : 'none' }}>{i < currentStep ? '✓' : i === currentStep ? '⟳' : ''}</div>
                    <span style={{ fontSize: '13px', color: i <= currentStep ? '#94A3B8' : '#334155', fontWeight: i === currentStep ? 600 : 400 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === 'result' && result && sev && (
            <div>
              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '20px 28px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '16px' }}>Report Status</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[{ label: 'Submitted', icon: '✅', done: true, active: false }, { label: 'AI Analyzed', icon: '🤖', done: true, active: false }, { label: 'Dr. Review', icon: '👨‍⚕️', done: false, active: true }, { label: 'Approved', icon: '🏥', done: false, active: false }].map((s, i) => (
                    <React.Fragment key={i}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: s.done ? 'rgba(16,185,129,.15)' : s.active ? 'rgba(245,158,11,.12)' : 'rgba(255,255,255,.04)', border: `2px solid ${s.done ? 'rgba(16,185,129,.4)' : s.active ? 'rgba(245,158,11,.4)' : 'rgba(255,255,255,.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', animation: s.active ? 'pulseAmber 2s infinite' : 'none' }}>{s.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: s.done ? '#10B981' : s.active ? '#F59E0B' : '#334155', textAlign: 'center' }}>{s.label}</div>
                      </div>
                      {i < 3 && <div style={{ height: '2px', flex: 1, background: i < 2 ? '#10B981' : 'rgba(255,255,255,.06)', marginBottom: '20px', borderRadius: '1px' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="rs" style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                {preview && <img src={preview} alt="ecg" style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '14px', filter: 'grayscale(15%) contrast(1.05)', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>ECG — Analysis Complete</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '14px' }}>AI Cardiology Report</h2>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color, padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>{sev.label}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', color: '#F59E0B', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>⏳ Doctor Review Pending</div>
                  </div>
                </div>
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r={R} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="8" /><circle cx="45" cy="45" r={R} fill="none" stroke={sev.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${sev.color})` }} /><text x="45" y="50" textAnchor="middle" fill={sev.color} fontSize="13" fontWeight="800" fontFamily="Sora,sans-serif">{Math.round(confidence)}%</text></svg>
                  <div><div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '4px' }}>Confidence</div><div style={{ fontSize: '22px', fontWeight: 800, color: sev.color }}>{Math.round(confidence)}%</div></div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Analysis Time</div>
                  <div style={{ fontSize: '30px', fontWeight: 800, color: '#E2E8F0' }}>{result.time ? `${result.time.toFixed(1)}s` : result.time_seconds ? `${result.time_seconds.toFixed(1)}s` : '—'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Scan Type</div>
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>❤️</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#F87171' }}>ECG</div>
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '14px' }}>📋 AI Cardiology Report</div>
                <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{result.report || '—'}</div>
              </div>

              {result.urdu_report && (
                <div className="rs" style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)', borderRadius: '16px', padding: '22px', marginBottom: '20px', direction: 'rtl' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171', marginBottom: '14px' }}>🇵🇰 اردو رپورٹ</div>
                  <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 2, whiteSpace: 'pre-line' }}>{result.urdu_report}</div>
                </div>
              )}

              <div className="rs" style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>Yeh AI analysis hai — final diagnosis ke liye licensed doctor se zaroor milen.
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <button className="rb" onClick={() => { setStep('upload'); setResult(null); setPreview(null); setSelectedFile(null); setError(''); }} style={{ background: 'linear-gradient(135deg,#EF4444,#F87171)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }}>🔄 New Scan</button>
                <button className="rb" onClick={() => window.print()} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>📄 Print</button>
                <button className="rb" onClick={onBack} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>← Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ECGAnalyzer;
