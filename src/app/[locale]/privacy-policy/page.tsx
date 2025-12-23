// Plik: src/app/[locale]/privacy-policy/page.tsx
'use client';

import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LegalPageLayout from '@/components/LegalPageLayout';
import SimpleBackground from '@/components/SimpleBackground';

export default function PrivacyPolicyPage() {
  const { t, i18n } = useTranslation('privacy-policy');


  // Możliwość nadpisania maila z ENV (fallback do domyślnego)
  const contactEmail = useMemo(
    () => process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@pierogicoin.com',
    []
  );

  // Sekcje — memoizowane; przebuduj przy zmianie języka/tłumaczeń
  const sections = useMemo(
    () => [
      { id: 'introduction',    titleKey: 'introduction.title',    content: <p>{t('introduction.p1')}</p> },
      {
        id: 'data_we_collect',
        titleKey: 'data_we_collect.title',
        content: (
          <>
            <p>{t('data_we_collect.p1')}</p>
            <ul className="list-disc pl-6 space-y-1 marker:text-gold-400">
              <li><strong>{t('data_we_collect.list.item1.title')}:</strong> {t('data_we_collect.list.item1.desc')}</li>
              <li><strong>{t('data_we_collect.list.item2.title')}:</strong> {t('data_we_collect.list.item2.desc')}</li>
              <li><strong>{t('data_we_collect.list.item3.title')}:</strong> {t('data_we_collect.list.item3.desc')}</li>
            </ul>
          </>
        )
      },
      {
        id: 'how_we_use_data',
        titleKey: 'how_we_use_data.title',
        content: (
          <>
            <p>{t('how_we_use_data.p1')}</p>
            <ul className="list-disc pl-6 space-y-1 marker:text-gold-400">
              <li>{t('how_we_use_data.list.item1')}</li>
              <li>{t('how_we_use_data.list.item2')}</li>
              <li>{t('how_we_use_data.list.item3')}</li>
            </ul>
          </>
        )
      },
      { id: 'cookies',           titleKey: 'cookies.title',           content: <p>{t('cookies.p1')}</p> },
      { id: 'data_security',     titleKey: 'data_security.title',     content: <p>{t('data_security.p1')}</p> },
      { id: 'third_parties',     titleKey: 'third_parties.title',     content: <p>{t('third_parties.p1')}</p> },
      { id: 'your_rights',       titleKey: 'your_rights.title',       content: <p>{t('your_rights.p1')}</p> },
      { id: 'childrens_privacy', titleKey: 'childrens_privacy.title', content: <p>{t('childrens_privacy.p1')}</p> },
      { id: 'contact',           titleKey: 'contact.title',           content: <p>{t('contact.p1', { email: contactEmail })}</p> }
    ],
    [t, contactEmail]
  );

  // Miły UX: jeśli wchodzimy z hash-em (#sekcja), przewiń delikatnie do treści
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96; // offset pod sticky header
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [i18n.language]);

  return (
    <>
      <SimpleBackground variant="dots" />
      <LegalPageLayout
        pageTitleKey="title"
        pageSubtitleKey="subtitle"   // ważne: unikamy brakującego propsa
        sections={sections}
        namespace="privacy-policy"
      />
    </>
  );
}
