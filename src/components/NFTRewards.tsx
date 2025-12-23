'use client';

import { motion } from 'framer-motion';
import Image from 'next/image'; // 1. Zaimportuj komponent Image

export default function NFTRewards() {
  return (
    <section className="text-center py-10">
      <h2 className="text-3xl font-bold text-gold-400">🎨 Ekskluzywne NFT dla Inwestorów</h2>
      <p className="text-lg text-gray-400 mt-2">Kupując więcej niż 10,000 PRG, otrzymasz unikalne NFT!</p>

      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative w-64 h-64 rounded-lg shadow-lg overflow-hidden">
          <Image
            src="/images/nft-reward.jpg"
            alt="Ekskluzywne NFT"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </motion.div>
    </section>
  );
}