import React, { useState } from 'react';

const EMERGENCIES = [
  { id: 'heart-attack', icon: '❤️', title: 'Heart Attack', titleUr: 'دل کا دورہ',
    symptoms: ['Chest pain or pressure', 'Pain in arm, jaw, or back', 'Shortness of breath', 'Cold sweats, nausea'],
    steps: ['Call emergency services (1122/115) IMMEDIATELY', 'Have the person sit or lie down comfortably', 'If prescribed, give 1 aspirin (chewed, not swallowed whole)', 'Loosen tight clothing', 'If person becomes unconscious, begin CPR', 'Do NOT leave the person alone'],
    stepsUr: ['فوری طور پر ایمرجنسی نمبر 1122/115 پر کال کریں', 'مریض کو بٹھائیں یا لٹائیں', 'اگر ڈاکٹر نے بتائی ہو تو ایک اسپرین دیں', 'تنگ کپڑے ڈھیلے کریں', 'اگر بے ہوش ہو جائیں تو CPR شروع کریں'] },
  { id: 'choking', icon: '🫁', title: 'Choking', titleUr: 'گلا بند ہونا',
    symptoms: ['Cannot speak, cry, or breathe', 'Clutching throat (universal sign)', 'Coughing weakly or not at all', 'Skin turning blue'],
    steps: ['Ask "Are you choking?" — if they cannot respond, act!', 'Stand behind the person, wrap arms around waist', 'Make a fist with one hand, place above navel', 'Perform quick upward thrusts (Heimlich maneuver)', 'Repeat until object is expelled or person becomes unconscious', 'If unconscious, call emergency and start CPR'],
    stepsUr: ['پوچھیں کیا گلے میں کچھ پھنسا ہے — اگر جواب نہ دے سکیں تو فوری عمل کریں', 'پیچھے سے بازو لپیٹ کر تیز جھٹکے دیں (ہائم لک)', 'بے ہوش ہو جائیں تو CPR شروع کریں'] },
  { id: 'burns', icon: '🔥', title: 'Burns', titleUr: 'جلنا',
    symptoms: ['Red, swollen, painful skin', 'Blisters forming', 'White or charred skin (severe)', 'Intense pain or numbness'],
    steps: ['Remove from heat source immediately', 'Cool the burn under running water for 10-20 minutes', 'Do NOT use ice, butter, or toothpaste', 'Cover loosely with clean, non-stick bandage', 'Take over-the-counter pain relief if needed', 'Seek medical help for burns larger than palm size'],
    stepsUr: ['آگ/گرمی سے فوری دور کریں', '10-20 منٹ ٹھنڈا پانی ڈالیں', 'برف، مکھن یا ٹوتھ پیسٹ نہ لگائیں', 'صاف پٹی سے ڈھانپیں'] },
  { id: 'bleeding', icon: '🩸', title: 'Severe Bleeding', titleUr: 'شدید خون بہنا',
    symptoms: ['Blood soaking through bandages', 'Blood spurting from wound', 'Large pool of blood', 'Person becoming pale/weak'],
    steps: ['Apply firm, direct pressure with clean cloth', 'Keep pressing — do NOT lift to check', 'Elevate the injured area above heart level', 'Call emergency services if bleeding doesn\'t stop in 10 min', 'If blood soaks through, add more cloth on top', 'Keep the person calm and lying down'],
    stepsUr: ['صاف کپڑے سے زخم پر دبائیں', 'دبائے رکھیں — چیک کرنے کے لیے نہ اٹھائیں', 'زخمی حصے کو دل سے اونچا رکھیں', '10 منٹ میں نہ رکے تو ایمرجنسی کال کریں'] },
  { id: 'fracture', icon: '🦴', title: 'Fracture', titleUr: 'ہڈی ٹوٹنا',
    symptoms: ['Intense pain at injury site', 'Swelling and bruising', 'Visible deformity', 'Unable to move the area'],
    steps: ['Do NOT move the injured area', 'Immobilize the limb with a splint', 'Apply ice pack wrapped in cloth (15 min on, 15 off)', 'Control swelling by elevation', 'Call emergency or go to nearest hospital', 'Do NOT try to realign the bone'],
    stepsUr: ['زخمی حصے کو ہلائیں نہیں', 'کھپچی باندھ کر حرکت بند کریں', 'برف کپڑے میں لپیٹ کر لگائیں', 'ہسپتال جائیں — خود ہڈی سیدھی نہ کریں'] },
  { id: 'seizure', icon: '⚡', title: 'Seizure', titleUr: 'مرگی کا دورہ',
    symptoms: ['Uncontrollable shaking/jerking', 'Falls to the ground', 'Loss of consciousness', 'Stiffening of body'],
    steps: ['Clear the area of dangerous objects', 'Do NOT hold the person down or restrain them', 'Place them on their side (recovery position)', 'Do NOT put anything in their mouth', 'Time the seizure — call 1122 if it lasts >5 minutes', 'Stay with them until fully conscious'],
    stepsUr: ['خطرناک چیزیں ہٹائیں', 'مریض کو پکڑیں نہیں', 'کروٹ پر لٹائیں', 'منہ میں کچھ نہ ڈالیں', '5 منٹ سے زیادہ ہو تو 1122 کال کریں'] },
];

