// Plik: supabase/functions/helius-webhook-handler/index.ts
// To jest główny plik Twojej nowej funkcji w Supabase.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from 'https://esm.sh/@solana/web3.js@1.73.0';
import { getAssociatedTokenAddress, createTransferInstruction } from 'https://esm.sh/@solana/spl-token@0.3.7';

// --- Konfiguracja ---
const PRG_MINT_ADDRESS = new PublicKey(Deno.env.get('PRG_MINT_ADDRESS')!);
const HOT_WALLET_PRIVATE_KEY = Deno.env.get('HOT_WALLET_PRIVATE_KEY')!; // Klucz prywatny portfela z tokenami PRG

// Funkcja do wysyłania tokenów PRG
async function sendPrgTokens(toAddress: string, amount: number, connection: Connection) {
  const hotWallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(HOT_WALLET_PRIVATE_KEY)));
  const toPublicKey = new PublicKey(toAddress);

  const fromAta = await getAssociatedTokenAddress(PRG_MINT_ADDRESS, hotWallet.publicKey);
  const toAta = await getAssociatedTokenAddress(PRG_MINT_ADDRESS, toPublicKey);

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromAta,
      toAta,
      hotWallet.publicKey,
      amount * (10 ** 9) // Zakładając 9 miejsc po przecinku dla PRG
    )
  );

  const signature = await connection.sendTransaction(transaction, [hotWallet]);
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}


serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    const transactionInfo = payload[0]; // Helius wysyła dane w tablicy

    if (transactionInfo.type !== 'TRANSFER') {
      return new Response('Not a transfer transaction', { status: 200 });
    }

    // Inicjalizacja klientów
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const connection = new Connection(Deno.env.get('SOLANA_RPC_ENDPOINT')!, 'confirmed');

    // Wyciągamy kluczowe dane z powiadomienia Helius
    const fromAddress = transactionInfo.source;
    const amount = transactionInfo.amount / (10 ** 9); // Zakładając, że to SOL
    const signature = transactionInfo.signature;

    // 1. Znajdź oczekującą transakcję w bazie danych
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('buyer_wallet', fromAddress)
      .eq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !purchase) {
      console.warn(`Nie znaleziono pasującej transakcji dla portfela: ${fromAddress}`);
      return new Response('No matching pending purchase found', { status: 404 });
    }

    // 2. Weryfikacja kwoty (z pewną tolerancją na wahania cen)
    const amountDifference = Math.abs(purchase.crypto_amount - amount);
    if (amountDifference > 0.001) { // Tolerancja 0.001 SOL
        console.warn(`Niezgodność kwoty. Oczekiwano: ${purchase.crypto_amount}, Otrzymano: ${amount}`);
        // Możesz tu dodać logikę do oflagowania tej transakcji
        return new Response('Amount mismatch', { status: 400 });
    }

    // 3. Wyślij tokeny PRG
    const prgSendSignature = await sendPrgTokens(purchase.prg_delivery_address, purchase.tokens_to_credit, connection);

    // 4. Zaktualizuj status transakcji w bazie danych
    await supabase
      .from('purchases')
      .update({
        status: 'completed',
        payment_signature: signature,
        prg_send_signature: prgSendSignature,
      })
      .eq('id', purchase.id);

    return new Response(JSON.stringify({ success: true, message: 'Tokens distributed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Błąd w webhooku:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
})