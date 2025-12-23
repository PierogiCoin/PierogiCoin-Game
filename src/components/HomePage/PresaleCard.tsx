'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';
import {
  FiDollarSign,
  FiArrowUpCircle,
  FiGift,
  FiClipboard,
  FiCheck,
  FiExternalLink,
} from 'react-icons/fi';
import { usePresale } from '@/context/PresaleContext';
import PresaleTimer from '@/components/PresaleTimer';
import PresaleProgress from '@/components/PresaleProgress';

// ——— Small skeleton used while loading ———
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} aria-hidden />
);

// ——— Metric card ———
interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  glow?: string;
  reduceMotion?: boolean;
}

const MetricBox: React.FC<MetricBoxProps> = ({ icon, label, value, glow, reduceMotion }) => (
  <motion.div
    className={`p-4 rounded-lg text-center flex-1 border border-gray-600/50 ${glow || 'bg-gray-700/50'}`}
    whileHover={reduceMotion ? undefined : { scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
  >
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 uppercase">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-xl font-bold text-white mt-1 tabular-nums">{value}</div>
  </motion.div>
);

// ——— Copyable contract address ———
const CopyAddress: React.FC<{ address?: string }> = ({ address }) => {
  const { t } = useTranslation(['buy-tokens-page', 'common']);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  }, [address]);

  if (!address) return null;

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a12]/60 p-3">
      <div className="font-mono text-sm text-white/90 truncate" title={address} aria-label={t('buy-tokens-page:contract_address_label', 'Token contract address')}>
        {short}
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/15 transition"
          aria-live="polite"
        >
          {copied ? <FiCheck aria-hidden /> : <FiClipboard aria-hidden />}
          {copied ? t('common:copied', 'Copied') : t('common:copy', 'Copy')}
        </button>
        <a
          href={process.env.NEXT_PUBLIC_TOKEN_EXPLORER_URL || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/15 transition"
        >
          <FiExternalLink aria-hidden />
          {t('buy-tokens-page:view_on_explorer', 'View on explorer')}
        </a>
      </div>
    </div>
  );
};

export const PresaleStatusCard: React.FC = () => {
  const { t, i18n } = useTranslation(['buy-tokens-page', 'common']);
  const { isBackgroundFetching, currentStage, nextPriceDisplayInfo } = usePresale();

  // Number formatter is memoized and locale-aware
  const priceFormatter = useMemo(() => {
    const locale = t('common:locale_code', { defaultValue: i18n.language || 'en-US' }) as string;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 5,
        maximumFractionDigits: 6,
      });
    } catch {
      // Fallback in the very unlikely case of a bad locale
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 5,
        maximumFractionDigits: 6,
      });
    }
  }, [t, i18n.language]);

  // Show a subtle skeleton while stage is loading (instead of returning null)
  if (!currentStage) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#0d0d14]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-gold-500/20">
        <div className="flex items-center justify-center mb-6 gap-2.5">
          <FaRocket className="text-gold-400" />
          <Skeleton className="h-7 w-56" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-3.5 w-full mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  const currentPrice = Number(currentStage?.current_price ?? 0);
  const nextPrice = nextPriceDisplayInfo || t('common:not_available_short');
  const bonusPct = Number.isFinite(currentStage?.bonus_pct)
    ? `${currentStage!.bonus_pct}%`
    : '0%';

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-[#0d0d14]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-gold-500/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-live="polite"
    >
      <h3 className="text-2xl sm:text-3xl font-bold text-gold-400 mb-6 flex items-center justify-center gap-2.5">
        <FaRocket className="animate-pulse" aria-hidden />
        {t('buy-tokens-page:presale_status_title')}
        {isBackgroundFetching && (
          <span className="ml-2 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping" aria-label={t('common:loading', 'Loading')} />
        )}
      </h3>

      {/* Timer */}
      <div className="mb-6">
        <PresaleTimer />
      </div>

      {/* Progress */}
      <div className="mb-8">
        <PresaleProgress />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricBox
          icon={<FiDollarSign aria-hidden />}
          label={t('buy-tokens-page:metric.current_price_label')}
          value={priceFormatter.format(currentPrice)}
          glow="bg-green-500/10"
          reduceMotion={false}
        />
        <MetricBox
          icon={<FiArrowUpCircle aria-hidden />}
          label={t('buy-tokens-page:metric.next_stage_price_label')}
          value={nextPrice}
          glow="bg-blue-500/10"
          reduceMotion={false}
        />
        <MetricBox
          icon={<FiGift aria-hidden />}
          label={t('buy-tokens-page:metric.stage_bonus_label')}
          value={bonusPct}
          glow="bg-gold-500/10"
          reduceMotion={false}
        />
      </div>

      {/* Contract address + Explorer */}
      <CopyAddress address={tokenAddress} />

      {/* CTAs */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <a
          href="/#buy"
          className="inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 font-semibold bg-gradient-to-r from-gold-400 to-amber-500 text-gray-900 hover:brightness-110 transition"
        >
          {t('buy-tokens-page:cta.buy_now', 'Buy now')}
        </a>
        <a
          href="/whitepaper.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition"
        >
          {t('common:whitepaper', 'Whitepaper')}
          <FiExternalLink aria-hidden />
        </a>
      </div>
    </motion.div>
  );
};
