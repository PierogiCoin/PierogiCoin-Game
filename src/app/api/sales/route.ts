// src/app/api/sales/route.ts

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// -------------------------
// Inicjalizacja Supabase
// -------------------------

// -------------------------
// Inicjalizacja Supabase
// -------------------------

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// -------------------------
// Obsługa żądania GET
// -------------------------

export async function GET() {
  if (!supabaseUrl || !supabaseServiceKey) {
     console.error("❌ Fatal Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined");
     return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const requestTimestamp = new Date().toISOString();
  console.log(`[API /api/sales - ${requestTimestamp}] Received GET request.`);

  try {
    // Pobierz wszystkie wpisy z tabeli "transactions" i zsumuj wartości kolumny amount_usd
    const { data: allRows, error } = await supabase
      .from('transactions')
      .select('amount_usd');

    if (error) {
      console.error(`[API /api/sales - ${requestTimestamp}] Supabase error:`, error);
      return NextResponse.json(
        { success: false, error: 'Database query failed.' },
        { status: 500 }
      );
    }

    // Zsumuj pola amount_usd
    const totalUsdSales = (allRows || [])
      .map((row) => Number(row.amount_usd) || 0)
      .reduce((acc, curr) => acc + curr, 0);

    console.log(
      `[API /api/sales - ${requestTimestamp}] Computed totalUsdSales: ${totalUsdSales}`
    );

    return NextResponse.json(
      {
        success: true,
        totalUsdSales,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(
      `❌ [API /api/sales - ${new Date().toISOString()}] Unexpected error:`,
      errorMessage
    );
    return NextResponse.json(
      { success: false, error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}