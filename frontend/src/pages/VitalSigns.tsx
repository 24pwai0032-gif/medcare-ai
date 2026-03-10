import React, { useState } from 'react';

const RANGES: Record<string, { unit: string; normal: [number, number]; warning: [number, number]; label: string; emoji: string }> = {
  heartRate:    { unit: 'bpm',   normal: [60, 100],  warning: [50, 120],  label: 'Heart Rate',    emoji: '💓' },
  systolic:     { unit: 'mmHg',  normal: [90, 120],  warning: [80, 140],  label: 'Systolic BP',   emoji: '🩺' },
  diastolic:    { unit: 'mmHg',  normal: [60, 80],   warning: [50, 90],   label: 'Diastolic BP',  emoji: '🩺' },
  temperature:  { unit: '°F',    normal: [97, 99],   warning: [95, 103],  label: 'Temperature',   emoji: '🌡️' },
  oxygen:       { unit: '%',     normal: [95, 100],  warning: [90, 100],  label: 'SpO2',          emoji: '💨' },
  respiratory:  { unit: '/min',  normal: [12, 20],   warning: [8, 30],    label: 'Respiratory',   emoji: '🫁' },
};

const VitalSigns = ({ onBack }: { onBack: () => void }) => {
  const [vitals, setVitals] = useState<Record<string, string>>({ heartRate: '', systolic: '', diastolic: '', temperature: '', oxygen: '', respiratory: '' });
  const [showResult, setShowResult] = useState(false);

  const canAnalyze = Object.values(vitals).some(v => v.trim() !== '' && !isNaN(Number(v)));

  const getStatus = (key: string, value: number) => {
    const r = RANGES[key];
    if (value >= r.normal[0] && value <= r.normal[1]) return { status: 'Normal', color: '#10B981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)' };
    if (value >= r.warning[0] && value <= r.warning[1]) return { status: 'Warning', color: '#F59E0B', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' };
    return { status: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)' };
  };

  const results = Object.entries(vitals).filter(([, v]) => v.trim() !== '' && !isNaN(Number(v))).map(([key, v]) => {
    const val = Number(v);
    const range = RANGES[key];
    const status = getStatus(key, val);
    return { key, val, range, ...status };
  });

  const overall = results.some(r => r.status === 'Critical') ? { label: 'Critical', color: '#EF4444', emoji: '🔴' } : results.some(r => r.status === 'Warning') ? { label: 'Warning', color: '#F59E0B', emoji: '🟡' } : { label: 'Normal', color: '#10B981', emoji: '🟢' };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
    @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.6}}
    .xw{animation:fadeUp .4s ease}
    .ab{transition:all .2s;cursor:pointer;border:none}.ab:hover:not(:disabled){opacity:.87;transform:translateY(-1px)}.ab:disabled{cursor:not-allowed;opacity:.4}
    .bk{transition:all .2s;cursor:pointer}.bk:hover{background:rgba(255,255,255,.08)!important}
    .rb{transition:all .2s;cursor:pointer}.rb:hover{opacity:.85;transform:translateY(-1px)}
    .rs{animation:fadeUp .4s ease both}
    .vi:focus{border-color:rgba(14,165,233,.4)!important;outline:none}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xw" style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora',sans-serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 12s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 16s ease infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="bk" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Sora,sans-serif' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 20px rgba(14,165,233,.3)' }}>🩺</div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9' }}>Vital Signs</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Health Monitoring</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse2 2s infinite' }} />AI Online
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
          {!showResult ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩺</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg,#38BDF8,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>Vital Signs Monitor</h2>
                <p style={{ color: '#475569', fontSize: '14px' }}>Apne vital signs enter karein — AI analyze karega</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {Object.entries(RANGES).map(([key, r]) => (
                  <div key={key} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{r.emoji}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>{r.label}</div>
                        <div style={{ fontSize: '10px', color: '#334155' }}>Normal: {r.normal[0]}–{r.normal[1]} {r.unit}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input className="vi" type="number" value={vitals[key]} onChange={e => setVitals(p => ({ ...p, [key]: e.target.value }))} placeholder={`${r.normal[0]}–${r.normal[1]}`}
                        style={{ flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', padding: '10px 14px', color: '#E2E8F0', fontSize: '14px', fontFamily: 'Sora,sans-serif' }} />
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{r.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="ab" disabled={!canAnalyze} onClick={() => setShowResult(true)}
                style={{ width: '100%', padding: '16px', background: canAnalyze ? 'linear-gradient(135deg,#0EA5E9,#38BDF8)' : 'rgba(255,255,255,.04)', color: canAnalyze ? '#fff' : '#334155', borderRadius: '14px', fontSize: '15px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                🩺 Analyze Vitals
              </button>
            </div>
          ) : (
            <div>
              <div className="rs" style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>🩺</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Vital Signs Analysis</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '14px' }}>Health Status Report</h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: overall.label === 'Critical' ? 'rgba(239,68,68,.12)' : overall.label === 'Warning' ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.12)', border: `1px solid ${overall.label === 'Critical' ? 'rgba(239,68,68,.3)' : overall.label === 'Warning' ? 'rgba(245,158,11,.3)' : 'rgba(16,185,129,.3)'}`, color: overall.color, padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>{overall.emoji} {overall.label}</div>
                </div>
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {results.map(r => (
                  <div key={r.key} style={{ background: 'rgba(255,255,255,.02)', border: `1px solid ${r.border}`, borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{r.range.emoji}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>{r.range.label}</span>
                      </div>
                      <div style={{ background: r.bg, padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: r.color }}>{r.status}</div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: r.color }}>{r.val} <span style={{ fontSize: '14px', color: '#475569' }}>{r.range.unit}</span></div>
                    <div style={{ fontSize: '10px', color: '#334155', marginTop: '6px' }}>Normal range: {r.range.normal[0]}–{r.range.normal[1]} {r.range.unit}</div>
                  </div>
                ))}
              </div>

              <div className="rs" style={{ background: 'rgba(14,165,233,.04)', border: '1px solid rgba(14,165,233,.12)', borderRadius: '16px', padding: '22px', marginBottom: '20px', direction: 'rtl' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '14px' }}>🇵🇰 اردو خلاصہ</div>
                <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 2 }}>
                  {overall.label === 'Normal' ? 'آپ کے تمام وائٹل سائنز نارمل ہیں۔ صحت مند عادات جاری رکھیں۔' : overall.label === 'Warning' ? 'کچھ وائٹل سائنز نارمل حد سے باہر ہیں۔ ڈاکٹر سے مشورہ کریں۔' : 'فوری طبی مدد حاصل کریں! کچھ وائٹل سائنز خطرناک حد میں ہیں۔'}
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>Yeh tool sirf monitoring ke liye hai — professional medical checkup ki jagah nahi le sakta.
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="rb" onClick={() => { setShowResult(false); setVitals({ heartRate: '', systolic: '', diastolic: '', temperature: '', oxygen: '', respiratory: '' }); }} style={{ background: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }}>🔄 New Check</button>
                <button className="rb" onClick={onBack} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>← Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VitalSigns;
