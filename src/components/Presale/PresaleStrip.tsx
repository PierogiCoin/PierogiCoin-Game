'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ===== Types =====
export type Stage = {
  name: string;
  price: number;        // price of 1 PRG in USD
  bonusPercent: number; // stage bonus in %
  endDate: string;      // ISO date string
};

type ApiOk = { usdRaised: number; currentStage: Stage | null };
type ApiErr = { error: string };
export type ApiResp = ApiOk | ApiErr;

// Target cap for progress (USD)
const TARGET_USD = Number(process.env.NEXT_PUBLIC_PRESALE_TARGET_USD || 250_000);

// ===== Helpers =====
function useCountdown(endIso?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endIso]);
  if (!endIso) return null;
  const end = new Date(endIso).getTime();
  const diff = Math.max(0, end - now);
  const secondsTotal = Math.floor(diff / 1000);
  const d = Math.floor(secondsTotal / 86400);
  const h = Math.floor((secondsTotal % 86400) / 3600);
  const m = Math.floor((secondsTotal % 3600) / 60);
  const s = secondsTotal % 60;
  return { d, h, m, s, done: diff <= 0 };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

// Tiny skeleton block
const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className ?? ''}`} />
);

export default function PresaleStrip() {
  const { t, i18n } = useTranslation('presale');
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reduce = useReducedMotion();

  // Locale-aware USD formatter
  const usdFmt = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language || 'en', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [i18n.language]
  );

  const usdFmt4 = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language || 'en', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }),
    [i18n.language]
  );

  const fetchState = useCallback(async (signal?: AbortSignal) => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/presale-state', { cache: 'no-store', signal });
      if (!res.ok) throw new Error(`${res.status}`);
      const j = (await res.json()) as ApiResp;
      setData(j);
    } catch {
      setData({ error: 'Network error' });
      setErrorMsg(t('errors.network', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchState(ctrl.signal);
    const id = setInterval(() => fetchState(ctrl.signal), 30_000); // refresh every 30s
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [fetchState]);

  const usdRaised = data && 'usdRaised' in data ? data.usdRaised : 0;
  const stage: Stage | null = data && 'currentStage' in data ? data.currentStage : null;

  const progress = useMemo(() => {
    if (!TARGET_USD) return 0;
    return Math.min(100, Math.round((usdRaised / TARGET_USD) * 100));
  }, [usdRaised]);

  const cd = useCountdown(stage?.endDate);

  return (
    <div className="relative z-10">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4 }}
          className="rounded-xl border border-gold-500/20 bg-gold-500/10 backdrop-blur-md px-4 py-3"
          aria-live="polite"
        >
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col">
              <div className="text-sm text-gold-300/90">
                {stage ? t('strip.title_with_stage', { defaultValue: 'Presale — {{name}}', name: stage.name }) : t('strip.title', 'Presale')}
              </div>
              <div className="mt-0.5 text-xs text-gray-300">
                {t('strip.price', 'Price')}:&nbsp;
                <span className="text-gold-300">{stage ? usdFmt4.format(stage.price) : '--'}</span>
                {stage ? (
                  <>
                    {' '}
                    • {t('strip.bonus', 'Bonus')}: {stage.bonusPercent}%
                  </>
                ) : null}
              </div>
            </div>

            {/* Countdown */}
            <div className="text-sm font-medium text-gray-200">
              {cd ? (
                cd.done ? (
                  <span className="text-gold-300">{t('strip.stage_ended', 'Stage ended')}</span>
                ) : (
                  <>
                    {t('strip.ends_in', 'Ends in')}:&nbsp;
                    <span className="tabular-nums text-gold-300" aria-label={t('strip.ends_in_aria', 'Time remaining for current stage')}>
                      {cd.d}d {pad2(cd.h)}:{pad2(cd.m)}:{pad2(cd.s)}
                    </span>
                  </>
                )
              ) : (
                <span className="text-gold-300/80">—</span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{t('strip.raised', 'Raised')}</span>
              <span className="tabular-nums">
                {usdFmt.format(usdRaised)} / {usdFmt.format(TARGET_USD)}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#0d0d14]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={t('strip.progress_aria', 'Presale progress')}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500"
              />
            </div>
            <div className="mt-1 text-right text-[11px] text-gray-400">{progress}%</div>
          </div>

          {/* CTA */}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="#how-to-buy"
              className="inline-flex items-center rounded-lg border border-gold-400/40 bg-gold-400/10 px-3 py-1.5 text-sm font-semibold text-gold-200 hover:bg-gold-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60"
            >
              {t('strip.cta_buy', 'Buy PRG')}
            </a>
            <a
              href="#tokenomics"
              className="inline-flex items-center rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-[#0d0d14]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300/40"
            >
              {t('strip.cta_tokenomics', 'Tokenomics')}
            </a>
          </div>

          {/* States */}
          {loading && (
            <div className="mt-3" aria-hidden>
              <div className="flex items-center gap-2">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-3 w-16" />
              </div>
              <div className="mt-2"><SkeletonLine className="h-2 w-full" /></div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-2 text-xs text-red-400 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchState(); }}
                className="rounded border border-red-400/30 px-2 py-1 text-[11px] text-red-200 hover:bg-red-400/10"
              >
                {t('strip.retry', 'Retry')}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
