// src/app/manager/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ManagerDashboard from '@/components/ManagerDashboard';

export default function ManagerPage() {
  const { currentUser, isAuthReady } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const isManager = currentUser?.role === 'MANAGER';

  const refreshAll = () => {
    setLoading(true);
    setRefreshCount((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!isManager) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/leave');
        const data = await res.json();
        if (!ignore) {
          if (!res.ok) throw new Error(data.error || 'Failed to fetch manager inbox');
          setLeaves(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          console.error('Fetch leaves error:', err);
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isManager, refreshCount]);

  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.Status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.Status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.Status === 'Rejected').length;

  // 0. Loading auth state
  if (!isAuthReady) {
    return (
      <div className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-8 h-8 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs text-gray-500">Verifying manager access...</span>
        </div>
      </div>
    );
  }

  // 1. Logged out guard
  if (!currentUser) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
          🔒
        </div>
        <h2 className="text-xl font-bold text-gray-900">Manager Sign-In Required</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The Manager Approval Inbox is restricted to authorized managers. Please sign in with your manager credentials.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <span>Sign In to Portal</span>
        </Link>
      </div>
    );
  }

  // 2. Employee Access Restriction Guard
  if (!isManager) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          You are currently signed in as an Employee (<strong className="text-gray-700">{currentUser.name}</strong>). Only managers have permission to view and approve organizational leave requests.
        </p>
        <Link
          href="/employee"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <span>Return to Employee Portal</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    );
  }

  // 3. Manager Portal for Authenticated Managers
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              Manager Portal
            </span>
            <span className="text-xs text-gray-400 font-mono">SAP RAP Behavior Action Service</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Leave Approvals & Team Oversight
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manager: <strong className="text-gray-900 font-bold">{currentUser.name}</strong> •{' '}
            ID: <span className="font-mono">{currentUser.id}</span> • {currentUser.designation || 'Lead'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{loading ? 'Syncing...' : 'Sync SAP'}</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
          <span>Failed to connect to SAP: {error}</span>
          <button onClick={refreshAll} className="underline font-bold hover:text-red-900 ml-4">
            Retry
          </button>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Applications</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Across all departments</p>
        </div>

        {/* Pending */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700">Pending Review</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg animate-pulse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-amber-600/80 mt-0.5 font-medium">Awaiting decision comment</p>
        </div>

        {/* Approved */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700">Approved</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">Synced to SAP HR</p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-rose-200/90 rounded-2xl p-5 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-700">Rejected</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
          <p className="text-[11px] text-rose-600/80 mt-0.5 font-medium">With manager comments</p>
        </div>
      </div>

      {/* Main Inbox Component */}
      <ManagerDashboard leaves={leaves} onActionComplete={refreshAll} loading={loading} />
    </div>
  );
}
