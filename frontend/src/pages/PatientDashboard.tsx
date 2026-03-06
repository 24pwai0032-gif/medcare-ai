// src/pages/PatientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { getMyScans } from '../services/api';
import { SkeletonList } from '../components/Skeleton';
import XrayAnalyzer from './XrayAnalyzer';
import ECGAnalyzer from './ECGAnalyzer';
import BloodTestAnalyzer from './BloodTestAnalyzer';
import BoneScan from './BoneScan';
import MentalHealth from './MentalHealth';
import EmergencyAid from './EmergencyAid';
import DiagnosisAI from './DiagnosisAI';
import PrescriptionReader from './PrescriptionReader';
import VitalSigns from './VitalSigns';

const PatientDashboard = ({
  user,
  onLogout
}: {
  user: any;
  onLogout: () => void;
}) => {
  const [activeModule, setActiveModule] =
    useState('home');

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const scans = await getMyScans();
        setRecentScans(scans);
      } catch (err) {
        console.error('Scans fetch error:', err);
      } finally {
        setLoadingScans(false);
      }
    };
    fetchScans();
  }, []);

  // Agar module selected hai — show karo
  if (activeModule === 'xray')
    return (
      <div>
        {/* Back Button */}
        <div className="bg-white border-b px-6 py-3">
          <button
            onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <XrayAnalyzer />
      </div>
    );

  if (activeModule === 'bone')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <BoneScan />
      </div>
    );

  if (activeModule === 'ecg')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button
            onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <ECGAnalyzer />
      </div>
    );

  if (activeModule === 'blood')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button
            onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <BloodTestAnalyzer />
      </div>
    );

  if (activeModule === 'mental')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button
            onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <MentalHealth />
      </div>
    );

  if (activeModule === 'emergency')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button
            onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <EmergencyAid />
      </div>
    );

  if (activeModule === 'diagnosis')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <DiagnosisAI />
      </div>
    );

  if (activeModule === 'prescription')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <PrescriptionReader />
      </div>
    );

  if (activeModule === 'vitals')
    return (
      <div>
        <div className="bg-white border-b px-6 py-3">
          <button onClick={() => setActiveModule('home')}
            className="flex items-center gap-2 text-blue-900 font-medium hover:underline">
            ← Back to Dashboard
          </button>
        </div>
        <VitalSigns />
      </div>
    );

  const modules = [
    { id: 'xray',        icon: '🫁', title: 'X-Ray Analysis' },
    { id: 'bone',        icon: '🦴', title: 'Bone Scan' },
    { id: 'ecg',         icon: '💓', title: 'ECG Analyzer' },
    { id: 'blood',       icon: '🧪', title: 'Blood Test' },
    { id: 'mental',      icon: '🧠', title: 'Mental Health' },
    { id: 'diagnosis',   icon: '🔍', title: 'Diagnosis AI' },
    { id: 'prescription',icon: '💊', title: 'Prescription' },
    { id: 'vitals',      icon: '📊', title: 'Vital Signs' },
    { id: 'emergency',   icon: '🚨', title: 'Emergency' },
  ];

  const severityColors: Record<string, string> = {
    '🟢 Normal':   'bg-green-100 text-green-700',
    '🟡 Mild':     'bg-yellow-100 text-yellow-700',
    '🟠 Moderate': 'bg-orange-100 text-orange-700',
    '🔴 Severe':   'bg-red-100 text-red-700',
    '🚨 URGENT':   'bg-red-200 text-red-800',
    'green':  'bg-green-100 text-green-700',
    'yellow': 'bg-yellow-100 text-yellow-700',
    'orange': 'bg-orange-100 text-orange-700',
    'red':    'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="font-bold text-lg">MedCare AI</span>
          </div>
          <p className="text-blue-300 text-xs mt-1">Patient Portal</p>
        </div>

        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <p className="font-medium text-sm">{user?.full_name || 'Patient'}</p>
              <p className="text-blue-300 text-xs">Patient ID: #1234</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-blue-300 text-xs font-medium uppercase mb-3">
            AI Modules
          </p>
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition ${
                activeModule === mod.id
                  ? 'bg-white text-blue-900'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <span>{mod.icon}</span>
              <span>{mod.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-blue-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-300 hover:bg-blue-800 transition">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Patient'}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monday, March 3, 2026
            </p>
          </div>
          <button
            onClick={() => setActiveModule('xray')}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
            + New Scan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { icon: '🫁', label: 'Total Scans',    value: '12' },
            { icon: '✅', label: 'Reports Ready',  value: '8'  },
            { icon: '⏳', label: 'Pending Review', value: '3'  },
            { icon: '🚨', label: 'Urgent Alerts',  value: '1'  },
          ].map((stat, i) => (
            <div key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between">
            <h2 className="font-bold text-gray-900">Recent Scans</h2>
            <button className="text-blue-900 text-sm font-medium">
              View All →
            </button>
          </div>
          <div className="p-6 space-y-4">
            {loadingScans ? (
              <div className="p-6">
                <SkeletonList count={3} />
              </div>
            ) : recentScans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🫁</p>
                <p className="text-gray-500 text-sm">
                  No scans yet. Upload your first scan!
                </p>
                <button
                  onClick={() => setActiveModule('xray')}
                  className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800">
                  + New Scan
                </button>
              </div>
            ) : (
              recentScans.slice(0, 5).map((scan: any, i: number) => (
                <div key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                      {scan.scan_type === 'xray'       ? '🫁' :
                       scan.scan_type === 'ecg'        ? '💓' :
                       scan.scan_type === 'blood-test' ? '🧪' :
                       scan.scan_type === 'bone'       ? '🦴' : '📋'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm capitalize">
                        {scan.scan_type.replace('-', ' ')} Scan
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      severityColors[scan.severity] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {scan.severity || 'Pending'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      scan.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {scan.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Quick Access</h2>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {modules.slice(0, 6).map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition text-left">
                <span className="text-2xl">{mod.icon}</span>
                <span className="text-sm font-medium text-gray-700">{mod.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;