'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Layout, Trophy, Star,
    Coins, Zap, Shield, Target,
    ChevronRight, ExternalLink, Loader2, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PlayerStats {
    username: string;
    level: number;
    prg: number;
    gems: number;
    xp: number;
    totalPrgEarned: number;
    arenaPoints: number;
    duelsWon: number;
    achievementsClaimed: number;
    tasksCompleted: number;
    referrals: number;
    avatarId: string;
    founderTier: number;

    // Investment stats
    totalInvested: number;
    totalTokensPurchased: number;
    investorTier: number;
    investorTierName: string;
    purchaseCount: number;

    // Referral stats
    referralCount: number;
    referralTokensEarned: number;
    totalReferralVolume: number;
}

export default function GameDashboard() {
    const { t } = useTranslation('buy-tokens-page');
    const [identifier, setIdentifier] = useState('');
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!identifier.trim()) return;

        setLoading(true);
        setError(null);
        setStats(null);

        try {
            const res = await fetch(`/api/game/user-stats?identifier=${encodeURIComponent(identifier.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else {
                setStats(data.stats);
            }
        } catch (err) {
            setError('Failed to connect to game servers');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto mb-24 px-4" id="dashboard">
            <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0a0a0f]/80 backdrop-blur-2xl p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(250,204,21,0.1)]">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold mb-4 uppercase tracking-wider">
                        <Layout className="w-3 h-3" /> {t('dashboard.title', 'Player Dashboard')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        {t('dashboard.headline', 'Check Your')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">{t('dashboard.headline_highlight', 'In-Game Progress')}</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        {t('dashboard.subtitle', 'Enter your Telegram username or email address associated with the game to instantly view your assets and achievements.')}
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-12">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={t('dashboard.placeholder', 'Telegram username or Email...')}
                            className="w-full bg-black/60 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-500/50 transition-all text-lg shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-gold-500/20 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.search_btn', 'Search')}
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 right-0 -bottom-8 text-center text-red-400 text-sm font-medium"
                            >
                                {error === 'User not found' ? t('dashboard.user_not_found', 'No player found with this identifier. Have you started the game yet?') : error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </form>

                {/* Dashboard View */}
                <AnimatePresence mode="wait">
                    {stats ? (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {/* Profile Card */}
                            <div className="md:col-span-1 space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full" />
                                        <div className="relative w-full h-full rounded-2xl bg-black border-2 border-gold-500/40 flex items-center justify-center text-4xl overflow-hidden shadow-2xl">
                                            {stats.avatarId || '🥟'}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gold-400 to-amber-500 w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-black text-black text-sm">
                                            Lvl {stats.level}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">@{stats.username}</h3>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {t('dashboard.active_player', 'Active Player')}
                                    </div>

                                    {stats.founderTier > 0 && (
                                        <div className="mt-4 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-lg text-[10px] font-black uppercase text-gold-400 tracking-tighter">
                                            {stats.founderTier === 3 ? 'Genesis Legend' : stats.founderTier === 2 ? 'Founder Visionary' : 'Founder Initiate'}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black">{t('dashboard.experience', 'Experience')}</div>
                                        <div className="text-white font-bold">{stats.xp.toLocaleString()} XP</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatItem
                                    icon={<Coins className="w-5 h-5" />}
                                    label={t('dashboard.current_balance', 'Current Balance')}
                                    value={`${stats.prg.toLocaleString()} PRG`}
                                    subValue={`${stats.gems} Gems 💎`}
                                    color="gold"
                                />
                                <StatItem
                                    icon={<Trophy className="w-5 h-5" />}
                                    label={t('dashboard.arena_rank', 'Arena Rank')}
                                    value={`${stats.arenaPoints.toLocaleString()} ${t('dashboard.points', 'Pts')}`}
                                    subValue={`${stats.duelsWon} ${t('dashboard.duels_won', 'Duels Won')}`}
                                    color="blue"
                                />
                                <StatItem
                                    icon={<Star className="w-5 h-5" />}
                                    label={t('dashboard.achievements', 'Achievements')}
                                    value={`${stats.achievementsClaimed} ${t('dashboard.unlocked', 'Unlocked')}`}
                                    subValue={`${stats.tasksCompleted} ${t('dashboard.tasks_done', 'Tasks Done')}`}
                                    color="purple"
                                />
                                <StatItem
                                    icon={<Users className="w-5 h-5" />}
                                    label={t('dashboard.network', 'Network')}
                                    value={`${stats.referrals} ${t('dashboard.friends', 'Friends')}`}
                                    subValue={t('dashboard.earn_passive', 'Earn Passive %')}
                                    color="emerald"
                                />
                            </div>

                            {/* Investment & Referral Stats */}
                            {(stats.totalInvested > 0 || stats.referralCount > 0) && (
                                <div className="md:col-span-3 mt-6 pt-6 border-t border-white/5">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-gold-400" />
                                        {t('dashboard.investment_stats', 'Investment & Referral Stats')}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stats.totalInvested > 0 && (
                                            <>
                                                <div className="bg-gradient-to-br from-gold-500/10 to-amber-500/5 border border-gold-500/20 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-gold-500/20 rounded-lg">
                                                            <Coins className="w-5 h-5 text-gold-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-gold-300/70 uppercase font-black">
                                                                {t('dashboard.total_invested', 'Total Invested')}
                                                            </div>
                                                            <div className="text-xl font-black text-gold-300">
                                                                ${stats.totalInvested.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gold-200/60">
                                                        {stats.purchaseCount} {t('dashboard.purchases', 'purchases')}
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                                            <Target className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-blue-300/70 uppercase font-black">
                                                                {t('dashboard.tokens_purchased', 'Tokens Purchased')}
                                                            </div>
                                                            <div className="text-xl font-black text-blue-300">
                                                                {stats.totalTokensPurchased.toLocaleString()} PRG
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {stats.investorTierName && (
                                                        <div className="text-xs text-blue-200/60 flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> {stats.investorTierName}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {stats.referralCount > 0 && (
                                            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                        <Users className="w-5 h-5 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-emerald-300/70 uppercase font-black">
                                                            {t('dashboard.referral_earnings', 'Referral Earnings')}
                                                        </div>
                                                        <div className="text-xl font-black text-emerald-300">
                                                            {stats.referralTokensEarned.toLocaleString()} PRG
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-emerald-200/60">
                                                    {stats.referralCount} {t('dashboard.referrals_made', 'referrals')} • ${stats.totalReferralVolume.toLocaleString()} {t('dashboard.volume', 'volume')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="md:col-span-3 mt-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> {t('dashboard.shield_note', 'Want to earn more? Launch the game and keep tapping!')}
                                </div>
                                <a
                                    href="https://t.me/pierogicoin_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold flex items-center gap-2 hover:bg-white/10 hover:border-gold-500/30 transition-all group"
                                >
                                    {t('dashboard.open_game', 'Open Game')} <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        </motion.div>
                    ) : !loading && (
                        <div className="text-center py-10 opacity-30 select-none grayscale pointer-events-none">
                            <div className="max-w-[200px] mx-auto border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center gap-2">
                                <User className="w-10 h-10" />
                                <p className="text-xs uppercase font-black">{t('dashboard.no_data', 'No Data Found')}</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

function StatItem({ icon, label, value, subValue, color }: { icon: any, label: string, value: string, subValue: string, color: 'gold' | 'blue' | 'purple' | 'emerald' }) {
    const colorClasses = {
        gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors border-l-4 border-l-gold-500/30">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]} border`}>
                {icon}
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">{label}</div>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{subValue}</div>
        </div>
    );
}
