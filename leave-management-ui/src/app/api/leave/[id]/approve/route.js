// src/app/api/leave/[id]/approve/route.js
import { NextResponse } from 'next/server';
import { callSapApi } from '@/lib/sapClient';

export async function POST(request, { params }) {
  try {
    const { id } = await params; // RequestId (e.g. LR00000001)
    const body = await request.json().catch(() => ({}));
    const { DecisionComment } = body;

    const endpoint = `/LeaveRequest(RequestId='${id}')/com.sap.gateway.srvd_a2x.zui_leave_req_o4.v0001.approveResult`;

    const payload = {
      DecisionComment: DecisionComment || 'Approved',
    };

    const result = await callSapApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Approve Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}