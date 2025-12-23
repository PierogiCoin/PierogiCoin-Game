// Plik: src/app/api/update-signature/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const updateSchema = z.object({
  transactionId: z.number().int().positive(),
  signature: z.string().min(64),
});

export const POST = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.UPDATE_SIGNATURE_SECRET;

  console.log("[API update-signature] Authorization header:", authHeader);
  console.log("[API update-signature] Expected secret:", expectedSecret);

  if (!expectedSecret || authHeader !== expectedSecret) {
    console.warn("[API update-signature] Nieautoryzowane żądanie.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("[API update-signature] Request body:", body);

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[API update-signature] Błąd walidacji danych:", parsed.error.flatten());
      return NextResponse.json({ error: 'Nieprawidłowe dane żądania.', details: parsed.error.flatten() }, { status: 400 });
    }

    const { transactionId, signature } = parsed.data;
    const supabase = createClient();

    const { data, error } = await supabase
      .from('purchases')
      .update({ payment_signature: signature, status: 'confirmed' })
      .eq('id', transactionId)
      .select();

    if (error) {
      console.error("[API update-signature] Błąd Supabase:", error);
      return NextResponse.json({ success: false, error: 'Błąd aktualizacji transakcji.' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(`[API update-signature] Nie znaleziono zakupu o ID: ${transactionId}`);
      return NextResponse.json({ success: false, error: 'Nie znaleziono transakcji.' }, { status: 404 });
    }

    console.log(`[API update-signature] Pomyślnie zaktualizowano sygnaturę dla zakupu ID: ${transactionId}`);

    // Tokeny zostaną wysłane przez webhook Heliusa po wykryciu transakcji on-chain.

    return NextResponse.json({ success: true, message: 'Transakcja została zaktualizowana.' });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Wewnętrzny błąd serwera.';
    console.error("[API update-signature] Błąd:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
};