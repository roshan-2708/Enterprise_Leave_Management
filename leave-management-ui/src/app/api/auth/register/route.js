// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { callSapApi } from '@/lib/sapClient';
import { saveUser } from '@/lib/userDb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, department, email, password } = body;

    if (!id || !name || !password) {
      return NextResponse.json(
        { error: 'Employee ID, Full Name, and Password are required.' },
        { status: 400 }
      );
    }

    const employeeIdClean = id.trim().toUpperCase();

    // 1. SAP BTP Backend Table (ZEMPLOYEE_RP) me create karein
    const sapPayload = {
      Employee_Id: employeeIdClean,
      Full_Name: name.trim(),
      Department: department ? department.trim() : 'Engineering',
      Email: email ? email.trim() : `${employeeIdClean.toLowerCase()}@company.com`,
    };

    try {
      await callSapApi('/Employee', {
        method: 'POST',
        body: JSON.stringify(sapPayload),
      });
    } catch (sapErr) {
      console.warn('SAP Employee creation note:', sapErr.message);
      // Agar employee table me already exist karta hai, continue with web registration
    }

    // 2. Local Credentials Store me save karein (Password Hash)
    // Registration is strictly for employees; Manager accounts are static only.
    const user = saveUser({
      id: employeeIdClean,
      name: name.trim(),
      department,
      email,
      role: 'EMPLOYEE',
      password,
    });

    return NextResponse.json(
      { message: 'Employee successfully registered in SAP BTP!', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}