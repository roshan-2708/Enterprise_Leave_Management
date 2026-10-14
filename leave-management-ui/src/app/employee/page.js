// src/app/employee/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LeaveForm from '@/components/LeaveForm';
import StatusBadge from '@/components/StatusBadge';
import LeaveBalanceCards from '@/components/LeaveBalanceCards';
import toast from 'react-hot-toast';

export default function EmployeePage() {
  const router = useRouter();
  const { currentUser, isAuthReady } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Guard: Must be logged in as EMPLOYEE
  useEffect(() => {
    if (!isAuthReady) return;
    if (!currentUser) {
      toast.error('Please sign in to access the Employee Portal');
      router.replace('/');
    } else if (currentUser.role === 'MANAGER') {
      toast('Redirecting to your Manager Portal...', { icon: '🛡️' });
      router.replace('/manager');
    }
  }, [currentUser, isAuthReady, router]);

  const refreshAll = () => {
    setLoading(true);
    setLoadingBalances(true);
    setRefreshCount((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;

    async function loadEmployeeData() {
      if (!currentUser?.id || currentUser.role !== 'EMPLOYEE') {
        setLoading(false);
        setLoadingBalances(false);
        return;
      }

      // 1. Fetch personal leaves
      try {
        const url = `/api/leave?employeeId=${currentUser.id}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!ignore) {
          if (!res.ok) throw new Error(data.error || 'Failed to fetch leaves from SAP');
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

      // 2. Fetch leave balances
      try {
        const res = await fetch(`/api/leave/balance?employeeId=${currentUser.id}`);
        const data = await res.json();
        if (!ignore && res.ok && Array.isArray(data)) {
          setBalances(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Fetch balance error:', err);
        }
      } finally {
        if (!ignore) {
          setLoadingBalances(false);
        }
      }
    }

    loadEmployeeData();

    return () => {
      ignore = true;
    };
  }, [currentUser, refreshCount]);

  // Filtered personal leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      if (statusFilter !== 'ALL' && item.Status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.RequestId?.toLowerCase().includes(q);
        const matchReason = item.Reason?.toLowerCase().includes(q);
        const matchType = item.LeaveTypeId?.toLowerCase().includes(q);
        if (!matchId && !matchReason && !matchType) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: leaves.length,
      pending: leaves.filter((l) => l.Status === 'Pending').length,
      approved: leaves.filter((l) => l.Status === 'Approved').length,
      rejected: leaves.filter((l) => l.Status === 'Rejected').length,
    };
  }, [leaves]);

  if (!isAuthReady || !currentUser || currentUser.role !== 'EMPLOYEE') {
    return (
      <div className="py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs text-gray-500">Checking authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Employee Greeting Header Banner */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Employee Portal
            </span>
            <span className="text-xs text-gray-400 font-mono">SAP BTP Employee Self-Service</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Employee ID: <strong className="font-mono text-gray-800">{currentUser.id}</strong> •{' '}
            {currentUser.designation || 'Staff'} • {currentUser.department || 'Engineering'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition shadow-xs disabled:opacity-50"
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
            <span>{loading ? 'Refreshing...' : 'Refresh Quota & History'}</span>
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

      {/* Employee Leave Balance Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">My Leave Entitlement</h2>
          <span className="text-xs text-gray-400 font-mono">Live Quotas from SAP</span>
        </div>
        <LeaveBalanceCards balances={balances} loading={loadingBalances} />
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Apply Leave Form */}
        <div className="lg:col-span-1">
          <LeaveForm onCreated={refreshAll} />
        </div>

        {/* Right Column: Personal Leave Applications Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Header & Search */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">My Leave Applications</h3>
                <p className="text-xs text-gray-500 mt-0.5">Your personal leave history and manager comments</p>
              </div>

              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search my leaves..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
                <svg
                  className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2 bg-gray-50/60 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All', count: counts.all },
                { id: 'Pending', label: 'Pending', count: counts.pending },
                { id: 'Approved', label: 'Approved', count: counts.approved },
                { id: 'Rejected', label: 'Rejected', count: counts.rejected },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} <span className="text-[10px] text-gray-400 font-mono">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-3.5 px-5">Request ID</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-5">Reason & Manager Feedback</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Loading records from SAP...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-500">No applications found</span>
                          <span className="text-[11px] text-gray-400">Use the form on the left to submit a new leave request.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((item) => (
                      <tr key={item.RequestId} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                          {item.RequestId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {item.LeaveTypeId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-medium text-gray-800">
                            {item.FromDate} <span className="text-gray-400">→</span> {item.ToDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 max-w-xs">
                          <div className="font-medium text-gray-800 truncate" title={item.Reason}>
                            {item.Reason}
                          </div>
                          {item.ManagerComment && (
                            <div className="text-[10px] text-purple-600 font-medium italic mt-0.5 truncate">
                              Manager Note: &ldquo;{item.ManagerComment}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <StatusBadge status={item.Status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
