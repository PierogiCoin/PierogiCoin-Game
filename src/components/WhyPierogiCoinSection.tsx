'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';
import { FiTrendingUp, FiShield, FiUsers, FiZap } from 'react-icons/fi';

const FALLBACKS = {
  title: 'Why PierogiCoin?',
  subtitle: 'The ultimate meme coin that combines Polish heritage with cutting-edge blockchain technology.',
  features: {
    1: {
      title: 'Strong Growth Potential',
      description: 'PierogiCoin has a clear roadmap and a passionate community, paving the way for sustainable growth.',
    },
    2: {
      title: 'Secure & Transparent',
      description: 'Built on the robust Solana blockchain, providing lightning-fast transactions and top-tier security.',
    },
    3: {
      title: 'Vibrant Community',
      description: 'Join a global community of pierogi enthusiasts and crypto fans. Together, we are building the future.',
    },
  },
  cta: {
    buy: 'Buy Now',
    tokenomics: 'See Tokenomics',
  },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => (
  <motion.div
    className="bg-gray-950/50 p-6 rounded-xl border border-white/10 text-center flex flex-col items-center"
    variants={itemVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="text-4xl text-gold-400 mb-4" aria-hidden>{icon}</div>
    <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
);

export default function WhyPierogiCoinSection() {
  const { t, i18n } = useTranslation('why_invest');
  const lang = i18n.language || 'en'; // Domyślnie 'en'

  const icons = [FiTrendingUp, FiShield, FiUsers];

  return (
    <section id="why-pierogicoin" className="relative py-20 md:py-28 text-gray-200">

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-400">
            {t('title', { defaultValue: FALLBACKS.title })}
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            {t('subtitle', { defaultValue: FALLBACKS.subtitle })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-6 md:gap-8">
          {Object.values(FALLBACKS.features).map((feature, index) => {
            const Icon = icons[index];
            return (
              <FeatureCard
                key={feature.title}
                icon={<Icon />}
                title={t(`feature${index + 1}.title`, { defaultValue: feature.title })}
                description={t(`feature${index + 1}.description`, { defaultValue: feature.description })}
                delay={0.1 * (index + 1)}
              />
            );
          })}
        </div>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <a
            href={`https://pierogimeme.io/${lang}/buy-tokens`}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400/90 px-5 py-3 font-semibold text-gray-900 shadow hover:bg-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-300"
          >
            <FiZap aria-hidden />
            {t('cta.buy', { defaultValue: FALLBACKS.cta.buy })}
          </a>
          <a
            href="#tokenomics"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            {t('cta.tokenomics', { defaultValue: FALLBACKS.cta.tokenomics })}
          </a>
        </motion.div>
      </div>
    </section>
  );
}