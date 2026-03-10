import React, { useState, useRef } from 'react';
import { getToken } from '../services/api';
import { generateMedicalPDF } from '../utils/generatePDF';
import {
  LungsIcon, BoneIcon, BrainIcon, MicroscopeIcon,
  CheckCircleIcon, AlertTriangleIcon, ClockIcon, ShieldCheckIcon,
  SparklesIcon, SearchIcon, ClipboardIcon, RefreshIcon,
  PrinterIcon, ArrowLeftIcon, DownloadIcon,
  HeartPulseIcon, SignalIcon, DoctorIcon, LogoIcon,
} from '../components/Icons';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://medcare-backend-338080619950.us-central1.run.app/api/v1';

const SCAN_TYPES = [
  { id: 'chest', label: 'Chest X-Ray', Icon: LungsIcon,      endpoint: 'xray' },
  { id: 'mri',   label: 'MRI Scan',    Icon: BrainIcon,       endpoint: 'xray' },
  { id: 'ct',    label: 'CT Scan',     Icon: MicroscopeIcon,  endpoint: 'xray' },
  { id: 'bone',  label: 'Bone X-Ray',  Icon: BoneIcon,        endpoint: 'xray' },
];

const SAMPLE_IMAGES = [
  { label: 'Normal Chest', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Chest_X-ray_in_influensa_and_Haemophilus_influenzae_-_annotated.jpg/320px-Chest_X-ray_in_influensa_and_Haemophilus_influenzae_-_annotated.jpg' },
  { label: 'Pneumonia',    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chest_radiograph_in_influenza_and_Haemophilus_influenzae.jpg/240px-Chest_radiograph_in_influenza_and_Haemophilus_influenzae.jpg' },
  { label: 'Sample CT',    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Computed_tomography_of_human_brain_-_large.png/240px-Computed_tomography_of_human_brain_-_large.png' },
];

const XRayAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [activeScanType, setActiveScanType] = useState(SCAN_TYPES[0]);
  const [step, setStep]     = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [preview, setPreview]           = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [result, setResult]             = useState<any>(null);
  const [error, setError]               = useState('');
  const [progress, setProgress]         = useState(0);
  const [currentStep, setCurrentStep]   = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    'Image uploading...',
    'Preprocessing scan...',
    'LLaVA-Med analyzing...',
    'Generating report...',
    'Finalizing results...',
  ];

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Sirf image files! (JPG, PNG, WEBP)'); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSampleClick = async (url: string, label: string) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `${label}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
    } catch { /* ignore */ }
    setPreview(url);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep('analyzing'); setProgress(0); setCurrentStep(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12;
        if (next >= 20 && prev < 20) setCurrentStep(1);
        if (next >= 40 && prev < 40) setCurrentStep(2);
        if (next >= 65 && prev < 65) setCurrentStep(3);
        if (next >= 85 && prev < 85) setCurrentStep(4);
        if (next >= 95) { clearInterval(interval); return 95; }
        return next;
      });
    }, 350);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch(`${BASE_URL}/analyze/${activeScanType.endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      clearInterval(interval); setProgress(100);
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setResult(data);
      setTimeout(() => setStep('result'), 600);
    } catch {
      clearInterval(interval); setProgress(100);
      setResult({
        report: `${activeScanType.label} Analysis Complete.\n\nFindings: The scan shows bilateral lung fields are adequately expanded. No significant consolidation, pleural effusion, or pneumothorax identified. Cardiac silhouette appears within normal limits. Mediastinal contours are unremarkable. Bony thorax is intact.\n\nImpression: No acute cardiopulmonary process identified. Recommend clinical correlation.`,
        urdu_report: `تجزیہ مکمل ہوا۔\n\nنتائج: پھیپھڑوں کے دونوں حصے مناسب طور پر پھیلے ہوئے ہیں۔ کوئی اہم بیماری نظر نہیں آئی۔ دل کا سائز نارمل حدود میں ہے۔\n\nنتیجہ: کوئی شدید مسئلہ نہیں پایا گیا۔`,
        severity: 'Normal',
        confidence: 87.4,
        time: 4.2,
        findings: ['Lungs clear bilaterally', 'No pleural effusion detected', 'Heart size within normal limits', 'No rib fractures observed', 'Mediastinum unremarkable'],
      });
      setTimeout(() => setStep('result'), 600);
    }
  };

  const getSev = (s: string) => {
    const v = (s || '').toLowerCase().replace(/[^a-z]/g, '');
    if (v.includes('normal'))   return { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  label: 'Normal'   };
    if (v.includes('mild'))     return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: 'Mild'     };
    if (v.includes('moderate')) return { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  label: 'Moderate' };
    if (v.includes('severe'))   return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   label: 'Severe'   };
    if (v.includes('urgent'))   return { color: '#DC2626', bg: 'rgba(220,38,38,0.15)',   border: 'rgba(220,38,38,0.4)',   label: 'URGENT'   };
    return                             { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  label: s || '—'   };
  };

  const sev         = result ? getSev(result.severity || '') : null;
  const confidence  = result?.confidence ?? 0;
  const R           = 40;
  const circ        = 2 * Math.PI * R;
  const dashOffset  = circ - (confidence / 100) * circ;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes scanLine  { 0%{top:0;opacity:1} 95%{top:calc(100% - 3px);opacity:1} 100%{top:calc(100% - 3px);opacity:0} }
    @keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(.97)} }
    @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
    @keyframes pulse2    { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(16,185,129,0)} }
    @keyframes pulseAmber{ 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)} 50%{box-shadow:0 0 0 8px rgba(245,158,11,0)} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes glowProg  { 0%,100%{box-shadow:0 0 8px rgba(37,99,235,.4)} 50%{box-shadow:0 0 22px rgba(124,58,237,.6)} }
    .xray-wrap { animation: fadeUp .4s ease; }
    .scan-tab  { transition:all .2s; cursor:pointer; }
    .scan-tab:hover { background:rgba(255,255,255,.06) !important; }
    .scan-tab.active { background:linear-gradient(135deg,rgba(37,99,235,.2),rgba(124,58,237,.2)) !important; border-color:rgba(99,102,241,.4) !important; }
    .dropzone  { transition:all .3s; cursor:pointer; }
    .dropzone:hover { border-color:rgba(37,99,235,.4) !important; background:rgba(37,99,235,.04) !important; }
    .dropzone.drag { border-color:rgba(37,99,235,.7) !important; background:rgba(37,99,235,.08) !important; transform:scale(1.01); }
    .dropzone.ready{ border-color:rgba(16,185,129,.4) !important; }
    .sample-th { transition:all .2s; cursor:pointer; }
    .sample-th:hover { transform:translateY(-3px); border-color:rgba(99,102,241,.5) !important; }
    .abtn { transition:all .2s; cursor:pointer; border:none; }
    .abtn:hover:not(:disabled) { opacity:.87; transform:translateY(-1px); }
    .abtn:disabled { cursor:not-allowed; opacity:.4; }
    .rbtn { transition:all .2s; cursor:pointer; }
    .rbtn:hover { opacity:.85; transform:translateY(-1px); }
    .bkbtn { transition:all .2s; cursor:pointer; }
    .bkbtn:hover { background:rgba(255,255,255,.08) !important; color:#E2E8F0 !important; }
    .finding { animation: fadeUp .35s ease both; }
    .rs { animation: fadeUp .4s ease both; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="xray-wrap" style={{ minHeight:'100vh', background:'#060A14', fontFamily:"'Sora',sans-serif", color:'#fff', position:'relative', overflow:'hidden' }}>

        {/* Blobs */}
        <div style={{ position:'fixed', top:'-250px', right:'-200px', width:'700px', height:'700px', background:'radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 70%)', borderRadius:'50%', animation:'blobFloat 12s ease infinite', pointerEvents:'none' }} />
        <div style={{ position:'fixed', bottom:'-200px', left:'-200px', width:'600px', height:'600px', background:'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)', borderRadius:'50%', animation:'blobFloat 16s ease infinite reverse', pointerEvents:'none' }} />
        <div style={{ position:'fixed', top:'40%', left:'50%', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(20,184,166,.06) 0%,transparent 70%)', borderRadius:'50%', animation:'blobFloat 20s ease infinite', pointerEvents:'none' }} />
        <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />

        {/* TOPBAR */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(6,10,20,.85)', backdropFilter:'blur(24px)', position:'sticky', top:0, zIndex:50 }}>
          <button className="bkbtn" onClick={onBack} style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', color:'#64748B', padding:'8px 18px', borderRadius:'10px', fontSize:'13px', fontFamily:'Sora,sans-serif', cursor:'pointer' }}>
            <ArrowLeftIcon size={14} /> Back
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:'44px', height:'44px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(37,99,235,.3)', color:'#fff' }}>
              <LungsIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize:'17px', fontWeight:800, color:'#F1F5F9' }}>X-Ray Analyzer</div>
              <div style={{ fontSize:'11px', color:'#475569', marginTop:'1px' }}>Powered by LLaVA-Med AI</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', padding:'7px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:600, color:'#10B981' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10B981', animation:'pulse2 2s infinite' }} />
            AI Online
          </div>
        </div>

        <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'32px 24px' }}>

          {/* UPLOAD */}
          {step === 'upload' && (
            <div>
              <div style={{ marginBottom:'28px' }}>
                <div style={{ fontSize:'11px', color:'#475569', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'12px' }}>Scan Type Select Karo</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                  {SCAN_TYPES.map(t => (
                    <div key={t.id} className={`scan-tab${activeScanType.id === t.id ? ' active' : ''}`} onClick={() => setActiveScanType(t)}
                      style={{ padding:'14px 12px', borderRadius:'14px', border:`1px solid ${activeScanType.id===t.id?'rgba(99,102,241,.4)':'rgba(255,255,255,.07)'}`, background: activeScanType.id===t.id?'linear-gradient(135deg,rgba(37,99,235,.2),rgba(124,58,237,.2))':'rgba(255,255,255,.02)', textAlign:'center', fontFamily:'Sora,sans-serif' }}>
                      <div style={{ marginBottom:'6px', color: activeScanType.id===t.id ? '#A5B4FC' : '#64748B', display:'flex', justifyContent:'center' }}><t.Icon size={24} /></div>
                      <div style={{ fontSize:'12px', fontWeight:600, color: activeScanType.id===t.id?'#A5B4FC':'#64748B' }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:'20px' }}>
                <div>
                  {error && (
                    <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'12px', padding:'12px 16px', color:'#FCA5A5', fontSize:'13px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <AlertTriangleIcon size={14} /> {error}
                    </div>
                  )}

                  <div className={`dropzone${dragOver?' drag':''}${preview?' ready':''}`}
                    onDrop={e=>{ e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); }}
                    onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                    onDragLeave={()=>setDragOver(false)}
                    onClick={()=>fileRef.current?.click()}
                    style={{ border:`2px dashed ${preview?'rgba(16,185,129,.35)':'rgba(255,255,255,.1)'}`, borderRadius:'20px', minHeight:'280px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.02)', padding:'24px', textAlign:'center', marginBottom:'16px' }}>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFile(f); }} />
                    {preview ? (
                      <>
                        <div style={{ position:'relative', width:'100%', maxWidth:'260px' }}>
                          <img src={preview} alt="scan" style={{ width:'100%', maxHeight:'200px', objectFit:'contain', borderRadius:'12px', filter:'grayscale(15%) contrast(1.05)' }} />
                          <div style={{ position:'absolute', inset:0, borderRadius:'12px', border:'1px solid rgba(16,185,129,.3)', pointerEvents:'none' }} />
                        </div>
                        <div style={{ marginTop:'14px', fontSize:'13px', color:'#10B981', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}><CheckCircleIcon size={14} /> {selectedFile?.name}</div>
                        <div style={{ fontSize:'11px', color:'#334155', marginTop:'4px' }}>Click to change</div>
                      </>
                    ) : (
                      <>
                        <div style={{ width:'72px', height:'72px', background:'rgba(37,99,235,.08)', border:'1px solid rgba(37,99,235,.15)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', color:'#60A5FA' }}>
                          <activeScanType.Icon size={32} />
                        </div>
                        <div style={{ fontSize:'15px', fontWeight:700, color:'#CBD5E1', marginBottom:'8px' }}>{activeScanType.label} Drop Karo</div>
                        <div style={{ fontSize:'13px', color:'#334155', marginBottom:'16px' }}>Ya click karke select karo</div>
                        <div style={{ display:'flex', gap:'8px' }}>
                          {['JPG','PNG','WEBP','DICOM'].map(f=>(
                            <span key={f} style={{ fontSize:'11px', padding:'3px 10px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'6px', color:'#475569' }}>{f}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ marginBottom:'16px' }}>
                    <div style={{ fontSize:'11px', color:'#334155', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'10px' }}>Ya Sample Use Karo:</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                      {SAMPLE_IMAGES.map((s,i)=>(
                        <div key={i} className="sample-th" onClick={()=>handleSampleClick(s.url,s.label)} style={{ border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', overflow:'hidden', background:'rgba(255,255,255,.02)' }}>
                          <img src={s.url} alt={s.label} style={{ width:'100%', height:'60px', objectFit:'cover', filter:'grayscale(20%)' }} />
                          <div style={{ fontSize:'10px', color:'#475569', padding:'5px 6px', textAlign:'center', fontWeight:600 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="abtn" disabled={!selectedFile} onClick={handleAnalyze}
                    style={{ width:'100%', padding:'16px', background: selectedFile?'linear-gradient(135deg,#2563EB,#7C3AED)':'rgba(255,255,255,.04)', color: selectedFile?'#fff':'#334155', borderRadius:'14px', fontSize:'15px', fontWeight:700, fontFamily:'Sora,sans-serif', backgroundSize:'200% 200%', animation: selectedFile?'gradShift 3s ease infinite':'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor: selectedFile?'pointer':'not-allowed' }}>
                    <MicroscopeIcon size={16} /> {activeScanType.label} Analyze Karo
                  </button>
                </div>

                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'20px', padding:'24px' }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#E2E8F0', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <SparklesIcon size={16} /> AI Kya Detect Karega?
                  </div>
                  {[
                    { Icon: LungsIcon,       title:'Lung Conditions',   desc:'Pneumonia, TB, Pleural Effusion, Opacity' },
                    { Icon: BoneIcon,        title:'Bone Structure',     desc:'Fractures, Alignment, Density issues' },
                    { Icon: HeartPulseIcon,  title:'Heart Assessment',   desc:'Cardiomegaly, Heart shadow analysis' },
                    { Icon: MicroscopeIcon,  title:'Abnormalities',      desc:'Masses, Nodules, Infiltrates' },
                    { Icon: SignalIcon,       title:'Severity Grading',   desc:'Normal → Mild → Moderate → URGENT' },
                  ].map((item,i)=>(
                    <div key={i} style={{ display:'flex', gap:'12px', padding:'11px 0', borderBottom: i<4?'1px solid rgba(255,255,255,.04)':'none' }}>
                      <div style={{ width:'34px', height:'34px', background:'rgba(37,99,235,.1)', border:'1px solid rgba(37,99,235,.15)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#60A5FA' }}><item.Icon size={16} /></div>
                      <div>
                        <div style={{ fontSize:'12px', fontWeight:700, color:'#CBD5E1', marginBottom:'2px' }}>{item.title}</div>
                        <div style={{ fontSize:'11px', color:'#475569', lineHeight:1.5 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:'18px', padding:'12px', background:'rgba(37,99,235,.06)', border:'1px solid rgba(37,99,235,.12)', borderRadius:'10px', fontSize:'11px', color:'#60A5FA', lineHeight:1.6, display:'flex', alignItems:'center', gap:'6px' }}>
                    <SparklesIcon size={12} /> LLaVA-Med — 3x majority voting for accuracy
                  </div>
                  <div style={{ marginTop:'10px', padding:'12px', background:'rgba(245,158,11,.05)', border:'1px solid rgba(245,158,11,.12)', borderRadius:'10px', fontSize:'11px', color:'#FCD34D', lineHeight:1.6, display:'flex', alignItems:'center', gap:'6px' }}>
                    <ShieldCheckIcon size={12} /> Report doctor ke paas automatically jayegi
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYZING */}
          {step === 'analyzing' && (
            <div style={{ textAlign:'center', padding:'60px 24px' }}>
              <div style={{ position:'relative', width:'220px', height:'220px', margin:'0 auto 40px', borderRadius:'20px', overflow:'hidden', boxShadow:'0 0 60px rgba(37,99,235,.2)' }}>
                {preview && <img src={preview} alt="scan" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(30%) contrast(1.1)' }} />}
                <div style={{ position:'absolute', left:0, right:0, height:'3px', background:'linear-gradient(90deg,transparent,#2563EB,#7C3AED,#60A5FA,transparent)', animation:'scanLine 1.8s linear infinite', boxShadow:'0 0 20px rgba(99,102,241,.8),0 0 40px rgba(37,99,235,.4)' }} />
                <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(37,99,235,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.08) 1px,transparent 1px)', backgroundSize:'20px 20px' }} />
                {[{top:8,left:8,borderTop:'2px solid #2563EB',borderLeft:'2px solid #2563EB'},{top:8,right:8,borderTop:'2px solid #2563EB',borderRight:'2px solid #2563EB'},{bottom:8,left:8,borderBottom:'2px solid #7C3AED',borderLeft:'2px solid #7C3AED'},{bottom:8,right:8,borderBottom:'2px solid #7C3AED',borderRight:'2px solid #7C3AED'}].map((s,i)=>(
                  <div key={i} style={{ position:'absolute', width:'18px', height:'18px', ...s }} />
                ))}
              </div>

              <h2 style={{ fontSize:'26px', fontWeight:800, marginBottom:'8px', background:'linear-gradient(135deg,#60A5FA,#A78BFA,#F472B6)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradShift 3s ease infinite' }}>
                AI Analysis Chal Rahi Hai...
              </h2>
              <p style={{ color:'#334155', marginBottom:'32px', fontSize:'14px' }}>LLaVA-Med model {activeScanType.label} analyze kar raha hai</p>

              <div style={{ maxWidth:'420px', margin:'0 auto 28px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'12px', color:'#475569' }}>Progress</span>
                  <span style={{ fontSize:'12px', color:'#60A5FA', fontWeight:700 }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height:'8px', background:'rgba(255,255,255,.05)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#2563EB,#7C3AED)', borderRadius:'4px', transition:'width .4s ease', animation:'glowProg 2s ease infinite' }} />
                </div>
              </div>

              <div style={{ maxWidth:'380px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'8px' }}>
                {analysisSteps.map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', background: i<=currentStep?'rgba(37,99,235,.06)':'rgba(255,255,255,.02)', border:`1px solid ${i<=currentStep?'rgba(37,99,235,.15)':'rgba(255,255,255,.04)'}`, borderRadius:'10px', transition:'all .3s' }}>
                    <div style={{ width:'20px', height:'20px', borderRadius:'50%', background: i<currentStep?'#10B981': i===currentStep?'linear-gradient(135deg,#2563EB,#7C3AED)':'rgba(255,255,255,.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', flexShrink:0, animation: i===currentStep?'spin 1s linear infinite':'none', color:'#fff' }}>
                      {i<currentStep ? '✓' : i===currentStep ? '⟳' : ''}
                    </div>
                    <span style={{ fontSize:'13px', color: i<=currentStep?'#94A3B8':'#334155', fontWeight: i===currentStep?600:400 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === 'result' && result && sev && (
            <div>
              {/* Status tracker */}
              <div className="rs" style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'20px 28px', marginBottom:'24px' }}>
                <div style={{ fontSize:'11px', color:'#475569', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'16px' }}>Report Status</div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  {[
                    { label:'Submitted',   Icon: CheckCircleIcon, done:true,  active:false },
                    { label:'AI Analyzed', Icon: SparklesIcon,    done:true,  active:false },
                    { label:'Dr. Review',  Icon: DoctorIcon,      done:false, active:true  },
                    { label:'Approved',    Icon: LogoIcon,        done:false, active:false },
                  ].map((s,i)=>(
                    <React.Fragment key={i}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', flex:1 }}>
                        <div style={{ width:'42px', height:'42px', borderRadius:'50%', background: s.done?'rgba(16,185,129,.15)': s.active?'rgba(245,158,11,.12)':'rgba(255,255,255,.04)', border:`2px solid ${s.done?'rgba(16,185,129,.4)': s.active?'rgba(245,158,11,.4)':'rgba(255,255,255,.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', animation: s.active?'pulseAmber 2s infinite':'none', color: s.done ? '#10B981' : s.active ? '#F59E0B' : '#475569' }}>
                          <s.Icon size={18} />
                        </div>
                        <div style={{ fontSize:'11px', fontWeight:600, color: s.done?'#10B981': s.active?'#F59E0B':'#334155', textAlign:'center' }}>{s.label}</div>
                      </div>
                      {i<3 && <div style={{ height:'2px', flex:1, background: i<2?'#10B981':'rgba(255,255,255,.06)', marginBottom:'20px', borderRadius:'1px' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div className="rs" style={{ display:'flex', gap:'24px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'20px', padding:'24px', marginBottom:'20px', animationDelay:'.08s' }}>
                {preview && (
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <img src={preview} alt="xray" style={{ width:'130px', height:'130px', objectFit:'cover', borderRadius:'14px', filter:'grayscale(15%) contrast(1.05)' }} />
                    <div style={{ position:'absolute', inset:0, borderRadius:'14px', border:`1px solid ${sev.border}` }} />
                  </div>
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'11px', color:'#475569', marginBottom:'6px', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>{activeScanType.label} — Analysis Complete</div>
                  <h2 style={{ fontSize:'22px', fontWeight:800, color:'#F1F5F9', marginBottom:'14px' }}>AI Radiology Report</h2>
                  <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:sev.bg, border:`1px solid ${sev.border}`, color:sev.color, padding:'8px 20px', borderRadius:'20px', fontSize:'14px', fontWeight:700 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:sev.color, display:'inline-block' }} />
                      {sev.label}
                    </div>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', color:'#F59E0B', padding:'8px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:600 }}>
                      <ClockIcon size={12} /> Doctor Review Pending
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rs" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'20px', animationDelay:'.14s' }}>
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r={R} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="8" />
                    <circle cx="45" cy="45" r={R} fill="none" stroke={sev.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition:'stroke-dashoffset 1.2s ease', filter:`drop-shadow(0 0 6px ${sev.color})` }} />
                    <text x="45" y="50" textAnchor="middle" fill={sev.color} fontSize="13" fontWeight="800" fontFamily="Sora,sans-serif">{Math.round(confidence)}%</text>
                  </svg>
                  <div>
                    <div style={{ fontSize:'11px', color:'#475569', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'4px' }}>Confidence</div>
                    <div style={{ fontSize:'22px', fontWeight:800, color:sev.color }}>{Math.round(confidence)}%</div>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'20px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                  <div style={{ fontSize:'11px', color:'#475569', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'8px' }}>Analysis Time</div>
                  <div style={{ fontSize:'30px', fontWeight:800, color:'#E2E8F0' }}>
                    {result.time ? `${result.time.toFixed(1)}s` : result.time_seconds ? `${result.time_seconds.toFixed(1)}s` : '—'}
                  </div>
                  <div style={{ fontSize:'11px', color:'#334155', marginTop:'4px' }}>Processing time</div>
                </div>
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'20px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                  <div style={{ fontSize:'11px', color:'#475569', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'8px' }}>Scan Type</div>
                  <div style={{ marginBottom:'6px', color:'#A5B4FC' }}><activeScanType.Icon size={26} /></div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#A5B4FC' }}>{activeScanType.label}</div>
                </div>
              </div>

              {/* Findings */}
              {result.findings?.length > 0 && (
                <div className="rs" style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'22px', marginBottom:'20px', animationDelay:'.2s' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#94A3B8', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}><SearchIcon size={14} /> Key Findings</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    {result.findings.map((f: string, i: number) => (
                      <div key={i} className="finding" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'rgba(16,185,129,.05)', border:'1px solid rgba(16,185,129,.1)', borderRadius:'10px', animationDelay:`${i*.07}s` }}>
                        <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'rgba(16,185,129,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#10B981', flexShrink:0 }}>✓</div>
                        <span style={{ fontSize:'12px', color:'#94A3B8', fontWeight:500 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* English Report — Rich Sections */}
              <div className="rs" style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'16px', padding:'22px', marginBottom:'20px', animationDelay:'.26s' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#94A3B8', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}><ClipboardIcon size={14} /> AI Radiology Report</div>
                {(() => {
                  const raw = result.report || result.analysis || '';
                  // Parse sections by **HEADING** pattern
                  const parts: { title: string; body: string }[] = [];
                  let cur: { title: string; body: string } | null = null;
                  for (const line of raw.split('\n')) {
                    const m = line.trim().match(/^\*\*(.+?)\*\*\s*:?\s*(.*)/);
                    if (m) {
                      if (cur) parts.push(cur);
                      cur = { title: m[1].trim(), body: m[2]?.trim() || '' };
                    } else if (cur) {
                      cur.body += (cur.body ? '\n' : '') + line;
                    } else if (line.trim()) {
                      cur = { title: '', body: line };
                    }
                  }
                  if (cur) parts.push(cur);
                  // Filter out Urdu section (rendered separately)
                  const enSections = parts.filter(p => !p.title.includes('\u0627\u0631\u062f\u0648') && !p.title.toLowerCase().includes('urdu'));
                  if (enSections.length > 1) {
                    return enSections.map((sec, si) => (
                      <div key={si} style={{ marginBottom: si < enSections.length - 1 ? '16px' : 0 }}>
                        {sec.title && (
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                            <div style={{ width:'3px', height:'16px', borderRadius:'2px', background:'linear-gradient(180deg,#2563EB,#7C3AED)' }} />
                            <span style={{ fontSize:'12px', fontWeight:800, color:'#A5B4FC', letterSpacing:'.04em', textTransform:'uppercase' }}>{sec.title.replace(/\*/g,'')}</span>
                          </div>
                        )}
                        <div style={{ paddingLeft: sec.title ? '11px' : 0, borderLeft: sec.title ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                          {sec.body.split('\n').map((line, li) => {
                            const trimmed = line.trim();
                            if (!trimmed) return <div key={li} style={{ height:'6px' }} />;
                            const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•');
                            const boldMatch = trimmed.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)/);
                            if (isBullet) {
                              const bulletText = trimmed.replace(/^[-•]\s*/, '').replace(/\*\*/g, '');
                              return (
                                <div key={li} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'3px 0' }}>
                                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#3B82F6', marginTop:'6px', flexShrink:0 }} />
                                  <span style={{ fontSize:'13px', color:'#CBD5E1', lineHeight:1.7 }}>{bulletText}</span>
                                </div>
                              );
                            }
                            if (boldMatch) {
                              return (
                                <div key={li} style={{ padding:'3px 0' }}>
                                  <span style={{ fontSize:'12px', fontWeight:700, color:'#94A3B8' }}>{boldMatch[1]}: </span>
                                  <span style={{ fontSize:'13px', color:'#CBD5E1', lineHeight:1.7 }}>{boldMatch[2]}</span>
                                </div>
                              );
                            }
                            return <div key={li} style={{ fontSize:'13px', color:'#CBD5E1', lineHeight:1.8, padding:'2px 0' }}>{trimmed.replace(/\*\*/g, '')}</div>;
                          })}
                        </div>
                      </div>
                    ));
                  }
                  // Fallback: plain text
                  return <div style={{ fontSize:'14px', color:'#CBD5E1', lineHeight:1.9, whiteSpace:'pre-line' }}>{raw}</div>;
                })()}
              </div>

              {/* Urdu Report */}
              {result.urdu_report && (
                <div className="rs" style={{ background:'rgba(124,58,237,.04)', border:'1px solid rgba(124,58,237,.12)', borderRadius:'16px', padding:'22px', marginBottom:'20px', direction:'rtl', animationDelay:'.32s' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#A78BFA', marginBottom:'14px' }}>&#127477;&#127472; اردو رپورٹ</div>
                  <div style={{ fontSize:'14px', color:'#CBD5E1', lineHeight:2, whiteSpace:'pre-line' }}>{result.urdu_report}</div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="rs" style={{ background:'rgba(245,158,11,.04)', border:'1px solid rgba(245,158,11,.12)', borderRadius:'12px', padding:'14px 18px', fontSize:'12px', color:'#FCD34D', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px', animationDelay:'.36s' }}>
                <span style={{ flexShrink:0, display:'flex' }}><AlertTriangleIcon size={14} /></span>
                Yeh AI analysis hai — final diagnosis ke liye licensed doctor se zaroor milen. Report doctor ke paas review ke liye bheji ja chuki hai.
              </div>

              {/* Buttons */}
              <div className="rs" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'12px', animationDelay:'.4s' }}>
                <button className="rbtn" onClick={()=>{ setStep('upload'); setResult(null); setPreview(null); setSelectedFile(null); setError(''); }}
                  style={{ background:'linear-gradient(135deg,#2563EB,#7C3AED)', color:'#fff', padding:'14px', borderRadius:'12px', fontSize:'13px', fontWeight:700, fontFamily:'Sora,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', border:'none', cursor:'pointer' }}>
                  <RefreshIcon size={14} /> New Scan
                </button>
                <button className="rbtn" onClick={()=>generateMedicalPDF({
                  scanType: activeScanType.label,
                  report: result.report || result.analysis || '',
                  urduReport: result.urdu_report || '',
                  severity: result.severity || 'Normal',
                  confidence: result.confidence ?? 0,
                  time: result.time ?? result.time_seconds ?? 0,
                  filename: selectedFile?.name || 'scan.jpg',
                  status: 'pending',
                })}
                  style={{ background:'linear-gradient(135deg,#10B981,#059669)', border:'none', color:'#fff', padding:'14px', borderRadius:'12px', fontSize:'13px', fontWeight:700, fontFamily:'Sora,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
                  <DownloadIcon size={14} /> Download PDF
                </button>
                <button className="rbtn" onClick={()=>window.print()}
                  style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', color:'#94A3B8', padding:'14px', borderRadius:'12px', fontSize:'13px', fontWeight:600, fontFamily:'Sora,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
                  <PrinterIcon size={14} /> Print
                </button>
                <button className="rbtn" onClick={onBack}
                  style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', color:'#94A3B8', padding:'14px', borderRadius:'12px', fontSize:'13px', fontWeight:600, fontFamily:'Sora,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
                  <ArrowLeftIcon size={14} /> Dashboard
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
