// Plik: src/app/[locale]/about/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { FaUsers, FaLock, FaLightbulb, FaRegEye, FaDiscord } from 'react-icons/fa';

// --- TYPY I DANE ---
interface ValueItem {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
}

const values: ValueItem[] = [
  { icon: FaUsers, titleKey: 'values.community.title', descKey: 'values.community.description' },
  { icon: FaRegEye, titleKey: 'values.transparency.title', descKey: 'values.transparency.description' },
  { icon: FaLightbulb, titleKey: 'values.innovation.title', descKey: 'values.innovation.description' },
  { icon: FaLock, titleKey: 'values.security.title', descKey: 'values.security.description' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  },
};

export default function AboutPage() {
  const { t } = useTranslation('about');
  const params = useParams();
  const locale = (params as { locale?: string })?.locale || 'en';

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-100">

      {/* ——— AMBIENT BACKGROUND (Global Vanta is under this, we add glows) ——— */}

      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* ——— HERO SECTION ——— */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 drop-shadow-2xl"
            >
              <span className="block text-white">{t('hero.title').split(' ')[0]}</span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-amber-300 to-gold-500">
                {t('hero.title').split(' ').slice(1).join(' ')}
                <span className="absolute -inset-2 blur-2xl bg-gold-500/20 rounded-full -z-10" />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <main className="relative z-10 container mx-auto px-4 py-20 space-y-32">

        {/* ——— NASZA HISTORIA ——— */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
              {t('story.heading')}
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed border-l-2 border-white/5 pl-6">
              <p>{t('story.paragraph1')}</p>
              <p>{t('story.paragraph2')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/about-story.webp"
                alt="Our Story"
                fill
                className="object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </motion.div>
        </motion.section>

        {/* ——— WARTOŚCI ——— */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-white mb-16"
          >
            {t('values.heading')}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.titleKey}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-2xl text-amber-400 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                    <v.icon />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {t(v.titleKey)}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {t(v.descKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ——— TRUST STATS ——— */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black/40 p-10 md:p-16 text-center backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          <div className="grid gap-10 md:grid-cols-3 relative z-10">
            {[
              { label: t('trust.community_label'), value: t('trust.community_value'), icon: "👥" },
              { label: t('trust.launch_label'), value: t('trust.launch_value'), icon: "🚀" },
              { label: t('trust.transparency_label'), value: t('trust.transparency_value'), icon: "🔍" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ——— PLATFORM AVAILABILITY ——— */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-10 md:p-16 text-center backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointing-events-none" />
          <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointing-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">{t('availability.heading')}</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 relative z-10">{t('availability.description')}</p>

          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <motion.a
              href="https://t.me/PRGWHEEL_bot"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">✈️</span>
              {t('availability.telegram')}
            </motion.a>
            <motion.a
              href="https://teleprg.vercel.app/"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-white/10 shadow-lg transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">🌐</span>
              {t('availability.browser')}
            </motion.a>
          </div>
        </motion.section>

        {/* ——— CTA ——— */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-10"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">{t('cta.heading')}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">{t('cta.description')}</p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`/${locale}/tokenomics`}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
            >
              {t('cta.tokenomics')}
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://t.me/PRGWHEEL_bot"
              target="_blank"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <FaDiscord className="text-indigo-400" /> {t('cta.join_discord')}
            </motion.a>
          </div>
        </motion.section>

      </main>
    </div>
  );
}