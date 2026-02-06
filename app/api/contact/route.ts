import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

async function sendEmailViaSendGrid({ name, email, message }: { name?: string; email: string; message: string }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.CONTACT_RECEIVER_EMAIL;

  if (!apiKey || !to) return; // skip sending if not configured

  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
        subject: `New contact form message from ${email}`,
      },
    ],
    from: { email: to },
    content: [
      {
        type: 'text/plain',
        value: `Name: ${name || 'N/A'}\nEmail: ${email}\n\nMessage:\n${message}`,
      },
    ],
  };

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body || {};

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    // Persist message using service role client so RLS doesn't block
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name: name ?? null, email, message }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting contact message', error);
      return NextResponse.json({ error: 'Failed to persist message' }, { status: 500 });
    }

    // Send email notification (best-effort)
    try {
      await sendEmailViaSendGrid({ name, email, message });
    } catch (err) {
      console.error('Error sending contact email:', err);
      // Don't fail the request if email send fails
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
