'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieBanner() {
    const { t } = useTranslation('common');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('prg_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('prg_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('prg_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[100] max-w-md w-full"
                >
                    <div className="relative bg-[#0a0a12]/95 backdrop-blur-xl border border-gold-500/30 rounded-2xl p-6 shadow-2xl shadow-black/60">
                        {/* Close button */}
                        <motion.button
                            onClick={handleDecline}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label={t('cookies.close', 'Close')}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>

                        {/* Top glow accent */}
                        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                        <div className="flex flex-col gap-4 pr-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    🍪 {t('cookies.title', 'We use cookies')}
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {t(
                                        'cookies.description',
                                        'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.'
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                <motion.button
                                    onClick={handleDecline}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 hover:border-white/20"
                                >
                                    {t('cookies.decline', 'Decline')}
                                </motion.button>
                                <motion.button
                                    onClick={handleAccept}
                                    whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(251,191,36,0.4)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-900 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 rounded-xl transition-all shadow-lg shadow-gold-500/25"
                                >
                                    {t('cookies.accept', 'Accept All')}
                                </motion.button>
                            </div>

                            <div className="text-xs text-gray-400 text-center sm:text-left">
                                <Link href="/privacy-policy" className="hover:text-gold-400 underline decoration-gray-600 underline-offset-2 transition-colors">
                                    {t('cookies.policy_link', 'Read our Privacy Policy')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
