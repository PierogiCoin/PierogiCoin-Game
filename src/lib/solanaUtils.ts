// src/lib/solanaUtils.ts

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { supabaseAdmin } from '@/lib/supabaseClient';

async function signTransactionWithKeypair(transaction: Transaction, keypair: Keypair): Promise<Transaction> {
  transaction.partialSign(keypair);
  return transaction;
}

/**
 * Wysyła tokeny PRG do podanego portfela na blockchainie Solana
 */
export async function sendPRGToken(
  connection: Connection,
  buyerPubkey: PublicKey,
  amountInRawUnits: bigint
): Promise<{ success: boolean; error?: string }> {
  try {
    // POPRAW: odczytujemy mint tokena z env
    const mintAddress = process.env.PRG_TOKEN_MINT!;
    if (!mintAddress) {
      throw new Error('Brakuje zmiennej środowiskowej PRG_TOKEN_MINT');
    }
    const TOKEN_MINT = new PublicKey(mintAddress);

    // Pobieramy klucz prywatny nadawcy (payer) z ENV, w formacie JSON [liczby]
    const secretKeyJson = process.env.PAYER_SECRET_KEY;
    if (!secretKeyJson) {
      throw new Error('Brakuje zmiennej środowiskowej PAYER_SECRET_KEY');
    }
    const payerSecretKey = Uint8Array.from(JSON.parse(secretKeyJson));
    const payer = Keypair.fromSecretKey(payerSecretKey);

    // Znajdź Account PDA (ATA) nadawcy i odbiorcy
    const [senderATA] = await PublicKey.findProgramAddress(
      [payer.publicKey.toBuffer(), TOKEN_MINT.toBuffer()],
      TOKEN_PROGRAM_ID
    );
    const [receiverATA] = await PublicKey.findProgramAddress(
      [buyerPubkey.toBuffer(), TOKEN_MINT.toBuffer()],
      TOKEN_PROGRAM_ID
    );

    // Budujemy tablicę instrukcji
    const instructions = [];

    // 1) Jeśli ATA odbiorcy nie istnieje, utwórz go
    const receiverAccountInfo = await connection.getAccountInfo(receiverATA);
    if (!receiverAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,    // who pays for account creation
          receiverATA,        // new ATA address
          buyerPubkey,        // owner of the new ATA
          TOKEN_MINT          // mint
        )
      );
    }

    // 2) Instrukcja transferu tokenów
    instructions.push(
      createTransferInstruction(
        senderATA,          // source token account
        receiverATA,        // destination token account
        payer.publicKey,    // owner of source ATA
        amountInRawUnits    // amount (in raw units, np. jeśli PRG ma 6 decymalnych, to 1 PRG = 1_000_000u)
      )
    );

    // 3) Zbuduj i podpisz transakcję
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = payer.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Podpisujemy transakcję
    const signedTx = await signTransactionWithKeypair(transaction, payer);
    const signature = await sendAndConfirmTransaction(connection, signedTx, [payer]);

    // 4) Zaktualizuj status w Supabase (z pending na “fulfilled”)
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'fulfilled' })
      .eq('payment_transaction_signature', signature);

    if (updateError) {
      console.error('Błąd przy aktualizacji statusu w Supabase:', updateError);
      // Mimo błędu aktualizacji statusu, transakcja na łańcuchu już się wykonała
      return { success: true };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('❌ Błąd przy wysyłaniu PRG:', err);
    return { success: false, error: (err as Error).message };
  }
}