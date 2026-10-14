// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RootAuthGateway() {
  const router = useRouter();
  const { currentUser, isAuthReady, login } = useAuth();

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

  // If already logged in, redirect to their designated page immediately
  useEffect(() => {
    if (!isAuthReady) return;
    if (currentUser?.id) {
      if (currentUser.role === 'MANAGER') {
        router.replace('/manager');
      } else {
        router.replace('/employee');
      }
    }
  }, [currentUser, isAuthReady, router]);

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

      toast.success(
        isRegister
          ? 'Registered & synced with SAP BTP successfully!'
          : 'Signed in successfully!'
      );

      login(data.user);

      // Route to dedicated page based on user role
      if (data.user?.role === 'MANAGER') {
        router.push('/manager');
      } else {
        router.push('/employee');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  // If auth is still checking or already logged in, show loading state
  if (!isAuthReady || currentUser?.id) {
    return (
      <div className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs font-semibold text-gray-500">
            {currentUser?.id
              ? `Redirecting to ${currentUser.role === 'MANAGER' ? 'Manager Portal' : 'Employee Portal'}...`
              : 'Loading portal...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-md mx-auto animate-fadeIn">
      {/* Enterprise Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-xl mb-3 shadow-md shadow-blue-500/25">
            SAP
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isRegister ? 'Register Employee' : 'Sign In to SAP Portal'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRegister
              ? 'Creates your master record in SAP ZEMPLOYEE_RP'
              : 'Enter your Employee ID and password to access your portal'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. EMP101 or MGR001"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })}
              className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase tracking-wide transition"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roshan Kumar Patra"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="emp@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{isRegister ? 'Syncing to SAP BTP...' : 'Verifying credentials...'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Register & Sync to SAP' : 'Sign In to Portal'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-100 pt-5">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              New employee in the organization?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}