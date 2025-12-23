// Plik: src/app/api/finalize-purchase/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Connection } from '@solana/web3.js';
import { createClient } from '@/lib/supabase/server';

const finalizeSchema = z.object({
  transactionId: z.number().int(),
  signature: z.string().min(64).max(88),
});

const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET;

export async function POST(request: Request) {
  // 1. Walidacja autoryzacji (zabezpieczenie webhooka)
  if (!HELIUS_WEBHOOK_SECRET) {
    console.error('CRITICAL: HELIUS_WEBHOOK_SECRET is not defined!');
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Inicjalizacja klienta Supabase
  const supabase = createClient();

  try {
    const body = await request.json();
    const validation = finalizeSchema.safeParse(body || {});

    if (!validation.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane żądania." }, { status: 400 });
    }

    const { transactionId, signature } = validation.data;

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT!, 'confirmed');
    const txStatus = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });

    if (txStatus.value?.err) {
      await supabase.from('purchases').update({ status: 'failed_on_chain', error_message: JSON.stringify(txStatus.value.err) }).eq('id', transactionId);
      throw new Error("Transakcja nie powiodła się na blockchainie.");
    }

    await supabase.from('purchases').update({ status: 'confirmed', payment_signature: signature }).eq('id', transactionId);

    return NextResponse.json({ success: true, message: "Transakcja pomyślnie sfinalizowana." });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Wewnętrzny błąd serwera.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}