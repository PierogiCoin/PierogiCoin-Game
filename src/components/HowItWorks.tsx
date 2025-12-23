// src/components/HowItWorks.tsx
'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiDownload, FiCreditCard, FiShoppingCart, FiShield } from 'react-icons/fi';

// Jeśli masz własny typ kroku:
type Step = { title: string; description: string; cta?: string };

export default function HowItWorks() {
  const { t } = useTranslation('homepage');

  // 🔧 Normalizacja: obiekt -> tablica kroków, posortowana po kluczu liczbowym
  const steps = useMemo<Step[]>(() => {
    const raw = t('how_to_buy_section.steps', {
      returnObjects: true,
      defaultValue: {},
    }) as unknown;

    if (Array.isArray(raw)) return raw as Step[];

    const obj = (raw ?? {}) as Record<string, Step>;
    return Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => obj[k])
      .filter(Boolean);
  }, [t]);

  // Ikony do 4 kroków (możesz podmienić)
  const icons = [FiDownload, FiCreditCard, FiShoppingCart, FiShield];

  return (
    <section
      id="how-to-buy"
      className="relative py-16 text-white"
      aria-labelledby="how-to-buy-heading"
    >
      <div className="container mx-auto px-4">
        <h2 id="how-to-buy-heading" className="sr-only">
          {t('how_to_buy_section.title')}
        </h2>

        <div className="text-center mb-10">
          <p className="text-3xl font-bold">{t('how_to_buy_section.title')}</p>
          <p className="text-gray-300 mt-2">{t('how_to_buy_section.subtitle')}</p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="list"
          aria-label={t('how_it_works.list_aria', 'Lista kroków – jak zacząć')}
        >
          {steps.map((s, i) => {
            const Icon = icons[i] ?? FiShield;
            return (
              <motion.div
                key={i}
                role="listitem"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 border border-gold-300/30">
                    <Icon aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{s.description}</p>
                    {s.cta && (
                      <div className="mt-3">
                        <a
                          href="#buy-tokens"
                          className="inline-flex items-center rounded-lg border border-gold-400/40 bg-gold-400/10 px-3 py-1.5 text-sm font-medium hover:bg-gold-400/20"
                        >
                          {s.cta}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}