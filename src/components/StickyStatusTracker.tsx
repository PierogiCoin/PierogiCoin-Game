'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_STATS } from '@/data/projectData';
import { FiX, FiTrendingUp } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

import { useFundStats } from '@/hooks/useFundStats';

export default function StickyStatusTracker() {
    const { t } = useTranslation('common');
    const [isVisible, setIsVisible] = useState(false);
    const [closed, setClosed] = useState(false);
    const { usdRaised, loading } = useFundStats();

    // Fallback or use real data
    const currentFund = loading ? 0 : usdRaised;
    // For target, we can either keep using PROJECT_STATS (if it's the ultimate target) or logic from API
    // sticking to PROJECT_STATS.targetFund for the "Hard Cap" visual is fine if API doesn't send total cap
    const targetFund = PROJECT_STATS.targetFund;

    const progress = Math.min((currentFund / targetFund) * 100, 100);

    useEffect(() => {
        const handleScroll = () => {
            // Show only after scrolling past Hero (approx 600px)
            if (window.scrollY > 600) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (closed) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:right-auto md:left-8 md:w-96 z-50"
                >
                    <div className="bg-[#0b0f19]/90 backdrop-blur-md border border-gold-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={() => setClosed(true)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-white"
                        >
                            <FiX size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400 animate-pulse">
                                <FiTrendingUp />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('sticky.audit_live')}</div>
                                <div className="text-white font-bold text-lg leading-none">
                                    ${currentFund.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ ${targetFund.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mini Progress Bar */}
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-gold-500 to-amber-600"
                            />
                        </div>

                        <a
                            href="#funding-hub"
                            className="block w-full py-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-center text-sm rounded-lg transition-colors"
                        >
                            {t('sticky.support_cta')}
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
