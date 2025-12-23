'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Wallet, ArrowRight, ArrowLeft, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    tierName?: string;
    tierAmount?: number;
}

const PRESALE_RATE = 2000;
const SOLANA_WALLET = process.env.NEXT_PUBLIC_RECEIVE_WALLET || process.env.NEXT_PUBLIC_SOLANA_WALLET || "So11111111111111111111111111111111111111112";

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center gap-3 mb-6">
        {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
                <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${s === currentStep
                        ? 'bg-gold-500 border-gold-500 text-black'
                        : s < currentStep
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white/5 border-white/20 text-gray-500'
                        }`}
                    animate={{ scale: s === currentStep ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {s < currentStep ? <Check className="w-4 h-4" /> : s}
                </motion.div>
                {s < 2 && (
                    <div className={`w-12 h-0.5 rounded-full transition-colors ${currentStep > 1 ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                )}
            </div>
        ))}
    </div>
);

// Quick amount presets
const QUICK_AMOUNTS = [50, 100, 250, 500];

export default function PurchaseModal({ isOpen, onClose, tierName, tierAmount }: PurchaseModalProps) {
    const { t } = useTranslation('common');
    const [amount, setAmount] = useState<string>(tierAmount ? tierAmount.toString() : '100');
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for back

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setCopied(false);
            if (tierAmount) setAmount(tierAmount.toString());
        }
    }, [isOpen, tierAmount]);

    const prgAmount = parseInt(amount || '0') * PRESALE_RATE;

    const handleCopy = () => {
        navigator.clipboard.writeText(SOLANA_WALLET);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleNext = () => {
        setDirection(1);
        setStep(2);
    };

    const handleBack = () => {
        setDirection(-1);
        setStep(1);
    };

    if (!isOpen) return null;

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 })
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/85 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full max-w-lg bg-gradient-to-b from-[#0e121b] to-[#080a10] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Top glow */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gold-500/10">
                                <Coins className="w-5 h-5 text-gold-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {step === 1 ? t('purchase.title', 'Secure Your PRG') : t('purchase.payment', 'Complete Payment')}
                            </h3>
                        </div>
                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Step Indicator */}
                    <div className="px-6 pt-6">
                        <StepIndicator currentStep={step} />
                    </div>

                    {/* Body with animated transitions */}
                    <div className="p-6 pt-2 overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">{t('purchase.amount_usd', 'Contribution Amount (USD)')}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-lg">$</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-black/50 border border-gold-500/30 rounded-xl py-4 pl-10 pr-4 text-white font-bold text-lg focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                                                min="10"
                                            />
                                        </div>
                                        {/* Quick amount buttons */}
                                        <div className="flex gap-2 mt-3">
                                            {QUICK_AMOUNTS.map((qa) => (
                                                <motion.button
                                                    key={qa}
                                                    onClick={() => setAmount(qa.toString())}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${amount === qa.toString()
                                                        ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                                        }`}
                                                >
                                                    ${qa}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <motion.div
                                        className="bg-gradient-to-r from-gold-500/10 to-amber-500/10 border border-gold-500/20 rounded-xl p-5 text-center"
                                        animate={{ scale: [1, 1.01, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <p className="text-sm text-gold-400 mb-1">{t('purchase.you_receive', 'You Receive')}</p>
                                        <p className="text-4xl font-black text-white">{prgAmount.toLocaleString()} <span className="text-gold-400">PRG</span></p>
                                        {tierName && <p className="text-xs text-gray-400 mt-2">{t('purchase.tier_bonus', 'Includes {{tier}} tier benefits', { tier: tierName })}</p>}
                                    </motion.div>

                                    <motion.button
                                        onClick={handleNext}
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(251,191,36,0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl font-bold text-black text-lg shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
                                    >
                                        {t('purchase.proceed', 'Proceed to Payment')}
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="space-y-5"
                                >
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <Wallet className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-300 font-medium">{t('purchase.solana_instruction', 'Send exactly {{amount}} USD worth of SOL or USDC to:', { amount })}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded font-medium">SOL</span>
                                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded font-medium">USDC</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="w-full bg-black/60 border border-gold-500/30 rounded-xl py-4 px-4 text-sm text-gray-300 font-mono break-all pr-14 group-hover:border-gold-500/50 transition-colors">
                                            {SOLANA_WALLET}
                                        </div>
                                        <motion.button
                                            onClick={handleCopy}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${copied ? 'bg-green-500/20' : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {copied ? (
                                                    <motion.div
                                                        key="check"
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Check className="w-5 h-5 text-green-400" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="copy"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Copy className="w-5 h-5 text-gold-500" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                        {copied && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -bottom-8 right-0 text-xs text-green-400 font-medium"
                                            >
                                                ✓ Address copied!
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="text-center pt-4">
                                        <p className="text-sm text-gray-400 mb-4">{t('purchase.confirm_note', 'Tokens will be airdropped to your sending address within 24h.')}</p>
                                        <motion.button
                                            onClick={onClose}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white text-lg shadow-lg shadow-green-500/20"
                                        >
                                            {t('purchase.i_have_sent', 'I Have Sent Funds')} ✓
                                        </motion.button>
                                        <motion.button
                                            onClick={handleBack}
                                            whileHover={{ x: -3 }}
                                            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            {t('common.back', 'Back')}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

