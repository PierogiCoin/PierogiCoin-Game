// Plik: src/components/LandingShowcase.tsx
'use client';

// --- POPRAWKA: Dodajemy brakujące importy ---
import { motion } from 'framer-motion';
import Link from 'next/link';

// Zakładam, że ten plik istnieje i jest poprawny
import '@/styles/components/LandingShowcase.css';

export default function LandingShowcase() {
  return (
    <section className="landing-showcase relative">
      <div className="background-blur-overlay"></div>

      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="landing-title text-gold-400 text-5xl font-extrabold mb-6 drop-shadow-lg">
          PierogiCoin NFT Revolution
        </h1>
        <p className="landing-description text-gray-300 text-lg max-w-2xl mx-auto">
          Discover a collection of exclusive NFTs blending tradition, technology, and taste. The future of flavor on the blockchain.
        </p>
        <div className="mt-8">
          <Link
            href="/nft"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 hover:scale-105"
          >
            🚀 Explore Collection
          </Link>
        </div>
      </motion.div>
    </section>
  );
}