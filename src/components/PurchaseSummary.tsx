import React from 'react';
import { motion } from 'framer-motion';

// Use motion.div component props to avoid conflicts with React HTMLAttributes event types
type SummaryRowProps = Omit<React.ComponentProps<typeof motion.div>, 'children'> & {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: string;
  highlight?: 'bonus' | 'total';
};

const SummaryRow = React.forwardRef<HTMLDivElement, SummaryRowProps>(function SummaryRow(
  { label, value, hint, highlight, className = '', ...rest },
  ref
) {
  const labelBase =
    highlight === 'total'
      ? 'font-semibold text-base sm:text-lg'
      : 'text-xs sm:text-sm text-gray-300';
  const valueBase =
    highlight === 'total'
      ? 'font-extrabold text-base sm:text-lg tracking-tight'
      : 'font-mono text-xs sm:text-sm';
  const color =
    highlight === 'bonus'
      ? 'text-amber-300'
      : highlight === 'total'
        ? 'text-white'
        : 'text-gray-200';

  return (
    <motion.div
      ref={ref}
      className={`flex justify-between items-center ${className}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      aria-label={typeof label === 'string' ? label : undefined}
      title={hint}
      {...rest}
    >
      <span className={`${labelBase} ${highlight === 'total' ? '' : 'text-gray-300'}`}>
        {label}
      </span>
      <span className={`${valueBase} ${color}`}>{value}</span>
    </motion.div>
  );
});

// ----- PurchaseSummary (exports default) -----
export type PurchaseSummaryData = {
  totalTokens: number;
  baseTokens: number;
  stageBonusTokens: number;
  investmentBonusTokens: number;
  stageBonusPercent: number;
  investmentBonusPercent: number;
};

export default function PurchaseSummary({
  data,
  t,
  className = '',
}: {
  data: PurchaseSummaryData;
  t?: (k: string, opts?: Record<string, unknown>) => string;
  className?: string;
}) {
  // Safe translator fallback (works even if parent didn't pass t)
  const tt: (key: string, opts?: Record<string, unknown>) => string =
    typeof t === 'function'
      ? t
      : (key: string, opts?: Record<string, unknown>) => (opts && 'defaultValue' in (opts || {})) ? (opts.defaultValue as string) : key;

  // Try multiple key variants / namespaces
  const tr = (candidates: string[], opts?: Record<string, unknown> & { defaultValue?: string }) => {
    for (const k of candidates) {
      const v = tt(k, { ...(opts || {}), defaultValue: '__MISSING__' });
      if (v && v !== '__MISSING__' && v !== k) return v;
    }
    return (opts && 'defaultValue' in (opts || {})) ? opts!.defaultValue! : candidates[0];
  };

  // Simple mustache-style interpolation for labels
  const interpolate = (text: string, vars: Record<string, unknown>) =>
    text.replace(/{{\s*(.*?)\s*}}/g, (_, k) => String(vars[k.trim()] ?? ''));

  // Localized number formatting (fallback to browser/html lang if available)
  const getLocale = (): string => {
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang || '';
      if (htmlLang) return htmlLang;
    }
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
    return 'en-US';
  };
  const numberFmt = new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 0 });
  const fmt = (n: number) => numberFmt.format(n);

  const rows: Array<{ label: React.ReactNode; value: React.ReactNode; hint?: string; highlight?: 'bonus' | 'total' }>
    = [
      {
        label: tr([
          'buy-tokens-page:buy_section.summary.base_tokens',
          'buy_section.summary.base_tokens',
          'summary.base_tokens',
          'base_tokens',
        ], { defaultValue: 'Base PRG' }),
        value: fmt(data.baseTokens),
        hint: tr([
          'buy-tokens-page:buy_section.summary.base_tokens_hint',
          'buy_section.summary.base_tokens_hint',
          'summary.base_tokens_hint',
          'base_tokens_hint',
        ], { defaultValue: 'Tokens without bonuses' }),
      },
      {
        label: interpolate(
          tr([
            'buy-tokens-page:buy_section.summary.investment_bonus',
            'buy_section.summary.investment_bonus',
            'summary.investment_bonus',
            'investment_bonus',
          ], { defaultValue: 'Investment bonus (+{{percent}}%)' }),
          { percent: data.investmentBonusPercent }
        ),
        value: fmt(data.investmentBonusTokens),
        highlight: 'bonus',
      },
      {
        label: interpolate(
          tr([
            'buy-tokens-page:buy_section.summary.stage_bonus',
            'buy_section.summary.stage_bonus',
            'summary.stage_bonus',
            'stage_bonus',
          ], { defaultValue: 'Stage bonus (+{{percent}}%)' }),
          { percent: data.stageBonusPercent }
        ),
        value: fmt(data.stageBonusTokens),
        highlight: 'bonus',
      },
      {
        label: tr([
          'buy-tokens-page:buy_section.summary.total_tokens',
          'buy_section.summary.total_tokens',
          'summary.total_tokens',
          'total_tokens',
        ], { defaultValue: 'Total PRG to receive' }),
        value: fmt(data.totalTokens),
        highlight: 'total',
      },
    ];

  return (
    <div className={`space-y-2 ${className}`}>
      {rows.map((r, i) => (
        <SummaryRow key={i} label={r.label} value={r.value} hint={r.hint} highlight={r.highlight} />
      ))}
    </div>
  );
}
