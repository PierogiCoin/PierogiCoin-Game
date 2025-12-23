// Plik: src/components/LegalPageLayout.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';

// POPRAWKA: Importujemy poprawny, reużywalny komponent PageHeader
import PageHeader from '@/components/PageHeader';

// Definicja typów dla sekcji i propsów
interface Section {
  id: string;
  titleKey: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  pageTitleKey: string;
  pageSubtitleKey: string; // Dodano dla spójności
  sections: Section[];
  namespace: string;
}

export default function LegalPageLayout({ 
  pageTitleKey, 
  pageSubtitleKey, 
  sections, 
  namespace 
}: LegalPageLayoutProps) {
  const { t } = useTranslation(namespace);

  return (
    // POPRAWKA: Dodajemy tło, aby treść była czytelna na animacji Vanta
    <div className="bg-black/80 min-h-screen">
      
      {/* POPRAWKA: Używamy komponentu PageHeader dla spójnego wyglądu nagłówków */}
      <PageHeader title={t(pageTitleKey)} subtitle={t(pageSubtitleKey)} />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Boczna nawigacja (Spis Treści) */}
            <aside className="md:col-span-1">
              <div className="sticky top-28">
                <h2 className="text-lg font-semibold text-gold-400 mb-4">{t('on_this_page', 'On this page')}</h2>
                <nav>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <Link 
                          href={`#${section.id}`} 
                          className="text-gray-400 hover:text-gold-300 transition-colors block border-l-2 border-gray-700 hover:border-gold-400 pl-4"
                        >
                          {t(section.titleKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Główna treść */}
            <article className="md:col-span-3 prose prose-invert prose-lg max-w-none space-y-8 text-gray-300 bg-[#0a0a12]/50 p-8 rounded-xl border border-gray-700/50">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gold-400 !mb-4">{t(section.titleKey)}</h2>
                  {/* Treść sekcji jest teraz renderowana jako ReactNode */}
                  {section.content}
                </section>
              ))}
            </article>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
