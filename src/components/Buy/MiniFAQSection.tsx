'use client';
import React, { useEffect } from 'react';
import { TFunction } from 'i18next';
import { FiArrowRightCircle } from 'react-icons/fi';

function resolveT(t: TFunction, keys: string[], fallback: string) {
  for (const k of keys) {
    const val = t(k, { defaultValue: '__MISSING__' });
    if (val && val !== '__MISSING__' && val !== k) return val;
  }
  return fallback;
}

const defaultItems = [
  {
    key: 'q1',
    q: 'Jak zapłacić bez łączenia portfela?',
    a: 'Skorzystaj z sekcji „Płatność ręczna”: wyślij SOL lub USDC na podany adres lub użyj linku/QR Solana Pay. Po potwierdzeniu transakcji on-chain tokeny PRG zostaną przydzielone automatycznie.'
  },
  {
    key: 'q2',
    q: 'Kiedy otrzymam tokeny PRG?',
    a: 'Twoje PRG są rezerwowane automatycznie po potwierdzeniu wpłaty w sieci. W panelu zobaczysz status. Wypłata/claim nastąpi zgodnie z harmonogramem (TGE).'
  },
  {
    key: 'q3',
    q: 'Jakie kryptowaluty mogę użyć?',
    a: 'Obsługujemy SOL oraz USDC w sieci Solana. Inne waluty możesz wymienić na SOL/USDC przez DEX lub most przed wpłatą.'
  },
];

export default function MiniFAQSection({ t }: { t: TFunction }) {

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const langAttr = typeof document !== 'undefined' ? document.documentElement.lang : 'n/a';
    // eslint-disable-next-line no-console
    console.debug('[MiniFAQ i18n debug]', {
      navigatorLanguage: typeof navigator !== 'undefined' ? navigator.language : 'n/a',
      htmlLang: langAttr,
      faqTitle: resolveT(t, ['buy_section.faq.title', 'mini_faq.title', 'faq.title'], 'Najczęstsze pytania'),
    });
  }, [t]);

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6">
      <h4 className="text-lg sm:text-xl font-semibold text-white mb-4">
        {resolveT(t, ['buy_section.faq.title', 'mini_faq.title', 'faq.title'], 'Najczęstsze pytania')}
      </h4>
      <div className="space-y-2">
        {defaultItems.map((item) => (
          <details key={item.key} className="group rounded-lg border border-white/10 bg-black/30 p-3">
            <summary className="cursor-pointer text-white/90 text-sm font-medium flex items-center justify-between">
              {resolveT(t, [
                `buy_section.faq.items.${item.key}.q`,
                `mini_faq.items.${item.key}.q`,
                `faq.items.${item.key}.q`
              ], item.q)}
              <FiArrowRightCircle className="transition-transform group-open:rotate-90 text-white/60" />
            </summary>
            <p className="mt-1 text-xs text-white/70">
              {resolveT(t, [
                `buy_section.faq.items.${item.key}.a`,
                `mini_faq.items.${item.key}.a`,
                `faq.items.${item.key}.a`
              ], item.a)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
