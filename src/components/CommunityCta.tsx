'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * CommunityCta – sekcja CTA do społeczności
 * - pełne tłumaczenia (homepage/common)
 * - przyjazne dla anchorów (id="community")
 * - linki z ENV z bezpiecznym fallbackiem
 * - aria‑label oraz rel="noopener noreferrer"
 */
export default function CommunityCta() {
  const { t } = useTranslation(['homepage', 'common']);

  // Linki z ENV – jeśli brak, wyłączamy dany przycisk
  const links = useMemo(
    () => ({
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
      discord: process.env.NEXT_PUBLIC_DISCORD_URL || '',
    }),
    []
  );

  const variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  } as const;

  const Btn = ({
    href,
    label,
    testId,
  }: {
    href: string;
    label: string;
    testId: string;
  }) => (
    <motion.a
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      href={href || '#'}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      aria-label={label}
      data-testid={testId}
      className={[
        'inline-flex items-center rounded-lg border px-5 py-3 text-sm font-semibold',
        'border-gray-700 bg-[#0d0d14] text-gold-300',
        'hover:border-gold-400 hover:bg-[#0a0a12] focus:outline-none',
        href ? '' : 'pointer-events-none opacity-50',
      ].join(' ')}
    >
      {label}
    </motion.a>
  );

  return (
    <section id="community" className="mx-auto w-full max-w-7xl px-4 py-16 text-center">
      <h2 className="text-3xl font-extrabold text-gold-300">
        {t('homepage:community.title')}
      </h2>
      <p className="mt-2 text-gray-400">{t('homepage:community.subtitle')}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Btn
          href={links.twitter}
          label={t('homepage:community.twitter')}
          testId="cta-twitter"
        />
        <Btn
          href={links.telegram}
          label={t('homepage:community.telegram')}
          testId="cta-telegram"
        />
        <Btn
          href={links.discord}
          label={t('homepage:community.discord')}
          testId="cta-discord"
        />
      </div>
    </section>
  );
}
