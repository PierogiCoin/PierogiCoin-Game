// src/components/ParallaxSection.js
import React from 'react';
import { motion } from 'framer-motion'; // <-- dodaliśmy import motion
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function ParallaxSection({ backgroundUrl, children }) {
  const { t } = useTranslation();

  // Prosty efekt paralaksy oparty na scrollu
  const parallaxVariants = {
    initial: { y: 0 },
    whileInView: { y: -50 },
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Tło paralaksy */}
      <motion.div
        className="absolute inset-0"
        variants={parallaxVariants}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.8 }}
        transition={{ ease: 'easeOut', duration: 1.2 }}
      >
        <Image
          src={backgroundUrl}
          alt={t('parallax.altText', 'Parallax background')}
          layout="fill"
          objectFit="cover"
          className="pointer-events-none select-none"
        />
      </motion.div>

      {/* Nakładka półprzezroczysta */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Treść sekcji */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </section>
  );
}