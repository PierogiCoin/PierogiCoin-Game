'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Layout, Trophy, Star,
    Coins, Zap, Shield, Target,
    ExternalLink, Loader2, Users, LogIn
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';

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

export default function MyGameDashboard() {
    const { t } = useTranslation('buy-tokens-page');
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                setUser(authUser);
                await fetchUserStats(authUser.id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Auth error:', err);
            setLoading(false);
        }
    };

    const fetchUserStats = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/game/my-stats`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else if (!data.stats && data.error === 'No game account found') {
                // User not found in game DB, but request was successful
                setError(data.error);
            } else {
                setStats(data.stats);
            }
        } catch (err) {
            setError('Failed to load your game data');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });
                if (error) throw error;
                if (data.user && data.session) {
                    setUser(data.user);
                    await fetchUserStats(data.user.id);
                } else if (data.user) {
                    setAuthMessage({ type: 'success', text: t('dashboard.check_email', 'Check your email for the confirmation link!') });
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    setUser(data.user);
                    await fetchUserStats(data.user.id);
                }
            }
        } catch (err: any) {
            setAuthMessage({ type: 'error', text: err.message || 'Authentication failed' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setStats(null);
    };

    if (loading) {
        return (
            <section className="max-w-4xl mx-auto mb-24 px-4" id="my-dashboard">
                <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0a0a0f]/80 backdrop-blur-2xl p-8 md:p-12">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                    </div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="max-w-4xl mx-auto mb-24 px-4" id="my-dashboard">
                <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0a0a0f]/80 backdrop-blur-2xl p-8 md:p-12">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold mb-4 uppercase tracking-wider">
                            <Layout className="w-3 h-3" /> {t('dashboard.title', 'Player Dashboard')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            {t('dashboard.my_stats', 'My Game Stats')}
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            {t('dashboard.sign_in_prompt', 'Sign in to view your personal game statistics and investment history')}
                        </p>
                        <form onSubmit={handleAuth} className="max-w-sm mx-auto space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder={t('dashboard.email_placeholder', 'Email address')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder={t('dashboard.password_placeholder', 'Password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-500/50 transition-all"
                                />
                            </div>

                            {authMessage && (
                                <div className={`text-sm ${authMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {authMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
                            >
                                {authLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <LogIn className="w-5 h-5" />
                                )}
                                {isSignUp ? t('dashboard.sign_up', 'Create Account') : t('dashboard.sign_in', 'Sign In')}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm text-gray-400 hover:text-gold-400 transition-colors"
                            >
                                {isSignUp
                                    ? t('dashboard.already_have_account', 'Already have an account? Sign In')
                                    : t('dashboard.need_account', 'Don\'t have an account? Sign Up')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-4xl mx-auto mb-24 px-4" id="my-dashboard">
            <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0a0a0f]/80 backdrop-blur-2xl p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(250,204,21,0.1)]">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold mb-4 uppercase tracking-wider">
                        <Layout className="w-3 h-3" /> {t('dashboard.title', 'Player Dashboard')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        {t('dashboard.my_stats', 'My')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">{t('dashboard.headline_highlight', 'Game Progress')}</span>
                    </h2>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 max-w-xl mx-auto text-sm mb-4">
                            {user.email}
                        </p>
                        <button
                            onClick={handleSignOut}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors underline"
                        >
                            {t('dashboard.sign_out', 'Sign Out')}
                        </button>
                    </div>
                </div>

                {/* Dashboard View */}
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10"
                        >
                            <p className="text-red-400 font-bold mb-2">{error}</p>
                            <p className="text-gray-500 text-sm mb-6">
                                {t('dashboard.no_game_account', 'No game account found. Start playing to see your stats!')}
                            </p>
                            <a
                                href="https://t.me/pierogicoin_bot"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10"
                            >
                                {t('dashboard.open_game', 'Open Game')} <ExternalLink className="w-4 h-4" />
                            </a>
                        </motion.div>
                    ) : stats ? (
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
                    ) : (
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
