// src/app/api/get-sales-data/route.ts

import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Inicjalizacja klienta Supabase (zmienne środowiskowe w .env.local bez NEXT_PUBLIC_)
// Inicjalizacja klienta Supabase (zmienne środowiskowe w .env.local bez NEXT_PUBLIC_)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(): Promise<NextResponse> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Fatal Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  try {
    // Pobranie sumy USD Raised
    const { data: totalUsdData, error: totalUsdError } = await supabaseAdmin
      .rpc("get_total_confirmed_usd_raised");

    if (totalUsdError) {
      console.error("RPC 'get_total_confirmed_usd_raised' error:", totalUsdError);
    }
    const usdRaised = totalUsdError ? 0 : Number(totalUsdData) || 0;

    // Pobranie sumy sprzedanych tokenów PRG
    const { data: totalTokensData, error: totalTokensError } = await supabaseAdmin
      .rpc("get_total_confirmed_prg_credited");

    if (totalTokensError) {
      console.error("RPC 'get_total_confirmed_prg_credited' error:", totalTokensError);
    }
    const soldTokens = totalTokensError ? 0 : Number(totalTokensData) || 0;

    // Jeżeli oba RPC zawiodły, zwróć błąd
    if (totalUsdError && totalTokensError) {
      return NextResponse.json(
        { error: "Failed to fetch critical sales data from database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ usdRaised, soldTokens }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET /api/get-sales-data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data from server." },
      { status: 500 }
    );
  }
}