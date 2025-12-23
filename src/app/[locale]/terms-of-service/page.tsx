// Plik: src/app/[locale]/terms-of-service/page.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalPageLayout from '@/components/LegalPageLayout';
import SimpleBackground from '@/components/SimpleBackground';

export default function TermsOfServicePage() {
  const { t } = useTranslation('terms-of-service');

  // Twoja nowa, bardziej szczegółowa struktura sekcji
  const sections = [
    {
      id: 'agreement',
      titleKey: 'agreement.title',
      content: <p>{t('agreement.p1')}</p>
    },
    {
      id: 'risk',
      titleKey: 'risk.title',
      content: <p>{t('risk.p1')}</p>
    },
    {
      id: 'user_obligations',
      titleKey: 'user_obligations.title',
      content: (
        <>
          <p>{t('user_obligations.p1')}</p>
          <ul>
            <li>{t('user_obligations.list.item1')}</li>
            <li>{t('user_obligations.list.item2')}</li>
            <li>{t('user_obligations.list.item3')}</li>
          </ul>
        </>
      )
    },
    {
      id: 'no_warranty',
      titleKey: 'no_warranty.title',
      content: <p>{t('no_warranty.p1')}</p>
    },
    {
      id: 'limitation_of_liability',
      titleKey: 'limitation_of_liability.title',
      content: <p>{t('limitation_of_liability.p1')}</p>
    },
    {
      id: 'changes',
      titleKey: 'changes.title',
      content: <p>{t('changes.p1')}</p>
    },
  ];

  return (
    <>
      <SimpleBackground variant="grid" />
      
      <LegalPageLayout 
        pageTitleKey="title"
        // POPRAWKA: Dodajemy brakujący prop `pageSubtitleKey`
        pageSubtitleKey="subtitle" 
        sections={sections}
        namespace="terms-of-service"
      />
    </>
  );
}
