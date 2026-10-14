// src/app/api/leave/balance/route.js
import { NextResponse } from 'next/server';
import { callSapApi } from '@/lib/sapClient';

function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate) return 1;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    // Base quota entitlements for leave types
    const balances = {
      CL: {
        type: 'CL',
        name: 'Casual Leave',
        total: 10,
        used: 0,
        pending: 0,
        remaining: 10,
      },
      SL: {
        type: 'SL',
        name: 'Sick Leave',
        total: 5,
        used: 0,
        pending: 0,
        remaining: 5,
      },
      EL: {
        type: 'EL',
        name: 'Earned Leave',
        total: 15,
        used: 0,
        pending: 0,
        remaining: 15,
      },
    };

    if (employeeId) {
      try {
        const endpoint = `/LeaveRequest?$filter=EmployeeId eq '${employeeId}'`;
        const result = await callSapApi(endpoint, { method: 'GET' });
        const list = Array.isArray(result?.value) ? result.value : [];

        for (const item of list) {
          const type = item.LeaveTypeId;
          if (balances[type]) {
            const days = calculateDays(item.FromDate, item.ToDate);
            if (item.Status === 'Approved') {
              balances[type].used += days;
            } else if (item.Status === 'Pending') {
              balances[type].pending += days;
            }
          }
        }

        // Calculate remaining
        Object.keys(balances).forEach((key) => {
          balances[key].remaining = Math.max(0, balances[key].total - balances[key].used);
        });
      } catch (sapErr) {
        console.warn('Could not query employee leave requests for balance, using standard quota:', sapErr.message);
      }
    }

    return NextResponse.json(Object.values(balances));
  } catch (error) {
    console.error('Leave Balance Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
