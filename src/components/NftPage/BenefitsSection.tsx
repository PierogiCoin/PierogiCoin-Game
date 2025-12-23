// Plik: src/components/NftPage/BenefitsSection.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants, useReducedMotion } from 'framer-motion';

export interface NftBenefit {
  id: string;
  icon: React.ElementType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

interface BenefitsSectionProps {
  benefits: NftBenefit[];
  titleKey?: string;          // np. 'benefits.section_title'
  descriptionKey?: string;    // opcjonalny lead pod tytułem
  columns?: 2 | 3;            // kontrola siatki
  cta?: React.ReactNode;      // opcjonalne CTA pod listą
  anchorId?: string;          // np. 'benefits'
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    transition: reduce ? {} : { staggerChildren: 0.12, delayChildren: 0.15 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function BenefitsSection({
  benefits,
  titleKey = 'benefits.section_title',
  descriptionKey,
  columns = 3,
  cta,
  anchorId = 'benefits',
}: BenefitsSectionProps) {
  const { t } = useTranslation('nft-page');
  const reduce = useReducedMotion();
  const titleId = `${anchorId}-title`;
  const descId = descriptionKey ? `${anchorId}-desc` : undefined;

  return (
    <section
      id={anchorId}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="my-16 w-full max-w-6xl mx-auto text-center"
    >
      <motion.h2
        id={titleId}
        className="text-3xl font-extrabold text-gold-300 mb-3"
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t(titleKey)}
      </motion.h2>

      {descriptionKey && (
        <motion.p
          id={descId}
          className="mx-auto max-w-2xl text-sm text-gray-300 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {t(descriptionKey)}
        </motion.p>
      )}

      <motion.ul
        role="list"
        className={`grid gap-6 md:gap-8 grid-cols-1 ${
          columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        custom={reduce}
        viewport={{ once: true, amount: 0.2 }}
      >
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <motion.li
              key={benefit.id}
              role="listitem"
              variants={itemVariants}
              whileHover={reduce ? undefined : { y: -3 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-700/60 bg-[#0a0a12]/60 p-6 text-left backdrop-blur-sm transition-colors hover:border-gold-400/60 focus-within:border-gold-400/60"
            >
              {/* subtelny „glow” tła */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    'radial-gradient(120px 120px at 20% 0%, rgba(250,204,21,0.12), transparent 60%)',
                }}
              />

              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gold-400/10">
                  <Icon className="text-2xl text-gold-300" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-300">
                    {t(benefit.descriptionKey)}
                  </p>
                </div>
              </div>

              {/* focus ring dla dostępności (jeśli kiedyś zrobisz z tego link/przycisk) */}
              <span className="absolute inset-0 rounded-2xl ring-0 ring-gold-400/0 focus-within:ring-2 focus-within:ring-gold-400/70" />
            </motion.li>
          );
        })}
      </motion.ul>

      {cta && (
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {cta}
        </motion.div>
      )}
    </section>
  );
}
