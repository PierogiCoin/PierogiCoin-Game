'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Trophy, Sparkles } from 'lucide-react';
import { useRecentPurchases } from '@/hooks/useRecentPurchases';
import { useTranslation } from 'react-i18next';

export default function SupportersLeaderboard() {
    // const { purchases, loading } = useRecentPurchases(10);
    const { t } = useTranslation('common');

    // Hardcoded data as requested
    const loading = false;
    const purchases = [
        {
            id: 'manual-seb',
            buyer: 'Sebastian PL',
            amountUSD: 35,
            tokens: 875000,
            createdAt: new Date().toISOString()
        }
    ];

    // Empty State (No supporters yet)
    if (!loading && purchases.length === 0) {
        return (
            <div className="mt-12 bg-gradient-to-br from-black/60 to-gold-900/10 border border-gold-500/30 rounded-2xl p-8 relative overflow-hidden text-center group">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gold-500/20 blur-[50px] rounded-full group-hover:bg-gold-500/30 transition-all duration-700" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10"
                >
                    <div className="inline-flex p-3 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4 animate-pulse">
                        <Trophy className="w-8 h-8 text-gold-400" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2">
                        {t('leaderboard.empty_title', 'Zostań Pierwszą Legendą!')}
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                        {t('leaderboard.empty_desc', 'Nikt jeszcze nie wsparł projektu. Bądź pierwszy, traf na szczyt listy i zgarnij status Foundera!')}
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold">
                        <Sparkles className="w-4 h-4" />
                        {t('leaderboard.bonus', 'Bonus: +25% PRG (Founder Status)')}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-lg transition-colors shadow-lg shadow-gold-500/20 hover:scale-105"
                        >
                            {t('leaderboard.cta', 'Wspieram teraz')}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="mt-12 bg-black/40 border border-gold-500/20 rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-gold-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Heroes of Audit</h3>
                </div>
                <div className="text-xs text-gray-400">Top Contributors</div>
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {purchases.map((s, idx) => (
                    <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${idx === 0 ? 'bg-gradient-to-r from-gold-500/20 to-transparent border-gold-500/50' :
                            idx === 1 ? 'bg-white/5 border-gray-400/30' :
                                idx === 2 ? 'bg-white/5 border-orange-700/30' :
                                    'bg-transparent border-white/5 hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-gold-500 text-black' :
                                idx === 1 ? 'bg-gray-300 text-black' :
                                    idx === 2 ? 'bg-orange-700 text-white' :
                                        'bg-gray-800 text-gray-400'
                                }`}>
                                {idx + 1}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">
                                    {s.buyer}
                                    {idx === 0 && <span className="ml-2 text-gold-400 text-xs">👑 Legend</span>}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">{new Date(s.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-gold-400">${s.amountUSD}</div>
                            <div className="text-[10px] text-gray-500">{s.tokens.toLocaleString()} PRG</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-2">Want to see your name here?</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gold-400 font-bold animate-pulse">
                    <Star className="w-4 h-4 fill-gold-400" />
                    Support & Become a Legend
                    <Star className="w-4 h-4 fill-gold-400" />
                </div>
            </div>
        </div>
    );
}
