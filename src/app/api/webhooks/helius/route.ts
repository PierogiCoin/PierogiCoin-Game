// Plik: src/app/api/webhooks/helius/route.ts
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  SendTransactionError,
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
  type Account as SplTokenAccount,
} from '@solana/spl-token';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getStageForUsdAmount, getInvestmentBonusPercent } from '@/config/presaleConfig';
import { logger } from '@/utils/logger';

// Next runtime hints
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

// --- ENV ---
const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET!;
const PRG_TOKEN_MINT_ADDRESS = process.env.PRG_TOKEN_MINT_ADDRESS || '';
const PRG_TOKEN_DECIMALS = Number(process.env.PRG_TOKEN_DECIMALS || 9);
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || '';
const USDC_MINT_ADDRESS = process.env.USDC_MINT_ADDRESS || '';
const USDC_DECIMALS = Number(process.env.USDC_DECIMALS || 6);
const TOKEN_SENDER_SECRET_KEY = (process.env.TOKEN_SENDER_SECRET_KEY || '').trim();

// --- UTILS ---
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// zamiennik dla BigInt potęgowania (bez operatora **)
function pow10BigInt(n: number): bigint {
  let result = BigInt(1);
  const ten = BigInt(10);
  for (let i = 0; i < Math.max(0, n); i++) {
    result = result * ten;
  }
  return result;
}

