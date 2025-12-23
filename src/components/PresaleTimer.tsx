// Plik: src/components/PresaleTimer.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePresale } from '@/context/PresaleContext';
import { FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

// ULEPSZENIE: TimerBox ma teraz stylizowane tło, aby liczby bardziej się wyróżniały.
const TimerBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl md:text-4xl font-bold text-white tracking-wider bg-[#0a0a12]/50 p-3 rounded-lg w-20 text-center">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-xs uppercase text-gray-400 mt-2">{label}</span>
  </div>
);

// ULEPSZENIE: Dwukropek jest teraz animowany, aby przyciągać wzrok.
const ColonSeparator = () => (
    <motion.span 
        className="text-3xl text-gray-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
        :
    </motion.span>
);


const PresaleTimer = () => {
  const { t } = useTranslation('buy-tokens-page');
  const { days, hours, minutes, seconds } = usePresale();

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <p className="text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
        <FiClock />
        {t('timer.ends_in')}
      </p>
      <div className="flex justify-center items-center gap-2 md:gap-3">
        <TimerBox value={days ?? 0} label={t('timer.days')} />
        <ColonSeparator />
        <TimerBox value={hours ?? 0} label={t('timer.hours')} />
        <ColonSeparator />
        <TimerBox value={minutes ?? 0} label={t('timer.minutes')} />
        <ColonSeparator />
        <TimerBox value={seconds ?? 0} label={t('timer.seconds')} />
      </div>
    </motion.div>
  );
};

export default PresaleTimer;