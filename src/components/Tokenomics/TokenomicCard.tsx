// src/components/Tokenomics/TokenomicCard.tsx
'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import type { TokenomicSegment } from '@/data/tokenomicsData';

interface TokenomicCardProps {
  item: TokenomicSegment;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/* --- Animacje wyniesione poza render --- */
const detailsVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: '1rem',
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

const springTrans = { type: 'spring', stiffness: 400, damping: 17 } as const;

/* --- Komponent --- */
const TokenomicCardBase: React.FC<TokenomicCardProps> = ({
  item,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}) => {
  const { t } = useTranslation('tokenomics');
  const reduceMotion = useReducedMotion();

  // Memo tłumaczeń — mniejszy „szum” re-renderów
  const tTitle = useMemo(() => t(item.titleKey), [t, item.titleKey]);
  const tDesc = useMemo(() => t(item.descriptionKey), [t, item.descriptionKey]);

  // Miękki glow w kolorze segmentu (gdy karta otwarta)
  const glowShadow = useMemo(() => {
    const hex = typeof item.color === 'string' && /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(item.color);
    return hex ? `0 0 20px 5px ${item.color}40` : undefined; // ~25% alfa
  }, [item.color]);

  // CSS var do koloru segmentu + glow
  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      // TS: CSSProperties ma index signature, więc custom var przejdzie
      ['--seg-color' as string]: item.color || '#facc15',
      boxShadow: isSelected && glowShadow ? glowShadow : undefined,
    }),
    [item.color, isSelected, glowShadow]
  );

  const detailsId = `tokenomic-details-${item.id}`;
  const hasDetails = Boolean(item.details && (item.details.purposeKey || item.details.vestingKey));

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={springTrans}
      className={[
        'w-full text-left p-4 sm:p-5 rounded-xl shadow-lg border',
        'bg-[#0a0a12]/70 backdrop-blur-md transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'focus-visible:ring-gold-400/70 focus-visible:ring-offset-gray-900',
        isHovered ? 'border-gold-500/90' : 'border-gray-700/60',
        isSelected ? 'border-gold-400' : '',
        'cursor-pointer',
      ].join(' ')}
      style={cardStyle}
      aria-pressed={isSelected}
      aria-expanded={isSelected}
      aria-controls={hasDetails ? detailsId : undefined}
      aria-label={tTitle}
    >
      {/* Nagłówek */}
      <div className="flex items-start mb-2 gap-3">
        <motion.span
          className="text-xl mt-0.5 leading-none"
          animate={reduceMotion ? undefined : { scale: isHovered || isSelected ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ color: 'var(--seg-color)' as React.CSSProperties['color'] }}
          aria-hidden="true"
        >
          {/* Ikona jako ReactNode — zazwyczaj <svg/> z lucide/heroicons */}
          {/* Upewniamy się, że nie jest fokusowalna dla czytników */}
          {React.isValidElement(item.icon)
            ? React.cloneElement(item.icon as React.ReactElement, { 'aria-hidden': true, focusable: false })
            : item.icon}
        </motion.span>

        <div className="flex-1">
          <h3
            className="text-md sm:text-lg font-semibold"
            title={tTitle}
            style={{ color: 'var(--seg-color)' as React.CSSProperties['color'] }}
          >
            {tTitle}{' '}
            <span className="text-sm text-gray-400">({item.numericPercentage}%)</span>
          </h3>

          {/* Krótki opis – zawsze widoczny */}
          <p className="text-gray-400 text-xs sm:text-sm">{tDesc}</p>
        </div>

        {/* Chevron (rotuje, gdy otwarte) */}
        <motion.span
          initial={false}
          animate={reduceMotion ? undefined : { rotate: isSelected ? 180 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="text-gray-400 ml-2 select-none"
          aria-hidden="true"
        >
          ▾
        </motion.span>
      </div>

      {/* Szczegóły – rozwijane TYLKO po kliknięciu */}
      <AnimatePresence initial={false}>
        {isSelected && hasDetails && (
          <motion.div
            id={detailsId}
            key="details"
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-sm"
          >
            <div className="mt-4 border-t border-gray-700 pt-3 space-y-3">
              {item.details?.purposeKey && (
                <div>
                  <h4 className="font-semibold text-gray-300 mb-1">
                    {t('modal.purpose_label')}
                  </h4>
                  <p className="text-gray-300/90 leading-relaxed">{t(item.details.purposeKey)}</p>
                </div>
              )}

              {item.details?.vestingKey && (
                <div>
                  <h4 className="font-semibold text-gray-300 mb-1">
                    {t('modal.vesting_label')}
                  </h4>
                  <p className="text-gray-300/90 leading-relaxed">{t(item.details.vestingKey)}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

/* --- Mniejsze zużycie CPU dzięki memo --- */
const TokenomicCard = React.memo(TokenomicCardBase, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.isHovered === next.isHovered &&
    prev.item.id === next.item.id &&
    prev.item.numericPercentage === next.item.numericPercentage &&
    prev.item.color === next.item.color
  );
});

TokenomicCard.displayName = 'TokenomicCard';
export default TokenomicCard;
