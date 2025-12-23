'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PresaleProvider } from '@/context/PresaleContext';
import AuditFundTracker from '@/components/AuditFundTracker';
import PurchaseModal from '@/components/Funding/PurchaseModal';
import PurchasePanel from '@/components/Buy/PurchasePanel';
import { motion } from 'framer-motion';
import { Shield, Rocket, Users, CheckCircle } from 'lucide-react';
import { PROJECT_STATS } from '@/data/projectData';
import { useFundStats } from '@/hooks/useFundStats';
import { useGameStats } from '@/hooks/useGameStats';
import Link from 'next/link';
import ReferralSection from '@/components/Buy/ReferralSection';
import NextPhaseSection from '@/components/Buy/NextPhaseSection';

export default function BuyTokensPage() {
  const { t } = useTranslation(['buy-tokens-page', 'common']);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [selectedTier, setSelectedTier] = useState<{ name: string; amount: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fundStats = useFundStats();
  const { stats: gameStats } = useGameStats();

  // Capture referral
  React.useEffect(() => {
    if (searchParams) {
      const ref = searchParams.get('ref');
      if (ref) {
        localStorage.setItem('referrer', ref);
        console.log('[Referral] Captured referrer:', ref);
      }
    }
  }, [searchParams]);

  const handleBuy = (tierName?: string, amount?: number) => {
    if (tierName && amount) {
      setSelectedTier({ name: tierName, amount });
    } else {
      setSelectedTier(null);
    }
    setIsModalOpen(true);
  };

  const tiers = [
    {
      name: t('tiers_list.starter.name', 'Founder Initiate'),
      price: 50,
      tokens: '1,250,000',
      bonus: 'Badge + x1.1 Boost',
      features: t('tiers_list.starter.features', { returnObjects: true }) as string[] || [],
    },
    {
      name: t('tiers_list.investor.name', 'Founder Visionary'),
      price: 150,
      tokens: '3,750,000',
      bonus: 'Badge + x1.25 Boost',
      popular: true,
      features: t('tiers_list.investor.features', { returnObjects: true }) as string[] || [],
    },
    {
      name: t('tiers_list.whale.name', 'Genesis Legend'),
      price: 500,
      tokens: '12,500,000',
      bonus: 'Badge + x1.5 Boost',
      features: t('tiers_list.whale.features', { returnObjects: true }) as string[] || [],
    },
  ];

  return (
    <PresaleProvider>
      <motion.main
        className="relative z-10 container mx-auto px-4 md:pt-16 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* --- Hero Section --- */}
        <div className="max-w-4xl mx-auto mb-20 text-center relative">
          {/* Decorative background glow for hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold tracking-wider mb-8 uppercase shadow-lg shadow-gold-500/5">
              <Shield className="w-4 h-4" /> {t('badge', 'Audit Fund Presale')}
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            {t('hero_title', 'Secure the Future')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-orange-500 drop-shadow-sm">
              PierogiCoin
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {t('hero_subtitle', 'Join the exclusive presale to fund our CertiK Audit.')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <button
              onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl bg-gold-500 text-black font-bold text-lg hover:bg-gold-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            >
              {t('cta_hero', 'Join Presale')}
            </button>
            <Link
              href="/whitepaper"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              {t('common:whitepaper', 'Read Whitepaper')}
            </Link>
          </div>


          {/* Audit Fund Data */}
          <div className="relative transform hover:scale-[1.01] transition-transform duration-500">
            <AuditFundTracker
              currentAmount={fundStats.usdRaised}
              targetAmount={PROJECT_STATS.targetFund}
              activePlayers={gameStats.activePlayers || PROJECT_STATS.activePlayers}
              prgEarnedToday={gameStats.totalEarned || PROJECT_STATS.prgEarnedToday}
            />
          </div>
        </div>

        {/* --- How It Works Scroller --- */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('process_title', 'How to Participate?')}</h2>
            <div className="h-1 w-20 bg-gold-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: t('process_steps.step1.title'), desc: t('process_steps.step1.desc') },
              { step: '02', title: t('process_steps.step2.title'), desc: t('process_steps.step2.desc') },
              { step: '03', title: t('process_steps.step3.title'), desc: t('process_steps.step3.desc') },
              { step: '04', title: t('process_steps.step4.title'), desc: t('process_steps.step4.desc') }
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <div className="text-4xl font-black text-white/10 mb-2">{s.step}</div>
                <h3 className="text-gold-400 font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Tiers Section --- */}
        <div id="tiers" className="scroll-mt-24 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('tiers_title', 'Choose Your Tier')}</h2>
            <p className="text-gray-400">{t('tiers_subtitle', 'Higher tiers unlock exclusive roles and bonuses.')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex flex-col rounded-3xl p-8 border backdrop-blur-xl transition-all duration-300 group
                  ${tier.popular
                    ? 'bg-gradient-to-b from-[#1a1a24] to-[#0d0d14] border-gold-500/50 shadow-[0_0_30px_rgba(250,204,21,0.1)] z-10 scale-105 md:-translate-y-4'
                    : 'bg-[#0d0d14]/60 border-white/10 hover:border-gold-500/30 hover:bg-[#15151e]'
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-amber-500 text-black font-extrabold px-6 py-1.5 rounded-full text-sm shadow-lg tracking-wide uppercase">
                    {t('popular_badge', 'Most Popular')}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-gold-400' : 'text-white'}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">${tier.price}</span>
                    <span className="text-gray-400 font-medium text-lg">USD</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Prg Tokens</span>
                      <span className="text-white font-bold">{tier.tokens}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-sm font-bold">Total Bonus</span>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded font-bold">+{tier.bonus}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {Array.isArray(tier.features) && tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                        <CheckCircle className={`w-5 h-5 shrink-0 ${tier.popular ? 'text-gold-500' : 'text-gray-600 group-hover:text-gold-500/70'} transition-colors`} />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleBuy(tier.name, tier.price)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${tier.popular
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-black hover:scale-[1.02] shadow-lg shadow-gold-500/20'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                    }`}
                >
                  {t('contribute_btn', 'Contribute Now')}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- Custom Amount Section (Slider/Manual) --- */}
        <div className="max-w-4xl mx-auto mb-24 px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('custom_amount.title', 'Or Enter Custom Amount')}</h2>
            <p className="text-gray-400">{t('custom_amount.subtitle', 'Use the slider or type any amount to buy PRG')}</p>
          </div>

          <div className="bg-[#0d0d14]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
            <PurchasePanel />
          </div>
        </div>

        {/* --- Referral Section --- */}
        <ReferralSection />

        {/* --- Next Phase Section --- */}
        <NextPhaseSection />


        {/* --- Why Audit Section --- */}
        <div className="max-w-6xl mx-auto border-t border-white/10 pt-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                {t('why_audit', 'Why do we need an Audit?')}
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                {t('why_audit_desc', 'Security is our #1 priority. A CertiK audit is not just a badge—it verifies our code logic, secures user funds, and is a mandatory requirement for listing on Tier-1 exchanges.')}
              </p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Shield, title: t('audit_features.security.title'), desc: t('audit_features.security.desc') },
                  { icon: Users, title: t('audit_features.trust.title'), desc: t('audit_features.trust.desc') },
                  { icon: Rocket, title: t('audit_features.exchange.title'), desc: t('audit_features.exchange.desc') }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-3 bg-black/40 rounded-lg text-gold-500 border border-white/10">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-gold-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="bg-[#0f0f16] border border-white/10 p-6 rounded-2xl shadow-xl aspect-square flex flex-col justify-center items-center text-center">
                    <Shield className="w-12 h-12 text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-xs text-gray-400">{t('stats.secure_code')}</div>
                  </div>
                  <div className="bg-[#0f0f16] border border-white/10 p-6 rounded-2xl shadow-xl aspect-square flex flex-col justify-center items-center text-center">
                    <Users className="w-12 h-12 text-blue-400 mb-2" />
                    <div className="text-2xl font-bold text-white">4.2k+</div>
                    <div className="text-xs text-gray-400">{t('stats.active_holders')}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0f0f16] border border-white/10 p-6 rounded-2xl shadow-xl aspect-square flex flex-col justify-center items-center text-center">
                    <Rocket className="w-12 h-12 text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-white">Q1 &apos;25</div>
                    <div className="text-xs text-gray-400">{t('stats.listing_target')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gold-500 to-amber-600 p-6 rounded-2xl shadow-xl aspect-square flex flex-col justify-center items-center text-center border border-white/20">
                    <div className="text-3xl font-black text-black mb-1">PRG</div>
                    <div className="text-sm font-bold text-black/70">{t('stats.future_motto')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="mt-8 max-w-2xl mx-auto px-6 py-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/80 leading-relaxed text-left">
                {t('utility_notice')}
              </p>
            </div>
          </div>
        </div>

        <PurchaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tierName={selectedTier?.name}
          tierAmount={selectedTier?.amount}
        />

      </motion.main>
    </PresaleProvider >
  );
}