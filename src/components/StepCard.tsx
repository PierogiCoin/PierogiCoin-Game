// Plik: src/components/StepCard.tsx

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiExternalLink } from 'react-icons/fi';

// Warianty animacji dla pojedynczej karty.
// Dzięki temu, że są tutaj, komponent jest w pełni niezależny.
const stepItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Definicja typów dla propsów, które komponent przyjmuje.
export interface StepCardProps {
  icon: JSX.Element;
  titleKey: string;
  descriptionKey: string;
  link?: string;
  linkKey?: string;
}

// Definicja komponentu funkcyjnego z typowaniem propsów.
export const StepCard: React.FC<StepCardProps> = ({ icon, titleKey, descriptionKey, link, linkKey }) => {
  const { t } = useTranslation('home');
  
  // Tworzenie unikalnych ID dla tytułu i opisu na potrzeby dostępności (a11y).
  // Pomaga to czytnikom ekranu powiązać ze sobą elementy.
  const titleId = `step-title-${titleKey}`;
  const descriptionId = `step-description-${descriptionKey}`;

  return (
    <motion.div
      className="group flex h-full flex-col items-center rounded-2xl border border-transparent bg-[#0d0d14]/60 p-6 text-center shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-gold-500/50"
      variants={stepItemVariants}
      whileHover={{ y: -8, scale: 1.03, boxShadow: '0px 10px 30px rgba(250, 204, 21, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      // Atrybuty dostępności, które informują czytnik ekranu, który element jest tytułem, a który opisem karty.
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="mb-5 inline-block rounded-full bg-gold-500/10 p-4 text-5xl text-gold-400 shadow-lg transition-colors group-hover:bg-gold-500/20">
        {/* Klonujemy ikonę, aby dodać do niej klasy Tailwind CSS */}
        {React.cloneElement(icon, { className: 'h-10 w-10' })}
      </div>
      <h3 id={titleId} className="mb-3 text-xl font-semibold text-gold-300 transition-colors group-hover:text-gold-200 sm:text-2xl">
        {t(titleKey)}
      </h3>
      {/* Klasa `flex-grow` sprawia, że ten element rozciąga się, aby wypełnić dostępną przestrzeń,
          dzięki czemu przyciski na dole kart będą zawsze na tej samej wysokości. */}
      <p id={descriptionId} className="flex-grow text-sm leading-relaxed text-gray-400 transition-colors group-hover:text-gray-300">
        {t(descriptionKey)}
      </p>
      {/* Warunkowe renderowanie linku, tylko jeśli został podany w danych. */}
      {link && linkKey && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link mt-auto inline-flex items-center pt-4 text-sm font-medium text-gold-500 transition-colors duration-200 hover:text-gold-400"
          // Lepszy, bardziej opisowy label dla czytników ekranu.
          aria-label={`${t(linkKey)} (otwiera w nowej karcie)`} 
        >
          {t(linkKey)}
          <FiExternalLink className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </a>
      )}
    </motion.div>
  );
};