let _heliusConn: Connection | null = null;
function getHeliusConnection(): Connection {
  if (!_heliusConn) {
    const key = HELIUS_API_KEY || '';
    const url = key
      ? `https://mainnet.helius-rpc.com/?api-key=${key}`
      : (process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com');
    _heliusConn = new Connection(url);
  }
  return _heliusConn;
}

function normalizeB58(addr: string | null | undefined): string {
  try {
    if (!addr) return '';
    return new PublicKey(addr).toBase58();
  } catch {
    return String(addr || '');
  }
}

// --- Minimalny model Helius ---
type RawTokenAmount = { amount: string; decimals: number };
type TokenTransferEdge = {
  fromUserAccount?: string;
  toUserAccount?: string;
  mint?: string;
  tokenAddress?: string;
  mintAddress?: string;
  rawTokenAmount?: RawTokenAmount | null;
  tokenAmount?: number;
  amount?: number;
};
type NativeTransferEdge = {
  fromUserAccount?: string;
  toUserAccount?: string;
  amount?: number | string;
};

type HeliusTxRecord = {
  signature: string;
  type: string;
  transactionError?: unknown;
  tokenTransfers?: TokenTransferEdge[];
  nativeTransfers?: NativeTransferEdge[];
};

function isHeliusTxRecord(u: unknown): u is HeliusTxRecord {
  const x = u as HeliusTxRecord;
  return !!x && typeof x === 'object' && typeof (x as { signature?: unknown }).signature === 'string';
}
function isHeliusTxArray(u: unknown): u is HeliusTxRecord[] {
  return Array.isArray(u) && u.every(isHeliusTxRecord);
}

// --- DB row (wycinek) ---
type PurchaseRow = {
  id: string | number;
  status: 'pending' | 'confirmed' | 'completed' | string;
  tokens_to_credit: string | number | bigint;
  prg_send_signature?: string | null;
  buyer_wallet: string;
  prg_delivery_address: string;
  payment_signature?: string | null;
  error_message?: string | null;
  stage_name?: string | null;
};

// --- Token program mintu ---
async function getTokenProgramForMint(connection: Connection, mint: PublicKey): Promise<PublicKey> {
  try {
    const info = await connection.getParsedAccountInfo(mint, 'processed');
    const ownerPk =
      (info.value as AccountInfo<Buffer | ParsedAccountData> | null)?.owner ?? null;

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

// --- Balance jako bigint ---
async function getTokenBalanceBigint(connection: Connection, tokenAccount: PublicKey): Promise<bigint> {
  try {
    const res = await connection.getTokenAccountBalance(tokenAccount, 'confirmed');
    const amtStr = res?.value?.amount;
    if (typeof amtStr === 'string' && amtStr.length > 0) return BigInt(amtStr);
  } catch {
    /* fallback */
  }
  try {
    const acc22 = await getAccount(connection, tokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
    return acc22.amount;
  } catch {
    /* fallback do legacy */
  }
  const acc = await getAccount(connection, tokenAccount, 'confirmed', TOKEN_PROGRAM_ID);
  return acc.amount;
}

// --- Ensure ATA (z retry i fallbackiem programu) ---
async function ensureAta(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  maxAttempts = 8
): Promise<{ address: PublicKey }> {
  // szybki sanity log
  try {
    const lamports = await connection.getBalance(payer.publicKey, { commitment: 'processed' });
    if (lamports < 0.01 * 1_000_000_000) {
      console.warn('[HELIUS WEBHOOK] Low payer SOL balance (~', lamports / 1_000_000_000, 'SOL ). ATA creation may fail.');
    }
  } catch {/* noop */}

  // Walidacja ownera
  {
    const ownerInfo = await connection.getAccountInfo(owner, 'processed');
    if (!ownerInfo) {
      throw new Error(`Owner account ${owner.toBase58()} does not exist on-chain. Fund this wallet with SOL so ATA can be created.`);
    }
    if (!ownerInfo.owner.equals(SystemProgram.programId)) {
      throw new Error(`Owner ${owner.toBase58()} is not a System Program account (owner program = ${ownerInfo.owner.toBase58()}).`);
    }
    if (ownerInfo.executable || (ownerInfo.data && ownerInfo.data.length !== 0)) {
      throw new Error(
        `Owner ${owner.toBase58()} is not a plain System account (executable=${ownerInfo.executable}, data.len=${ownerInfo.data?.length || 0}).`
      );
    }
  }

  const primaryProgram = await getTokenProgramForMint(connection, mint);
  const altProgram = primaryProgram.equals(TOKEN_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

  async function tryCreateWithProgram(programId: PublicKey) {
    const ataAddress = await getAssociatedTokenAddress(
      mint,
      owner,
      true,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // istnieje?
    try {
      const acc = await getAccount(connection, ataAddress, 'processed', programId);
      if (acc) return { address: ataAddress, programUsed: programId };
    } catch {/* not found */}

    const ix = createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      ataAddress,
      owner,
      mint,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);
    try {
      await sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
    } catch (e) {
      if (e instanceof SendTransactionError) {
        try {
          const logs = await e.getLogs(connection);
          console.error('[HELIUS WEBHOOK] ensureAta(): SendTransactionError logs:', logs);
        } catch (logErr) {
          console.error('[HELIUS WEBHOOK] ensureAta(): Could not fetch logs:', logErr);
        }
      }
      throw e;
    }

    // verify
    for (let i = 0; i < 5; i++) {
      try {
        await getAccount(connection, ataAddress, 'confirmed', programId);
        if (i > 0) console.log('[HELIUS WEBHOOK] ensureAta(): ATA verified (probe', i + 1, ') ->', ataAddress.toBase58());
        return { address: ataAddress, programUsed: programId };
      } catch {
        await sleep(150 + Math.floor(Math.random() * 150));
      }
    }
    throw new Error('ATA verification failed after creation');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      try {
        const res = await tryCreateWithProgram(primaryProgram);
        if (attempt > 1) {
          console.log('[HELIUS WEBHOOK] ensureAta(): success after retry #', attempt, 'using program', res.programUsed.toBase58());
        }
        return { address: res.address };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);

        const shouldTryAlt =
          !primaryProgram.equals(TOKEN_2022_PROGRAM_ID) && (
            msg.includes('Provided owner is not allowed') ||
            msg.includes('Invalid seeds') ||
            msg.includes('owner does not match') ||
            msg.includes('incorrect owner') ||
            msg.includes('OwnerMismatch') ||
            msg.includes('Associated token account owner does not match')
          );

        if (shouldTryAlt) {
          console.warn(
            `[HELIUS WEBHOOK] ensureAta(): primary ${primaryProgram.toBase58()} failed (owner/program mismatch), trying ALT ${altProgram.toBase58()}. Reason: ${msg}`
          );
          const resAlt = await tryCreateWithProgram(altProgram);
          if (attempt > 1) {
            console.log('[HELIUS WEBHOOK] ensureAta(): success after retry #', attempt, 'using ALT program', resAlt.programUsed.toBase58());
          }
          return { address: resAlt.address };
        }

        throw e;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);

      const retryable =
        msg.includes('TokenAccountNotFoundError') ||
        msg.includes('Failed to find account') ||
        msg.includes('could not find account') ||
        msg.includes('not have enough balance to pay') ||
        msg.includes('Block not available') ||
        msg.includes('node is behind') ||
        msg.includes('minContextSlot not reached') ||
        msg.includes('ATA verification failed') ||
        msg.includes('Transaction was not confirmed') ||
        msg.includes('Timed out') ||
        msg.includes('Blockhash not found') ||
        msg.includes('Transaction expired');

      console.warn(`[HELIUS WEBHOOK] ensureAta() attempt ${attempt}/${maxAttempts} failed: ${msg}`);

      if (!retryable || attempt === maxAttempts) break;
      const backoff = 300 * attempt + Math.floor(Math.random() * 200);
      await sleep(backoff);
    }
  }

  throw new Error('Failed to ensure ATA');
}

// --- Kurs SOL/USD ---
async function fetchSolUsd(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      method: 'GET',
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const j = (await res.json()) as { solana?: { usd?: number } };
    const v = Number(j?.solana?.usd);
    if (!v || !Number.isFinite(v)) throw new Error('bad price');
    return v;
  } catch (e) {
    console.warn('[HELIUS WEBHOOK] Failed to fetch SOL/USD price, defaulting to 0:', e);
    return 0;
  }
}

type AmountCalc =
  | { cryptoType: 'USDC'; cryptoAmount: number; usdAmount: number }
  | { cryptoType: 'SOL'; cryptoAmount: number; usdAmount: number };

// --- Kwoty z krawędzi transferu ---
async function calcAmountsFromEdge(
  chosenEdge: TokenTransferEdge | NativeTransferEdge,
  tx: HeliusTxRecord
): Promise<AmountCalc | null> {
  try {
    // USDC via tokenTransfers
    const mint = (chosenEdge as TokenTransferEdge)?.mint
      || (chosenEdge as TokenTransferEdge)?.tokenAddress
      || (chosenEdge as TokenTransferEdge)?.mintAddress;

    if (mint && USDC_MINT_ADDRESS && normalizeB58(mint) === normalizeB58(USDC_MINT_ADDRESS)) {
      const raw = (chosenEdge as TokenTransferEdge)?.rawTokenAmount;
      if (raw && typeof raw.amount === 'string') {
        const amt = Number(raw.amount);
        const dec = Number(raw.decimals ?? USDC_DECIMALS);
        const tokens = amt / 10 ** dec;
        return { cryptoType: 'USDC', cryptoAmount: tokens, usdAmount: tokens };
      }
      const tok = Number((chosenEdge as TokenTransferEdge)?.tokenAmount ?? (chosenEdge as TokenTransferEdge)?.amount ?? 0);
      if (!Number.isFinite(tok) || tok <= 0) return null;
      return { cryptoType: 'USDC', cryptoAmount: tok, usdAmount: tok };
    }

    // Native SOL
    {
      const raw = (chosenEdge as NativeTransferEdge)?.amount;
      const lamportsVal = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
      if (Number.isFinite(lamportsVal) && lamportsVal > 0) {
        const sol = lamportsVal / 1_000_000_000;
        if (sol < 0.000005) return null;
        const solUsd = await fetchSolUsd();
        if (solUsd > 0) return { cryptoType: 'SOL', cryptoAmount: sol, usdAmount: sol * solUsd };
      }
    }

    // fallback: spróbuj znaleźć USDC edge w tokenTransfers
    if (Array.isArray(tx?.tokenTransfers) && tx.tokenTransfers.length) {
      const maybeUsdc = tx.tokenTransfers.find((e: TokenTransferEdge) => normalizeB58(e?.mint) === normalizeB58(USDC_MINT_ADDRESS));
      if (maybeUsdc) return calcAmountsFromEdge(maybeUsdc, tx);
    }

    return null;
  } catch {
    return null;
  }
}

// --- PRG send z retry ---
async function sendPrgWithRetry(
  connection: Connection,
  senderKeypair: Keypair,
  fromTokenAccount: PublicKey,
  toTokenAccount: PublicKey,
  amountSmallestUnits: bigint,
  maxAttempts = 6,
  tokenProgramId: PublicKey = TOKEN_PROGRAM_ID
): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      const tx = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          senderKeypair.publicKey,
          amountSmallestUnits,
          [],
          tokenProgramId
        )
      );
      tx.feePayer = senderKeypair.publicKey;
      tx.recentBlockhash = blockhash;

      const sig = await sendAndConfirmTransaction(connection, tx, [senderKeypair], {
        skipPreflight: false,
        commitment: 'confirmed',
      });
      return sig;
    } catch (e) {
      if (e instanceof SendTransactionError) {
        try {
          const logs = await e.getLogs(connection);
          console.error('[HELIUS WEBHOOK] sendPrgWithRetry(): SendTransactionError logs:', logs);
        } catch (logErr) {
          console.error('[HELIUS WEBHOOK] sendPrgWithRetry(): Could not fetch logs:', logErr);
        }
      }
      const msg = e instanceof Error ? e.message : String(e);

      const isAtaRace =
        msg.includes('TokenAccountNotFoundError') ||
        msg.includes('Failed to find account') ||
        msg.includes('could not find account') ||
        msg.includes('Attempt to debit an account but found no record of a prior credit');

      const isBlockhash =
        msg.includes('Blockhash not found') ||
        msg.includes('blockhash not found') ||
        msg.includes('Transaction expired') ||
        msg.includes('nonce') ||
        msg.includes('blockhash');

      const isNodeBehind =
        msg.includes('node is behind') ||
        msg.includes('Block not available') ||
        msg.includes('minContextSlot not reached');

      const isTimeout =
        msg.includes('was not confirmed') ||
        msg.includes('Transaction was not confirmed') ||
        msg.includes('Timed out');

      const retryable = isAtaRace || isBlockhash || isNodeBehind || isTimeout;

      console.error(`[HELIUS WEBHOOK] PRG send attempt ${attempt}/${maxAttempts} failed (retryable=${retryable}):`, msg);

      if (!retryable || attempt === maxAttempts) throw e;

      if (isAtaRace) {
        try {
          let acc: SplTokenAccount | null = null;
          try { acc = await getAccount(connection, toTokenAccount, 'processed', TOKEN_2022_PROGRAM_ID); } catch {/* ignore */}
          if (!acc) { try { acc = await getAccount(connection, toTokenAccount, 'processed', TOKEN_PROGRAM_ID); } catch {/* ignore */} }
          if (acc) void acc.owner;
        } catch {/* outer ensure zrobi robotę */}
      }

      const backoff = 300 + 200 * attempt + Math.floor(Math.random() * 200);
      await sleep(backoff);
    }
  }
  throw new Error('Failed to send PRG transaction');
}

