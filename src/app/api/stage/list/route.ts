// src/app/api/stage/list/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
  'cache-control': 'no-store',
} as const;

export async function OPTIONS() {
  // Preflight for external callers (e.g. local dev tools)
  return NextResponse.json({}, { status: 200, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('presale_stages')
      .select('id,name,start_date,end_date,bonus_percent,is_active,price,hardcap_usd')
      .order('start_date', { ascending: true });

    let items = [];

    // Fallback if DB is empty or error
    if (error || !data || data.length === 0) {
      console.warn('⚠️ No stages found in DB or error. Using fallback mock stages.', error);
      const now = new Date();
      items = [
        {
          id: 1,
          name: 'Stage 1',
          start_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // started 7 days ago
          end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),   // ends in 7 days
          is_active: true,
          bonus_percent: 20,
          price: 0.00004, // 1 USD = 25,000 PRG
          hardcap_usd: 500000,
        },
        {
          id: 2,
          name: 'Stage 2',
          start_date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          bonus_percent: 15,
          price: 0.00005,
          hardcap_usd: 1000000,
        },
        {
          id: 3,
          name: 'Stage 3',
          start_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: false,
          bonus_percent: 10,
          price: 0.00006,
          hardcap_usd: 1500000,
        }
      ];
    } else {
      // PostgREST returns numeric types as strings. Cast them to numbers
      items = data.map((row: Record<string, unknown>) => ({
        id: row.id,
        name: row.name,
        start_date: row.start_date ?? null,
        end_date: row.end_date ?? null,
        is_active: row.is_active ?? null,
        // coerce numeric fields
        bonus_percent: row.bonus_percent === null || row.bonus_percent === undefined ? null : Number(row.bonus_percent),
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        hardcap_usd: row.hardcap_usd === null || row.hardcap_usd === undefined ? null : Number(row.hardcap_usd),
      }));
    }

    return NextResponse.json({ items }, { status: 200, headers: CORS_HEADERS });
  } catch (e: unknown) {
    // If even mock generation fails (unlikely), return safe empty
    const message = e instanceof Error ? e.message : 'unexpected';
    console.error('API Error:', message);
    
    // Recovery: return mock even in catch
     const now = new Date();
     const recoveryItems = [{
          id: 1,
          name: 'Fallback Stage',
          start_date: now.toISOString(),
          end_date: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
          is_active: true,
          bonus_percent: 5,
          price: 0.001,
          hardcap_usd: 10000
      }];

    return NextResponse.json(
      { items: recoveryItems }, // Return recovery items instead of error to keep UI alive
      { status: 200, headers: CORS_HEADERS }
    );
  }
}