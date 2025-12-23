'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Crown, Star, Shield, Zap } from 'lucide-react';

import { useFundStats } from '@/hooks/useFundStats';

export default function FoundersClubSection() {
    const { t } = useTranslation('homepage');
    const { transactionCount, loading } = useFundStats();

    // Calculate spots left (1000 total)
    const spotsLeft = Math.max(0, 1000 - transactionCount);

    const features = [
        {
            icon: Crown,
            title: t('founders_club.features.status.title'),
            description: t('founders_club.features.status.desc')
        },
        {
            icon: Star,
            title: t('founders_club.features.earnings.title'),
            description: t('founders_club.features.earnings.desc')
        },
        {
            icon: Shield,
            title: t('founders_club.features.whitelist.title'),
            description: t('founders_club.features.whitelist.desc')
        },
        {
            icon: Zap,
            title: t('founders_club.features.season_pass.title'),
            description: t('founders_club.features.season_pass.desc')
        }
    ];

    return (
        <section className="relative py-24 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
                            <Crown className="w-4 h-4 text-gold-400" />
                            <span className="text-gold-400 text-sm font-bold uppercase tracking-wider">{t('founders_club.badge')}</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            {t('founders_club.title_prefix')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500">
                                {t('founders_club.title_highlight')}
                            </span>
                        </h2>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            {t('founders_club.description')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="https://t.me/PRGWHEEL_bot?start=founder"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl font-bold text-gray-900 text-center hover:scale-105 transition-transform shadow-lg shadow-gold-500/20"
                            >
                                {t('founders_club.cta_button')}
                            </a>
                            <div className="px-8 py-4 border border-white/10 rounded-xl text-white text-center">
                                {loading ? 'Loading...' : t('founders_club.spots_left', { count: spotsLeft })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/50 hover:bg-white/10 transition-all group overflow-hidden"
                            >
                                {/* Hover Shine Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-500/20 to-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-gold-500/10">
                                        <feature.icon className="w-6 h-6 text-gold-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
