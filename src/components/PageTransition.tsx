// src/components/PageTransition.tsx
"use client";

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        // ZMIANA: Zmieniono 'type' na 'ease'
        transition={{ ease: 'linear', duration: 0.3 }}
        className="flex-grow"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;