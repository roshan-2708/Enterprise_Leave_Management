// src/components/AuthModal.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const router = useRouter();
  const { login, closeAuthModal } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: '',
    name: '',
    department: 'Engineering',
    email: '',
    password: '',
    role: 'EMPLOYEE',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      toast.success(isRegister ? 'Registered & synced with SAP BTP!' : 'Signed in successfully!');
      login(data.user);

      if (data.user?.role === 'MANAGER') {
        router.push('/manager');
      } else {
        router.push('/employee');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeAuthModal) {
      closeAuthModal();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl mb-3 shadow-md">
            SAP
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRegister ? 'Register Employee in SAP' : 'Sign in to Portal'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isRegister
              ? 'Creates a master record in SAP ZEMPLOYEE_RP and enables leave applications'
              : 'Enter your credentials to access the Leave Management System'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. EMP105"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="emp105@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Syncing with SAP...' : isRegister ? 'Register & Sync to SAP' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-600 border-t border-gray-100 pt-4">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <div>
              <p>
                New employee?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}