// --- Auth ---
function getAuthHeader(req: NextRequest): string | null {
  return req.headers.get('authorization') || req.headers.get('Authorization');
}
function isAuthorized(req: NextRequest): boolean {
  const hdr = getAuthHeader(req);
  if (!HELIUS_WEBHOOK_SECRET) {
    console.error('[HELIUS WEBHOOK] Missing HELIUS_WEBHOOK_SECRET env.');
    return false;
  }
  if (!hdr) return false;
  const val = hdr.trim();
  return val === HELIUS_WEBHOOK_SECRET || val === `Bearer ${HELIUS_WEBHOOK_SECRET}`;
}

// --- DB lookup z retry ---
async function findPurchaseWithRetry(supabase: SupabaseClient, signature: string): Promise<PurchaseRow | null> {
  const start = Date.now();
  let delay = 800;

  while (Date.now() - start < 25_000) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('payment_signature', signature)
      .limit(1);

    if (!error && data?.length) return data[0] as PurchaseRow;

    const jitter = Math.floor(Math.random() * 200);
    await sleep(delay + jitter);
    delay = Math.min(delay * 2, 4000);
  }

  await supabase.from('webhook_errors').insert({
    error_type: 'purchase_not_found',
    context: JSON.stringify({ signature }),
    message: 'No purchase found for signature within retry window',
  });

  console.warn('[HELIUS WEBHOOK] No purchase found for signature within retry window:', signature);
  return null;
}

