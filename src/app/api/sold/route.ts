// src/app/api/sold/route.ts

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// 1) Inicjalizacja Supabase
//    Upewnij się, że w .env.local masz
//      SUPABASE_URL=<twoje_url>
//      SUPABASE_SERVICE_ROLE_KEY=<twoj_service_role_key>
//    (bez prefixu NEXT_PUBLIC_!) 
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 1) Inicjalizacja Supabase
// ----------------------------------------------------------------
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Tworzymy klienta Supabase
// const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/sold
 * Zwraca łączną liczbę sprzedanych tokenów PRG (pole total_prg w tabeli transactions)
 */
export async function GET() {
  const requestTimestamp = new Date().toISOString();
  console.log(`[API /api/sold - ${requestTimestamp}] GET żądanie`);

  // Jeśli zmienne środowiskowe nie są zdefiniowane, logujemy błąd od razu:
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      'FATAL: Brakuje SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local dla /api/sold/route.ts'
    );
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Przykład: zakładamy, że w Supabase masz tabelę "transactions"
    // i kolumnę "total_prg" (sumaryczna liczba wszystkich sprzedanych PRG).
    // Jeśli Twoja tabela nazywa się inaczej lub kolumna ma inną nazwę, dostosuj poniższe.
    const { data, error } = await supabase
      .from('transactions')         // <- Upewnij się, że to poprawna nazwa tabeli
      .select('total_prg')          // <- i właściwe pole w tabeli
      .single();                    // oczekujemy pojedynczego wiersza z tą sumą

    if (error) {
      console.error(
        `[API /api/sold - ${requestTimestamp}] Błąd przy zapytaniu do Supabase:`,
        JSON.stringify(error)
      );
      return NextResponse.json(
        { success: false, error: 'Nie udało się pobrać liczby sprzedanych tokenów.' },
        { status: 500 }
      );
    }

    // Jeżeli `data` jest null lub nie zawiera oczekiwanego pola, zwróćmy odpowiedni komunikat:
    if (!data || typeof data.total_prg !== 'number') {
      console.warn(
        `[API /api/sold - ${requestTimestamp}] Brak pola total_prg w wyniku lub jest w niepoprawnym formacie.`
      );
      return NextResponse.json(
        { success: false, error: 'Pole total_prg jest niedostępne lub ma niepoprawny typ.' },
        { status: 500 }
      );
    }

    console.log(
      `[API /api/sold - ${requestTimestamp}] total_prg = ${data.total_prg}`
    );
    return NextResponse.json(
      { success: true, totalPrgSold: data.total_prg },
      { status: 200 }
    );
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`[API /api/sold - ${requestTimestamp}] Wyjątek:`, errMsg);
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}