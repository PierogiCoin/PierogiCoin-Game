// src/components/LanguageSwitcher.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react'; // Dodano React
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Dodano Variants
import { FaGlobe } from 'react-icons/fa'; // Upewnij się, że masz FaGlobe zaimportowane
// Możesz dodać ikony strzałek, jeśli chcesz
// import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Definicja dostępnych języków (możesz to przenieść do pliku konfiguracyjnego)
interface LanguageOption {
  code: string; // np. 'en', 'pl'
  name: string; // np. 'English', 'Polski'
  flag: string; // Emoji flagi lub komponent SVG
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  // Dodaj więcej języków, jeśli potrzebujesz
];

// Warianty animacji dla menu rozwijanego
const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common'); // Załóżmy, że t() jest używane np. dla aria-label
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false); // Zamknij menu po zmianie języka
  };

  // Obsługa kliknięcia poza menu, aby je zamknąć
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Uruchom ponownie, gdy stan isOpen się zmieni

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages.find(lang => lang.code === i18n.resolvedLanguage) || languages[0];


  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(prev => !prev)} // Użyj funkcji zwrotnej dla setIsOpen
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-full text-sm text-gray-200 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('language_switcher.toggle_button_label', {defaultValue: 'Change language'})}
      >
        <FaGlobe className="text-gold-400 h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.name}</span> {/* Pokaż nazwę na większych ekranach */}
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span> {/* Pokaż kod na mniejszych */}
        {/* Opcjonalna ikona strzałki
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="h-4 w-4" />
        </motion.div>
        */}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-2 w-44 origin-top-right bg-[#0d0d14]/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/60 overflow-hidden z-[1000] focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-switcher-button"
          >
            {languages.map((lang) => (
              <li key={lang.code} role="none">
                <motion.button
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 transition-colors duration-150
                    ${i18n.language === lang.code || i18n.resolvedLanguage === lang.code
                      ? 'bg-gold-500/20 text-gold-300 font-semibold'
                      : 'text-gray-300 hover:bg-gold-500/10 hover:text-gold-200'
                    }
                  `}
                  role="menuitem"
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  disabled={i18n.language === lang.code || i18n.resolvedLanguage === lang.code} // Wyłącz aktywny język
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </motion.button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}