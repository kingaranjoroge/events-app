import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body || {};

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    // Placeholder: could integrate with email provider or ticketing system
    console.log('Contact message received:', { name, email, message });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
