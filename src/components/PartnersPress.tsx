'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface PartnerItem {
  name: string;
  src: string; // /public path or remote URL allowed by next.config
  url?: string;
}

// Domyślna lista – podmień według potrzeb
const DEFAULT_PARTNERS: PartnerItem[] = [
  { name: 'ŁykKreacji.pl', src: '/partners/lykkreacji.svg', url: 'https://lykkreacji.pl' },
  { name: 'Mooneyedesign.com', src: '/partners/mooneyedesign.svg', url: 'https://mooneyedesign.com' },
];

interface PartnersPressProps {
  items?: PartnerItem[];
  title?: string;
  marquee?: boolean; // tryb płynącego paska
}

export default function PartnersPress({ items = DEFAULT_PARTNERS, title = 'Partnerzy & Wzmianki', marquee = false }: PartnersPressProps) {
  if (!items?.length) return null;

  return (
    <section aria-labelledby="partners-press-title" className="mx-auto w-full max-w-7xl px-4 py-12">
      <h2 id="partners-press-title" className="text-center text-3xl font-extrabold text-gold-300">
        {title}
      </h2>

      {marquee ? (
        <MarqueeRow items={items} />
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 justify-center w-full">
          {items.map((p, i) => (
            <li key={p.name} role="listitem" className="flex justify-center">
              <PartnerCard item={p} index={i} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MarqueeRow({ items }: { items: PartnerItem[] }) {
  // Duplikujemy listę, by uzyskać płynny, bezszwowy efekt
  const doubled = [...items, ...items];
  return (
    <div className="relative mt-8 overflow-hidden">
      <div className="marquee flex gap-6 will-change-transform">
        {doubled.map((p, i) => (
          <div key={`${p.name}-${i}`} className="shrink-0">
            <PartnerCard item={p} index={i} />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

function PartnerCard({ item, index }: { item: PartnerItem; index: number }) {
  const [imgOk, setImgOk] = React.useState(true);

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative flex h-20 w-full max-w-[240px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-md outline-none ring-0 transition hover:border-gold-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold-400/60"
    >
      {imgOk ? (
        <Image
          src={item.src}
          alt={`${item.name} logo`}
          width={220}
          height={60}
          sizes="(max-width: 768px) 40vw, 220px"
          loading="lazy"
          className="max-h-10 w-auto opacity-85 transition group-hover:opacity-100 grayscale group-hover:grayscale-0 contrast-125 group-hover:scale-[1.03]"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="flex h-10 items-center justify-center rounded bg-gray-100 px-3 text-sm font-medium text-gray-600">
          {initials(item.name)}
        </div>
      )}
      <span className="sr-only">{item.name}</span>
    </motion.div>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.name} title={item.name} className="focus:outline-none">
        {inner}
      </a>
    );
  }
  return inner;
}

function initials(name: string) {
  return name
    .split(/\s+|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}
