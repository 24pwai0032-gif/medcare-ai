// src/pages/DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { getPendingScans, approveScan, rejectScan } from '../services/api';

const DoctorDashboard = ({
  user,
  onLogout
}: {
  user: any;
  onLogout: () => void;
}) => {
  // const [activeTab, setActiveTab] = useState('pending');

  const [pendingScans, setPendingScans] = useState<any[]>([]);

  useEffect(() => {
    getPendingScans()
      .then(setPendingScans)
      .catch(console.error);
  }, []);

  const handleApprove = async (scanId: number) => {
    await approveScan(scanId);
    setPendingScans(prev => prev.filter(s => s.id !== scanId));
  };

  const handleReject = async (scanId: number) => {
    await rejectScan(scanId);
    setPendingScans(prev => prev.filter(s => s.id !== scanId));
  };

  const severityColors: Record<string, string> = {
    '🟢 Normal':   'bg-green-100 text-green-700',
    '🟡 Mild':     'bg-yellow-100 text-yellow-700',
    '🟠 Moderate': 'bg-orange-100 text-orange-700',
    '🔴 Severe':   'bg-red-100 text-red-700',
    '🚨 URGENT':   'bg-red-200 text-red-800 animate-pulse',
  };

  const urgentCount = pendingScans.filter(s => s.severity?.includes('URGENT')).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col fixed h-full">

        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="font-bold text-lg">
              MedCare AI
            </span>
          </div>
          <p className="text-blue-300 text-xs mt-1">
            Doctor Portal
          </p>
        </div>

        {/* Doctor Info */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-lg">
              👨‍⚕️
            </div>
            <div>
              <p className="font-medium text-sm">
                Dr. {user?.full_name || 'Doctor'}
              </p>
              <p className="text-blue-300 text-xs">
                General Physician
              </p>
              <p className="text-green-400 text-xs">
                ● Online
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 p-4">
          <p className="text-blue-300 text-xs font-medium uppercase mb-3">
            Navigation
          </p>
          {[
            { icon: '📋', label: 'Pending Reviews', count: 4 },
            { icon: '✅', label: 'Approved Today',  count: 8 },
            { icon: '👥', label: 'My Patients',     count: 24 },
            { icon: '📊', label: 'Analytics',       count: null },
            { icon: '⚙️', label: 'Settings',        count: null },
          ].map((item, i) => (
            <button key={i}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium mb-1 text-blue-100 hover:bg-blue-800 transition">
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-blue-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-300 hover:bg-blue-800 transition">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Doctor Dashboard 👨‍⚕️
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monday, March 3, 2026
            </p>
          </div>
          {/* Urgent Alert */}
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-red-500 animate-pulse">🚨</span>
            <span className="text-red-700 text-sm font-medium">
              {urgentCount} Urgent Case{urgentCount !== 1 ? 's' : ''} Needs Review!
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { icon: '⏳', label: 'Pending Reviews', value: pendingScans.length,  color: 'yellow' },
            { icon: '✅', label: 'Approved Today',  value: '—',                  color: 'green'  },
            { icon: '👥', label: 'Total Patients',  value: '—',                  color: 'blue'   },
            { icon: '🚨', label: 'Urgent Cases',    value: urgentCount,          color: 'red'    },
          ].map((stat, i) => (
            <div key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">
              Pending Reviews
            </h2>
            <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
              Bulk Approve ✅
            </button>
          </div>
          <div className="p-6 space-y-4">
            {pendingScans.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No pending scans 🎉
              </p>
            ) : (
              pendingScans.map((scan: any, i: number) => (
                <div key={scan.id ?? i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm capitalize">
                        {scan.scan_type?.replace('-', ' ')} Scan
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(scan.created_at).toLocaleDateString()} — {scan.filename}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      severityColors[scan.severity] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {scan.severity || 'Pending'}
                    </span>
                    <button
                      onClick={() => handleApprove(scan.id)}
                      className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition">
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(scan.id)}
                      className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '⚡', label: 'Avg Review Time', value: '4.2 mins' },
            { icon: '🎯', label: 'AI Accuracy Rate', value: '87%' },
            { icon: '📈', label: 'Reviews This Week', value: '43' },
          ].map((stat, i) => (
            <div key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-3xl mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;