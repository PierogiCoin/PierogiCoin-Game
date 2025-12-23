// Plik: src/app/[locale]/faq/page.tsx
'use client';

import FAQSection from '@/components/FAQSection';

// Ta strona teraz tylko importuje i renderuje gotowy komponent sekcji.
// Cała logika, stany i dane są zarządzane wewnątrz FAQSection.
export default function FAQPage() {
  return <FAQSection />;
}
