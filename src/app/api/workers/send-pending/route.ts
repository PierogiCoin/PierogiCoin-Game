// src/app/api/workers/send-pending/route.ts
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  type AccountInfo,
  type ParsedAccountData,
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { createClient } from '@/lib/supabase/server';

// --- ENV ---
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const PRG_TOKEN_MINT_ADDRESS = process.env.PRG_TOKEN_MINT_ADDRESS || '';
const TOKEN_SENDER_SECRET_KEY = (process.env.TOKEN_SENDER_SECRET_KEY || '').trim();
const WORKER_SECRET = (process.env.WORKER_SECRET || '').trim();

// --- RPC conn (re-używane) ---
const connection = new Connection(
  HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : (process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com')
);

// --- Typ kolejki ---
type PendingRow = {
  id: string | number;
  status: 'queued' | 'failed' | 'sending' | 'sent';
  attempts: number;
  buyer_wallet: string;
  amount_smallest: string | number | bigint; // w najmniejszych jednostkach PRG
  purchase_id?: string | number | null;
  updated_at?: string | null;
  last_error?: string | null;
};

// --- Utils ---
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Ustalenie programu tokenów na podstawie właściciela konta mint
async function getTokenProgramForMint(conn: Connection, mint: PublicKey): Promise<PublicKey> {
  try {
    const info = await conn.getParsedAccountInfo(mint, 'processed');
    const ownerPk = (info.value as AccountInfo<Buffer | ParsedAccountData> | null)?.owner ?? null;
    if (ownerPk) {
      if (ownerPk.equals(TOKEN_2022_PROGRAM_ID) || ownerPk.equals(TOKEN_PROGRAM_ID)) {
        return ownerPk;
      }
      return ownerPk;
    }
  } catch {
    /* ignore, fallback niżej */
  }
  return TOKEN_PROGRAM_ID;
}

// Idempotentne utworzenie ATA pod wskazany program tokenów
async function ensureAta(
  conn: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner, true, tokenProgramId, ASSOCIATED_TOKEN_PROGRAM_ID);

  // quick path: istnieje?
  try {
    await getAccount(conn, ata, 'processed', tokenProgramId);
    return ata;
  } catch {
    // not found → stworzymy
  }

  const ix = createAssociatedTokenAccountIdempotentInstruction(
    payer.publicKey,
    ata,
    owner,
    mint,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const tx = new Transaction().add(ix);
  await sendAndConfirmTransaction(conn, tx, [payer], { commitment: 'confirmed' });

  // weryfikacja
  for (let i = 0; i < 5; i++) {
    try {
      await getAccount(conn, ata, 'confirmed', tokenProgramId);
      return ata;
    } catch {
      await sleep(120 + Math.floor(Math.random() * 120));
    }
  }
  throw new Error('ATA verification failed after creation');
}

// Transfer PRG z retry (amount jako bigint)
async function sendPrgWithRetry(
  conn: Connection,
  sender: Keypair,
  fromTokenAcc: PublicKey,
  toTokenAcc: PublicKey,
  amountSmallest: bigint,
  tokenProgramId: PublicKey,
  maxAttempts = 4
): Promise<string> {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const { blockhash } = await conn.getLatestBlockhash('confirmed');
      const tx = new Transaction().add(
        createTransferInstruction(
          fromTokenAcc,
          toTokenAcc,
          sender.publicKey,
          amountSmallest,
          [],
          tokenProgramId
        )
      );
      tx.feePayer = sender.publicKey;
      tx.recentBlockhash = blockhash;

      const sig = await sendAndConfirmTransaction(conn, tx, [sender], { commitment: 'confirmed' });
      return sig;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const retryable =
        msg.includes('TokenAccountNotFoundError') ||
        msg.includes('Failed to find account') ||
        msg.includes('could not find account') ||
        msg.includes('Attempt to debit an account but found no record of a prior credit') ||
        msg.includes('Blockhash not found') ||
        msg.includes('Transaction expired') ||
        msg.includes('node is behind') ||
        msg.includes('minContextSlot not reached') ||
        msg.includes('Timed out') ||
        msg.includes('was not confirmed') ||
        msg.includes('Transaction was not confirmed');

      if (!retryable || i === maxAttempts) {
        throw e instanceof Error ? e : new Error(msg);
      }
      await sleep(280 * i + Math.floor(Math.random() * 160));
    }
  }
  throw new Error('unreachable');
}

