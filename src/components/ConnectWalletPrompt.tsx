// Plik: src/components/ConnectWalletPrompt.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
// ULEPSZENIE: Importujemy nową, bardziej pasującą ikonę
import { FaWallet } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamicznie importujemy przycisk portfela, aby uniknąć problemów z SSR.
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  {
    ssr: false,
    // Wyświetlamy prosty placeholder podczas ładowania przycisku
    loading: () => (
      <button className="w-full max-w-xs mx-auto px-6 py-3 rounded-full bg-cyber-600/50 text-white font-semibold animate-pulse">
        Ładowanie portfela...
      </button>
    )
  }
);

const ConnectWalletPrompt = () => {
  const { t } = useTranslation('buy-tokens-page');

  return (
    <motion.div
      // ULEPSZENIE: Używamy Twojej nowej, subtelniejszej stylistyki
      className="bg-[#0d0d14]/70 backdrop-blur-lg p-8 rounded-2xl text-center max-w-lg mx-auto border border-gray-700 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-4">
        {/* ULEPSZENIE: Używamy ikony FaWallet */}
        <FaWallet className="text-gold-400 text-5xl mx-auto" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        {t('connect_wallet_prompt.title')}
      </h3>
      <p className="text-gray-400 mb-6">
        {t('connect_wallet_prompt.subtitle')}
      </p>

      {/* ULEPSZENIE: Używamy klas Tailwind zamiast stylów inline,
          co pozwala na łatwe dodanie efektu hover i jest lepszą praktyką. */}
      <WalletMultiButtonDynamic
        className="!w-full !max-w-xs !mx-auto !bg-gradient-to-r !from-gold-500 !to-amber-500 !hover:from-gold-600 !hover:to-amber-600 !text-gray-900 !font-bold !text-lg !py-3 !px-6 !rounded-full !shadow-lg !transition-all !duration-300"
      />
    </motion.div>
  );
};

export default ConnectWalletPrompt;