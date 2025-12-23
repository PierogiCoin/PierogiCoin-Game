// Plik: src/components/PageHeader.tsx
'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants, cubicBezier } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';

type Align = 'left' | 'center' | 'right';

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showTypewriter?: boolean;
  /** Mały „kicker” nad tytułem (np. sekcja, claim) */
  kicker?: string;
  /** Wyrównanie treści */
  align?: Align;
  /** Opcjonalne CTA pod leadem */
  actions?: React.ReactNode;
  /** Podświetlone słowa w tytule (otoczone gradientem) */
  highlight?: string[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: cubicBezier(0.16, 1, 0.3, 1),
    },
  },
};

export default function PageHeader({
  title,
  subtitle,
  showTypewriter = false,
  kicker,
  align = 'center',
  actions,
  highlight = [],
}: PageHeaderProps) {
  const { t } = useTranslation('common');
  const reduceMotion = useReducedMotion();

  // SSR-safe typewriter
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // Słowa dla maszyny do pisania (i18n)
  const typewriterWords = useMemo(
    () => [
      t('typewriter.word1', 'Twój projekt'),
      t('typewriter.word2', 'Twoja społeczność'),
      t('typewriter.word3', 'Twoja waluta'),
      t('typewriter.word4', 'Twój sukces!'),
    ],
    [t]
  );

  // „Spotlight” za kursorem (lekki, bez canvas)
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const alignment =
    align === 'left'
      ? 'text-left items-start'
      : align === 'right'
      ? 'text-right items-end'
      : 'text-center items-center';

  const wrapperPad = 'pt-16 pb-10 sm:pt-24 sm:pb-14';

  const splitAndHighlight = (text: string) => {
    if (!highlight.length) return text;
    // proste podświetlanie całych słów
    const safeWords = highlight.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const parts = text.split(new RegExp(`(${safeWords.join('|')})`, 'gi'));
    return parts.map((p, i) =>
      highlight.some((h) => h.toLowerCase() === p.toLowerCase()) ? (
        <span
          key={i}
          className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#fde68a_0%,#fbbf24_40%,#f59e0b_60%,#facc15_100%)]"
        >
          {p}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      )
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full max-w-7xl mx-auto px-4 ${wrapperPad}`}
      aria-label="section-header"
    >
      {/* Tło „aurora” + spotlight */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Aura – pływające gradientowe bloby (łagodne w reduceMotion) */}
        <motion.div
          className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{
            background:
              'radial-gradient(closest-side, rgba(250,204,21,0.8), rgba(234,179,8,0.2), transparent 70%)',
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ['-10%', '10%', '-8%'],
                  y: ['0%', '8%', '-6%'],
                  scale: [1, 1.06, 1],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        {/* Spotlight pod kursorem */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120px 120px at ${mouse.x}px ${mouse.y}px, rgba(250,204,21,0.12), transparent 70%)`,
            transition: reduceMotion ? 'none' : 'background-position 120ms ease-out',
          }}
        />
        {/* Delikatny noise */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.35%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22/></svg>')]"></div>
      </div>

      <motion.div
        className={`relative z-10 flex flex-col ${alignment}`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {kicker && (
          <motion.span
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />
            {kicker}
          </motion.span>
        )}

        {/* Tytuł */}
        {showTypewriter ? (
          <h1
            className={[
              'font-extrabold tracking-tight',
              'text-4xl md:text-5xl lg:text-6xl',
              'text-gold-300',
              'min-h-[60px] md:min-h-[84px]',
            ].join(' ')}
          >
            {isClient && (
              <Typewriter
                words={typewriterWords}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1500}
              />
            )}
          </h1>
        ) : (
          title && (
            <motion.h1
              className={[
                'font-extrabold tracking-tight',
                'text-4xl sm:text-5xl md:text-6xl',
                'text-transparent bg-clip-text',
                'bg-[length:200%_200%] bg-gradient-to-r from-gold-200 via-amber-300 to-gold-500',
              ].join(' ')}
              style={{
                animation: reduceMotion ? undefined : 'hdr-grad 10s ease-in-out infinite',
              }}
            >
              {splitAndHighlight(title)}
            </motion.h1>
          )
        )}

        {/* Podtytuł */}
        {subtitle && (
          <motion.p
            className="mt-4 max-w-3xl text-base md:text-lg text-gray-300"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA / akcje */}
        {actions && (
          <motion.div
            className={[
              'mt-6 flex flex-wrap gap-3',
              align === 'center'
                ? 'justify-center'
                : align === 'right'
                ? 'justify-end'
                : 'justify-start',
            ].join(' ')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {actions}
          </motion.div>
        )}
      </motion.div>

      {/* Keyframes dla animowanego gradientu */}
      <style jsx>{`
        @keyframes hdr-grad {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}