// --- Główny worker webhooka ---
async function handleWebhook(transactions: HeliusTxRecord[]): Promise<void> {
  const supabase = createClient();

  console.log('[HELIUS WEBHOOK] Handling batch size:', transactions.length);

  for (const tx of transactions) {
    const signature = tx.signature;
    console.log('[HELIUS WEBHOOK] TX signature:', signature, 'type:', tx.type, 'hasError:', !!tx.transactionError);

    if (!(tx.type === 'TRANSFER' || tx.type === 'TRANSFER_INSTRUCTION' || tx.type === 'TOKEN_TRANSFER') || tx.transactionError) {
      continue;
    }

    const normTreasury = normalizeB58(TREASURY_WALLET_ADDRESS);
    const tokenEdges = Array.isArray(tx.tokenTransfers) ? tx.tokenTransfers : [];
    const nativeEdges = Array.isArray(tx.nativeTransfers) ? tx.nativeTransfers : [];

    const pickEdge = <T extends TokenTransferEdge | NativeTransferEdge>(edges: T[]): T | null => {
      if (!edges || edges.length === 0) return null;
      if (normTreasury) {
        const m = edges.find((e) => normalizeB58((e as TokenTransferEdge).toUserAccount) === normTreasury);
        if (m) return m;
      }
      return edges[0] || null;
    };

    const chosenEdge = (pickEdge(tokenEdges) ?? pickEdge(nativeEdges)) as TokenTransferEdge | NativeTransferEdge | null;

    console.log(
      '[HELIUS WEBHOOK] tokenEdges:',
      tokenEdges.length,
      '| nativeEdges:',
      nativeEdges.length
    );

    try {
      const brief = chosenEdge
        ? {
            fromUserAccount: (chosenEdge as TokenTransferEdge).fromUserAccount ?? (chosenEdge as NativeTransferEdge).fromUserAccount,
            toUserAccount: (chosenEdge as TokenTransferEdge).toUserAccount ?? (chosenEdge as NativeTransferEdge).toUserAccount,
            amount: (chosenEdge as TokenTransferEdge).amount ?? (chosenEdge as NativeTransferEdge).amount,
            mint: (chosenEdge as TokenTransferEdge).mint
              ?? (chosenEdge as TokenTransferEdge).tokenAddress
              ?? (chosenEdge as TokenTransferEdge).mintAddress,
            rawTokenAmount: (chosenEdge as TokenTransferEdge).rawTokenAmount,
          }
        : null;
      console.log('[HELIUS WEBHOOK] chosenEdge brief:', brief);
    } catch (e) {
      console.log('[HELIUS WEBHOOK] chosenEdge log error:', e);
    }

    const fromUser = (chosenEdge as TokenTransferEdge | NativeTransferEdge | null)?.fromUserAccount ?? null;
    const toUser = (chosenEdge as TokenTransferEdge | NativeTransferEdge | null)?.toUserAccount ?? null;

    console.log('[HELIUS WEBHOOK] fromUser:', fromUser, '| toUser:', toUser, '| pickedTreasury:', normTreasury || '(none)');

    if (normalizeB58(fromUser) === normalizeB58(toUser)) {
      console.log('[HELIUS WEBHOOK] Self-transfer detected — skipping.');
      continue;
    }
    if (normTreasury && normalizeB58(fromUser) === normTreasury) {
      continue;
    }
    if (!fromUser || !toUser) continue;

    if (normTreasury) {
      const isToTreasury = normalizeB58(toUser) === normTreasury;
      if (!isToTreasury) continue;
    }

    const buyerWallet = new PublicKey(fromUser);
    let purchase = await findPurchaseWithRetry(supabase, signature);

    if (!purchase) {
      const amounts = chosenEdge ? await calcAmountsFromEdge(chosenEdge, tx) : null;
      if (!amounts) {
        console.log('[HELIUS WEBHOOK] No matching purchase and unable to infer amounts – skipping signature:', signature);
        continue;
      }

      const { data: presaleState, error: rpcError } = await supabase.rpc('get_total_confirmed_usd_raised');
      if (rpcError) {
        console.error('[HELIUS WEBHOOK] RPC get_total_confirmed_usd_raised error:', rpcError);
        continue;
      }
      const totalUsdRaised = Number(presaleState) || 0;
      const stage = getStageForUsdAmount(totalUsdRaised);
      if (!stage) {
        console.error('[HELIUS WEBHOOK] No active stage while auto-creating purchase.');
        continue;
      }

      const BASE_RATE_PER_USD = 25_000;
      const stageBonusPct = Number(stage.bonusPercent || 0);
      const investBonusPct = Number(getInvestmentBonusPercent(amounts.usdAmount) || 0);
      const totalBonusBps = Math.max(0, Math.floor((stageBonusPct + investBonusPct) * 100));

      const base = Math.max(0, Math.floor(amounts.usdAmount * BASE_RATE_PER_USD));
      const bonus = Math.floor((base * totalBonusBps) / 10_000);
      const tokens_to_credit = base + bonus;

      const insertPayload = {
        buyer_wallet: normalizeB58(fromUser),
        prg_delivery_address: normalizeB58(fromUser),
        usd_amount: Math.round(amounts.usdAmount * 1000) / 1000,
        crypto_type: amounts.cryptoType,
        crypto_amount: Math.round(amounts.cryptoAmount * 1e9) / 1e9,
        tokens_to_credit,
        stage_name: stage.name,
        status: 'confirmed',
        payment_signature: signature,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('purchases')
        .insert(insertPayload)
        .select()
        .single();

      if (insertErr || !inserted) {
        console.error('[HELIUS WEBHOOK] Failed to auto-create purchase:', insertErr);
        continue;
      }

      purchase = inserted as PurchaseRow;
      console.log('[HELIUS WEBHOOK] Auto-created purchase id:', purchase.id, 'status:', purchase.status);
    } else {
      console.log('[HELIUS WEBHOOK] Matched purchase id:', purchase.id, 'status:', purchase.status);
    }

    console.log('[HELIUS WEBHOOK] Preflight purchase check:', {
      id: purchase.id,
      status: purchase.status,
      tokens_to_credit: purchase.tokens_to_credit,
      prg_send_signature: purchase.prg_send_signature || null,
      buyer_wallet: purchase.buyer_wallet,
      prg_delivery_address: purchase.prg_delivery_address,
    });

    if (purchase.prg_send_signature) {
      console.log('[HELIUS WEBHOOK] Skip sending PRG – already has prg_send_signature:', purchase.prg_send_signature);
      continue;
    }

    if (purchase.status !== 'confirmed') {
      console.log('[HELIUS WEBHOOK] Status is not confirmed (', purchase.status, ') – updating to confirmed and proceeding.');
      await supabase.from('purchases').update({ status: 'confirmed' }).eq('id', purchase.id);
      purchase.status = 'confirmed';
    }

    // tokens_to_credit → bigint
    let tokensToCreditBig: bigint;
    try {
      tokensToCreditBig = BigInt(String(purchase.tokens_to_credit));
    } catch {
      console.error('[HELIUS WEBHOOK] tokens_to_credit invalid for purchase id:', purchase.id, 'value:', purchase.tokens_to_credit);
      continue;
    }
    if (tokensToCreditBig <= BigInt(0)) {
      console.error('[HELIUS WEBHOOK] tokens_to_credit <= 0 for purchase id:', purchase.id);
      continue;
    }

    try {
      // Sender secret
      let senderKeypair: Keypair;
      if (!TOKEN_SENDER_SECRET_KEY) throw new Error('TOKEN_SENDER_SECRET_KEY is empty');

      const isJsonArray = TOKEN_SENDER_SECRET_KEY.startsWith('[');
      const isLikelyBase58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(TOKEN_SENDER_SECRET_KEY) && !isJsonArray;

      if (isJsonArray) {
        const arr = JSON.parse(TOKEN_SENDER_SECRET_KEY) as unknown;
        if (!Array.isArray(arr) || arr.length !== 64) {
          throw new Error(`JSON secret must be 64-length array, got length=${Array.isArray(arr) ? arr.length : 'n/a'}`);
        }
        senderKeypair = Keypair.fromSecretKey(Uint8Array.from(arr as number[]));
        logger.log('[HELIUS WEBHOOK] TOKEN_SENDER_SECRET_KEY: using JSON array, pubkey =', senderKeypair.publicKey.toBase58());
      } else if (isLikelyBase58) {
        const { default: bs58 } = await import('bs58');
        const decoded = bs58.decode(TOKEN_SENDER_SECRET_KEY);
        if (decoded.length !== 64) throw new Error(`Base58 secret must decode to 64 bytes, got ${decoded.length}`);
        senderKeypair = Keypair.fromSecretKey(decoded);
        logger.log('[HELIUS WEBHOOK] TOKEN_SENDER_SECRET_KEY: using base58, pubkey =', senderKeypair.publicKey.toBase58());
      } else {
        throw new Error('Unsupported TOKEN_SENDER_SECRET_KEY format. Provide base58 or JSON [..64 bytes..].');
      }

      const mint = new PublicKey(PRG_TOKEN_MINT_ADDRESS);
      // Auto-detect the correct token program (Standard SPL or Token-2022)
      const tokenProgramId = await getTokenProgramForMint(getHeliusConnection(), mint); 
      
      logger.log('[HELIUS WEBHOOK] PRG mint ok =', mint.toBase58(), 'decimals =', PRG_TOKEN_DECIMALS);
      console.log('[HELIUS WEBHOOK] Detected Token Program for PRG:', tokenProgramId.toBase58());

      // Sender ATA
      const senderTokenAccount = await ensureAta(getHeliusConnection(), senderKeypair, mint, senderKeypair.publicKey);
      const senderAtaStr = senderTokenAccount.address.toBase58();
      console.log('[HELIUS WEBHOOK] Sender ATA address:', senderAtaStr);

      // Balance
      let senderRawBig: bigint = BigInt(0);
      try {
        senderRawBig = await getTokenBalanceBigint(getHeliusConnection(), senderTokenAccount.address);
        const senderUi = Number(senderRawBig) / 10 ** PRG_TOKEN_DECIMALS;
        console.log('[HELIUS WEBHOOK] Sender ATA balance:', senderUi, '(raw:', senderRawBig.toString(), ')');
      } catch (balErr) {
        console.warn('[HELIUS WEBHOOK] Could not fetch sender ATA balance via RPC/getAccount:', balErr);
      }

      // Buyer ATA
      const buyerTokenAccount = await ensureAta(getHeliusConnection(), senderKeypair, mint, buyerWallet);
      const buyerAtaStr = buyerTokenAccount.address.toBase58();
      console.log('[HELIUS WEBHOOK] Buyer ATA:', buyerAtaStr);
      console.log('[HELIUS WEBHOOK] Ready to send PRG from', senderAtaStr, 'to', buyerAtaStr);

      // ↓↓↓ ZAMIANA potęgowania BigInt na helpera
      const amountU64 = tokensToCreditBig * pow10BigInt(PRG_TOKEN_DECIMALS);

      console.log('[HELIUS WEBHOOK] Prepared PRG transfer context:', {
        purchaseId: purchase.id,
        toBuyer: normalizeB58(buyerWallet.toBase58()),
        sender: senderKeypair.publicKey.toBase58(),
        mint: PRG_TOKEN_MINT_ADDRESS,
        tokenAmount: tokensToCreditBig.toString(),
        smallestUnits: amountU64.toString(),
        decimals: PRG_TOKEN_DECIMALS,
        buyerAta: buyerAtaStr,
        senderAta: senderAtaStr,
      });

      // Sprawdź stan
      if (senderRawBig < amountU64) {
        const toUi = (v: bigint) => Number(v) / 10 ** PRG_TOKEN_DECIMALS;
        const need = toUi(amountU64);
        const have = toUi(senderRawBig);
        const msg = `[HELIUS WEBHOOK] Insufficient PRG balance on sender ATA. Need ${need}, have ${have}`;
        console.error('[HELIUS WEBHOOK] Aborting PRG send — insufficient sender balance (need raw', amountU64.toString(), 'have raw', senderRawBig.toString(), ')');
        await supabase.from('webhook_errors').insert({
          error_type: 'insufficient_sender_prg',
          context: JSON.stringify({ purchaseId: purchase.id, senderAta: senderAtaStr }),
          message: msg,
        });
        continue;
      }

      // Wyślij (z dodatkowymi re-ensure)
      let prgSignature: string | null = null;
      for (let i = 1; i <= 3; i++) {
        try {
          const ensured = await ensureAta(getHeliusConnection(), senderKeypair, mint, buyerWallet);
          const destAta = ensured.address;

          prgSignature = await sendPrgWithRetry(
            getHeliusConnection(),
            senderKeypair,
            senderTokenAccount.address,
            destAta,
            amountU64,
            6,
            tokenProgramId
          );
          console.log('[HELIUS WEBHOOK] PRG transfer sent. Signature:', prgSignature);
          break;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn(`[HELIUS WEBHOOK] Outer send loop attempt ${i}/3 failed: ${msg}`);
          if (i === 3) throw e;
          await sleep(400 + Math.floor(Math.random() * 200));
        }
      }

      await supabase
        .from('purchases')
        .update({ prg_send_signature: prgSignature, status: 'completed' })
        .eq('id', purchase.id);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      const errorStack = err instanceof Error && err.stack ? err.stack : null;

      await supabase.from('purchases').update({ error_message: errorMessage }).eq('id', purchase.id);
      await supabase.from('webhook_errors').insert({
        error_type: 'token_send_failed',
        context: JSON.stringify({ purchaseId: purchase.id, buyer: fromUser, signature }),
        message: errorMessage + (errorStack ? `\nSTACK:\n${errorStack}` : ''),
      });
    }
  }
}

// --- HTTP handler ---
export async function POST(req: NextRequest) {
  const hdr = getAuthHeader(req);
  if (!isAuthorized(req)) {
    console.error(
      '[HELIUS WEBHOOK] Unauthorized request. Got header:',
      hdr ? (hdr.length > 80 ? `${hdr.slice(0, 40)}...(redacted)` : hdr) : 'null'
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[HELIUS WEBHOOK] Failed to parse JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let transactions: HeliusTxRecord[];
  if (isHeliusTxArray(body)) {
    transactions = body;
  } else if (isHeliusTxRecord(body)) {
    transactions = [body];
  } else {
    console.log('[HELIUS WEBHOOK] Empty or invalid payload.');
    return NextResponse.json({ message: 'No transactions' }, { status: 200 });
  }

  if (transactions.length === 0) {
    console.log('[HELIUS WEBHOOK] Empty payload.');
    return NextResponse.json({ message: 'No transactions' }, { status: 200 });
  }

  console.log('[HELIUS WEBHOOK] Received payload. Count:', transactions.length);

  try {
    // Fire-and-forget (uwaga na środowisko serverless)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleWebhook(transactions)
      .then(() => console.log('[HELIUS WEBHOOK] Background processing finished for batch:', transactions.length))
      .catch((e) => console.error('[HELIUS WEBHOOK] Background processing error:', e));

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (e) {
    console.error('[HELIUS WEBHOOK] Unhandled error in handler (pre-dispatch):', e);
    // Celowo 200, by provider nie spamował retry przy miękkich init błędach
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}
