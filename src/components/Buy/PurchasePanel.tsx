// File: src/components/Buy/PurchasePanel.tsx
'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

import { usePresale } from '@/context/PresaleContext';
import AmountInput from '@/components/AmountInput';
import PurchaseSummary from '@/components/PurchaseSummary';
import { PresaleStatusSkeleton } from '@/components/PresaleStatusSkeleton';
import StageBar from '@/components/Buy/StageBar';
import InvestmentBonuses from '@/components/Buy/InvestmentBonuses';
import ManualPaymentSection from '@/components/Buy/ManualPaymentSection';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';

declare global { interface Window { gtag?: (...args: unknown[]) => void; } }

// ---------- helpers ----------
type StageLike = {
  bonusPercent?: number;
  soldUSD?: number;
  raisedUSD?: number;
  sold?: number;
  hardCapUSD?: number;
  capUSD?: number;
  hardCap?: number;
  endsAtIso?: string;
  slotsLeft?: number;
  remainingSlots?: number;
};

type Crypto = 'SOL' | 'USDC' | 'CARD';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const makeUsd0 = (locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const toUnits = (v: number, decimals: number) =>
  BigInt(Math.round(Number((v * 10 ** decimals).toFixed(0))));

const DEFAULT_BASE_RATE_PER_USD = 25_000;
const calculateTotalTokens = (
  amountUSD: number,
  stageBonusPercent: number,
  investmentBonusPercent: number,
  baseRatePerUsd: number = DEFAULT_BASE_RATE_PER_USD
) => {
  const usd = Math.max(0, Math.floor(amountUSD));
  const baseTokens = usd * baseRatePerUsd;
  const totalBonusPct = Math.max(0, (stageBonusPercent || 0) + (investmentBonusPercent || 0));
  const bonusTokens = Math.floor((baseTokens * totalBonusPct) / 100);
  return {
    totalTokens: baseTokens + bonusTokens,
    baseTokens,
    stageBonusTokens: Math.floor((baseTokens * (stageBonusPercent || 0)) / 100),
    investmentBonusTokens: Math.floor((baseTokens * (investmentBonusPercent || 0)) / 100),
  };
};

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

// ---------- component ----------
export default function PurchasePanel() {
  const { t, i18n } = useTranslation(['buy-tokens-page', 'common']);
  const locale = useMemo(
    () => (t('common:locale_code', { defaultValue: i18n.language || 'en-US' }) as string),
    [t, i18n.language]
  );
  const usd0 = useMemo(() => makeUsd0(locale), [locale]);
  const numFmt2 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const numFmt4 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  const { liveCryptoPrices, setShowConfetti, refreshData } = usePresale();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) localStorage.setItem('referrer', ref);

    // Check for success from Stripe redirect
    const success = searchParams?.get('success');
    if (success === 'true') {
      setShowConfetti(true);
      toast.success(t('common:toast.payment_successful', { defaultValue: 'Payment successful!' }));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, setShowConfetti, t]);

  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>('SOL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessLabel, setShowSuccessLabel] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'waiting_for_confirmation' | 'tokens_sent' | 'completed'>('idle');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [destinationInfo, setDestinationInfo] = useState<{ address: string; amount: number; crypto: Crypto } | null>(null);

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  // Hardcoded 'Audit Fund' stage data as per user request (Reset state)
  const currentStage = useMemo(() => ({
    name: 'Audit Fund', // Stage Name
    price: 0.00004,     // $1 = 25,000 PRG
    sold: 875000,       // 875k PRG Sold (approx $35)
    soldUSD: 35,        // Value in USD
    hardCapUSD: 15000,  // Goal
    endsAtIso: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 7 days left
  }), []);

  const isDataReady =
    !!currentStage &&
    liveCryptoPrices != null &&
    typeof liveCryptoPrices.SOL === 'number' &&
    typeof liveCryptoPrices.USDC === 'number';

  const getInvestmentBonusPercent = (amount: number): number => {
    // Simplified Investment Bonus: 5% flat for any purchase >= $100
    // As per user request: "Investment bonus (+5%)"
    if (amount >= 100) return 5;
    return 0;
  };

  const purchaseSummaryData = useMemo(() => {
    if (!liveCryptoPrices?.SOL || !liveCryptoPrices?.USDC || !currentStage) return undefined;

    // cast to any to access potentially various shape of stage object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = currentStage as any;

    // Per user request: "stage bonus chyba przy audit nie ma sensu" -> force 0 if needed, 
    // but let's default to whatever DB says, or override if specifically requested.
    // User said: "Stage bonus (+25%) dostosuj invest bonus stage bonus chyba przy audit nie ma sensu"
    // Interpretation: User wants to adjust Investment Bonus to ~5% (done above)
    // And implies Stage Bonus might not make sense for "Audit Fund", possibly meaning set to 0 or leave it be.
    // However, the text "Stage bonus (+25%)" suggests they might want THAT to be the value, or are quoting existing.
    // Let's stick to DB value for stage bonus, but Investment is flattened to 5%.

    // Forced to 0 for Audit phase as per user request
    const stageBonusPercent = 0;

    // Determine price per token to calculate rate
    const price = Number(s.price ?? s.current_price ?? 0);
    const baseRate = (price > 0) ? (1 / price) : DEFAULT_BASE_RATE_PER_USD;

    const investmentBonusPercent = getInvestmentBonusPercent(amountUSD);
    return {
      ...calculateTotalTokens(amountUSD, stageBonusPercent, investmentBonusPercent, baseRate),
      stageBonusPercent,
      investmentBonusPercent,
    };
  }, [amountUSD, liveCryptoPrices, currentStage]);

  const stageProgress = useMemo(() => {
    // If we have valid stage data, use it. Otherwise default to Audit Fund goal ($15,000)
    const s = currentStage as unknown as StageLike;
    const sold = Number(s?.soldUSD ?? s?.raisedUSD ?? s?.sold ?? 0);
    const cap = Number(s?.hardCapUSD ?? s?.capUSD ?? s?.hardCap ?? 15000); // Default to 15k for Audit

    return {
      sold,
      cap,
      pct: Math.min(100, Math.round((sold / cap) * 100))
    };
  }, [currentStage]);

  const stageEndsAt = useMemo(() => {
    const iso = (currentStage as unknown as StageLike)?.endsAtIso;
    const parsed = iso ? Date.parse(iso) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : Date.now() + 72 * 3600 * 1000;
  }, [currentStage]);

  const slotsLeft = useMemo(() => {
    const s = currentStage as unknown as StageLike;
    const val = Number(s?.slotsLeft ?? s?.remainingSlots ?? NaN);
    return Number.isFinite(val) ? val : null;
  }, [currentStage]);

  const maxFromBalanceUSD = useMemo(() => {
    if (!liveCryptoPrices) return null;
    if (selectedCrypto === 'SOL' && solBalance != null) {
      const reserveSOL = 0.003;
      return Math.max(0, solBalance - reserveSOL) * (liveCryptoPrices.SOL ?? 0);
    }
    if (selectedCrypto === 'USDC' && usdcBalance != null) {
      return usdcBalance * (liveCryptoPrices.USDC ?? 1);
    }
    return null;
  }, [selectedCrypto, solBalance, usdcBalance, liveCryptoPrices]);

  useEffect(() => {
    const s = localStorage.getItem('buy:amount');
    const c = localStorage.getItem('buy:crypto') as Crypto | null;
    if (s) setAmountUSD(Number(s));
    if (c === 'SOL' || c === 'USDC' || c === 'CARD') setSelectedCrypto(c);
  }, []);
  useEffect(() => { localStorage.setItem('buy:amount', String(amountUSD)); }, [amountUSD]);
  useEffect(() => { localStorage.setItem('buy:crypto', selectedCrypto); }, [selectedCrypto]);

  useEffect(() => {
    if (!publicKey) { setSolBalance(null); setUsdcBalance(null); return; }
    (async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        setSolBalance(lamports / 1e9);
      } catch { }
      try {
        const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const info = await connection.getTokenAccountBalance(ata).catch(() => null);
        setUsdcBalance(info?.value?.uiAmount ?? 0);
      } catch { setUsdcBalance(0); }
    })();
  }, [publicKey, connection]);

  const handleBuy = useCallback(async () => {
    const MIN = 1, MAX = 5000;
    const amountClamped = clamp(Math.floor(amountUSD), MIN, MAX);

    const isCard = selectedCrypto === 'CARD';
    let targetWallet = publicKey?.toBase58();

    if (isCard && !targetWallet) {
      // Validate manual address
      try {
        new PublicKey(manualAddress);
        targetWallet = manualAddress;
      } catch {
        toast.error(t('common:errors.invalid_address', { defaultValue: 'Please enter a valid Solana wallet address' }));
        return;
      }
    }

    if (!targetWallet) {
      toast.error(t('common:errors.wallet_missing', { defaultValue: 'Connect your wallet to continue.' }));
      return;
    }

    setIsProcessing(true);
    const referrer = (typeof window !== 'undefined' && localStorage.getItem('referrer')) || undefined;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase_start', {
        value: amountClamped,
        currency: isCard ? 'USD' : selectedCrypto,
        ...(purchaseSummaryData ? { tokens: purchaseSummaryData.totalTokens } : {}),
        referrer,
      });
    }

    // --- STRIPE FLOW ---
    if (isCard && targetWallet) {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountUSD: amountClamped,
            walletAddress: targetWallet,
            productType: 'token',
            referrer
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Checkout initialization failed');

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : 'Payment initialization failed';
        toast.error(msg);
        setIsProcessing(false);
      }
      return; // Important: do not execute crypto flow
    }

    // --- CRYPTO FLOW ---
    const flow = async () => {
      if (!publicKey) throw new Error('No wallet connected');

      const initResponse = await fetch('/api/initiate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAddress: publicKey.toBase58(),
          prgDeliveryAddress: publicKey.toBase58(),
          amountUSD: amountClamped,
          paymentCryptoCurrency: selectedCrypto,
          referrer,
        }),
      });
      if (!initResponse.ok) {
        const e = await initResponse.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to initiate purchase.');
      }
      const { transactionId, recipientAddress, usdPerCrypto } = await initResponse.json();
      setTransactionId(transactionId);

      const cryptoAmount = Number(amountClamped) / Number(usdPerCrypto);
      if (!Number.isFinite(cryptoAmount) || cryptoAmount <= 0) {
        throw new Error('Invalid crypto amount.');
      }
      setDestinationInfo({ address: recipientAddress, amount: cryptoAmount, crypto: selectedCrypto });
      setPurchaseStatus('waiting_for_confirmation');

      let transaction: Transaction;
      let blockhash: string, lastValidBlockHeight: number;
      const finalAmount = selectedCrypto === 'SOL'
        ? toUnits(cryptoAmount, 9)
        : toUnits(cryptoAmount, 6);

      try {
        ({ blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash());
        transaction = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey });

        if (selectedCrypto === 'SOL') {
          const have = BigInt(Math.floor((solBalance ?? 0) * 1e9));
          const reserveLamports = BigInt(500000);
          if (have < finalAmount + reserveLamports) {
            throw new Error('Not enough SOL to cover amount plus network fee.');
          }
          transaction.add(SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: Number(finalAmount),
          }));
        } else {
          const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
          const recip = new PublicKey(recipientAddress);
          const fromAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);

          const bal = await connection.getTokenAccountBalance(fromAta).catch(() => null);
          const have = bal?.value?.amount ? BigInt(bal.value.amount) : 0n;
          if (have < finalAmount) throw new Error('Insufficient USDC balance.');

          const toAta = await getAssociatedTokenAddress(USDC_MINT, recip);
          const toInfo = await connection.getAccountInfo(toAta);
          if (toInfo === null) {
            transaction.add(createAssociatedTokenAccountInstruction(publicKey, toAta, recip, USDC_MINT));
          }
          transaction.add(createTransferInstruction(fromAta, toAta, publicKey, Number(finalAmount)));
        }
      } catch (e) {
        console.error('Transaction build error', e);
        throw new Error('Could not prepare the transaction. Ensure you have SOL for fees.');
      }

      let signature: string;
      try {
        signature = await sendTransaction(transaction, connection);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(msg || 'Transaction was rejected in the wallet.');
      }
      setPurchaseStatus('tokens_sent');

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
        .catch(() => { });
      try {
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized');
      } catch { }

      await fetch('/api/update-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, signature }),
      }).catch(() => console.error('Signature not saved, but payment was sent.'));

      setShowConfetti(true);
      await refreshData();
      setAmountUSD(100);
      setShowSuccessLabel(true);
      setTimeout(() => setShowSuccessLabel(false), 5000);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase_success', {
          value: amountClamped,
          currency: selectedCrypto,
          tx: signature,
          referrer,
        });
      }

      toast.success(
        <div>
          {t('buy_section.purchase_complete', { defaultValue: 'Purchase complete!' })}
          <br />
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            {t('buy_section.view_on_solscan', { defaultValue: 'View on Solscan' })}
          </a>
        </div>
      );
    };

    try {
      await toast.promise(flow(), {
        pending: t('common:toast.processing_purchase', { defaultValue: 'Processing your purchase…' }),
        success: t('common:toast.payment_successful', { defaultValue: 'Payment successful!' }),
        error: {
          render: ({ data }: { data?: { message?: string } }) =>
            `${t('common:toast.payment_send_failed', { defaultValue: 'Payment failed' })}: ${data?.message || 'Unknown error'}`,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    amountUSD, publicKey, connection, sendTransaction,
    selectedCrypto, purchaseSummaryData, t, refreshData,
    setShowConfetti, solBalance
  ]);

  useEffect(() => {
    if (purchaseStatus !== 'tokens_sent' || !transactionId) return;
    let tries = 0;
    const iv = setInterval(async () => {
      tries++;
      try {
        const r = await fetch(`/api/check-purchase-status?transactionId=${transactionId}`);
        if (r.ok) {
          const d = await r.json();
          if (d.status === 'confirmed') {
            setPurchaseStatus('completed');
            clearInterval(iv);
          }
        }
      } catch { }
      if (tries >= 12) clearInterval(iv);
    }, 5000);
    return () => clearInterval(iv);
  }, [purchaseStatus, transactionId]);

  // Helpers for stages removed as per request (Audit phase - no schedule)

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const canBuy = !!publicKey && !isProcessing;

  return (
    <div className="space-y-8" suppressHydrationWarning>
      <StageBar
        t={t}
        usd0={usd0}
        stageProgress={stageProgress}
        stageEndsAt={stageEndsAt}
        slotsLeft={slotsLeft}
        source="supabase"
        milestonesAbsUSD={[5000, 10000, 15000]}
        milestoneReferenceCapUSD={15000}
      />


      <InvestmentBonuses t={t} usd0={usd0} />

      {/* Main Purchase Card */}
      <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-gold-500/20 rounded-3xl shadow-[0_0_50px_-20px_rgba(250,204,21,0.2)] p-6 sm:p-8 space-y-8 relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {!isDataReady && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50 animate-shimmer" />
        )}

        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            {t('buy_section.title', { defaultValue: 'Buy PRG Tokens' })}
          </h3>
          <p className="text-white/40 text-sm">Select payment method and amount</p>
        </div>

        {/* Input Area */}
        <div className="space-y-6">
          <AmountInput
            amountUSD={amountUSD}
            setAmountUSD={setAmountUSD}
            selectedCrypto={selectedCrypto === 'CARD' ? 'USDC' : selectedCrypto}
            liveCryptoPrices={liveCryptoPrices}
            disabled={isProcessing}
          />

          {/* Custom Crypto + Card Selector */}
          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">{t('buy_section.crypto_selector_label', { defaultValue: 'Pay with' })}</label>
            <div className="grid grid-cols-3 gap-3">
              {(['SOL', 'USDC', 'CARD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCrypto(c)}
                  className={`relative flex flex-col items-center justify-center gap-1 py-3 rounded-xl border bg-[#0f0f16] transition-all group ${selectedCrypto === c
                    ? 'border-gold-500 text-white shadow-[0_0_20px_rgba(250,204,21,0.15)] ring-1 ring-gold-500/50'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                  {c === 'SOL' && <Image src="https://cryptologos.cc/logos/solana-sol-logo.png" width={24} height={24} className="w-6 h-6 group-hover:scale-110 transition-transform" alt="SOL" unoptimized />}
                  {c === 'USDC' && <Image src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" width={24} height={24} className="w-6 h-6 group-hover:scale-110 transition-transform" alt="USDC" unoptimized />}
                  {c === 'CARD' && <FaCreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                  <span className="text-[10px] font-bold">{c === 'CARD' ? 'CARD' : c}</span>
                  {selectedCrypto === c && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {publicKey && (
            <div className="flex justify-between items-center text-xs px-2 py-1.5 mt-4 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/50">Payment Wallet</span>
              <span className="font-mono text-white/80">
                {selectedCrypto === 'SOL' && solBalance != null && `${numFmt4.format(solBalance)} SOL`}
                {selectedCrypto === 'USDC' && usdcBalance != null && `${numFmt2.format(usdcBalance)} USDC`}
                {selectedCrypto === 'CARD' && 'Stripe / Card'}
              </span>
            </div>
          )}

          {!publicKey && selectedCrypto === 'CARD' && (
            <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/5 animation-fade-in">
              <label className="block text-xs text-white/60 mb-1">
                {t('buy_section.manual_wallet_label', { defaultValue: 'Enter your Solana wallet address for token delivery:' })}
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Paste Solana address (e.g. 7Xw...)"
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none placeholder:text-gray-600 font-mono"
              />
            </div>
          )}
        </div>

        {purchaseSummaryData ? (
          <div className="border-t border-white/10 pt-4">
            <PurchaseSummary data={purchaseSummaryData} />
            <div className="flex flex-wrap gap-2 text-xs mt-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                🎯 {t('buy_section.investment_bonus', { defaultValue: 'Investment bonus:' })} {purchaseSummaryData.investmentBonusPercent}%
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <PresaleStatusSkeleton />
          </div>
        )}

        {destinationInfo && selectedCrypto !== 'CARD' && (
          <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animation-fade-in">
            <div className="text-center">
              <h5 className="text-amber-400 font-bold mb-1">{t('buy_section.manual_payment_title', { defaultValue: 'Complete Payment' })}</h5>
              <p className="text-amber-200/60 text-xs max-w-xs mx-auto mb-4">{t('buy_section.manual_payment_desc', { defaultValue: 'Send exact amount to address below' })}</p>
            </div>

            <ManualPaymentSection
              cryptoType={destinationInfo.crypto as 'SOL' | 'USDC'}
              paymentAddress={destinationInfo.address}
              usdAmount={amountUSD}
              tokensToCredit={purchaseSummaryData?.totalTokens || 0}
            />
          </div>
        )}

        <div className="space-y-4 pt-4">
          <button
            onClick={publicKey || (selectedCrypto === 'CARD' && manualAddress) ? handleBuy : () => document.querySelector<HTMLButtonElement>('.wallet-adapter-button')?.click()}
            disabled={(publicKey || (selectedCrypto === 'CARD' && manualAddress)) ? (isProcessing || !isDataReady) : false}
            className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-gold-500/20
              ${publicKey
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-black hover:scale-[1.02] hover:brightness-110'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                {selectedCrypto === 'CARD' ? 'Redirecting...' : t('buy_section.processing', { defaultValue: 'Processing...' })}
              </span>
            ) : (!publicKey && !(selectedCrypto === 'CARD' && manualAddress)) ? (
              selectedCrypto === 'CARD' ? t('buy_section.buy_with_card', { defaultValue: 'Buy with Card' }) : "Select Wallet"
            ) : (
              <span className="flex items-center justify-center gap-2">
                {showSuccessLabel && '🎉'}
                {t('buy_section.buy_now_btn', {
                  defaultValue: 'Buy {{amount}} PRG',
                  amount: purchaseSummaryData?.totalTokens
                    ? new Intl.NumberFormat(locale, { notation: 'compact' }).format(purchaseSummaryData.totalTokens)
                    : '…',
                })}
              </span>
            )}
          </button>

          <p className="text-center text-[10px] text-white/30 leading-tight">
            By clicking "Buy Now" or connecting your wallet, you agree to our <Link href="/terms" className="text-white/50 hover:underline">Terms of Sale</Link>.
            Cryptocurrency investments carry high risk.
          </p>
        </div>
      </div>
    </div>
  );
}