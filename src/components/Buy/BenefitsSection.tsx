'use client';

import React from 'react';
import { FiTrendingUp, FiGift, FiLink, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

type TFn = (key: string, options?: Record<string, unknown>) => string | undefined;

type ItemKey = 'growth' | 'community' | 'bonuses' | 'ux';

type Item = {
  icon: React.ReactNode;
  key: ItemKey;
  defaultTitle: string;
  defaultDesc: string;
};

const defaultItems: Item[] = [
  {
    icon: <FiTrendingUp className="w-5 h-5" />,
    key: 'growth',
    defaultTitle: 'Growth Potential',
    defaultDesc: 'Limited presale and transparent tokenomics.',
  },
  {
    icon: <FiUsers className="w-5 h-5" />,
    key: 'community',
    defaultTitle: 'Community',
    defaultDesc: 'Growing community and real use-cases for the token.',
  },
  {
    icon: <FiGift className="w-5 h-5" />,
    key: 'bonuses',
    defaultTitle: 'Bonuses',
    defaultDesc: 'Additional tokens for stage and investment size.',
  },
  {
    icon: <FiLink className="w-5 h-5" />,
    key: 'ux',
    defaultTitle: 'UX',
    defaultDesc: 'Solana Pay, fast amounts, MAX from balance.',
  },
];

type Props = {
  /** Optional translator function for backwards-compatibility. If not passed, the component will use i18next. */
  t?: TFn;
};

/**
 * BenefitsSection
 * - Robust i18n fallback: looks for keys under both `buy_section.benefits.*` and `benefits.*`.
 * - This fixes situations where JSON was added at root-level `benefits` instead of under `buy_section`.
 * - Translation namespaces used: `buy-tokens-page` (primary) + `common` (fallback namespace hook only).
 *
 * Required keys in either path:
 *   - buy_section.benefits.title  | benefits.title
 *   - buy_section.benefits.items.<growth|community|bonuses|ux>.title | benefits.items.<...>.title
 *   - buy_section.benefits.items.<growth|community|bonuses|ux>.desc  | benefits.items.<...>.desc
 */
export default function BenefitsSection({ t: maybeT }: Props) {
  const { t: tHook } = useTranslation(['buy-tokens-page', 'common']);
  const t: TFn = maybeT ?? (tHook as TFn);

  // Helper that tries multiple keys and returns the first translated value.
  const tr = (keys: string[], defaultValue: string): string => {
    for (const k of keys) {
      const v = (t(k) as string) ?? '';
      // When i18next misses, it often returns the key itself. Filter that out.
      if (v && v !== k) return v;
    }
    return defaultValue;
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6">
      <h4 className="text-lg sm:text-xl font-semibold text-white mb-4">
        {tr([
          'buy_section.benefits.title',
          'benefits.title',
        ], 'Why PierogiCoin?')}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {defaultItems.map((c) => (
          <div
            key={c.key}
            className="rounded-lg bg-black/30 border border-white/10 p-3 text-white/90 flex items-start gap-3"
          >
            <div className="shrink-0 text-gold-400">{c.icon}</div>
            <div>
              <div className="font-semibold text-sm">
                {tr([
                  `buy_section.benefits.items.${c.key}.title`,
                  `benefits.items.${c.key}.title`,
                ], c.defaultTitle)}
              </div>
              <div className="text-xs text-white/70">
                {tr([
                  `buy_section.benefits.items.${c.key}.desc`,
                  `benefits.items.${c.key}.desc`,
                ], c.defaultDesc)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
