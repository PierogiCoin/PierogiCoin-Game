// Plik: src/components/PresaleProgress.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePresale } from '@/context/PresaleContext';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import clsx from 'clsx';

type Props = {
  goal?: number;                 // domyślnie z ENV lub 40_000
  showPercentLabel?: boolean;
  className?: string;
  currency?: string;             // 'USD' domyślnie
  maxFractionDigits?: number;    // 0 by default for compact look
};

function mapLanguageToLocale(lang: string | undefined): string {
  // Spróbuj dopasować pełny locale – proste mapowanie dla najczęstszych
  if (!lang) return 'en-US';
  const l = lang.toLowerCase();
  if (l.startsWith('pl')) return 'pl-PL';
  if (l.startsWith('en')) return 'en-US';
  return l.includes('-') ? l : `${l}-${l.toUpperCase()}`;
}

export default function PresaleProgress({
  goal,
  showPercentLabel = true,
  className,
  currency = 'USD',
  maxFractionDigits = 0,
}: Props) {
  const { t, i18n } = useTranslation(['buy-tokens-page', 'common']);
  const reduce = useReducedMotion();
  const presale = usePresale() || {};
  const usdRaised = Number.isFinite(presale.usdRaised) ? Number(presale.usdRaised) : 0;
  const progressPercent = Number.isFinite(presale.progressPercent) ? Number(presale.progressPercent) : NaN;

  // SSR safety for CountUp / Intl
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const resolvedGoal =
    typeof goal === 'number'
      ? goal
      : Number(process.env.NEXT_PUBLIC_PRESALE_TARGET_USD) || 40_000;

  // Procent – jeśli kontekst nie podaje gotowego progressPercent, licz z danych
  const pctRaw = Number.isFinite(progressPercent)
    ? progressPercent
    : (usdRaised / Math.max(1, resolvedGoal)) * 100;

  const clampedPct = Math.max(0, Math.min(100, Math.round(pctRaw)));

  // Locale + formatter walutowy (bezpieczny dla braku klucza tłumaczenia)
  const locale = useMemo(() => {
    const fromI18n = i18n?.resolvedLanguage || i18n?.language;
    const fromT = t('common:locale_code', { defaultValue: '' });
    return mapLanguageToLocale(fromT || fromI18n || 'en-US');
  }, [i18n?.resolvedLanguage, i18n?.language, t]);

  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: maxFractionDigits,
      }),
    [locale, currency, maxFractionDigits]
  );

  const thousandsSep = useMemo(() => {
    // Wyciągamy separator tysięcy z przykładowej liczby 1_111
    const sample = new Intl.NumberFormat(locale).format(1111);
    const sep = sample.replace(/1/g, '').charAt(0);
    return sep || ',';
  }, [locale]);

  const raisedLabel = currencyFmt.format(Math.max(0, usdRaised));
  const goalLabel = currencyFmt.format(Math.max(0, resolvedGoal));

  return (
    <motion.div
      className={clsx('w-full', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.2 : 0.5 }}
    >
      <div className="mb-2 flex items-baseline justify-between text-sm font-medium">
        <span className="text-gray-400">
          {t('progress.raised', 'Raised')}:{' '}
          <span className="font-bold text-white tabular-nums">
            {isClient ? (
              <CountUp
                end={Math.max(0, usdRaised)}
                duration={reduce ? 0.2 : 1.2}
                separator={thousandsSep}
                decimals={0}
                formattingFn={(val) => currencyFmt.format(val)}
              />
            ) : (
              raisedLabel
            )}
          </span>
        </span>
        <span className="text-gray-400">
          {t('progress.goal', 'Goal')}:{' '}
          <span className="font-bold text-white tabular-nums">{goalLabel}</span>
        </span>
      </div>

      {showPercentLabel && (
        <div className="mb-1 flex justify-end text-[11px] text-gray-400 tabular-nums" aria-live="polite">
          {clampedPct}%
        </div>
      )}

      <div
        className="relative h-3.5 w-full overflow-hidden rounded-full border border-gray-600/50 bg-gray-700/50"
        role="progressbar"
        aria-label={t('progress.aria_label', 'Presale progress')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedPct}
        aria-valuetext={`${clampedPct}%`}
      >
        {/* Pasek wypełnienia */}
        <motion.div
          className={clsx(
            'h-full rounded-full',
            'bg-gradient-to-r from-gold-400 to-amber-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ duration: reduce ? 0.25 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Subtelne „pasy” tylko gdy user nie ogranicza animacji */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
            style={{
              backgroundImage:
                'linear-gradient(45deg, rgba(255,255,255,0.16) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.16) 75%, transparent 75%, transparent)',
              backgroundSize: '40px 40px',
            }}
            initial={{ x: 0 }}
            animate={{ x: 40 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 2.4 }}
          />
        )}
      </div>
    </motion.div>
  );
}
