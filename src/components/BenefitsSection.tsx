// Plik: src/components/BenefitsSection.tsx
"use client";

import React, { useState } from 'react';
// ZMIANA: Dodajemy `AnimatePresence` do importu
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaPercentage } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import '@/i18n';
import type { NftBenefit } from '@/types/NftBenefit';

const benefitsData: NftBenefit[] = [
  {
    id: 'benefit1',
    icon: FaUserShield,
    titleKey: 'nft_page:benefit1_title',
    descriptionKey: 'nft_page:benefit1_desc',
  },
  {
    id: 'benefit2',
    icon: FaPercentage,
    titleKey: 'nft_page:benefit2_title',
    descriptionKey: 'nft_page:benefit2_desc',
  },
];

interface BenefitsSectionProps {
  benefits?: NftBenefit[];
}

const listMotionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, when: 'beforeChildren' },
  },
};

const listItemMotionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function BenefitsSection({
  benefits = benefitsData,
}: BenefitsSectionProps) {
  const { t } = useTranslation('nft_page');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="benefits"
      className="relative py-16 bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-gold-400 mb-8 text-center drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {t('benefits_title', 'Why Our NFT Is Special')}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          variants={listMotionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {benefits.map((item, index) => (
            <motion.div
              key={item.id}
              className={`flex flex-col items-center text-center p-6 bg-[#0d0d14]/60 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/50 transition-transform duration-300 cursor-pointer ${
                activeIndex === index
                  ? 'scale-105 border-gold-500/90 shadow-gold-500/30'
                  : 'hover:scale-105 hover:border-gold-500/70'
              }`}
              variants={listItemMotionVariants}
              onClick={() => toggleAccordion(index)}
            >
              <div className="text-4xl text-gold-400 mb-4">
                <item.icon />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t(item.titleKey)}
              </h3>
              <p className="text-gray-300 text-sm">
                {t(item.descriptionKey)}
              </p>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 w-full text-left text-gray-200 text-sm"
                  >
                    {t(`${item.id}_details`, 'Szczegółowy opis benefitów…')}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}