// src/pages/Login.tsx
import React, { useState } from 'react';
import { loginUser, registerUser, saveToken, saveUser } from '../services/api';

const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    pmdc: '',
  });

  const validateForm = (): string | null => {
    if (!form.email.trim())
      return 'Email required!';
    if (!/\S+@\S+\.\S+/.test(form.email))
      return 'Valid email daalo!';
    if (!form.password || form.password.length < 6)
      return 'Password 6+ characters hona chahiye!';
    if (!isLogin && !form.full_name.trim())
      return 'Name required!';
    if (!isLogin && role === 'doctor' && !form.pmdc.trim())
      return 'PMDC number required!';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');

    try {
      let response;

      if (isLogin) {
        response = await loginUser({
          email: form.email,
          password: form.password,
        });
      } else {
        response = await registerUser({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: role,
          pmdc: form.pmdc || undefined,
        });
      }

      // Token + User save karo
      saveToken(response.access_token);
      saveUser(response.user);

      // Dashboard pe jao
      onLogin(response.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-2xl font-bold text-blue-900 mt-2">MedCare AI</h1>
          <p className="text-gray-500 text-sm mt-1">Pakistan's Medical AI Platform</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              isLogin ? 'bg-white text-blue-900 shadow' : 'text-gray-500'
            }`}>
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              !isLogin ? 'bg-white text-blue-900 shadow' : 'text-gray-500'
            }`}>
            Sign Up
          </button>
        </div>

        {/* Role */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRole('patient')}
            className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition ${
              role === 'patient'
                ? 'border-blue-900 bg-blue-50 text-blue-900'
                : 'border-gray-200 text-gray-500'
            }`}>
            👤 Patient
          </button>
          <button
            onClick={() => setRole('doctor')}
            className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition ${
              role === 'doctor'
                ? 'border-blue-900 bg-blue-50 text-blue-900'
                : 'border-gray-200 text-gray-500'
            }`}>
            👨‍⚕️ Doctor
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Syed Hassan Tayyab"
                value={form.full_name}
                onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="hassan@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm"
            />
          </div>

          {!isLogin && role === 'doctor' && (
            <div>
              <label className="text-sm font-medium text-gray-700">PMDC Number</label>
              <input
                type="text"
                placeholder="PMDC-12345"
                value={form.pmdc}
                onChange={e => setForm({...form, pmdc: e.target.value})}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition mt-2 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}>
            {loading ? '⏳ Please wait...' : isLogin ? '🔐 Login' : '✅ Create Account'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-900 font-medium">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;