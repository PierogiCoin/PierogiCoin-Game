// src/components/BlockchainBackground.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

type BlockchainBackgroundProps = {
  /** 
   * Ile rakietek ma się pojawiać w tle. 
   * Domyślnie 10, ale można nadpisać przez prop. 
   */
  rocketsCount?: number;
};

const BlockchainBackground: React.FC<BlockchainBackgroundProps> = ({
  rocketsCount = 10,
}) => {
  // Funkcja losująca pozycję początkową (x) w procentach
  const randomX = () => Math.random() * 100;

  // Funkcja losująca opóźnienie animacji (w sekundach)
  const randomDelay = () => Math.random() * 5;

  return (
    <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
      {Array.from({ length: rocketsCount }).map((_, i) => {
        const startX = randomX();
        const delay = randomDelay();

        return (
          <motion.div
            key={i}
            className="absolute text-3xl text-gold-400"
            style={{
              left: `${startX}%`,
              bottom: '-3rem', // zaczynamy poniżej dolnej krawędzi ekranu
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: ['0%', '-120vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 8 + Math.random() * 4, // losowa długość lotu
              ease: 'easeInOut',
              delay,
            }}
          >
            🚀
          </motion.div>
        );
      })}
    </div>
  );
};

export default BlockchainBackground;