'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';

export default function FloatingCTA() {
    const { t } = useTranslation('common');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling down 600px (past hero usually)
            if (window.scrollY > 600) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-20 right-6 z-[90] md:bottom-24 md:right-8"
                >
                    <Link href="/buy-tokens" className="group relative block" aria-label={t('nav.buy_tokens', 'Buy PRG Tokens')}>
                        {/* Glow effect */}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold-400 to-amber-600 opacity-75 blur transition duration-200 group-hover:opacity-100 animate-pulse"></div>

                        <button className="relative flex items-center gap-2 rounded-full bg-black px-6 py-3 min-h-[48px] font-bold text-white ring-1 ring-white/20 transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                            <span className="text-gold-400">
                                <FaShoppingCart size={20} />
                            </span>
                            <span className="bg-gradient-to-r from-gold-200 to-amber-400 bg-clip-text text-transparent group-hover:text-amber-300">
                                {t('nav.buy_tokens', 'Buy PRG')}
                            </span>
                        </button>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