export async function POST(req: Request): Promise<NextResponse> {
  // prosty auth do workera
  const auth = req.headers.get('authorization') || '';
  if (!WORKER_SECRET || auth !== `Bearer ${WORKER_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // klucz nadawcy (obsługa JSON[64] lub base58)
  if (!TOKEN_SENDER_SECRET_KEY) {
    return NextResponse.json({ error: 'TOKEN_SENDER_SECRET_KEY missing' }, { status: 500 });
  }
  let sender: Keypair;
  try {
    if (TOKEN_SENDER_SECRET_KEY.startsWith('[')) {
      const arr = JSON.parse(TOKEN_SENDER_SECRET_KEY) as unknown;
      if (!Array.isArray(arr) || arr.length !== 64) throw new Error('Secret JSON must be 64-length array');
      sender = Keypair.fromSecretKey(Uint8Array.from(arr as number[]));
    } else {
      const { default: bs58 } = await import('bs58');
      const decoded = bs58.decode(TOKEN_SENDER_SECRET_KEY);
      if (decoded.length !== 64) throw new Error(`Base58 secret must decode to 64 bytes, got ${decoded.length}`);
      sender = Keypair.fromSecretKey(decoded);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Bad TOKEN_SENDER_SECRET_KEY: ${msg}` }, { status: 500 });
  }

  if (!PRG_TOKEN_MINT_ADDRESS) {
    return NextResponse.json({ error: 'PRG_TOKEN_MINT_ADDRESS missing' }, { status: 500 });
  }
  const mint = new PublicKey(PRG_TOKEN_MINT_ADDRESS);

  // określ właściwy program tokenów dla mintu
  const tokenProgramId = await getTokenProgramForMint(connection, mint);

  // upewnij się, że mamy ATA nadawcy
  let fromAta: PublicKey;
  try {
    fromAta = await ensureAta(connection, sender, mint, sender.publicKey, tokenProgramId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `ensure sender ATA failed: ${msg}` }, { status: 500 });
  }

  const supabase = createClient();

  // pobierz paczkę do przetworzenia
  const { data: jobs, error } = await supabase
    .from('pending_token_sends')
    .select('*')
    .in('status', ['queued', 'failed'] as const)
    .order('updated_at', { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs?.length) return NextResponse.json({ processed: 0 });

  let ok = 0;
  let fail = 0;

  for (const raw of jobs as unknown as PendingRow[]) {
    const j: PendingRow = raw;
    try {
      await supabase
        .from('pending_token_sends')
        .update({
          status: 'sending',
          attempts: (j.attempts ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', j.id);

      const to = new PublicKey(j.buyer_wallet);
      const toAta = await ensureAta(connection, sender, mint, to, tokenProgramId);

      // amount → bigint (bez BigInt literali)
      const amtBig = BigInt(String(j.amount_smallest));
      if (amtBig <= BigInt(0)) {
        throw new Error(`Non-positive amount_smallest: ${String(j.amount_smallest)}`);
      }

      const sig = await sendPrgWithRetry(connection, sender, fromAta, toAta, amtBig, tokenProgramId, 4);

      await supabase
        .from('pending_token_sends')
        .update({
          status: 'sent',
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', j.id);

      if (j.purchase_id != null) {
        await supabase
          .from('purchases')
          .update({ prg_send_signature: sig, status: 'completed' })
          .eq('id', j.purchase_id);
      }

      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase
        .from('pending_token_sends')
        .update({
          status: 'failed',
          last_error: msg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', j.id);
      fail++;
    }
  }

  return NextResponse.json({ processed: jobs.length, ok, fail });
}

export async function GET(): Promise<NextResponse> {
  // Prosty „healthcheck”
  return NextResponse.json({ status: 'ready' });
}
