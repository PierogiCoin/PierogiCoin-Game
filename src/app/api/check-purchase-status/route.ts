import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('transactionId');
  if (!id) {
    return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('purchases')
    .select('status, payment_signature')
    .eq('id', Number(id))
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to fetch status' }, { status: 500 });
  }

  return NextResponse.json({ status: data?.status, signature: data?.payment_signature });
}