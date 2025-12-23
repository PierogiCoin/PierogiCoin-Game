// src/app/api/record-transaction/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- Zmiana: wymuszamy dynamiczność i przenosimy inicjalizację do środka ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Env vars check (safe to do top level, simply reads env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Obsługa metody POST ---
export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Fatal Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined");
     return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const body = await request.json();

    // Pobieramy WSZYSTKIE dane z frontendu
    const {
      amountUSD,
      walletAddress, // To jest nasz prg_delivery_address
      paymentPayerAddress, // To jest adres płacącego (z hooka)
      paymentCrypto,
      paymentCryptoAmount,
      paymentTransactionSignature,
      expectedPrgAmount,
      // Poniższe dane są w kodzie, ale nie ma ich w tabeli, więc je ignorujemy
      // currentPrgPrice,
      // presaleStageName,
    } = body;

    // Walidacja kluczowych pól
    if (!amountUSD || !walletAddress || !paymentTransactionSignature || !paymentPayerAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields from frontend" }, { status: 400 });
    }

    // ZAPISZ TRANSAKCJĘ - OBIEKT W 100% ZGODNY Z TWOJĄ TABELĄ
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          // Używamy DOKŁADNIE tych nazw kolumn, co w Twojej bazie
          amount_usd: amountUSD,
          prg_delivery_address: walletAddress,
          payment_payer_address: paymentPayerAddress, // <-- BRAKUJĄCE POLE
          payment_crypto_currency: paymentCrypto,
          payment_crypto_amount: paymentCryptoAmount,
          payment_transaction_signature: paymentTransactionSignature,
          frontend_expected_prg_amount: expectedPrgAmount,
          
          // Ustawiamy wymaganą kolumnę 'prg_amount_to_credit', na razie na tę samą wartość
          prg_amount_to_credit: expectedPrgAmount, // <-- BRAKUJĄCE POLE
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Transaction recorded successfully.",
      transactionId: data.id,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    console.error("API /record-transaction error:", errorMessage);
    return NextResponse.json(
      { success: false, error: "Failed to record transaction.", details: errorMessage },
      { status: 500 }
    );
  }
}