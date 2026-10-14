// src/components/ManagerDashboard.js
'use client';

import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

export default function ManagerDashboard({ leaves = [], onActionComplete, loading = false }) {
  const [processingState, setProcessingState] = useState({ id: null, action: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Custom Comment State
  const [commentModal, setCommentModal] = useState({
    isOpen: false,
    requestId: null,
    action: null,
    comment: '',
  });

  const openCommentModal = (requestId, action) => {
    setCommentModal({
      isOpen: true,
      requestId,
      action,
      comment: action === 'approve' ? 'Approved by Manager' : 'Rejected - Operational requirements',
    });
  };

  const closeCommentModal = () => {
    setCommentModal({
      isOpen: false,
      requestId: null,
      action: null,
      comment: '',
    });
  };

  const executeAction = async () => {
    const { requestId, action, comment } = commentModal;
    if (!requestId || !action) return;

    setProcessingState({ id: requestId, action });
    closeCommentModal();

    const isApprove = action === 'approve';
    const toastId = toast.loading(
      `${isApprove ? 'Approving' : 'Rejecting'} request ${requestId}...`
    );

    try {
      const endpoint = isApprove
        ? `/api/leave/${requestId}/approve`
        : `/api/leave/${requestId}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DecisionComment: comment || (isApprove ? 'Approved' : 'Rejected') }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `${isApprove ? 'Approval' : 'Rejection'} action failed`);

      toast.success(
        isApprove ? `Request ${requestId} approved successfully!` : `Request ${requestId} rejected!`,
        { id: toastId }
      );

      if (onActionComplete) onActionComplete();
    } catch (err) {
      toast.error(err.message || 'Action failed', { id: toastId });
    } finally {
      setProcessingState({ id: null, action: null });
    }
  };

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      // Status filter
      if (statusFilter !== 'ALL' && item.Status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.RequestId?.toLowerCase().includes(q);
        const matchEmp = item.EmployeeId?.toLowerCase().includes(q);
        const matchReason = item.Reason?.toLowerCase().includes(q);
        const matchType = item.LeaveTypeId?.toLowerCase().includes(q);
        if (!matchId && !matchEmp && !matchReason && !matchType) {
          return false;
        }
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

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Manager Approval Inbox</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review employee applications and sync decisions to SAP BTP RAP Behavior Pool
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search by ID, Employee, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-gray-50/60 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            statusFilter === 'ALL'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Requests <span className="ml-1 text-[11px] text-gray-400 font-mono">({counts.all})</span>
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            statusFilter === 'Pending'
              ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200'
              : 'text-gray-600 hover:text-amber-800 hover:bg-amber-50/50'
          }`}
        >
          Pending <span className="ml-1 text-[11px] font-mono text-amber-600">({counts.pending})</span>
        </button>

        <button
          onClick={() => setStatusFilter('Approved')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            statusFilter === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200'
              : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/50'
          }`}
        >
          Approved <span className="ml-1 text-[11px] font-mono text-emerald-600">({counts.approved})</span>
        </button>

        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            statusFilter === 'Rejected'
              ? 'bg-rose-50 text-rose-800 shadow-xs border border-rose-200'
              : 'text-gray-600 hover:text-rose-800 hover:bg-rose-50/50'
          }`}
        >
          Rejected <span className="ml-1 text-[11px] font-mono text-rose-600">({counts.rejected})</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3.5 px-5">Request ID</th>
              <th className="py-3.5 px-5">Employee</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-5">Reason</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Fetching requests from SAP...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-gray-500">No requests found matching your filter</span>
                    <span className="text-[11px] text-gray-400">Try selecting another status tab or clearing the search box</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeaves.map((item) => {
                const isProcessingThis = processingState.id === item.RequestId;
                const isApproving = isProcessingThis && processingState.action === 'approve';
                const isRejecting = isProcessingThis && processingState.action === 'reject';

                return (
                  <tr key={item.RequestId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50/70 border border-blue-200/60 px-2 py-0.5 rounded text-[11px]">
                        {item.RequestId}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900">{item.EmployeeId}</div>
                      <span className="text-[10px] text-gray-400 font-mono">SAP Master Record</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800 px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                        {item.LeaveTypeId}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {item.FromDate} <span className="text-gray-400">→</span> {item.ToDate}
                      </div>
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="truncate font-medium text-gray-800" title={item.Reason}>
                        {item.Reason}
                      </div>
                      {item.ManagerComment && (
                        <div className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                          Note: &ldquo;{item.ManagerComment}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.Status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      {item.Status === 'Pending' ? (
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openCommentModal(item.RequestId, 'approve')}
                            disabled={isProcessingThis}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{isApproving ? 'Approving...' : 'Approve'}</span>
                          </button>

                          <button
                            onClick={() => openCommentModal(item.RequestId, 'reject')}
                            disabled={isProcessingThis}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium text-[11px] inline-flex items-center gap-1">
                          {item.Status === 'Approved' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Approved
                            </span>
                          ) : item.Status === 'Rejected' ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ✕ Rejected
                            </span>
                          ) : (
                            <span>Processed</span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Decision Comment Modal */}
      {commentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Confirm {commentModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <button onClick={closeCommentModal} className="text-gray-400 hover:text-gray-600 text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Enter a decision note for Request <span className="font-mono font-bold text-blue-600">{commentModal.requestId}</span>. This will be recorded directly in SAP BTP.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Decision Comment</label>
              <textarea
                rows="2.5"
                value={commentModal.comment}
                onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional manager feedback..."
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeCommentModal}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAction}
                className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition shadow-xs ${
                  commentModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {commentModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}