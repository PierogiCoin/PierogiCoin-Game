// src/app/api/recent-purchases/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Ensure the route is always dynamic and never cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

type RecentPurchase = {
  id: string | number;
  buyer: string;           // e.g. shortened address
  amountUSD: number;
  tokens: number;
  txSignature?: string | null;
  createdAt: string;       // ISO
};

function shorten(addr?: string | null) {
  if (!addr) return '—';
  if (addr.length <= 8) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get('limit');
    const limit = Math.max(1, Math.min(50, Number(limitRaw) || 8)); // 1..50

    // Use service-role on the server to read latest public purchases
    // This will throw if env vars are missing, caught by catch block below
    const supabase = createAdminClient();

    // Query only successful purchases for the PRG project
    const { data, error } = await supabase
      .from('purchases')
      .select('id,buyer_wallet,usd_amount,tokens_to_credit,created_at,transaction_signature,project_tag,status')
      .eq('status', 'success')
      .eq('project_tag', 'PRG') // keep stream clean if table is shared across projects
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[API] Recent purchases query error:', error);
      // Fall back to 200 with empty list so UI doesn't break; include error for debugging
      return NextResponse.json(
        { items: [], count: 0, limit, __error: error.message },
        { status: 200, headers: { 'cache-control': 'no-store' } }
      );
    }

    const items: RecentPurchase[] =
      (data || []).map((r: Record<string, unknown>) => ({
        id: r.id as string | number,
        buyer: shorten(r.buyer_wallet as string),
        amountUSD: Number(r.usd_amount ?? 0),
        tokens: Number(r.tokens_to_credit ?? 0),
        txSignature: (r.transaction_signature as string) || null,
        createdAt: new Date(r.created_at as string).toISOString(),
      }));

    return NextResponse.json(
      { items, count: items.length, limit },
      {
        status: 200,
        headers: {
          'cache-control': 'no-store',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API] recent-purchases fatal error:', message);
    return NextResponse.json(
      { items: [], count: 0, limit: 0, __error: message },
      { status: 500 } // Or 200 if you want to mask it entirely, but 500 is more correct for server-side crashes
    );
  }
}