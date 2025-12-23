import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role)
// We need admin rights to bypass RLS for checking if email exists (if we wanted to check first),
// or just to rely on the INSERT policy.
// However, typically for "subscribe", we want to insert.
// If your project uses the standard client setup:
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
     console.error('Supabase credentials missing');
     return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { email, locale } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        { 
          email: email,
          locale: locale || 'en',
          subscribed_at: new Date().toISOString()
        }
      ]);

    if (error) {
      // Handle unique violation (Postgres error 23505) gracefully
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
      }
      console.error('Newsletter error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error('Newsletter API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
