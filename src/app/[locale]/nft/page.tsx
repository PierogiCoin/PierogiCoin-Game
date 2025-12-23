'use client';

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDiscord, FaTwitter, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// import NFTRevealCard from '@/components/NFT/NFTRevealCard';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 50, damping: 20 }
  },
};

export default function NFTPage() {
  const { t } = useTranslation(['nft-page', 'common']);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscription = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('common:validation.email_invalid', 'Invalid email address'));
      return;
    }
    try {
      setState('loading');
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      toast.success(t('subscription.success', 'You are on the list!'));
      setState('success');
      setEmail('');
    } catch {
      toast.error(t('common:errors.generic', 'Something went wrong.'));
      setState('idle');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center">

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-0 pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 text-center max-w-4xl py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-block px-5 py-2 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)]">
              {t('coming_soon_badge', 'WKRÓTCE')}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-2xl"
          >
            <span className="text-white">Pierogi</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-yellow-500 to-amber-600">
              Coin NFT
            </span>
          </motion.h1>

          {/* Sneak Peek Grid - HIDDEN FOR NOW
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center py-10"
          >
            <NFTRevealCard
              name="Cyber Chef #042"
              revealImage="/images/nfts/pierogi-nft-1.webp"
              rarity="Rare"
            />
            <NFTRevealCard
              name="Golden Dumpling"
              revealImage="/images/nfts/pierogi-nft-2.webp"
              rarity="Legendary"
            />
            <NFTRevealCard
              name="Grandma's Secret"
              revealImage="/images/nfts/pierogi-nft-3.webp"
              rarity="Epic"
            />
          </motion.div>
          */}

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            {t('coming_soon_desc', 'Our NFT collection is currently baking in the oven. Join the whitelist to be the first to taste the future of trad-fi cuisine.')}
          </motion.p>

          {/* Email Subscription */}
          <motion.div variants={itemVariants} className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center gap-3"
                >
                  <FaCheckCircle className="text-2xl" />
                  <span className="font-bold">{t('subscription.thanks', 'Dzięki! Powiadomimy Cię.')}</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscription} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-amber-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                  <div className="relative flex shadow-2xl rounded-xl overflow-hidden">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('common:form.email_placeholder', 'Twój adres email...')}
                      className="w-full px-6 py-4 bg-[#0d0d14] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                      required
                    />
                    <button
                      type="submit"
                      disabled={state === 'loading'}
                      className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-8 py-4 transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {state === 'loading' ? '...' : t('subscription.notify_me', 'Powiadom Mnie')}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
            <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest opacity-60">
              {t('subscription.spam_disclaimer', 'Zero spamu. Tylko konkrety.')}
            </p>
          </motion.div>

          {/* Socials */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-6 pt-8"
          >
            <a
              href="https://discord.com/invite/RAGDZyQZ8a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-400 transition-colors transform hover:scale-110"
            >
              <FaDiscord size={32} />
            </a>
            <a
              href="https://x.com/PRGCoin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
            >
              <FaTwitter size={32} />
            </a>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer Ambient Light */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
    </div>
  );
}
