// Plik: src/app/[locale]/tokenomics/page.tsx
'use client';

// Importujemy nasz nowy, ulepszony i w pełni interaktywny komponent sekcji tokenomiki
import TokenomicsSection from '@/components/TokenomicsSection';

// Ta strona staje się bardzo prosta - jej jedynym zadaniem jest
// renderowanie dedykowanego komponentu sekcji.
export default function TokenomicsPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <TokenomicsSection />
    </div>
  );
}
