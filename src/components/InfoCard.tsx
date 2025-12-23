'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export default function InfoCard({ icon, title, description, delay = 0 }: InfoCardProps) {
  return (
    <motion.div
      className="bg-[#0d0d14]/50 p-6 rounded-xl border border-gray-700/50 text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="text-4xl text-gold-400 mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}
