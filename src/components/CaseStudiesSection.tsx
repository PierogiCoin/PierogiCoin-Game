// Plik: src/components/CaseStudiesSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiBarChart2, FiTarget, FiZap } from 'react-icons/fi';
import Image from 'next/image'; // Używamy zoptymalizowanego komponentu Image

// Definicja typów
interface CaseStudy {
  id: number;
  client: string;
  category: string;
  challenge: string;
  solution: string;
  results: {
    icon: React.ReactNode;
    text: string;
  }[];
  imageUrl: string;
  imageAlt: string;
}

// Przykładowe dane - w prawdziwej aplikacji pochodziłyby z CMS lub pliku danych
const caseStudiesData: CaseStudy[] = [
  {
    id: 1,
    client: 'Restauracja "Smaki Regionu"',
    category: 'Branding & Strona WWW',
    challenge: 'Klient posiadał przestarzałą stronę, która nie przyciągała klientów i nie pozwalała na rezerwacje online, tracąc na rzecz nowoczesnej konkurencji.',
    solution: 'Zaprojektowaliśmy nowe, apetyczne logo i menu. Stworzyliśmy szybką, mobilną stronę z galerią i intuicyjnym systemem rezerwacji. Uruchomiliśmy kampanię na Instagramie, prezentując dania.',
    results: [
      { icon: <FiArrowUpRight/>, text: '+60% rezerwacji online' },
      { icon: <FiBarChart2/>, text: '+25% ruchu na stronie' },
    ],
    imageUrl: '/images/case-study-restaurant.jpg', // Upewnij się, że masz te obrazki w folderze public/images
    imageAlt: 'Nowa strona internetowa dla restauracji Smaki Regionu',
  },
  {
    id: 2,
    client: 'Tech-Innowacje Sp. z o.o.',
    category: 'Web3 & Tokenizacja',
    challenge: 'Startup potrzebował zebrać kapitał na rozwój swojego projektu technologicznego poprzez przedsprzedaż tokena, ale brakowało mu zaplecza technicznego i strategii marketingowej.',
    solution: 'Stworzyliśmy token na blockchainie Solana, wdrożyliśmy bezpieczny smart kontrakt do przedsprzedaży i zbudowaliśmy dedykowaną stronę sprzedażową. Opracowaliśmy materiały marketingowe i film promocyjny.',
    results: [
      { icon: <FiTarget/>, text: '100% celu zbiórki ($50k) w 3 tygodnie' },
      { icon: <FiZap/>, text: '+5,000 członków społeczności na Discordzie' },
    ],
    imageUrl: '/images/case-study-web3.jpg',
    imageAlt: 'Strona przedsprzedaży tokena dla Tech-Innowacje',
  },
];

// Główny komponent sekcji
const CaseStudiesSection = () => {
  return (
    <section id="case-studies" className="py-20 md:py-28 bg-[#0a0a12] text-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Nasze Realizacje Mówią Same za Siebie
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-400">
            Nie tylko obiecujemy rezultaty – dostarczamy je. Zobacz, jak pomogliśmy naszym klientom osiągnąć ich cele.
          </p>
        </motion.div>

        <div className="space-y-20">
          {caseStudiesData.map((study, index) => (
            <motion.div
              key={study.id}
              className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              {/* Obrazek - zmienia pozycję w zależności od wiersza */}
              <div className={`rounded-xl overflow-hidden shadow-2xl ${index % 2 === 0 ? 'lg:order-last' : ''}`}>
                <Image
                  src={study.imageUrl}
                  alt={study.imageAlt}
                  width={1200}
                  height={900}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Treść */}
              <div className="flex flex-col">
                <span className="font-semibold text-cyan-400 mb-2">{study.category}</span>
                <h3 className="text-3xl font-bold text-white mb-4">{study.client}</h3>
                
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-gray-300 mb-2">Wyzwanie:</h4>
                  <p className="text-gray-400">{study.challenge}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-gray-300 mb-2">Nasze Rozwiązanie:</h4>
                  <p className="text-gray-400">{study.solution}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-700">
                  <h4 className="font-bold text-lg text-gray-300 mb-3">Kluczowe Rezultaty:</h4>
                  <div className="space-y-3">
                    {study.results.map((result, idx) => (
                      <div key={idx} className="flex items-center text-green-400">
                        <div className="w-6 h-6 mr-3">{result.icon}</div>
                        <span className="font-semibold">{result.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;