// src/pages/XRayAnalyzer.tsx
import React, { useState, useRef } from 'react';
import { getToken } from '../services/api';

const BASE_URL = 'https://medcare-backend-338080619950.us-central1.run.app/api/v1';

const XRayAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Sirf image files allowed hain! (JPG, PNG, WEBP)');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep('analyzing');
    setProgress(0);

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${BASE_URL}/analyze/xray`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) throw new Error('Analysis fail ho gayi!');
      const data = await res.json();
      setResult(data);
      setTimeout(() => setStep('result'), 500);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Kuch masla aa gaya. Dobara try karo.');
      setStep('upload');
    }
  };

  const getSeverityConfig = (severity: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('normal')) return { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: '🟢 Normal' };
    if (s.includes('mild')) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '🟡 Mild' };
    if (s.includes('moderate')) return { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', label: '🟠 Moderate' };
    if (s.includes('severe')) return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: '🔴 Severe' };
    if (s.includes('urgent')) return { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', label: '🚨 URGENT' };
    return { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', label: severity || 'Analyzing...' };
  };

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: '#060A14',
      fontFamily: "'Sora', sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    blob1: {
      position: 'fixed', top: '-200px', right: '-200px',
      width: '600px', height: '600px',
      background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none',
    },
    blob2: {
      position: 'fixed', bottom: '-150px', left: '-150px',
      width: '500px', height: '500px',
      background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none',
    },
    topbar: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(6,10,20,0.8)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 10,
    },
    backBtn: {
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#94A3B8', padding: '8px 16px',
      borderRadius: '10px', cursor: 'pointer',
      fontSize: '14px', transition: 'all 0.2s',
    },
    titleArea: { display: 'flex', alignItems: 'center', gap: '12px' },
    iconBox: {
      width: '42px', height: '42px',
      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
      borderRadius: '12px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: '20px',
    },
    title: { fontSize: '18px', fontWeight: 700, color: '#fff' },
    subtitle: { fontSize: '12px', color: '#64748B', marginTop: '2px' },
    badge: {
      display: 'flex', alignItems: 'center', gap: '6px',
      background: 'rgba(16,185,129,0.1)',
      border: '1px solid rgba(16,185,129,0.2)',
      color: '#10B981', padding: '6px 14px',
      borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    },
    content: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },

    // Upload styles
    uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    dropzone: {
      border: '2px dashed rgba(255,255,255,0.1)',
      borderRadius: '20px', padding: '48px 24px',
      textAlign: 'center', cursor: 'pointer',
      transition: 'all 0.3s', minHeight: '320px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.02)',
    },
    dropzoneActive: {
      border: '2px dashed rgba(37,99,235,0.6)',
      background: 'rgba(37,99,235,0.05)',
    },
    dropzoneReady: {
      border: '2px dashed rgba(16,185,129,0.4)',
      background: 'rgba(16,185,129,0.03)',
    },
    uploadIcon: { fontSize: '64px', marginBottom: '16px', opacity: 0.7 },
    uploadTitle: { fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' },
    uploadSub: { fontSize: '13px', color: '#475569' },
    infoCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', padding: '28px',
    },
    infoTitle: { fontSize: '15px', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px' },
    infoItem: {
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    infoItemIcon: {
      width: '32px', height: '32px', borderRadius: '8px',
      background: 'rgba(37,99,235,0.15)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', flexShrink: 0,
    },
    infoItemText: { fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 },
    infoItemTitle: { fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '2px' },
    analyzeBtn: {
      width: '100%', marginTop: '24px',
      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
      border: 'none', color: '#fff',
      padding: '16px', borderRadius: '14px',
      fontSize: '15px', fontWeight: 700,
      cursor: 'pointer', transition: 'opacity 0.2s',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px',
    },
    analyzeBtnDisabled: {
      background: 'rgba(255,255,255,0.05)',
      color: '#475569', cursor: 'not-allowed',
    },

    // Analyzing styles
    analyzingWrap: { textAlign: 'center', padding: '80px 24px' },
    scanWrapper: {
      width: '200px', height: '200px', margin: '0 auto 40px',
      position: 'relative',
    },
    scanImage: {
      width: '200px', height: '200px', objectFit: 'cover',
      borderRadius: '16px', filter: 'grayscale(30%)',
    },
    scanLine: {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '3px',
      background: 'linear-gradient(90deg, transparent, #2563EB, #7C3AED, transparent)',
      animation: 'scanLine 2s linear infinite',
      boxShadow: '0 0 20px rgba(37,99,235,0.8)',
    },
    progressBar: {
      width: '100%', maxWidth: '400px', margin: '0 auto',
      height: '6px', background: 'rgba(255,255,255,0.06)',
      borderRadius: '3px', overflow: 'hidden',
    },
    progressFill: {
      height: '100%', borderRadius: '3px',
      background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
      transition: 'width 0.4s ease',
    },
    stepsList: {
      maxWidth: '400px', margin: '32px auto 0',
      display: 'flex', flexDirection: 'column', gap: '10px',
    },
    stepItem: {
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px', padding: '12px 16px',
      fontSize: '13px', color: '#64748B',
    },

    // Result styles
    resultHeader: {
      display: 'flex', gap: '24px', marginBottom: '24px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', padding: '24px',
      alignItems: 'center',
    },
    resultImage: {
      width: '120px', height: '120px', objectFit: 'cover',
      borderRadius: '12px', flexShrink: 0,
      filter: 'grayscale(20%)',
    },
    resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    resultCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '20px',
    },
    resultCardLabel: { fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' },
    resultCardValue: { fontSize: '28px', fontWeight: 800, color: '#E2E8F0' },
    reportBox: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '24px', marginBottom: '20px',
    },
    reportTitle: { fontSize: '14px', fontWeight: 700, color: '#94A3B8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
    reportText: { fontSize: '14px', color: '#CBD5E1', lineHeight: 1.8 },
    urduBox: {
      background: 'rgba(124,58,237,0.05)',
      border: '1px solid rgba(124,58,237,0.15)',
      borderRadius: '16px', padding: '24px', marginBottom: '20px',
      direction: 'rtl',
    },
    actionBtns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    btnPrimary: {
      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
      border: 'none', color: '#fff', padding: '14px',
      borderRadius: '12px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px',
    },
    btnSecondary: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#94A3B8', padding: '14px',
      borderRadius: '12px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px',
    },
    pendingBadge: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: 'rgba(245,158,11,0.1)',
      border: '1px solid rgba(245,158,11,0.2)',
      color: '#F59E0B', padding: '8px 16px',
      borderRadius: '20px', fontSize: '13px', fontWeight: 600,
      marginBottom: '20px',
    },
    errorBox: {
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '12px', padding: '14px 18px',
      color: '#FCA5A5', fontSize: '13px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '8px',
    },
  };

  const sevConfig = result ? getSeverityConfig(result.severity || '') : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: calc(100% - 3px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .xray-back:hover { background: rgba(255,255,255,0.08) !important; color: #E2E8F0 !important; }
        .xray-analyze:hover { opacity: 0.85; }
        .xray-btn:hover { opacity: 0.85; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        {/* Topbar */}
        <div style={styles.topbar}>
          <button
            className="xray-back"
            style={styles.backBtn}
            onClick={onBack}
          >
            ← Back
          </button>

          <div style={styles.titleArea}>
            <div style={styles.iconBox}>🫁</div>
            <div>
              <div style={styles.title}>X-Ray Analyzer</div>
              <div style={styles.subtitle}>Chest X-Ray • MRI • CT Scan</div>
            </div>
          </div>

          <div style={styles.badge}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            AI Online
          </div>
        </div>

        <div style={styles.content}>

          {/* ── UPLOAD STEP ── */}
          {step === 'upload' && (
            <div style={styles.uploadGrid}>
              {/* Dropzone */}
              <div>
                {error && (
                  <div style={styles.errorBox}>
                    ⚠️ {error}
                  </div>
                )}

                <div
                  style={{
                    ...styles.dropzone,
                    ...(dragOver ? styles.dropzoneActive : {}),
                    ...(preview ? styles.dropzoneReady : {}),
                  }}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="X-Ray"
                        style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '12px', marginBottom: '16px', filter: 'grayscale(20%)' }}
                      />
                      <div style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>
                        ✅ {selectedFile?.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                        Click to change
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.uploadIcon}>🫁</div>
                      <div style={styles.uploadTitle}>X-Ray Image Drop Karo</div>
                      <div style={styles.uploadSub}>Ya click karke select karo</div>
                      <div style={{ marginTop: '16px', fontSize: '12px', color: '#334155' }}>
                        JPG • PNG • WEBP • DICOM
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="xray-analyze"
                  style={{
                    ...styles.analyzeBtn,
                    ...((!selectedFile) ? styles.analyzeBtnDisabled : {}),
                  }}
                  onClick={handleAnalyze}
                  disabled={!selectedFile}
                >
                  🔬 Analyze Karo
                </button>
              </div>

              {/* Info Panel */}
              <div style={styles.infoCard}>
                <div style={styles.infoTitle}>🤖 AI Kya Detect Karega?</div>

                {[
                  { icon: '🫁', title: 'Lung Conditions', desc: 'Pneumonia, TB, Pleural Effusion, Lung Opacity' },
                  { icon: '🦴', title: 'Bone Structure', desc: 'Rib fractures, Spine alignment, Bone density' },
                  { icon: '❤️', title: 'Heart Size', desc: 'Cardiomegaly, Heart shadow assessment' },
                  { icon: '🔬', title: 'Abnormalities', desc: 'Masses, Nodules, Infiltrates, Consolidation' },
                  { icon: '📊', title: 'Severity Score', desc: 'Normal → Mild → Moderate → Severe → URGENT' },
                ].map((item, i) => (
                  <div key={i} style={{ ...styles.infoItem, ...(i === 4 ? { borderBottom: 'none' } : {}) }}>
                    <div style={styles.infoItemIcon}>{item.icon}</div>
                    <div>
                      <div style={styles.infoItemTitle}>{item.title}</div>
                      <div style={styles.infoItemText}>{item.desc}</div>
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: '20px', padding: '12px 16px',
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.15)',
                  borderRadius: '10px', fontSize: '12px', color: '#60A5FA',
                }}>
                  ⚡ LLaVA-Med model — 3x majority voting for accuracy
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYZING STEP ── */}
          {step === 'analyzing' && (
            <div style={styles.analyzingWrap}>
              <div style={styles.scanWrapper}>
                {preview && (
                  <img src={preview} alt="Scanning" style={styles.scanImage} />
                )}
                <div style={styles.scanLine} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Analysis Chal Rahi Hai...
              </h2>
              <p style={{ color: '#475569', marginBottom: '32px', fontSize: '14px' }}>
                LLaVA-Med model X-Ray analyze kar raha hai
              </p>

              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px' }}>
                {Math.round(progress)}% complete
              </div>

              <div style={styles.stepsList}>
                {[
                  { label: '✅ Image uploaded', done: true },
                  { label: '✅ Preprocessing...', done: progress > 20 },
                  { label: progress > 40 ? '✅ Model running...' : '⏳ Model loading...', done: progress > 40 },
                  { label: progress > 70 ? '✅ Report generating...' : '⏳ Generating report...', done: progress > 70 },
                  { label: progress >= 90 ? '✅ Finalizing...' : '⏳ Finalizing...', done: progress >= 90 },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.stepItem, color: s.done ? '#94A3B8' : '#334155' }}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULT STEP ── */}
          {step === 'result' && result && sevConfig && (
            <div>
              {/* Pending notice */}
              <div style={styles.pendingBadge}>
                ⏳ Doctor Review Pending — Report save ho gayi, doctor approve karega
              </div>

              {/* Header */}
              <div style={styles.resultHeader}>
                {preview && (
                  <img src={preview} alt="X-Ray" style={styles.resultImage} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Analysis Complete</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#E2E8F0', marginBottom: '12px' }}>
                    X-Ray Report Ready
                  </h2>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: sevConfig.bg,
                    border: `1px solid ${sevConfig.border}`,
                    color: sevConfig.color,
                    padding: '8px 20px', borderRadius: '20px',
                    fontSize: '14px', fontWeight: 700,
                  }}>
                    {sevConfig.label}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={styles.resultGrid}>
                <div style={styles.resultCard}>
                  <div style={styles.resultCardLabel}>Confidence Score</div>
                  <div style={{ ...styles.resultCardValue, color: sevConfig.color }}>
                    {result.confidence ? `${Math.round(result.confidence)}%` : 'N/A'}
                  </div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultCardLabel}>Analysis Time</div>
                  <div style={styles.resultCardValue}>
                    {result.time ? `${result.time.toFixed(1)}s` : result.time_seconds ? `${result.time_seconds.toFixed(1)}s` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* English Report */}
              <div style={styles.reportBox}>
                <div style={styles.reportTitle}>
                  <span>📋</span> AI Radiology Report
                </div>
                <div style={styles.reportText}>
                  {result.report || result.analysis || 'Report generating...'}
                </div>
              </div>

              {/* Urdu Report */}
              {result.urdu_report && (
                <div style={styles.urduBox}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#A78BFA', marginBottom: '12px', direction: 'rtl' }}>
                    🇵🇰 اردو رپورٹ
                  </div>
                  <div style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 2 }}>
                    {result.urdu_report}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '12px', padding: '14px 18px',
                fontSize: '12px', color: '#FCD34D',
                marginBottom: '20px',
              }}>
                ⚠️ Yeh AI analysis hai — final diagnosis ke liye doctor se zaroor milen.
              </div>

              {/* Action Buttons */}
              <div style={styles.actionBtns}>
                <button
                  className="xray-btn"
                  style={styles.btnPrimary}
                  onClick={() => {
                    setStep('upload');
                    setResult(null);
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                >
                  🔄 New Scan
                </button>
                <button
                  className="xray-btn"
                  style={styles.btnSecondary}
                  onClick={onBack}
                >
                  ← Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default XRayAnalyzer;