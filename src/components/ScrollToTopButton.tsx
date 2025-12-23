// src/components/ScrollToTopButton.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowUp } from 'react-icons/fa';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollToTopButton() {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Get scroll progress
  const { scrollYProgress } = useScroll();

  // SVG circle calculations
  const size = 52;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Transform scroll progress to strokeDashoffset (must be at component level, not in JSX)
  const strokeDashoffset = useTransform(
    scrollYProgress,
    [0, 1],
    [circumference, 0]
  );

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[990]"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0a0a12] border border-gold-500/30 rounded-lg text-xs text-white whitespace-nowrap shadow-lg"
              >
                {t('footer.scroll_to_top_label', { defaultValue: 'Back to top' })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Ring Container */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-[52px] h-[52px] bg-[#0a0a12]/90 backdrop-blur-sm rounded-full shadow-xl shadow-black/40 border border-gold-500/30 hover:border-gold-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a12] group"
            aria-label={t('footer.scroll_to_top_label', { defaultValue: 'Scroll to top' })}
          >
            {/* Background circle */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Progress - using motion.circle with style prop containing the MotionValue */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset }}
              />
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>

            {/* Arrow Icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-gold-400 group-hover:text-gold-300 transition-colors"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaArrowUp className="text-lg" />
            </motion.div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gold-500/0 group-hover:bg-gold-500/10 transition-colors" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}