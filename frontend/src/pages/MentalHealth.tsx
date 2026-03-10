import React, { useState } from 'react';
import {
  BrainIcon, ArrowLeftIcon, AlertTriangleIcon, ClipboardIcon,
  RefreshIcon, SparklesIcon,
} from '../components/Icons';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking slowly, or being fidgety/restless',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

const PHQ9_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const MentalHealth = ({ onBack }: { onBack: () => void }) => {
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(-1));
  const [showResult, setShowResult] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const score = answers.reduce((sum, a) => sum + (a >= 0 ? a : 0), 0);
  const allAnswered = answers.every(a => a >= 0);

  const getResult = () => {
    if (score <= 4) return { level: 'Minimal', color: '#10B981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)', advice: 'Your mental health appears to be in a good state. Keep maintaining healthy habits.', urdu: 'آپ کی ذہنی صحت اچھی ہے۔ صحت مند عادات جاری رکھیں۔', pct: 15 };
    if (score <= 9) return { level: 'Mild', color: '#F59E0B', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)', advice: 'Mild symptoms detected. Consider self-care activities: exercise, meditation, talking to friends.', urdu: 'ہلکی علامات پائی گئیں۔ ورزش، مراقبہ اور دوستوں سے بات کریں۔', pct: 35 };
    if (score <= 14) return { level: 'Moderate', color: '#F97316', bg: 'rgba(249,115,22,.12)', border: 'rgba(249,115,22,.3)', advice: 'Moderate depression symptoms. We recommend consulting a mental health professional.', urdu: 'اعتدال پسند ڈپریشن کی علامات۔ ماہر نفسیات سے مشورہ کریں۔', pct: 55 };
    if (score <= 19) return { level: 'Moderately Severe', color: '#EF4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)', advice: 'Significant depression symptoms. Please seek professional help as soon as possible.', urdu: 'شدید ڈپریشن کی علامات۔ براہ کرم جلد از جلد پیشہ ورانہ مدد حاصل کریں۔', pct: 75 };
    return { level: 'Severe', color: '#DC2626', bg: 'rgba(220,38,38,.12)', border: 'rgba(220,38,38,.3)', advice: 'Severe depression detected. Please contact a mental health professional or crisis helpline immediately.', urdu: 'شدید ڈپریشن — فوری طور پر ماہر نفسیات سے رابطہ کریں یا ہیلپ لائن پر کال کریں۔', pct: 95 };
  };

  const res = getResult();
  const R = 40, circ = 2 * Math.PI * R, dashOffset = circ - (res.pct / 100) * circ;

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
    .oq{transition:all .2s;cursor:pointer}.oq:hover{border-color:rgba(59,130,246,.4)!important}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xw" style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora',sans-serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 12s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 16s ease infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="bk" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}>
            <ArrowLeftIcon size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#EC4899,#F472B6)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(236,72,153,.3)', color: '#fff' }}><BrainIcon size={22} /></div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9' }}>Mental Health</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>PHQ-9 Depression Screening</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse2 2s infinite' }} />AI Online
          </div>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
          {!showResult ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ marginBottom: '12px', color: '#F472B6' }}><BrainIcon size={42} /></div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>PHQ-9 Depression Screening</h2>
                <p style={{ color: '#475569', fontSize: '13px' }}>Pichle 2 hafton mein kya aapko ye mehsoos hua?</p>
              </div>

              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#475569' }}>Question {currentQ + 1} of 9</span>
                <span style={{ fontSize: '12px', color: '#EC4899', fontWeight: 600 }}>{answers.filter(a => a >= 0).length}/9 answered</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,.05)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentQ + 1) / 9) * 100}%`, background: 'linear-gradient(90deg,#EC4899,#F472B6)', borderRadius: '2px', transition: 'width .3s ease' }} />
              </div>

              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px', lineHeight: 1.6 }}>{currentQ + 1}. {PHQ9_QUESTIONS[currentQ]}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PHQ9_OPTIONS.map(opt => (
                    <button key={opt.value} className="oq" onClick={() => { const n = [...answers]; n[currentQ] = opt.value; setAnswers(n); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: answers[currentQ] === opt.value ? 'rgba(236,72,153,.1)' : 'rgba(255,255,255,.02)', border: `1px solid ${answers[currentQ] === opt.value ? 'rgba(236,72,153,.4)' : 'rgba(255,255,255,.06)'}`, borderRadius: '12px', color: answers[currentQ] === opt.value ? '#F472B6' : '#94A3B8', fontSize: '13px', fontWeight: answers[currentQ] === opt.value ? 700 : 400, fontFamily: 'Sora,sans-serif', textAlign: 'left', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${answers[currentQ] === opt.value ? '#EC4899' : 'rgba(255,255,255,.12)'}`, background: answers[currentQ] === opt.value ? '#EC4899' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, color: '#fff' }}>{answers[currentQ] === opt.value ? '✓' : ''}</div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button className="rb" disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', color: '#94A3B8', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', cursor: currentQ === 0 ? 'not-allowed' : 'pointer', opacity: currentQ === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ArrowLeftIcon size={12} /> Previous</button>
                {currentQ < 8 ? (
                  <button className="rb" disabled={answers[currentQ] < 0} onClick={() => setCurrentQ(c => c + 1)} style={{ flex: 1, padding: '12px', background: answers[currentQ] >= 0 ? 'linear-gradient(135deg,#EC4899,#F472B6)' : 'rgba(255,255,255,.04)', border: 'none', borderRadius: '12px', color: answers[currentQ] >= 0 ? '#fff' : '#334155', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', cursor: answers[currentQ] < 0 ? 'not-allowed' : 'pointer' }}>Next →</button>
                ) : (
                  <button className="ab" disabled={!allAnswered} onClick={() => setShowResult(true)} style={{ flex: 1, padding: '12px', background: allAnswered ? 'linear-gradient(135deg,#EC4899,#F472B6)' : 'rgba(255,255,255,.04)', color: allAnswered ? '#fff' : '#334155', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif' }}>View Results</button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="rs" style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 90 90"><circle cx="45" cy="45" r={R} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="8" /><circle cx="45" cy="45" r={R} fill="none" stroke={res.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${res.color})` }} /><text x="45" y="45" textAnchor="middle" fill={res.color} fontSize="14" fontWeight="800" fontFamily="Sora,sans-serif">{score}</text><text x="45" y="58" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="Sora,sans-serif">/27</text></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>PHQ-9 Score</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F1F5F9', marginBottom: '10px' }}>{res.level} Depression</h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: res.bg, border: `1px solid ${res.border}`, color: res.color, padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: res.color, display: 'inline-block' }} />
                    {res.level}
                  </div>
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardIcon size={14} /> Recommendation</div>
                <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.9 }}>{res.advice}</div>
              </div>

              <div className="rs" style={{ background: 'rgba(236,72,153,.04)', border: '1px solid rgba(236,72,153,.12)', borderRadius: '16px', padding: '22px', marginBottom: '20px', direction: 'rtl' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F472B6', marginBottom: '14px' }}>&#127477;&#127472; اردو مشورہ</div>
                <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 2 }}>{res.urdu}</div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><SparklesIcon size={14} /> Your Answers</div>
                {PHQ9_QUESTIONS.map((q, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 8 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', flex: 1 }}>{i + 1}. {q}</span>
                    <span style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>{PHQ9_OPTIONS[answers[i]]?.label || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="rs" style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flexShrink: 0, display: 'flex' }}><AlertTriangleIcon size={14} /></span>Yeh screening tool hai — final diagnosis ke liye mental health professional se zaroor milen.
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="rb" onClick={() => { setShowResult(false); setAnswers(Array(9).fill(-1)); setCurrentQ(0); }} style={{ background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}><RefreshIcon size={14} /> Retake</button>
                <button className="rb" onClick={onBack} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}><ArrowLeftIcon size={14} /> Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MentalHealth;
