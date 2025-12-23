'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Share2, Award, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';

export default function ReferralSection() {
    const { t } = useTranslation('buy-tokens-page');
    const { publicKey } = useWallet();
    const [copied, setCopied] = useState(false);
    const [refLink, setRefLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const baseUrl = window.location.origin + window.location.pathname;
            const address = publicKey ? publicKey.toBase58() : '';
            setRefLink(`${baseUrl}?ref=${address}`);
        }
    }, [publicKey]);

    const handleCopy = () => {
        if (!publicKey) {
            toast.info(t('referral.connect_wallet_first', { defaultValue: 'Connect your wallet to get your personalized link!' }));
            return;
        }
        navigator.clipboard.writeText(refLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t('referral.link_copied', { defaultValue: 'Referral link copied!' }));
    };

    const handleShareX = () => {
        const text = t('referral.share_text_x', {
            defaultValue: "I'm supporting the PierogiCoin Audit Fund! 🥟 Use my link to get an extra 2% bonus on your PRG tokens! #PierogiCoin $PRG"
        });
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refLink)}`, '_blank');
    };

    return (
        <section className="max-w-4xl mx-auto mb-24 px-4">
            <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-[#0d0d14]/80 backdrop-blur-xl p-8 md:p-10">
                {/* Decorative background Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold mb-4 uppercase tracking-wider">
                            <Users className="w-3 h-3" /> {t('referral.title', 'Refer & Earn')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                            {t('referral.headline', 'Grow the Community,')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">
                                {t('referral.headline_highlight', 'Get Rewarded')}
                            </span>
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            {t('referral.invite_text', 'Invite your friends to the Audit Fund and earn 5% of their contribution value in PRG tokens. Your friends also get an extra 2% bonus on their purchase!')}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <Award className="w-6 h-6 text-gold-400 mb-2" />
                                <div className="text-white font-bold">{t('referral.you_get', 'You Get 5%')}</div>
                                <div className="text-xs text-gray-500">{t('referral.you_get_desc', 'In PRG tokens')}</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <Zap className="w-6 h-6 text-amber-400 mb-2" />
                                <div className="text-white font-bold">{t('referral.they_get', 'They Get +2%')}</div>
                                <div className="text-xs text-gray-500">{t('referral.they_get_desc', 'Extra Bonus')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-[350px] shrink-0">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <label className="block text-sm font-bold text-gray-400 mb-3 ml-1">
                                {t('referral.your_link', 'Your Referral Link')}
                            </label>

                            <div className="relative mb-4">
                                <div className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-gray-300 truncate pr-12">
                                    {publicKey ? refLink : 'Connect wallet to see link...'}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gold-500 text-black hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleShareX}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all hover:border-gold-500/30"
                                >
                                    <Share2 className="w-4 h-4" />
                                    {t('referral.share_x', 'Share on X')}
                                </button>
                            </div>

                            {!publicKey && (
                                <p className="mt-4 text-[10px] text-center text-amber-500/80 font-medium">
                                    {t('referral.connect_hint', 'Please connect your wallet to generate a valid referral address.')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
