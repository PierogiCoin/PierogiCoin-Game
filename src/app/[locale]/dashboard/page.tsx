'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Layout, Trophy, Star,
    Coins, Zap, Shield, Target,
    ExternalLink, Loader2, Users, LogIn,
    Copy, Check, Share2, Wallet,
    TrendingUp, Award, Clock,
    Link as LinkIcon, AlertCircle, Sparkles,
    ChevronRight, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'react-toastify';
import DashboardTopUp from '@/components/DashboardTopUp';

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

export default function UserDashboardPage() {
    const { t } = useTranslation(['buy-tokens-page', 'common']);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    // Auth form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const supabase = createClient();

    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        checkUser();
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/game/leaderboard');
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard');
        }
    };

    const checkUser = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                setUser(authUser);
                await fetchUserStats();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Auth error:', err);
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/game/my-stats`);
            const data = await res.json();

            if (res.ok && data.stats) {
                setStats(data.stats);
            } else if (!res.ok) {
                console.error('API Error:', data.error);
                // Optionally show toast for 500 errors
                if (res.status === 500) {
                    toast.error(t('common:database_error', 'Database error. Please try again later.'));
                }
            } else if (data.error === 'No game account found') {
                console.log('No game account found for this user.');
                // stats will remain null, leading to the "Connect your account" view
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyFounderPack = async () => {
        if (!user) {
            toast.error(t('login_required') || 'Please login first');
            return;
        }

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amountUSD: 4.99,
                    productType: 'game_item',
                    successUrl: `${window.location.origin}/dashboard?success=founder`,
                    cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
                    metadata: {
                        itemName: "Klub Założycieli (Founder Pack)",
                        itemId: "founder_tier_1",
                        userId: user.id
                    }
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Could not initiate checkout. Please try again.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Payment Error');
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
                    await fetchUserStats();
                } else if (data.user) {
                    setAuthMessage({ type: 'success', text: t('dashboard.check_email') });
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    setUser(data.user);
                    await fetchUserStats();
                }
            }
        } catch (err: any) {
            console.error('Auth error detailed:', err);
            let msg = err.message || 'Authentication failed';
            if (msg.includes('Invalid login credentials')) {
                msg = t('dashboard.error_invalid_credentials', 'Invalid email or password. Please try again.');
            }
            setAuthMessage({ type: 'error', text: msg });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setStats(null);
    };

    const copyReferralLink = () => {
        const usernameOrId = stats?.username || user?.id;
        if (!usernameOrId) return;
        const link = `${window.location.origin}/buy-tokens?ref=${usernameOrId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success(t('common:copied', 'Copied!'));
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-gold-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4">
                <div className="max-w-md mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-amber-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
                                <LogIn className="w-8 h-8 text-gold-500" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2">{t('dashboard.welcome_back')}</h1>
                            <p className="text-gray-400">{t('dashboard.sign_in_hint')}</p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-500/50 transition-all border-b-2 focus:border-b-gold-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('dashboard.password_placeholder')}</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-500/50 transition-all border-b-2 focus:border-b-gold-500"
                                />
                            </div>

                            {authMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-sm p-3 rounded-lg ${authMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                                >
                                    {authMessage.text}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full py-4 rounded-xl bg-gold-500 text-black font-black text-lg hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 group"
                            >
                                {authLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" /> {isSignUp ? t('dashboard.register_btn') : t('dashboard.login_btn')}</>}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2"
                            >
                                {isSignUp ? t('dashboard.already_have_account') : t('dashboard.need_account')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const referralLink = (stats?.username || user?.id) ? `${window.location.origin}/buy-tokens?ref=${stats?.username || user?.id}` : '';
    const refCount = stats?.referralCount || 0;
    const refLevel = refCount >= 50 ? 5 : refCount >= 20 ? 4 : refCount >= 10 ? 3 : refCount >= 5 ? 2 : refCount >= 1 ? 1 : 0;
    const refLevelName = ['Brak', 'Początkujący', 'Ambasador', 'Lider', 'Ekspert', 'Legenda'][refLevel];

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-900/10 via-black to-black">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                            <div className="relative w-24 h-24 rounded-2xl bg-black border border-gold-500/30 flex items-center justify-center text-5xl overflow-hidden shadow-2xl">
                                {stats?.avatarId || '👤'}
                            </div>
                            {stats && (
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gold-400 to-amber-500 w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-black text-black text-sm shadow-lg">
                                    {stats.level}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-white">
                                    {stats?.username ? `@${stats.username}` : user.email.split('@')[0]}
                                </h1>
                                {stats && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Połączono
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-gold-500/10 text-gold-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-gold-500/20">
                                    {stats?.founderTier === 3 ? 'Genesis Legend' : stats?.founderTier === 2 ? 'Founder Visionary' : stats?.founderTier === 1 ? 'Founder Initiate' : 'Commoner'}
                                </span>
                                <span className="text-gray-500 text-sm font-medium">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                    >
                        {t('dashboard.sign_out')}
                    </button>
                </div>

                {/* Founders Club Special Offer */}
                <div className="mb-12 relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0d0d12] p-8 md:p-12 shadow-[0_0_50px_rgba(234,179,8,0.1)] group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[100px] -mr-60 -mt-60 animate-pulse pointer-events-none" />


                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Sparkles className="w-3 h-3 animate-pulse" /> Limitowana Oferta
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                                    Klub Założycieli <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-500 to-gold-600">
                                        + Season Pass
                                    </span>
                                </h2>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0">
                                    Bądź jednym z pierwszych 1000 graczy wspierających PierogiCoin i zgarnij dożywotnie benefity.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><TrendingUp className="w-5 h-5" /></div>
                                    <div>
                                        <div className="font-bold text-white text-sm">Mnożnik Airdropu 1.5x</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black">Dożywotni Bonus</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><Zap className="w-5 h-5" /></div>
                                    <div>
                                        <div className="font-bold text-white text-sm">Unikalna Skórka</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black">Złoty Pieróg</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400"><Award className="w-5 h-5" /></div>
                                    <div>
                                        <div className="font-bold text-white text-sm">Wczesny Dostęp</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black">Prawo Głosu (Beta)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-96 bg-black/40 border border-gold-500/20 rounded-2xl p-6 backdrop-blur-sm relative">
                            {/* Content for pricing and buy button */}
                            {stats?.founderTier && stats.founderTier > 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 text-green-500">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Jesteś Założycielem!</h3>
                                    <p className="text-gray-400 text-sm">Twoje benefity są aktywne.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <div className="text-[10px] font-black text-gold-500/70 uppercase tracking-widest mb-1">Pakiet Założyciela</div>
                                            <div className="text-3xl font-black text-white">$4.99</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pozostało</div>
                                            <div className="text-lg font-bold text-white tabular-nums">999 / 1000</div>
                                        </div>
                                    </div>

                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                                        <div className="h-full bg-gold-500 w-[0.1%]" />
                                    </div>

                                    <button onClick={handleBuyFounderPack} className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-black text-lg hover:shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group/btn">
                                        Zostań Założycielem <ChevronRight className="w-5 h-5 font-bold group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-center text-[10px] text-gray-500 mt-4">Oferta bezzwrotna. Dostępna tylko raz na konto.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Stats Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Game Connection / Guide */}
                        <AnimatePresence mode="wait">
                            {!stats ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 rounded-3xl bg-blue-500/5 border-2 border-dashed border-blue-500/20 relative overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                                            <LinkIcon className="w-8 h-8" />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h3 className="text-xl font-bold text-white mb-2">Połącz swoje konto z grą!</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-4">
                                                Wygląda na to, że Twoje konto e-mail nie jest jeszcze powiązane z żadnym graczem.
                                                Uruchom grę na urządzeniu mobilnym lub w przeglądarce, używając tego samego adresu e-mail, aby odblokować statystyki.
                                            </p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                <a href="https://t.me/pierogicoin_bot" target="_blank" className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-400 transition-all group-hover:scale-105">
                                                    Uruchom Grę <ChevronRight className="w-4 h-4" />
                                                </a>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Info className="w-4 h-4" /> Użyj e-mail: {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-1 rounded-3xl bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30"
                                >
                                    <div className="bg-[#0a0a0f] rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-green-500/70 uppercase tracking-widest">Konto Powiązane</div>
                                                <div className="text-lg font-bold text-white">Grasz jako @{stats.username}</div>
                                            </div>
                                        </div>
                                        <div className="h-px w-full md:w-px md:h-8 bg-white/10" />
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">Poziom</div>
                                                <div className="font-black text-white">{stats.level}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">XP</div>
                                                <div className="font-black text-white">{stats.xp.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">Arena</div>
                                                <div className="font-black text-white">{stats.arenaPoints}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Balance & Quick Actions */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d12] p-8 md:p-10 shadow-2xl group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] -mr-40 -mt-40 rounded-full group-hover:bg-gold-500/10 transition-colors duration-1000"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest mb-4">
                                            <Wallet className="w-4 h-4 text-gold-500" />
                                            {t('dashboard.your_balance')}
                                        </div>
                                        <div className="text-7xl font-black text-white flex items-baseline gap-3 tracking-tighter">
                                            {(stats?.prg || 0).toLocaleString()} <span className="text-3xl text-gold-500">PRG</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-3 bg-indigo-500/10 px-5 py-3 rounded-2xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                                            <span className="text-2xl">💎</span>
                                            <div>
                                                <div className="text-[10px] text-indigo-400/70 font-black uppercase tracking-widest">Gems</div>
                                                <div className="text-indigo-200 font-bold leading-none">{stats?.gems || 0}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-amber-500/10 px-5 py-3 rounded-2xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                                            <Zap className="w-6 h-6 text-amber-500" />
                                            <div>
                                                <div className="text-[10px] text-amber-400/70 font-black uppercase tracking-widest">Energy / XP</div>
                                                <div className="text-amber-200 font-bold leading-none">{stats?.xp?.toLocaleString() || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-4">
                                    <Link href="/buy-tokens" className="group/btn relative px-8 py-5 rounded-2xl bg-gold-500 text-black font-black text-center overflow-hidden hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gold-500/20">
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {t('dashboard.buy_more_coins')} <Coins className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                                    </Link>
                                    <a href="https://t.me/pierogicoin_bot" target="_blank" className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-center hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                                        Uruchom Grę 🥟 <ExternalLink className="w-4 h-4 opacity-50" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Top Up Section */}
                        <DashboardTopUp user={user} />

                        {/* Gaming Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DashboardStatCard
                                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                                title="Arena & Rywalizacja"
                                value={`${(stats?.arenaPoints || 0).toLocaleString()} Pkt`}
                                subtitle={`${stats?.duelsWon || 0} Wygranych Pojedynków`}
                                trend="Top 1% Graczy"
                                color="gold"
                            />
                            <DashboardStatCard
                                icon={<Star className="w-6 h-6 text-purple-400" />}
                                title="Progres Achievements"
                                value={`${stats?.achievementsClaimed || 0} / 50`}
                                subtitle={`Ukończono ${stats?.tasksCompleted || 0} zadań specjalnych`}
                                trend="Level Master"
                                color="purple"
                            />
                        </div>

                        {/* Recent Activity List */}
                        <div className="bg-[#0d0d12] border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] -mr-20 -mt-20 rounded-full blur-3xl" />
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                <Clock className="w-5 h-5 text-gray-500" />
                                {t('dashboard.recent_activity')}
                            </h3>
                            <div className="space-y-4 relative z-10">
                                {stats?.totalInvested && stats.totalInvested > 0 ? (
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20 shadow-lg shadow-green-500/5">
                                                <Coins className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-white font-black text-lg">Zakup Tokenów PRG</div>
                                                <div className="text-xs text-gray-500 font-medium">Otrzymano {(stats.totalTokensPurchased).toLocaleString()} PRG</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-black text-xl">+${stats.totalInvested.toLocaleString()}</div>
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black tracking-widest border border-green-500/20">
                                                <Check className="w-3 h-3" /> SUKCES
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                                            <Clock className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-600 font-medium italic">{t('dashboard.no_activity')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Global Leaderboard Preview */}
                        <div className="bg-[#0d0d12] border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500/50 to-transparent" />

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Trophy className="w-6 h-6 text-gold-500" />
                                    Top 5 Graczy (Global)
                                </h3>
                                <button className="text-xs font-bold text-gold-500 hover:text-gold-400 uppercase tracking-widest transition-colors">
                                    Zobacz pełny ranking
                                </button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="space-y-3 relative z-10">
                                    {leaderboard.length > 0 ? leaderboard.map((player, i) => {
                                        const isMe = stats?.username === player.username;
                                        return (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-white/[0.04] ${isMe ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 flex items-center justify-center font-black rounded-lg text-xs ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                                                        #{i + 1}
                                                    </div>
                                                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-xl border border-white/10">
                                                        {player.avatar_id || '👤'}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold ${isMe ? 'text-gold-400' : 'text-white'}`}>
                                                            {player.username} {isMe && '(Ty)'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-bold">Lvl {player.level}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-white">{(player.arena_points || 0).toLocaleString()}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pkt Areny</div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                            Ładowanie rankingu...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Referrals & Investor Ranking */}
                    <div className="space-y-8">

                        {/* Referral System - Level Based */}
                        <div className="relative overflow-hidden rounded-3xl border-2 border-gold-500/30 bg-gradient-to-b from-[#1a1a24] to-[#0d0d14] p-8 shadow-2xl">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gold-500/10 blur-[60px] rounded-full"></div>

                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Users className="w-7 h-7 text-gold-500" />
                                    {t('referral.title')}
                                </h3>
                                <div className="px-3 py-1 bg-gold-500 text-black text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-gold-500/20">
                                    Lv {refLevel}
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-2xl p-5 border border-white/5 mb-8">
                                <div className="text-[10px] font-black text-gold-500/70 uppercase tracking-widest mb-2">Twój Status Poleceń</div>
                                <div className="text-2xl font-black text-white mb-4 italic">&quot;{refLevelName}&quot;</div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (refCount / 50) * 100)}%` }}
                                        className="h-full bg-gold-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500">
                                    <span>{refCount} poleceń</span>
                                    <span>Cel: 50 Ambasador</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Każde polecenie to <span className="text-gold-400 font-bold">5% bonusu</span> dla Ciebie i <span className="text-gold-400 font-bold">2%</span> dla Twojego znajomego!
                            </p>

                            <div className="space-y-6">
                                <div className="group/link">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">
                                        {t('dashboard.referral_link_label')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={referralLink || 'Ładowanie linku...'}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xs text-gold-300 font-mono focus:outline-none pr-14 group-hover/link:border-gold-500/30 transition-colors"
                                        />
                                        <button
                                            onClick={copyReferralLink}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-all shadow-lg active:scale-90"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">{t('dashboard.referred_count')}</div>
                                        <div className="text-3xl font-black text-white">{refCount}</div>
                                    </div>
                                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">{t('dashboard.earned_label')}</div>
                                        <div className="text-2xl font-black text-gold-400">{(stats?.referralTokensEarned || 0).toLocaleString()}</div>
                                        <div className="text-[10px] text-gold-500/50 font-black uppercase">PRG</div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gold-500/5 border border-gold-500/10 rounded-2xl flex items-center gap-5 group/box hover:bg-gold-500/10 transition-colors">
                                    <div className="w-14 h-14 bg-gold-500/20 rounded-2xl flex items-center justify-center text-gold-400 shrink-0 border border-gold-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-gold-500/10">
                                        <TrendingUp className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gold-300/60 uppercase tracking-widest mb-1">{t('dashboard.referral_volume')}</div>
                                        <div className="text-2xl font-black text-gold-500">${stats?.totalReferralVolume?.toLocaleString() || 0} <span className="text-xs font-bold text-gold-500/50">USD</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Investor Tier Card */}
                        <div className="rounded-3xl border border-white/10 bg-[#0d0d12] p-8 md:p-10 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <Award className="w-7 h-7 text-blue-400" />
                                {t('dashboard.investor_rank')}
                            </h3>

                            <div className="space-y-8">
                                <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative z-10 overflow-hidden">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform duration-500">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-white uppercase tracking-tight mb-1">{stats?.investorTierName || 'Neutral Founder'}</div>
                                        <div className="text-xs text-blue-400 font-black tracking-widest uppercase opacity-70">Total: ${stats?.totalInvested?.toLocaleString() || 0}</div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Award className="w-20 h-20 -mr-10 -mt-10" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">
                                            {t('dashboard.next_tier_progress', { tier: 'Silver' })}
                                        </div>
                                        <div className="text-lg font-black text-blue-400 leading-none">
                                            {Math.min(100, Math.floor((stats?.totalInvested || 0) / 500 * 100))}%
                                        </div>
                                    </div>
                                    <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.floor((stats?.totalInvested || 0) / 500 * 100))}%` }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-blue-300/60 leading-relaxed uppercase font-bold">
                                        Rangi inwestora odblokowują specjalne aury w grze oraz ekskluzywne przedmioty kosmetyczne.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            <div className="mt-10 py-5 text-center opacity-30 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-red-500 font-mono">
                    DEBUG: URL={process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 12) + '...' : 'UNDEFINED'} <br />
                    KEY={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 6) + '...' : 'UNDEFINED'}
                </p>
            </div>

        </div>
    );
}

function DashboardStatCard({ icon, title, value, subtitle, trend, color }: { icon: any, title: string, value: string, subtitle: string, trend?: string, color: 'gold' | 'purple' }) {
    const colorStyles = {
        gold: 'hover:border-gold-500/20 shadow-gold-500/5',
        purple: 'hover:border-purple-500/20 shadow-purple-500/5'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-[#0d0d12] border border-white/5 rounded-3xl p-8 transition-all group relative overflow-hidden shadow-2xl ${colorStyles[color]}`}
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.01] rounded-full -mr-20 -mt-20 group-hover:bg-white/[0.03] transition-colors duration-700" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`p-4 bg-white/5 rounded-2xl group-hover:bg-${color === 'gold' ? 'gold' : 'purple'}-500/10 transition-colors border border-white/5 group-hover:border-${color === 'gold' ? 'gold' : 'purple'}-500/20 shadow-lg`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black text-${color === 'gold' ? 'gold' : 'purple'}-400 bg-${color === 'gold' ? 'gold' : 'purple'}-500/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-${color === 'gold' ? 'gold' : 'purple'}-500/20 shadow-sm`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{title}</div>
                <div className="text-4xl font-black text-white mb-2 tracking-tight">{value}</div>
                <div className="text-sm text-gray-400 font-medium leading-relaxed">{subtitle}</div>
            </div>
        </motion.div>
    );
}
