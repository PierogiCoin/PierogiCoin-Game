'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiTag,
  FiStar,
  FiTrendingUp,
  FiThumbsUp,
  FiShoppingBag,
  FiLink,
} from 'react-icons/fi';
import AnimatedSection from './AnimatedSection';
import InfoCard from './InfoCard'; // wspólny komponent do kart
import clsx from 'clsx';

// Opcjonalne propsy: pozwalają nadać ID (do anchorów z menu) i klasę
interface UtilitySectionProps {
  id?: string;
  className?: string;
  /** Where the CTA should point to (anchor or path) */
  ctaHref?: string;
}

export default function UtilitySection({ id = 'utility', className, ctaHref = '#buy-tokens' }: UtilitySectionProps) {
  const { t } = useTranslation(['homepage', 'common']);
  const headingId = `${id}-heading`;
  const subtitleId = `${id}-subtitle`;

  // Konfiguracja kafelków – trzymamy tylko ikonę i klucze tłumaczeń
  const utilities = useMemo(
    () => [
      {
        icon: <FiTag aria-hidden />,
        titleKey: 'utility.cards.discount.title',
        descKey: 'utility.cards.discount.desc',
      },
      {
        icon: <FiStar aria-hidden />,
        titleKey: 'utility.cards.premium.title',
        descKey: 'utility.cards.premium.desc',
      },
      {
        icon: <FiTrendingUp aria-hidden />,
        titleKey: 'utility.cards.staking.title',
        descKey: 'utility.cards.staking.desc',
      },
      {
        icon: <FiThumbsUp aria-hidden />,
        titleKey: 'utility.cards.voting.title',
        descKey: 'utility.cards.voting.desc',
      },
      {
        icon: <FiShoppingBag aria-hidden />,
        titleKey: 'utility.cards.merch.title',
        descKey: 'utility.cards.merch.desc',
      },
      {
        icon: <FiLink aria-hidden />,
        titleKey: 'utility.cards.integrations.title',
        descKey: 'utility.cards.integrations.desc',
      },
    ],
    []
  );

  return (
    <AnimatedSection>
      <section
        id={id}
        className={clsx('relative mx-auto max-w-6xl px-4 py-16 sm:py-20', className)}
        aria-labelledby={headingId}
        aria-describedby={subtitleId}
      >
        {/* dekoracyjny delikatny blur w tle */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-4 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-25"
            style={{
              background:
                'radial-gradient(closest-side, rgba(250,204,21,0.28), rgba(250,204,21,0))',
            }}
          />
        </div>

        <header className="text-center">
          <h2 id={headingId} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gold-300">
            {t('utility.title', 'Why hold PRG?')}
          </h2>
          <p id={subtitleId} className="mt-3 text-base sm:text-lg text-gray-300">
            {t('utility.subtitle', 'Discover real-world utility of the token across the PierogiCoin ecosystem.')}
          </p>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {utilities.map((u, i) => (
            <InfoCard
              key={u.titleKey}
              icon={u.icon}
              title={t(u.titleKey)}
              description={t(u.descKey)}
              delay={i * 0.08}
            />
          ))}
        </div>

        {/* CTA pod kartami – link do sekcji zakupu tokenów */}
        <div className="mt-10 flex justify-center">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-5 py-2.5 text-sm font-semibold text-gold-300 backdrop-blur transition hover:bg-gold-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/70"
          >
            {t('utility.cta', 'Buy PRG and explore benefits')}
          </a>
        </div>
      </section>
    </AnimatedSection>
  );
}
