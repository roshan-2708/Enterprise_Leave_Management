// src/app/api/leave/route.js
import { NextResponse } from 'next/server';
import { callSapApi } from '@/lib/sapClient';

// 1. GET: Fetch all leaves (or filter by employee)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    let endpoint = '/LeaveRequest?$orderby=CreatedAt desc';
    if (employeeId) {
      endpoint += `&$filter=EmployeeId eq '${employeeId}'`;
    }

    const result = await callSapApi(endpoint, { method: 'GET' });
    return NextResponse.json(result?.value || []);
  } catch (error) {
    console.error('Fetch Leaves Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Create a new leave request
export async function POST(request) {
  try {
    const body = await request.json();
    const { EmployeeId, LeaveTypeId, FromDate, ToDate, Reason } = body;

    const payload = {
      EmployeeId,
      LeaveTypeId,
      FromDate,
      ToDate,
      Reason,
    };

    const result = await callSapApi('/LeaveRequest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Create Leave Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}