'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import PurchasePanel from './Buy/PurchasePanel';
import RecentPurchases from './Buy/RecentPurchases';
import BenefitsSection from './Buy/BenefitsSection';
import MiniFAQSection from './Buy/MiniFAQSection';

export default function BuySection() {
  const { t } = useTranslation(['buy-tokens-page', 'common']);

  return (
    <section id="buy" aria-labelledby="buy-tokens-heading" className="space-y-8 md:space-y-10 max-w-4xl mx-auto">

      {/* Panel zakupu (zawiera pasek etapu, countdown, inputy, CTA) */}
      <PurchasePanel />

      {/* Ostatnie zakupy */}
      <RecentPurchases />

      {/* Dół – kompaktowe sekcje info */}
      <BenefitsSection t={t} />
      <MiniFAQSection t={t} />

      <div className="text-center">
        <a href="#buy" className="btn-primary">
          {t('common:buy_now', 'Kup teraz')}
        </a>
      </div>
    </section>
  );
}
