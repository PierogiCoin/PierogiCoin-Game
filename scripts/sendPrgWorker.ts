import { NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import { createClient } from '@/lib/supabase/server';
import { ENV } from '@/env.secret';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const { PRG_TOKEN_MINT_ADDRESS, TOKEN_SENDER_SECRET_KEY, WORKER_SECRET } = ENV;
const PRG_TOKEN_DECIMALS = Number(process.env.PRG_TOKEN_DECIMALS || 9);

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

async function ensureAta(connection: Connection, payer: Keypair, mint: PublicKey, owner: PublicKey) {
  const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
  return ata.address;
}

async function sendPrgWithRetry(
  connection: Connection,
  sender: Keypair,
  fromTokenAcc: PublicKey,
  toTokenAcc: PublicKey,
  amountSmallest: number,
  maxAttempts = 4
): Promise<string> {
  let lastErr: any;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction().add(
        createTransferInstruction(fromTokenAcc, toTokenAcc, sender.publicKey, amountSmallest)
      );
      tx.feePayer = sender.publicKey;
      tx.recentBlockhash = blockhash;
      const sig = await sendAndConfirmTransaction(connection, tx, [sender], { commitment: 'confirmed' });
      return sig;
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      const retryable =
        msg.includes('TokenAccountNotFoundError') ||
        msg.includes('Failed to find account') ||
        msg.includes('could not find account') ||
        msg.includes('Attempt to debit an account but found no record of a prior credit') ||
        msg.includes('Blockhash not found') ||
        msg.includes('Transaction expired') ||
        msg.includes('node is behind') ||
        msg.includes('Timed out');
      if (!retryable || i === maxAttempts) throw e;
      await new Promise(r => setTimeout(r, 300 * i + Math.floor(Math.random() * 150)));
    }
  }
  throw lastErr;
}

export async function POST(req: Request) {
  // prosty auth do workera
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${WORKER_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  // pobierz paczkę do przetworzenia
  const { data: jobs, error } = await supabase
    .from('pending_token_sends')
    .select('*')
    .in('status', ['queued', 'failed'])
    .order('updated_at', { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs?.length) return NextResponse.json({ processed: 0 });

  // klucze i mint
  const secret = JSON.parse(TOKEN_SENDER_SECRET_KEY);
  const sender = Keypair.fromSecretKey(Uint8Array.from(secret));
  const mint = new PublicKey(PRG_TOKEN_MINT_ADDRESS);

  // upewnij się, że mamy swój ATA (źródłowy)
  const fromAta = (await getOrCreateAssociatedTokenAccount(connection, sender, mint, sender.publicKey)).address;

  let ok = 0, fail = 0;

  for (const j of jobs) {
    try {
      await supabase.from('pending_token_sends')
        .update({ status: 'sending', attempts: j.attempts + 1, updated_at: new Date().toISOString() })
        .eq('id', j.id);

      const to = new PublicKey(j.buyer_wallet);
      const toAta = await ensureAta(connection, sender, mint, to);

      const sig = await sendPrgWithRetry(connection, sender, fromAta, toAta, Number(j.amount_smallest), 4);

      // sukces: oznacz w kolejce i (opcjonalnie) w purchases
      await supabase.from('pending_token_sends')
        .update({ status: 'sent', last_error: null, updated_at: new Date().toISOString() })
        .eq('id', j.id);

      if (j.purchase_id) {
        await supabase.from('purchases')
          .update({ prg_send_signature: sig, status: 'completed' })
          .eq('id', j.purchase_id);
      }

      ok++;
    } catch (e: any) {
      const msg = String(e?.message || e);
      await supabase.from('pending_token_sends')
        .update({ status: 'failed', last_error: msg, updated_at: new Date().toISOString() })
        .eq('id', j.id);
      fail++;
    }
  }

  return NextResponse.json({ processed: jobs.length, ok, fail });
}
