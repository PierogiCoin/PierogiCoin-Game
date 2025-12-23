'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Trophy, Users, TrendingUp } from 'lucide-react';

interface AuditFundTrackerProps {
    currentAmount: number;
    targetAmount: number;
    activePlayers: number;
    prgEarnedToday: number;
}

export default function AuditFundTracker({
    currentAmount,
    targetAmount,
    activePlayers,
    prgEarnedToday,
}: AuditFundTrackerProps) {
    const { t } = useTranslation('common');

    // Calculate percentage, capped at 100
    const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));

    return (
        <div className="w-full bg-[#0a0a12]/80 backdrop-blur-xl border border-gold-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent blur-sm" />
            <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Title & Progress Text */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-2">
                <div className="text-left">
                    <h3 className="text-xl text-gray-200 font-bold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-gold-400" />
                        {t('audit_fund.title', 'Postęp Zbiórki na Audyt')}
                    </h3>
                    <p className="text-xs text-gray-500">{t('audit_fund.goal_description', 'Zbieramy fundusze na audyt bezpieczeństwa CertiK')}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl md:text-4xl font-black text-white">
                        ${currentAmount.toLocaleString()} <span className="text-lg text-gray-500 font-medium">/ ${targetAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative h-6 md:h-8 bg-black/50 rounded-full border border-white/10 shadow-inner group-hover:border-gold-500/30 transition-colors">
                {/* Progress Fill */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-600 via-amber-400 to-gold-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] rounded-l-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    {/* Shimmer effect inside bar */}
                    <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%]" />
                </motion.div>

                {/* Milestones */}
                {[10, 25, 50, 75].map(pct => (
                    <div key={pct} className="absolute top-0 bottom-0 w-px bg-white/10 group-hover:bg-white/30 transition-colors" style={{ left: `${pct}%` }}>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{pct}%</div>
                    </div>
                ))}

                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-xs md:text-sm font-bold text-white drop-shadow-md mix-blend-difference">
                        {percentage.toFixed(1)}% {t('audit_fund.funded', 'Sfinansowano')}
                    </span>
                </div>
            </div>

            {/* Active Buff Display */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse border border-green-500/20">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                    </div>
                    <div className="flex-grow">
                        <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-0.5">Global Game Buff Active</div>
                        <div className="text-white font-bold text-sm md:text-base">
                            {percentage < 10 && t('audit_buffs.gathering')}
                            {percentage >= 10 && percentage < 25 && t('audit_buffs.tier1')}
                            {percentage >= 25 && percentage < 50 && t('audit_buffs.tier2')}
                            {percentage >= 50 && percentage < 75 && t('audit_buffs.tier3')}
                            {percentage >= 75 && percentage < 100 && t('audit_buffs.tier4')}
                            {percentage >= 100 && t('audit_buffs.tier5')}
                        </div>
                    </div>
                </div>
                <div className="text-right whitespace-nowrap hidden md:block pl-4 border-l border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase">{t('audit_buffs.next_unlock')}</div>
                    <div className="text-gray-300 font-bold text-sm">
                        {percentage < 10 ? "10% (+10% Gems)" : percentage < 25 ? "25% (+25% XP)" : percentage < 50 ? "50% (+Daily Boost)" : "100% (2x Mode)"}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-2xl font-bold text-white leading-none">{activePlayers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('audit_fund.players')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gold-400 leading-none">+{prgEarnedToday.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('audit_fund.earned_today')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div >
    );
}
