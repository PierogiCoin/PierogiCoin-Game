// src/components/WhyMintSection.tsx
'use client';

import React, { useState } from 'react'; // ✅ Dodano React i useState
import { motion, AnimatePresence, Variants } from 'framer-motion'; // ✅ Dodano Variants
import { useTranslation } from 'react-i18next'; // ✅ Dodano useTranslation
import { FaUsers, FaGift, FaUserShield, FaPercentage, FaChevronDown } from 'react-icons/fa'; // ✅ Dodano brakujące ikony
// Jeśli używasz FiCpu, FiShield itp., musisz je też zaimportować z 'react-icons/fi'

// Załóżmy, że i18n jest inicjalizowane globalnie
// import '@/i18n';

// Definicja typu dla pojedynczej korzyści
interface MintBenefit {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

// Definicje wariantów animacji (muszą być zdefiniowane)
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Opóźnienie między animacjami kart
      delayChildren: 0.2,  // Opóźnienie przed animacją pierwszej karty
    },
  },
};

const cardItemVariants: Variants = { // Warianty dla poszczególnych kart
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "circOut" } },
};

const descriptionVariants: Variants = { // Warianty dla opisu (akordeon)
  collapsed: { opacity: 0, height: 0, marginTop: "0rem", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  open: { opacity: 1, height: 'auto', marginTop: '0.75rem', transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }, // Zmieniono marginTop na 0.75rem (mb-3)
};

// Dane dla korzyści - użyjemy kluczy do tłumaczeń
const benefitsData: MintBenefit[] = [
  {
    id: 'dao_access',
    icon: <FaUserShield className="text-gold-400 text-3xl group-hover:text-gold-300 transition-colors" />,
    titleKey: 'why_mint.benefit1.title',
    descriptionKey: 'why_mint.benefit1.description',
  },
  {
    id: 'exclusive_perks',
    icon: <FaPercentage className="text-gold-400 text-3xl group-hover:text-gold-300 transition-colors" />,
    titleKey: 'why_mint.benefit2.title',
    descriptionKey: 'why_mint.benefit2.description',
  },
  {
    id: 'special_airdrops',
    icon: <FaGift className="text-gold-400 text-3xl group-hover:text-gold-300 transition-colors" />,
    titleKey: 'why_mint.benefit3.title',
    descriptionKey: 'why_mint.benefit3.description',
  },
  {
    id: 'community_events',
    icon: <FaUsers className="text-gold-400 text-3xl group-hover:text-gold-300 transition-colors" />,
    titleKey: 'why_mint.benefit4.title',
    descriptionKey: 'why_mint.benefit4.description',
  },
];

export default function WhyMintSection() {
  const { t } = useTranslation('nft_page'); // Użyj przestrzeni nazw 'nft_page' lub stwórz 'why_mint'
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // Stan dla aktywnego elementu akordeonu

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.section
      className="py-16 md:py-20 bg-[#0a0a12]/80 backdrop-blur-sm text-white text-center"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-gold-400 mb-12 md:mb-16 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          🧩 {t('why_mint.section_title', 'Why Mint Our NFT?')}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={cardGridVariants} // Stosujemy warianty do kontenera siatki
          // initial i whileInView są dziedziczone z sectionVariants dzięki staggerChildren
        >
          {benefitsData.map((item, index) => (
            <motion.div
              key={item.id}
              layout // ✅ Animuj zmiany layoutu (wysokości)
              variants={cardItemVariants} // Stosujemy warianty do każdej karty
              // initial i whileInView dla cardItemVariants będą działać dzięki staggerChildren na rodzicu (cardGridVariants)
              className={`group bg-[#0d0d14]/70 backdrop-blur-md rounded-xl shadow-xl p-6 cursor-pointer transition-all duration-300 ease-out overflow-hidden
                ${activeIndex === index ? 'border-2 border-gold-400/80 ring-2 ring-gold-400/50' : 'border border-gray-700/70 hover:border-gold-500/50'}
              `}
              onClick={() => toggleAccordion(index)}
              whileHover={{ y: -5, scale: activeIndex === index ? 1 : 1.02, boxShadow: "0px 8px 25px rgba(250, 204, 21, 0.15)"}}
              // transition prop tutaj może nadpisać transition z wariantu, jeśli jest potrzebne specyficzne zachowanie dla hover/tap
              transition={{ type: "spring", stiffness: 300, damping: 20 }} // Przykładowa tranzysja dla whileHover
            >
              <div className="flex flex-col items-center"> {/* Usunięto h-full, aby karta mogła się rozszerzać */}
                <motion.div
                  className="mb-4 p-3 bg-gold-500/10 rounded-full transition-colors duration-300 group-hover:bg-gold-500/20"
                  initial={{scale:0.8, opacity:0}}
                  animate={{scale:1, opacity:1}} // Można użyć whileInView, jeśli chcesz animować przy scrollu
                  transition={{delay:0.1, type:"spring", stiffness:200, damping:12}} // Niewielkie opóźnienie dla ikony
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gold-300 group-hover:text-gold-200 mb-2 text-center transition-colors">
                  {t(item.titleKey)}
                </h3>
              </div>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    key="content" // Ważny klucz dla AnimatePresence
                    variants={descriptionVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    className="text-sm text-gray-400 leading-relaxed text-center overflow-hidden" // Dodano overflow-hidden
                  >
                    {t(item.descriptionKey)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Opcjonalny wskaźnik strzałki */}
              <div className="mt-auto pt-4 flex justify-center"> {/* Dodano mt-auto pt-4, aby strzałka była na dole, jeśli treść jest krótka */}
                <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-gold-400/70 group-hover:text-gold-300"
                >
                    <FaChevronDown />
                </motion.div>
              </div>

            </motion.div>
          ))}
        </motion.div>
      </div>
      </motion.section>
  );
}