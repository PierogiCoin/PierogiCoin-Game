// Plik: src/components/NftPage/RarityInfoSection.tsx
'use client';

import React from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { FaStar, FaGem, FaCrown } from 'react-icons/fa';
import { PiShieldStarFill } from 'react-icons/pi'; // ładniejsza tarcza
import { useTranslation } from 'react-i18next';

type IconType = React.ComponentType<{ className?: string }>;

interface RarityTier {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: IconType;
  /** główny kolor (Tailwind class) np. 'text-gray-400' */
  textClass: string;
  /** kolor obramowania (Tailwind class) np. 'border-gray-500' */
  borderClass: string;
  /** opcjonalnie procent rozkładu / supply */
  distributionPct?: number;
}

const TIERS: RarityTier[] = [
  { id: 'common', nameKey: 'rarity.common.name', descriptionKey: 'rarity.common.description', icon: FaStar, textClass: 'text-gray-400', borderClass: 'border-gray-600', distributionPct: 60 },
  { id: 'rare', nameKey: 'rarity.rare.name', descriptionKey: 'rarity.rare.description', icon: FaGem, textClass: 'text-cyber-400', borderClass: 'border-cyber-500/50', distributionPct: 25 },
  { id: 'epic', nameKey: 'rarity.epic.name', descriptionKey: 'rarity.epic.description', icon: PiShieldStarFill, textClass: 'text-cyber-300', borderClass: 'border-cyber-400', distributionPct: 12 },
  { id: 'legendary', nameKey: 'rarity.legendary.name', descriptionKey: 'rarity.legendary.description', icon: FaCrown, textClass: 'text-gold-400', borderClass: 'border-gold-500', distributionPct: 3 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    transition: reduce ? {} : { staggerChildren: 0.12, delayChildren: 0.15 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function RarityInfoSection() {
  const { t } = useTranslation('nft-page');
  const reduce = useReducedMotion();
  const titleId = 'rarity-title';
  const descId = 'rarity-desc';

  return (
    <section className="py-16 md:py-20 text-white" aria-labelledby={titleId} aria-describedby={descId}>
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 id={titleId} className="text-3xl sm:text-4xl font-extrabold text-gold-300 mb-3">
            ✨ {t('rarity.section_title')}
          </h2>
          <p id={descId} className="text-gray-400 max-w-2xl mx-auto mb-10 md:mb-12">
            {t('rarity.section_subtitle')}
          </p>
        </motion.div>

        <motion.ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={reduce}
        >
          {TIERS.map((tier) => {
            const Icon = tier.icon;

            return (
              <motion.li
                key={tier.id}
                role="listitem"
                variants={itemVariants}
                whileHover={reduce ? undefined : { y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.99 }}
                className={[
                  'relative overflow-hidden rounded-2xl border-2',
                  'bg-[#0d0d14]/60 backdrop-blur-md shadow-xl transition-all',
                  'hover:shadow-2xl',
                  tier.borderClass,
                ].join(' ')}
              >
                {/* delikatny glow w tle */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(140px 120px at 20% 0%, rgba(250,204,21,0.12), transparent 60%)',
                  }}
                />
                <div className="relative p-6">
                  <div className="flex items-center justify-center">
                    <span
                      className={[
                        'inline-flex h-14 w-14 items-center justify-center rounded-xl',
                        'bg-[#0a0a12]/50 border',
                        tier.borderClass,
                      ].join(' ')}
                    >
                      <Icon className={['text-2xl', tier.textClass].join(' ')} />
                    </span>
                  </div>

                  <h3 className={['mt-4 text-xl font-semibold text-center', tier.textClass].join(' ')}>
                    {t(tier.nameKey)}
                  </h3>

                  {typeof tier.distributionPct === 'number' && (
                    <p className="mt-1 text-center text-xs text-gray-400 tabular-nums">
                      {t('rarity.distribution', { percent: tier.distributionPct })}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-gray-300 text-center">
                    {t(tier.descriptionKey)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
