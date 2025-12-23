// src/app/api/initiate-purchase/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getStageForUsdAmount, getInvestmentBonusPercent } from '@/config/presaleConfig';
import { PublicKey } from '@solana/web3.js';

// ENV
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS;

// Schema
const purchaseSchema = z.object({
  buyerAddress: z.string().min(32).max(44),
  amountUSD: z.number().min(1),
  paymentCryptoCurrency: z.enum(['SOL', 'USDC']),
  prgDeliveryAddress: z.string().min(32).max(44),
  referrerAddress: z.string().optional(),
});

// Simple price cache
type PriceCache = { sol: number; usdc: number; lastFetched: number };
let priceCache: PriceCache | null = null;
const CACHE_DURATION_MS = 2 * 60 * 1000;

async function getCachedCryptoPrices(): Promise<{ sol: number; usdc: number }> {
  const now = Date.now();

  if (priceCache && now - priceCache.lastFetched < CACHE_DURATION_MS) {
    return { sol: priceCache.sol, usdc: priceCache.usdc };
  }

  const headers = {
    'user-agent': 'presale-service/1.0 (+https://pierogimeme.io)',
    accept: 'application/json',
  } as const;

  const [solRes, usdcRes] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', { headers, cache: 'no-store' }),
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd', { headers, cache: 'no-store' }),
  ]);

  if (!solRes.ok || !usdcRes.ok) {
    throw new Error('Nie udało się pobrać cen crypto');
  }

  const solJson = (await solRes.json()) as { solana: { usd: number } };
  const usdcJson = (await usdcRes.json()) as { 'usd-coin': { usd: number } };

  priceCache = {
    sol: Number(solJson.solana.usd),
    usdc: Number(usdcJson['usd-coin'].usd),
    lastFetched: now,
  };

  return { sol: priceCache.sol, usdc: priceCache.usdc };
}

export async function POST(req: Request) {
  try {
    // Guard: required env
    if (!TREASURY_WALLET_ADDRESS) {
      console.error('[initiate-purchase] Missing TREASURY_WALLET_ADDRESS');
      return NextResponse.json(
        { success: false, error: 'Brak TREASURY_WALLET_ADDRESS w env' },
        { status: 500 }
      );
    }

    const supabase = createClient();

    // Parse & validate payload
    const body = await req.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      console.warn('[initiate-purchase] Validation error:', parsed.error.issues);
      return NextResponse.json({ error: 'Nieprawidłowe dane żądania.' }, { status: 400 });
    }

    const { buyerAddress, amountUSD, paymentCryptoCurrency, prgDeliveryAddress, referrerAddress } = parsed.data;

    // Wallet validation
    try {
      new PublicKey(buyerAddress);
      new PublicKey(prgDeliveryAddress);
      new PublicKey(TREASURY_WALLET_ADDRESS);
      if (referrerAddress) {
        try {
          new PublicKey(referrerAddress);
        } catch {
          console.warn('[initiate-purchase] Invalid referrerAddress format:', referrerAddress);
          // Don't fail the whole purchase if referrer is just a weird string, but maybe nullify it
        }
      }
    } catch {
      return NextResponse.json({ error: 'Nieprawidłowy adres portfela Solany.' }, { status: 400 });
    }

    // Prices
    const prices = await getCachedCryptoPrices();
    const usdPerCrypto = paymentCryptoCurrency === 'SOL' ? prices.sol : prices.usdc;

    // Presale state
    const { data: presaleState, error: rpcError } = await supabase.rpc('get_total_confirmed_usd_raised');
    if (rpcError) {
      console.error('[initiate-purchase] RPC get_total_confirmed_usd_raised error:', rpcError);
      throw new Error('Nie można pobrać stanu przedsprzedaży.');
    }

    const totalUsdRaised = Number(presaleState) || 0;
    const currentStage = getStageForUsdAmount(totalUsdRaised);
    if (!currentStage) {
      console.error('[initiate-purchase] No active presale stage');
      throw new Error('Brak aktywnego etapu sprzedaży.');
    }

    // Tokens calculation — single source of truth
    // Base: 1 USD => 25,000 PRG (before bonuses)
    const BASE_RATE_PER_USD = 25_000;

    const stageBonusPct = Number(currentStage.bonusPercent || 0); // e.g. 15 for +15%
    const investBonusPct = Number(getInvestmentBonusPercent(amountUSD) || 0);
    const referralBonusPct = referrerAddress ? 2 : 0; // +2% for using a referral link
    
    const totalBonusBps = Math.max(0, Math.floor((stageBonusPct + investBonusPct + referralBonusPct) * 100)); // convert % -> bps

    // Always integer tokens_to_credit
    const base = Math.max(0, Math.floor(amountUSD * BASE_RATE_PER_USD));
    const bonus = Math.floor((base * totalBonusBps) / 10_000);
    const totalTokens = base + bonus;

    console.log('[initiate-purchase] buyer:', buyerAddress,
      'amountUSD:', amountUSD,
      'pay:', paymentCryptoCurrency,
      'usdPerCrypto:', usdPerCrypto,
      'stage:', currentStage.name,
      'tokens:', totalTokens);

    // Anti-spam: last purchase within 30s
    const { data: recentPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('buyer_wallet', buyerAddress)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      recentPurchase &&
      recentPurchase.created_at &&
      Date.now() - new Date(recentPurchase.created_at).getTime() < 30_000
    ) {
      return NextResponse.json({ error: 'Proszę poczekać chwilę przed kolejnym zakupem.' }, { status: 429 });
    }

    // Insert purchase
    const { data: insertData, error: insertError } = await supabase
      .from('purchases')
      .insert({
        buyer_wallet: buyerAddress,
        prg_delivery_address: prgDeliveryAddress,
        usd_amount: amountUSD,
        crypto_type: paymentCryptoCurrency,
        crypto_amount: amountUSD / usdPerCrypto,
        tokens_to_credit: totalTokens,
        stage_name: currentStage.name,
        status: 'pending_payment',
        payment_signature: null,
        referrer_address: referrerAddress || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[initiate-purchase] Insert error:', insertError);
      throw insertError;
    }

    // Optionally: dynamically register buyerAddress in Helius webhook
    // (Disabled by default to avoid build/runtime errors. Create '@/lib/helius/addAddress.ts' to enable.)
    try {
      const mod = await import('@/lib/helius/addAddress').catch(() => null);
      if (mod?.default) {
        const added = await mod.default(buyerAddress);
        if (added) {
          console.log('[HELIUS] Dodano adres do webhooka:', buyerAddress);
        } else {
          console.warn('[HELIUS] Nie udało się dodać adresu do webhooka:', buyerAddress);
        }
      } else {
        console.log('[initiate-purchase] addAddress module not present — skipping webhook auto-registration.');
      }
    } catch (e) {
      console.warn('[initiate-purchase] addAddress failed:', e);
    }

    return NextResponse.json({
      success: true,
      transactionId: insertData.id,
      recipientAddress: TREASURY_WALLET_ADDRESS,
      usdPerCrypto,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd serwera.';
    console.error('[initiate-purchase] Fatal error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}