'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, BarChart3, Lock } from 'lucide-react';

export default function NextPhaseSection() {
    const { t } = useTranslation('buy-tokens-page');

    const steps = [
        {
            icon: Lock,
            title: t('next_phase.active_title', 'Phase 1: Security Audit'),
            status: 'active',
            desc: t('next_phase.active_desc', 'Current goal: $15,000 for CertiK Audit & Legal. Guaranteed lowest price.')
        },
        {
            icon: Globe,
            title: t('next_phase.phase2', 'Phase 2: Global Presale'),
            status: 'upcoming',
            desc: t('next_phase.description', 'Listing fund & Liquidity. Global marketing expansion.')
        }
    ];

    return (
        <section className="max-w-5xl mx-auto mb-24 px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-4">{t('next_phase.title', 'Project Evolution')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('next_phase.subtitle', 'Our journey is divided into strategic milestones. Each phase increases the project value.')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`relative p-8 rounded-3xl border ${step.status === 'active'
                                ? 'bg-gold-500/5 border-gold-500/30'
                                : 'bg-white/5 border-white/10 opacity-70'
                            }`}
                    >
                        {step.status === 'active' && (
                            <div className="absolute -top-3 left-8 bg-gold-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                {t('next_phase.status_active', 'Active Now')}
                            </div>
                        )}

                        <div className="flex gap-6">
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${step.status === 'active' ? 'bg-gold-500 text-black' : 'bg-white/10 text-gray-400'
                                }`}>
                                <step.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold mb-2 ${step.status === 'active' ? 'text-gold-400' : 'text-gray-300'}`}>
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {step.desc}
                                </p>

                                {step.status === 'upcoming' && (
                                    <div className="mt-4 inline-flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-tight">
                                        <BarChart3 className="w-4 h-4" />
                                        {t('next_phase.price_warning', 'Price will increase by 150%')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Connecting Arrow */}
            <div className="hidden md:flex justify-center -mt-3 relative z-10 pointer-events-none">
                <div className="bg-[#0a0a0f] p-2 rounded-full border border-white/10">
                    <ArrowRight className="w-6 h-6 text-gold-500" />
                </div>
            </div>
        </section>
    );
}
