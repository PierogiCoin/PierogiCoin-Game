// Plik: src/components/LanguageSelector.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
];

const menuVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  /**
   * Generuje nowy URL z podmienionym kodem języka.
   * Przykład: jeśli jesteś na /en/about, a klikniesz 'pl', zwróci /pl/about.
   */
  const redirectedPathName = (locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale; // Podmieniamy pierwszy segment (kod języka)
    return segments.join('/');
  };

  // Efekt do zamykania menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiGlobe />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <FiChevronDown />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-36 bg-[#0d0d14] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-20"
          >
            <ul>
              {languages.map(lang => (
                <li key={lang.code}>
                  {/* KLUCZOWA ZMIANA: Używamy komponentu Link do zmiany URL */}
                  <Link
                    href={redirectedPathName(lang.code)}
                    onClick={() => setIsOpen(false)} // Zamykamy menu po kliknięciu
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-gold-500 text-gray-900 font-bold cursor-default'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    // Zapobiegamy klikaniu w już aktywny język
                    style={{ pointerEvents: i18n.language === lang.code ? 'none' : 'auto' }}
                  >
                    {lang.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}