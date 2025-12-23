'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
// import Image from 'next/image'; // unused
import Link from 'next/link';
import { FileText, PieChart, Rocket, ShieldCheck, Flame, Globe, Users, Zap } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function WhitepaperPage() {
    const { t } = useTranslation('whitepaper');

    return (
        <main className="min-h-screen pt-24 pb-20 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[#07070d] -z-20" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,53,15,0.15),transparent_70%)] -z-10" />
            <div className="fixed inset-0 bg-[url('/images/pattern-grid.svg')] opacity-[0.03] -z-10" />

            <div className="container mx-auto px-4">

                {/* 1. HERO SECTION */}
                <motion.section
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="flex flex-col items-center text-center mb-32 relative"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full -z-10" />

                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold mb-8">
                        <FileText className="w-4 h-4" />
                        {t('manifesto.badge')}
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        {t('hero.title')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600">
                            {t('hero.title_highlight')}
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-2xl mb-10">
                        {t('hero.subtitle')}
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex gap-4 print:hidden">
                        <Link href="/buy-tokens" className="px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl text-black font-bold text-lg hover:shadow-lg hover:shadow-gold-500/20 transition-all">
                            {t('hero.cta_primary')}
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <FileText className="w-5 h-5" />
                            {t('hero.download_pdf')}
                        </button>
                    </motion.div>

                    <style jsx global>{`
                        @media print {
                            body {
                                background: white !important;
                                color: black !important;
                            }
                            main {
                                padding-top: 0 !important;
                                padding-bottom: 0 !important;
                            }
                            /* Hide decorative backgrounds */
                            div[class*="fixed"],
                            div[class*="absolute"],
                            div[class*="bg-gold-500/10"],
                            div[class*="radial-gradient"] {
                                display: none !important;
                            }
                            /* Ensure text visibility */
                            h1, h2, h3, p, span, div {
                                color: black !important;
                                text-shadow: none !important;
                            }
                            /* Borders */
                            .border-white\\/10, .border-white\\/5 {
                                border-color: #ddd !important;
                            }
                            /* Reset Grid for Print */
                            .grid {
                                display: block !important;
                            }
                            .grid > div {
                                page-break-inside: avoid;
                                margin-bottom: 20px;
                                border: 1px solid #eee;
                            }
                            /* Hide Navbar/Footer if present externally (usually managed by layout, but 'print:hidden' class helps) */
                            header, footer, nav {
                                display: none !important;
                            }
                        }
                    `}</style>
                </motion.section>

                {/* 2. MANIFESTO */}
                <section className="mb-32 max-w-4xl mx-auto">
                    <div className="relative p-1 rounded-2xl bg-gradient-to-br from-gold-500/20 via-transparent to-cyber-500/20">
                        <div className="bg-[#0a0a12] rounded-xl p-8 md:p-12 relative overflow-hidden">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 p-32 bg-gold-500/5 blur-3xl rounded-full" />

                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-gold-500" />
                                {t('manifesto.title')}
                            </h2>

                            <div className="prose prose-invert prose-lg max-w-none">
                                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                                    {t('manifesto.text_1')}
                                </p>
                                <p className="text-xl text-gray-300 leading-relaxed">
                                    {t('manifesto.text_2')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. TOKENOMICS */}
                <section id="tokenomics" className="mb-32 break-inside-avoid">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">{t('tokenomics.title')}</h2>
                        <p className="text-gray-400">{t('tokenomics.subtitle')}</p>
                    </div>

                    {/* Supply Card */}
                    <div className="max-w-md mx-auto mb-16 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">{t('tokenomics.supply')}</p>
                        <p className="text-4xl font-black text-white tracking-widest">{t('tokenomics.total_supply_value', '7,373,000,000 PRG')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {[
                            { label: t('tokenomics.chart.presale'), value: '40%', color: 'bg-gold-500', icon: Users },
                            { label: t('tokenomics.chart.liquidity'), value: '15%', color: 'bg-blue-500', icon: Zap },
                            { label: t('tokenomics.chart.team'), value: '10%', color: 'bg-purple-500', icon: ShieldCheck },
                            { label: t('tokenomics.chart.marketing'), value: '8%', color: 'bg-pink-500', icon: Globe },
                            { label: t('tokenomics.chart.ecosystem'), value: '12%', color: 'bg-green-500', icon: PieChart },
                            { label: t('tokenomics.chart.rewards'), value: '5%', color: 'bg-indigo-500', icon: Rocket },
                            { label: t('tokenomics.chart.staking'), value: '10%', color: 'bg-orange-500', icon: Flame },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-xl bg-[#0F0F16] border border-white/5 hover:border-gold-500/30 transition-all group print:border-gray-200"
                            >
                                <div className={`w-12 h-12 rounded-lg ${item.color} bg-opacity-20 flex items-center justify-center mb-4 text-white print:text-black print:bg-gray-100`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1 print:text-black">{item.value}</h3>
                                <p className="text-gray-400 text-sm font-medium print:text-gray-600">{item.label.split('(')[0].trim()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Vesting Table */}
                    <div className="bg-[#0a0a12] rounded-2xl p-8 border border-white/5 print:border-gray-300 print:bg-white mb-16">
                        <h3 className="text-2xl font-bold text-white mb-6 print:text-black">{t('tokenomics.details_title')}</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            {['team', 'marketing', 'game_rewards', 'liquidity'].map((key) => (
                                <div key={key} className="border-l-2 border-gold-500 pl-4">
                                    <h4 className="text-lg font-bold text-gold-400 mb-1 print:text-black">{t(`tokenomics.details.${key}.title`)}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed print:text-gray-600">{t(`tokenomics.details.${key}.desc`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Burn Mechanism */}
                    <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-500/20 print:border-gray-300 print:bg-white">
                        <div className="flex items-start gap-4">
                            <Flame className="w-10 h-10 text-orange-500 shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 print:text-black">{t('tokenomics.burn_mechanism.title')}</h3>
                                <p className="text-gray-400 print:text-gray-600">{t('tokenomics.burn_mechanism.description')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. ROADMAP */}
                <section className="mb-20 break-before-page">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4 print:text-black">{t('roadmap.title')}</h2>
                        <p className="text-gray-400 print:text-gray-600">{t('roadmap.subtitle')}</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-500 via-cyber-500 to-purple-500 opacity-20 print:hidden" />
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-300 hidden print:block" />

                        {['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5', 'phase_6'].map((phaseKey, index) => (
                            <div
                                key={phaseKey}
                                className="flex gap-8 relative break-inside-avoid"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#0a0a12] border-4 border-[#1a1a24] flex items-center justify-center shrink-0 z-10 relative group print:bg-white print:border-gray-800">
                                    <div className="absolute inset-0 bg-gold-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                                    <span className="font-black text-2xl text-gray-500 group-hover:text-gold-500 transition-colors print:text-black">{index + 1}</span>
                                </div>
                                <div className="flex-1 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all print:border-gray-300 print:bg-white">
                                    <h3 className="text-xl font-bold text-white mb-2 print:text-black">{t(`roadmap.${phaseKey}.title`)}</h3>
                                    <p className="text-gray-400 print:text-gray-600">{t(`roadmap.${phaseKey}.desc`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. SOCIALS & CONTACT */}
                <section className="mb-20 break-inside-avoid">
                    <div className="bg-[#0a0a12] border border-white/10 rounded-2xl p-8 md:p-12 print:border-gray-300 print:bg-white">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-4 print:text-black">{t('socials.title')}</h2>
                            <p className="text-gray-400 print:text-gray-600">{t('socials.subtitle')}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {['telegram', 'twitter', 'website', 'discord', 'facebook', 'instagram', 'tiktok'].map((key) => (
                                <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-200">
                                    <p className="font-mono text-gold-400 print:text-black break-all">
                                        {t(`socials.links.${key}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. LEGAL */}
                <section className="mb-20 pt-10 border-t border-white/10 print:border-gray-300 text-center">
                    <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-widest print:text-gray-800">{t('legal.title')}</h3>
                    <p className="text-xs text-gray-600 max-w-3xl mx-auto leading-relaxed print:text-gray-500">
                        {t('legal.text')}
                    </p>
                </section>

            </div>
        </main>
    );
}
