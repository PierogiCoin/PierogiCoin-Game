'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuditFundTracker from '@/components/AuditFundTracker';
import DonationWidget from '@/components/Funding/DonationWidget';
import SupportersLeaderboard from '@/components/Funding/SupportersLeaderboard';
import Link from 'next/link';
import { Gamepad2, Gem } from 'lucide-react';
import Image from 'next/image';
import { useFundStats } from '@/hooks/useFundStats';
import { useGameStats } from '@/hooks/useGameStats';
// import { usePresaleStatus } from '@/hooks/usePresaleStatus'; // Removed
// import { PROJECT_STATS } from '@/data/projectData'; // Unused

export default function FundingHubSection() {
    const { t } = useTranslation('funding-hub');
    const { stats, loading: loadingStats } = useGameStats();
    // const { status: presaleStatus, loading: loadingPresale } = usePresaleStatus(); // Removed
    const fundStats = useFundStats(); // New hook

    // --- Simulation Logic ---
    // Even with live data, we want a bit of "life" in the UI (jitter effect)
    const [simulatedPlayers, setSimulatedPlayers] = React.useState(0);
    const [simulatedEarnings, setSimulatedEarnings] = React.useState(0);

    // Initial load
    React.useEffect(() => {
        if (!loadingStats) {
            setSimulatedPlayers(stats.activePlayers);
            setSimulatedEarnings(stats.totalEarned);
        } else {
            // Keep 0 or minimal fallback to avoid "fake" data look
            setSimulatedPlayers(0);
            setSimulatedEarnings(0);
        }
    }, [loadingStats, stats]);

    // Live Jitter Effect
    React.useEffect(() => {
        const interval = setInterval(() => {
            // Randomly add/remove a small amount of players (jitter) if we have players
            if (simulatedPlayers > 0) {
                setSimulatedPlayers(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)));
            }

            // Earnings always go up slightly if we have activity
            if (simulatedEarnings > 0) {
                setSimulatedEarnings(prev => prev + Math.floor(Math.random() * 50));
            }
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [simulatedPlayers, simulatedEarnings]);

    const currentAmount = fundStats.usdRaised; // Real data only

    const targetAmount = 15000; // Hard cap for this stage/audit

    return (
        <section id="funding-hub" className="py-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#07070d]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-500/20 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(250,204,21,0.05)_0%,transparent_60%)]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* 1. Header & Tracker */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-white mb-6"
                    >
                        {t('title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">{t('title_highlight')}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
                    >
                        {t('subtitle')}
                    </motion.p>

                    <AuditFundTracker
                        currentAmount={currentAmount}
                        targetAmount={targetAmount}
                        activePlayers={simulatedPlayers}
                        prgEarnedToday={simulatedEarnings}
                    />
                </div>

                {/* 2. Three Pillars of Support */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">

                    {/* PILLAR 1: GAMER */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="h-full"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                                <Gamepad2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{t('gamer.title')}</h3>
                                <p className="text-xs text-gray-400">{t('gamer.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#0a0a12]/60 border border-gold-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300">
                            <div className="absolute top-0 right-0 bg-gold-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg animate-pulse">
                                {t('gamer.popular_badge')}
                            </div>

                            <div className="mb-6 mt-2 relative">
                                <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full" />
                                <Image src="/images/founders-pass.png" alt="Season Pass" width={200} height={200} className="relative z-10 mx-auto drop-shadow-2xl hover:scale-105 transition-transform" />
                            </div>

                            <h4 className="text-lg font-bold text-white mb-2 text-center">{t('gamer.card_title')}</h4>
                            <p className="text-center text-xs text-gold-400 font-bold mb-4">
                                {t('gamer.spots_left', { count: 1000 })}
                            </p>

                            <ul className="space-y-2 mb-6 text-sm text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-gold-400">✓</span> {t('gamer.features.prg_bonus')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-gold-400">✓</span> {t('gamer.features.earnings_boost')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-gold-400">✓</span> {t('gamer.features.founder_badge')}
                                </li>
                            </ul>

                            <a
                                href="https://t.me/PRGWHEEL_bot?start=founder"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl font-bold text-gray-900 text-center hover:shadow-lg hover:shadow-gold-500/20 transition-all"
                            >
                                {t('gamer.cta')}
                            </a>
                        </div>
                    </motion.div>

                    {/* PILLAR 2: COLLECTOR (NFT) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="h-full"
                    >
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20 text-cyber-400">
                                    <Gem className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{t('collector.title')}</h3>
                                    <p className="text-xs text-gray-400">{t('collector.subtitle')}</p>
                                </div>
                            </div>

                            <div className="flex-1 bg-[#0a0a12]/60 border border-cyber-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-cyber-500/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyber-500/10 transition-all duration-300 flex flex-col">

                                <div className="mb-6 mt-2 relative aspect-[4/5] rounded-xl overflow-hidden bg-black/40">
                                    <Image
                                        src="/nft/001.png"
                                        alt="NFT Preview"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Coming Soon Badge */}
                                    <div className="absolute top-2 right-2 bg-cyber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 uppercase tracking-wider animate-pulse">
                                        {t('collector.coming_soon')}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <span className="text-white font-bold text-sm">{t('collector.collection_name')}</span>
                                    </div>
                                </div>

                                <h4 className="text-lg font-bold text-white mb-2">{t('collector.card_title')}</h4>
                                <p className="text-sm text-gray-400 mb-6 flex-1">
                                    {t('collector.description')}
                                </p>

                                <Link
                                    href="/nft"
                                    className="block w-full py-3 border border-cyber-500 text-cyber-400 rounded-xl font-bold text-center hover:bg-cyber-500 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                >
                                    {t('collector.cta')}
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* PILLAR 3: SUPPORTER (Donation) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="h-full"
                    >
                        <DonationWidget />
                    </motion.div>

                </div>

                {/* LEADERBOARD & SOCIAL PROOF */}
                <div className="max-w-2xl mx-auto mt-16">
                    <SupportersLeaderboard />
                </div>

            </div >
        </section >
    );
}
