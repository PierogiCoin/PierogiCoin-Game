'use client';

import { motion } from 'framer-motion';


export default function MintingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gold-400">
      <motion.div
        className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"
        aria-label="Minting..."
      ></motion.div>
      <motion.p
        className="text-lg font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      >
        Minting your NFT...
      </motion.p>
    </div>
  );
}