const EmergencyAid = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const emergency = EMERGENCIES.find(e => e.id === selected);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
    @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes pulseRed{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 12px rgba(239,68,68,0)}}
    .xw{animation:fadeUp .4s ease}
    .bk{transition:all .2s;cursor:pointer}.bk:hover{background:rgba(255,255,255,.08)!important}
    .rb{transition:all .2s;cursor:pointer}.rb:hover{opacity:.85;transform:translateY(-1px)}
    .rs{animation:fadeUp .4s ease both}
    .ec{transition:all .25s;cursor:pointer}.ec:hover{border-color:rgba(239,68,68,.3)!important;transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.15)}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xw" style={{ minHeight: '100vh', background: '#060A14', fontFamily: "'Sora',sans-serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(239,68,68,.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 12s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)', borderRadius: '50%', animation: 'blobFloat 16s ease infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(6,10,20,.85)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button className="bk" onClick={selected ? () => setSelected(null) : onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#64748B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Sora,sans-serif' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#EF4444,#F87171)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 20px rgba(239,68,68,.3)', animation: 'pulseRed 2s infinite' }}>🚨</div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9' }}>Emergency First Aid</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Life-Saving Guide</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', animation: 'pulse2 1s infinite' }} />EMERGENCY
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          {!selected ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg,#F87171,#FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>Emergency First Aid</h2>
                <p style={{ color: '#475569', fontSize: '14px' }}>Kisi bhi emergency ka intekhab karo — step-by-step guide milegi</p>
              </div>

              <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px' }}>📞</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#FCA5A5' }}>Pakistan Emergency: 1122 (Rescue) / 115 (Edhi)</div>
                  <div style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>Pehle emergency call karein, phir first aid dein!</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                {EMERGENCIES.map(e => (
                  <div key={e.id} className="ec" onClick={() => setSelected(e.id)}
                    style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{e.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#E2E8F0', marginBottom: '4px' }}>{e.title}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{e.titleUr}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : emergency && (
            <div>
              <div className="rs" style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0, animation: 'pulseRed 2s infinite' }}>{emergency.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Emergency Guide</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F1F5F9', marginBottom: '4px' }}>{emergency.title}</h2>
                  <div style={{ fontSize: '14px', color: '#F87171', fontWeight: 600 }}>{emergency.titleUr}</div>
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCA5A5', marginBottom: '16px' }}>⚠️ Signs & Symptoms</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {emergency.symptoms.map((s, i) => (
                    <span key={i} style={{ padding: '8px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: '10px', color: '#FCA5A5', fontSize: '12px', fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="rs" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '16px' }}>📋 Step-by-Step First Aid</div>
                {emergency.steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: i < emergency.steps.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#F87171', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.7 }}>{s}</div>
                  </div>
                ))}
              </div>

              <div className="rs" style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)', borderRadius: '16px', padding: '22px', marginBottom: '20px', direction: 'rtl' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171', marginBottom: '14px' }}>🇵🇰 اردو ہدایات</div>
                {emergency.stepsUr.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: i < emergency.stepsUr.length - 1 ? '1px solid rgba(239,68,68,.08)' : 'none' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#F87171', flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.8 }}>{s}</span>
                  </div>
                ))}
              </div>

              <div className="rs" style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#FCD34D', marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <span>⚠️</span>Yeh guide basic first aid ke liye hai — professional medical help ki jagah nahi le sakti.
              </div>

              <div className="rs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="rb" onClick={() => setSelected(null)} style={{ background: 'linear-gradient(135deg,#EF4444,#F87171)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }}>🚨 Other Emergencies</button>
                <button className="rb" onClick={onBack} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#94A3B8', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>← Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmergencyAid;
