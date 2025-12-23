// Plik: src/components/NftPage/TeaserSection.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiEye, FiMaximize2, FiX } from 'react-icons/fi';

export interface TeaserItem {
  id: string;
  src: string;
  altKey: string;
  nameKey: string;
  descriptionKey: string;
  isSpecialReveal?: boolean;
}

interface TeaserSectionProps {
  sneakPeekImages?: TeaserItem[];
}

const defaultSneakPeekImages: TeaserItem[] = [
  { id: 'nft1', src: '/images/nfts/pierogi-nft-1.webp', altKey: 'teaser_section.nft_alt_1', nameKey: 'teaser_section.nft_name_1', descriptionKey: 'teaser_section.nft_desc_1' },
  { id: 'nft2', src: '/images/nfts/pierogi-nft-2.webp', altKey: 'teaser_section.nft_alt_2', nameKey: 'teaser_section.nft_name_2', descriptionKey: 'teaser_section.nft_desc_2', isSpecialReveal: true },
  { id: 'nft3', src: '/images/nfts/pierogi-nft-3.webp', altKey: 'teaser_section.nft_alt_3', nameKey: 'teaser_section.nft_name_3', descriptionKey: 'teaser_section.nft_desc_3' },
];

const cardItemVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ——— SUBKOMPONENTY ———
const RevealBlock: React.FC<{ onClick: () => void; index: number }> = ({ onClick, index }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Odkryj fragment ${index + 1}`}
    className="bg-gray-700/60 backdrop-blur-sm border border-gray-600/50 hover:bg-transparent transition-all duration-150 rounded-[6px]"
  />
);

const TeaserCard: React.FC<{ nft: TeaserItem; onSelect: () => void }> = ({ nft, onSelect }) => {
  const { t } = useTranslation('nft-page');

  const [revealedBlocks, setRevealedBlocks] = useState<boolean[]>(() => Array(9).fill(false));

  const revealedCount = useMemo(() => revealedBlocks.filter(Boolean).length, [revealedBlocks]);
  const allRevealed = revealedCount === 9;

  const handleRevealClick = useCallback((index: number) => {
    setRevealedBlocks(prev => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const canOpenModal = !nft.isSpecialReveal || allRevealed;

  return (
    <motion.article
      variants={cardItemVariants}
      className="group relative overflow-hidden rounded-2xl shadow-2xl bg-[#0d0d14]/50 aspect-[4/5] border border-gray-700/40 hover:border-gold-400/60 transition-colors focus-within:border-gold-400/60"
      aria-label={t(nft.nameKey)}
    >
      <button
        type="button"
        onClick={() => canOpenModal && onSelect()}
        className="absolute inset-0 z-0"
        aria-label={t(nft.nameKey)}
      // klawisz Enter/Space obsłuży button domyślnie
      />

      <Image
        src={nft.src}
        alt={t(nft.altKey, { defaultValue: `Image of ${nft.id}` })}
        fill
        loading="lazy"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        className={`object-cover w-full h-full transition-all duration-700 ease-in-out ${nft.isSpecialReveal && !allRevealed ? 'blur-md scale-110' : 'blur-none'}`}
      />

      {/* Overlay „powiększ” dla zwykłych kart */}
      {!nft.isSpecialReveal && (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <FiMaximize2 className="text-gold-300 text-5xl" />
        </div>
      )}

      {/* Siatka „zdrapka” */}
      {nft.isSpecialReveal && !allRevealed && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10 p-1 gap-1">
          {revealedBlocks.map((isRevealed, i) =>
            isRevealed ? (
              <div key={i} aria-hidden />
            ) : (
              <RevealBlock key={i} index={i} onClick={() => handleRevealClick(i)} />
            )
          )}
        </div>
      )}

      {/* Pasek podpisu */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-center transition-opacity duration-200 ${!canOpenModal ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <p className="text-gold-300 text-lg font-semibold truncate">
          {nft.isSpecialReveal && !allRevealed
            ? t('teaser_section.special_reveal_title', { count: 9 - revealedCount })
            : t(nft.nameKey)}
        </p>
      </div>
    </motion.article>
  );
};

// ——— MODAL z focus management ———
function useFocusRestore() {
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const capture = () => {
    lastFocusedRef.current = (document.activeElement as HTMLElement) || null;
  };
  const restore = () => {
    lastFocusedRef.current?.focus?.();
    lastFocusedRef.current = null;
  };
  return { capture, restore };
}

// ——— GŁÓWNY KOMPONENT ———
export default function TeaserSection({ sneakPeekImages = defaultSneakPeekImages }: TeaserSectionProps) {
  const { t } = useTranslation(['nft-page', 'common']);
  const reduce = useReducedMotion();
  const [selectedNft, setSelectedNft] = useState<TeaserItem | null>(null);
  const { capture, restore } = useFocusRestore();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Esc do zamykania, focus restore
  useEffect(() => {
    if (!selectedNft) return;
    capture();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNft(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNft]);

  useEffect(() => {
    if (selectedNft) {
      // autofocus tytułu po otwarciu
      const id = requestAnimationFrame(() => titleRef.current?.focus?.());
      return () => cancelAnimationFrame(id);
    } else {
      restore();
    }
  }, [selectedNft, restore]);

  return (
    <>
      <section id="nft-teasers" className="relative text-white text-center" aria-labelledby="teaser-title">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2
            id="teaser-title"
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 mb-12"
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FiEye className="inline-block mr-3 text-gold-400 align-middle" aria-hidden />
            {t('teaser_section.premium_title')}
          </motion.h2>

          <motion.div
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto"
            initial="initial"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: reduce ? {} : { staggerChildren: 0.08 } } }}
          >
            {sneakPeekImages.map((nft) => (
              <div role="listitem" key={nft.id}>
                <TeaserCard nft={nft} onSelect={() => setSelectedNft(nft)} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedNft && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNft(null)}
          >
            <motion.div
              className="bg-[#0d0d14] p-6 rounded-2xl shadow-2xl max-w-md w-full relative border border-gold-500/50"
              initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              transition={{ type: reduce ? 'tween' : 'spring', stiffness: 260, damping: 22, duration: reduce ? 0.2 : undefined }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="nft-dialog-title"
            >
              <button
                onClick={() => setSelectedNft(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl p-1 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={t('common:close_modal')}
              >
                <FiX />
              </button>

              <h3
                id="nft-dialog-title"
                ref={titleRef}
                tabIndex={-1}
                className="text-2xl font-bold text-gold-300 mb-4 pr-8 outline-none"
              >
                {t(selectedNft.nameKey)}
              </h3>

              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#0a0a12]">
                <Image
                  src={selectedNft.src}
                  alt={t(selectedNft.altKey)}
                  fill
                  sizes="90vw"
                  style={{ objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">{t(selectedNft.descriptionKey)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
