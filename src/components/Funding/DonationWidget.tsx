'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Copy, Check, ExternalLink, Heart, QrCode, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const SOLANA_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SOLANA_WALLET || "PleaseConfigureWalletInEnv";

export default function DonationWidget() {
    const { t } = useTranslation('funding-hub');
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SOLANA_WALLET_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = t('donation_widget.share_text', { defaultValue: "I just supported the PierogiCoin Audit Fund! 🥟 #PierogiCoin $PRG" });
        const url = "https://pierogimeme.io";
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                    <Heart className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{t('donation_widget.title')}</h3>
                    <p className="text-xs text-gray-400">{t('donation_widget.subtitle')}</p>
                </div>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm hover:border-pink-500/30 transition-colors group relative overflow-hidden">

                {/* QR Code Overlay */}
                <AnimatePresence>
                    {showQr && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-gray-900/95 z-20 flex flex-col items-center justify-center p-6"
                        >
                            <div className="bg-white p-2 rounded-xl mb-4">
                                <Image
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${SOLANA_WALLET_ADDRESS}`}
                                    alt="Wallet QR"
                                    width={160}
                                    height={160}
                                    unoptimized
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-mono break-all mb-4 px-2 text-center">{SOLANA_WALLET_ADDRESS}</p>
                            <button
                                onClick={() => setShowQr(false)}
                                className="text-sm text-pink-400 font-bold hover:text-pink-300"
                            >
                                {t('donation_widget.close_qr')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <Coffee className="w-8 h-8 text-white" />
                </div>

                <h4 className="text-lg font-bold text-white mb-2">{t('donation_widget.buy_coffee')}</h4>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    {t('donation_widget.coffee_desc')}
                </p>

                {/* Crypto Donation */}
                <div className="w-full mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-uppercase font-bold text-gray-500">{t('donation_widget.via_solana')}</p>
                        <button
                            onClick={() => setShowQr(true)}
                            className="text-xs flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
                        >
                            <QrCode className="w-3 h-3" /> {t('donation_widget.show_qr')}
                        </button>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-700 hover:border-pink-500/50 hover:bg-black/60 transition-all group/btn"
                    >
                        <code className="text-xs text-gray-300 font-mono truncate mr-2">
                            {SOLANA_WALLET_ADDRESS.slice(0, 8)}...{SOLANA_WALLET_ADDRESS.slice(-6)}
                        </code>
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-500 group-hover/btn:text-pink-400 transition-colors" />
                        )}
                    </button>
                    <AnimatePresence>
                        {copied && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-xs text-green-400 mt-1"
                            >
                                {t('donation_widget.copied')}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                    <button
                        onClick={handleShare}
                        className="flex-1 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-sm font-semibold text-blue-400 flex items-center justify-center gap-2 transition-all"
                    >
                        <Share2 className="w-3 h-3" />
                        <span>{t('donation_widget.share_x')}</span>
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/stripe/checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        amountUSD: 5, // Default coffee price
                                        productType: 'coffee'
                                    })
                                });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                    >
                        <span>{t('donation_widget.stripe_fiat')}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                </div>

            </div>
        </div>
    );
}
