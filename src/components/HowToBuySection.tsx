// src/components/HowToBuySection.tsx
'use client';

import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, Variants } from 'framer-motion';
import { FiDownload, FiDollarSign, FiStar, FiUserCheck, FiExternalLink } from 'react-icons/fi';

interface StepCardProps {
  icon: React.ReactNode;
  stepNumber: number;
  titleKey: string;
  descriptionKey: string;
  link?: string;
  linkText?: string;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const StepCard: React.FC<StepCardProps> = ({ icon, stepNumber, titleKey, descriptionKey, link, linkText }) => {
  const { t } = useTranslation('homepage');

  return (
    <motion.div
      className="relative p-8 bg-[#0d0d14]/80 backdrop-blur-xl rounded-2xl text-left border border-white/10 hover:border-gold-500/30 transition-colors group h-full flex flex-col"
      variants={itemVariants}
    >
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-gold-500/20 z-20">
        {stepNumber}
      </div>

      <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:bg-gold-500/10 transition-colors">
        <div className="text-3xl text-gold-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      </div>

      <h3 className="font-bold text-xl mb-3 text-white group-hover:text-gold-300 transition-colors">
        {t(titleKey)}
      </h3>

      <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
        {t(descriptionKey)}
      </p>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-gold-400 hover:text-white inline-flex items-center gap-2 transition-colors mt-auto"
        >
          {linkText || t('common:learn_more', 'Learn More')} <FiExternalLink />
        </a>
      )}
    </motion.div>
  );
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const STEPS = [
  {
    icon: <FiDownload />,
    titleKey: 'how_to_buy_section.steps.1.title',
    descriptionKey: 'how_to_buy_section.steps.1.description',
    link: 'https://phantom.app/',
    linkText: 'Download Phantom'
  },
  {
    icon: <FiDollarSign />,
    titleKey: 'how_to_buy_section.steps.2.title',
    descriptionKey: 'how_to_buy_section.steps.2.description'
  },
  {
    icon: <FiStar />,
    titleKey: 'how_to_buy_section.steps.3.title',
    descriptionKey: 'how_to_buy_section.steps.3.description',
    link: '#funding-hub',
    linkText: 'Go to Funding Hub'
  },
  {
    icon: <FiUserCheck />,
    titleKey: 'how_to_buy_section.steps.4.title',
    descriptionKey: 'how_to_buy_section.steps.4.description',
    link: 'https://t.me/PRGWHEEL_bot',
    linkText: 'Join Community'
  }
];

export default function HowToBuySection() {
  const { t } = useTranslation('homepage');

  return (
    <motion.section
      id="how-to-buy"
      className="relative overflow-hidden py-24 bg-black"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-900/20 via-black to-black pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-20">
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            {t('how_to_buy_section.journey_title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">{t('how_to_buy_section.journey_title_highlight')}</span>
          </motion.h2>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            <Trans
              t={t}
              i18nKey="how_to_buy_section.journey_desc"
              components={{ b: <b /> }}
            />
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={sectionVariants}
        >
          {STEPS.map((step, idx) => (
            <StepCard
              key={idx}
              stepNumber={idx + 1}
              icon={step.icon}
              titleKey={step.titleKey}
              descriptionKey={step.descriptionKey}
              link={step.link}
              linkText={step.linkText}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}