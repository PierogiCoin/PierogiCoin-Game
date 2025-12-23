// src/app/api/get-sales-summary/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// --- Zmiana: wymuszamy dynamiczność i przenosimy inicjalizację do środka ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  const requestTimestamp = new Date().toISOString();
  console.log(`[API] Received GET request for sales summary at ${requestTimestamp}.`);

  const supabaseAdmin = createAdminClient();

  try {
    // --- HARDCODED RESET (User Request) ---
    // Override DB to show fresh start state with only "Sebastian PL" ($35)
    
    // const { data: usdData, error: usdError } = await supabaseAdmin.rpc("get_total_confirmed_usd_raised");
    const usdRaised = 35;
    console.log(`[API] Mocked usdRaised: ${usdRaised}`);

    // const { data: tokensData, error: tokensError } = await supabaseAdmin.rpc("get_total_confirmed_prg_credited");
    const soldTokens = 875000;
    console.log(`[API] Mocked soldTokens: ${soldTokens}`);

    // const { count, error: countError } = await supabaseAdmin.from('purchases')...
    const transactionCount = 1;
    console.log(`[API] Mocked transactionCount: ${transactionCount}`);

    // --- Sukces ---
    console.log(`[API] Successfully processed. Returning: usdRaised=${usdRaised}, soldTokens=${soldTokens}, transactionCount=${transactionCount}`);
    return NextResponse.json(
      { success: true, usdRaised, soldTokens, transactionCount },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
        }
      }
    );

  } catch (error: unknown) {
    const errorTimestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";

    console.error(`❌ [API] Error in GET handler at ${errorTimestamp}:`, errorMessage);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales summary from server.", details: errorMessage },
      { status: 500 }
    );
  }
}