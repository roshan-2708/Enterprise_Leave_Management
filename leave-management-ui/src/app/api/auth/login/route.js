// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/userDb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'Employee ID and Password are required.' },
        { status: 400 }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const user = verifyUser(cleanId, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid Employee ID or Password.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Signed in successfully!', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
