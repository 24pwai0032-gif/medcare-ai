import React, { useState } from 'react';

const SYMPTOM_DB: Record<string, { conditions: string[]; severity: string; advice: string; urdu: string }> = {
  'headache': { conditions: ['Tension Headache', 'Migraine', 'Sinusitis'], severity: 'Mild', advice: 'Rest in a dark room. Stay hydrated. Take OTC pain relief if needed. See a doctor if persistent.', urdu: 'سر درد — آرام کریں، پانی پئیں، اگر بار بار ہو تو ڈاکٹر سے ملیں۔' },
  'fever': { conditions: ['Viral Infection', 'Flu', 'COVID-19', 'Bacterial Infection'], severity: 'Moderate', advice: 'Monitor temperature. Stay hydrated. Take paracetamol. Seek medical help if above 103°F.', urdu: 'بخار — درجہ حرارت چیک کریں، پانی پئیں، 103 سے اوپر ہو تو ڈاکٹر کے پاس جائیں۔' },
  'cough': { conditions: ['Common Cold', 'Bronchitis', 'Allergies', 'Pneumonia'], severity: 'Mild', advice: 'Stay hydrated. Use honey and warm water. Avoid irritants. See doctor if cough persists >2 weeks.', urdu: 'کھانسی — گرم پانی پئیں، شہد استعمال کریں، 2 ہفتے سے زیادہ ہو تو ڈاکٹر سے ملیں۔' },
  'chest pain': { conditions: ['Angina', 'Acid Reflux (GERD)', 'Muscle Strain', 'Anxiety'], severity: 'Severe', advice: '⚠️ SEEK IMMEDIATE MEDICAL ATTENTION. Call emergency services if accompanied by shortness of breath.', urdu: 'سینے میں درد — فوری طبی مدد حاصل کریں! سانس کی تکلیف ہو تو ایمرجنسی کال کریں۔' },
  'stomach pain': { conditions: ['Gastritis', 'Food Poisoning', 'IBS', 'Appendicitis'], severity: 'Moderate', advice: 'Eat bland foods. Avoid spicy food. Stay hydrated. See doctor if pain is severe or persistent.', urdu: 'پیٹ درد — ہلکا کھانا کھائیں، مسالے دار سے بچیں، شدید ہو تو ڈاکٹر سے ملیں۔' },
  'back pain': { conditions: ['Muscle Strain', 'Herniated Disc', 'Poor Posture', 'Sciatica'], severity: 'Mild', advice: 'Apply heat/ice. Gentle stretching. Maintain good posture. See doctor if numbness develops.', urdu: 'کمر درد — گرم/ٹھنڈا سیک کریں، ہلکی ورزش کریں، سنّ پن ہو تو ڈاکٹر سے ملیں۔' },
  'dizziness': { conditions: ['Vertigo', 'Low Blood Pressure', 'Dehydration', 'Anemia'], severity: 'Moderate', advice: 'Sit or lie down safely. Drink water. Avoid sudden movements. See doctor if frequent.', urdu: 'چکر آنا — بیٹھ جائیں، پانی پئیں، بار بار ہو تو ڈاکٹر سے ملیں۔' },
  'shortness of breath': { conditions: ['Asthma', 'Anxiety', 'Pneumonia', 'Heart Failure'], severity: 'Severe', advice: '⚠️ SEEK IMMEDIATE MEDICAL ATTENTION if severe or sudden onset. Use inhaler if prescribed.', urdu: 'سانس کی تکلیف — فوری طبی مدد حاصل کریں! اگر انہیلر ہے تو استعمال کریں۔' },
  'fatigue': { conditions: ['Anemia', 'Thyroid Issues', 'Depression', 'Diabetes'], severity: 'Mild', advice: 'Get adequate sleep. Eat balanced diet. Exercise regularly. See doctor if persistent.', urdu: 'تھکاوٹ — مناسب نیند لیں، متوازن غذا کھائیں، مسلسل ہو تو ڈاکٹر سے ملیں۔' },
  'joint pain': { conditions: ['Arthritis', 'Gout', 'Bursitis', 'Lupus'], severity: 'Moderate', advice: 'Rest the affected joint. Apply ice. Take anti-inflammatory medication. See doctor if swelling persists.', urdu: 'جوڑوں کا درد — آرام کریں، برف لگائیں، سوجن ہو تو ڈاکٹر سے ملیں۔' },
};

