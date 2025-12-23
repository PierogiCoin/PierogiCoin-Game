'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap } from 'lucide-react';

export default function AirdropCalculator() {
    const [hoursPlayed, setHoursPlayed] = useState(2);
    const [tasksCompleted, setTasksCompleted] = useState(5);
    const [referrals, setReferrals] = useState(0);

    // Simplified Algo based on Sustainable Phase 1 ECONOMY.ts
    const baseRate = 300; // PRG per hour (Energy regen + Spins)
    const taskBonus = 250; // Avg Daily Task/Login
    const referralBonus = 1000; // Matches ECONOMY.REFERRAL_REWARD

    const dailyEarnings = (hoursPlayed * baseRate) + (tasksCompleted * taskBonus);
    const totalEstimation = (dailyEarnings * 30) + (referrals * referralBonus); // Monthly + Refs

    return (
        <div className="relative px-4 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Intro */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <Calculator className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">Play-to-Airdrop</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Oblicz Swoje <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Potencjalne Zarobki
                            </span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            W ekosystemie Pieroga czas to pieniądz. Użyj kalkulatora, aby sprawdzić, ile PRG możesz zarobić, grając i zapraszając znajomych.
                        </p>
                    </motion.div>

                    {/* Calculator Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                    >
                        {/* Glowing Border effect */}
                        <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />

                        <div className="space-y-8">
                            {/* Hours Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Dzienny czas gry</label>
                                    <span className="text-gold-400 font-bold">{hoursPlayed} godz.</span>
                                </div>
                                <input
                                    type="range" min="0" max="12" step="0.5"
                                    value={hoursPlayed} onChange={(e) => setHoursPlayed(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                />
                            </div>

                            {/* Tasks Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Ukończone zadania dzienne</label>
                                    <span className="text-blue-400 font-bold">{tasksCompleted} zadań</span>
                                </div>
                                <input
                                    type="range" min="0" max="20" step="1"
                                    value={tasksCompleted} onChange={(e) => setTasksCompleted(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Referrals Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-300">Zaproszeni znajomi (Suma)</label>
                                    <span className="text-green-400 font-bold">{referrals} znajomych</span>
                                </div>
                                <input
                                    type="range" min="0" max="50" step="1"
                                    value={referrals} onChange={(e) => setReferrals(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>

                            {/* Result Box */}
                            <div className="bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-2xl p-6 border border-gold-500/20 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 animate-shimmer" />

                                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Szac. miesięczne zarobki</p>
                                <div className="text-5xl font-black text-white flex items-center justify-center gap-2 mb-2">
                                    <Zap className="w-8 h-8 text-gold-400 fill-gold-400" />
                                    {totalEstimation.toLocaleString()}
                                </div>
                                <p className="text-gold-500 font-medium text-sm">Tokenów PRG</p>
                            </div>

                            <a href="https://t.me/PRGWHEEL_bot" target="_blank" className="block w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-center hover:bg-gray-200 transition-colors">
                                Zacznij Zarabiać Teraz
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
