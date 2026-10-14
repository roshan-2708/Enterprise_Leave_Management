// src/components/LeaveForm.js
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LeaveForm({ onCreated }) {
  const { currentUser, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    LeaveTypeId: 'CL',
    FromDate: '',
    ToDate: '',
    Reason: '',
  });

  const durationDays = useMemo(() => {
    if (!formData.FromDate || !formData.ToDate) return null;
    const start = new Date(formData.FromDate);
    const end = new Date(formData.ToDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  }, [formData.FromDate, formData.ToDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please sign in first to submit a leave request.');
      openAuthModal();
      return;
    }

    if (formData.FromDate && formData.ToDate && new Date(formData.ToDate) < new Date(formData.FromDate)) {
      toast.error('To Date cannot be earlier than From Date.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting leave request to SAP BTP...');

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmployeeId: currentUser.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      toast.success('Leave submitted successfully!', { id: toastId });
      setFormData({ LeaveTypeId: 'CL', FromDate: '', ToDate: '', Reason: '' });
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.message || 'Submission failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">Apply for Leave</h2>
        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
          SAP RAP Behavior Pool
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-5">
        Submits directly to SAP BTP backend table <code className="font-mono text-gray-700 bg-gray-100 px-1 py-0.2 rounded text-[11px]">ZLEAVE_REQ_RP</code>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Leave Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Leave Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CL', label: 'Casual (CL)', color: 'blue' },
              { id: 'SL', label: 'Sick (SL)', color: 'amber' },
              { id: 'EL', label: 'Earned (EL)', color: 'emerald' },
            ].map((type) => {
              const isSelected = formData.LeaveTypeId === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, LeaveTypeId: type.id })}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              required
              value={formData.FromDate}
              onChange={(e) => setFormData({ ...formData, FromDate: e.target.value })}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              required
              value={formData.ToDate}
              onChange={(e) => setFormData({ ...formData, ToDate: e.target.value })}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Duration helper indicator */}
        {durationDays !== null && (
          <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-800">
            <span className="font-medium">Total Duration:</span>
            <span className="font-bold bg-white px-2 py-0.5 rounded shadow-xs border border-blue-200 text-blue-700">
              {durationDays} day{durationDays > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Leave</label>
          <textarea
            required
            rows="3"
            placeholder="Briefly state reason (e.g., attending exams, medical appointment)..."
            value={formData.Reason}
            onChange={(e) => setFormData({ ...formData, Reason: e.target.value })}
            className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Submitting to SAP...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{currentUser ? 'Submit Request to SAP' : 'Sign In to Apply'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}