const DiagnosisAI = ({ onBack }: { onBack: () => void }) => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!symptoms.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const input = symptoms.toLowerCase();
      const matched = Object.entries(SYMPTOM_DB).filter(([k]) => input.includes(k));
      if (matched.length > 0) {
        const allConditions = matched.flatMap(([, v]) => v.conditions);
        const worstSeverity = matched.some(([, v]) => v.severity === 'Severe') ? 'Severe' : matched.some(([, v]) => v.severity === 'Moderate') ? 'Moderate' : 'Mild';
        const allAdvice = matched.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v.advice}`).join('\n\n');
        const allUrdu = matched.map(([, v]) => v.urdu).join('\n');
        setResult({ conditions: Array.from(new Set(allConditions)), severity: worstSeverity, advice: allAdvice, urdu: allUrdu });
      } else {
        setResult({ conditions: ['General Consultation Recommended'], severity: 'Mild', advice: 'Your symptoms don\'t match common patterns in our database. We recommend consulting a healthcare professional for proper diagnosis.\n\nGeneral advice:\n- Stay hydrated\n- Get adequate rest\n- Monitor your symptoms\n- Keep a symptom diary', urdu: 'آپ کی علامات ہمارے ڈیٹابیس میں نہیں ملیں۔ براہ کرم ڈاکٹر سے ملیں۔' });
      }
      setAnalyzing(false);
    }, 1500);
  };

  const getSev = (s: string) => {
    if (s === 'Severe')   return { color: '#EF4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)', label: '🔴 Severe' };
    if (s === 'Moderate') return { color: '#F59E0B', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)', label: '🟡 Moderate' };
    return                       { color: '#10B981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)', label: '🟢 Mild' };
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
    @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .xw{animation:fadeUp .4s ease}
    .ab{transition:all .2s;cursor:pointer;border:none}.ab:hover:not(:disabled){opacity:.87;transform:translateY(-1px)}.ab:disabled{cursor:not-allowed;opacity:.4}
    .bk{transition:all .2s;cursor:pointer}.bk:hover{background:rgba(255,255,255,.08)!important}
    .rb{transition:all .2s;cursor:pointer}.rb:hover{opacity:.85;transform:translateY(-1px)}
    .rs{animation:fadeUp .4s ease both}
    .sc:hover{border-color:rgba(59,130,246,.3)!important;background:rgba(59,130,246,.04)!important}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xw" style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora',sans-serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 12s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 16s ease infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="bk" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Sora,sans-serif' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#3B82F6,#60A5FA)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 20px rgba(59,130,246,.3)' }}>🧠</div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9' }}>Diagnosis AI</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Symptom Checker</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse2 2s infinite' }} />AI Online
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
          {!result ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>Apni Symptoms Batayein</h2>
                <p style={{ color: '#475569', fontSize: '14px' }}>AI apke symptoms ko analyze karke possible conditions batayega</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '10px', display: 'block' }}>Symptoms likhein (English mein)</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. headache, fever, cough, stomach pain..."
                  style={{ width: '100%', minHeight: '130px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '16px', color: '#E2E8F0', fontSize: '14px', fontFamily: 'Sora,sans-serif', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {['headache', 'fever', 'cough', 'chest pain', 'stomach pain', 'back pain', 'dizziness', 'fatigue', 'joint pain', 'shortness of breath'].map(s => (
                  <button key={s} className="sc" onClick={() => setSymptoms(p => p ? `${p}, ${s}` : s)}
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '20px', color: '#94A3B8', fontSize: '12px', fontFamily: 'Sora,sans-serif', cursor: 'pointer', transition: 'all .2s' }}>{s}</button>
                ))}
              </div>

              <button className="ab" disabled={!symptoms.trim() || analyzing} onClick={handleAnalyze}
                style={{ width: '100%', padding: '16px', background: symptoms.trim() ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'rgba(255,255,255,.04)', color: symptoms.trim() ? '#fff' : '#334155', borderRadius: '14px', fontSize: '15px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {analyzing ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Analyzing...</> : '🧠 Analyze Symptoms'}
              </button>

              <div style={{ marginTop: '24px', background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>Yeh tool sirf initial guidance ke liye hai — final diagnosis ke liye doctor se zaroor milen.
              </div>
            </div>
          ) : (
            <div>
              <div className="rs" style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>🧠</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Symptom Analysis Complete</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9', marginBottom: '14px' }}>AI Diagnosis Report</h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: getSev(result.severity).bg, border: `1px solid ${getSev(result.severity).border}`, color: getSev(result.severity).color, padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>{getSev(result.severity).label}</div>
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '14px' }}>🔍 Possible Conditions</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.conditions.map((c: string, i: number) => (
                    <span key={i} style={{ padding: '8px 16px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '10px', color: '#60A5FA', fontSize: '13px', fontWeight: 600 }}>{c}</span>
                  ))}
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '14px' }}>📋 Medical Advice</div>
                <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{result.advice}</div>
              </div>

              {result.urdu && (
                <div className="rs" style={{ background: 'rgba(59,130,246,.04)', border: '1px solid rgba(59,130,246,.12)', borderRadius: '16px', padding: '22px', marginBottom: '20px', direction: 'rtl' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#60A5FA', marginBottom: '14px' }}>🇵🇰 اردو مشورہ</div>
                  <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 2, whiteSpace: 'pre-line' }}>{result.urdu}</div>
                </div>
              )}

              <div className="rs" style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>Yeh AI analysis hai — final diagnosis ke liye licensed doctor se zaroor milen.
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="rb" onClick={() => { setResult(null); setSymptoms(''); }} style={{ background: 'linear-gradient(135deg,#3B82F6,#60A5FA)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }}>🔄 New Check</button>
                <button className="rb" onClick={onBack} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>← Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiagnosisAI;
