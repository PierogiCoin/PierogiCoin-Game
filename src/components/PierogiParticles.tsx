// Plik: src/components/PierogiParticles.tsx
'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

type Props = {
  count?: number;         // ile pierogów wyrenderować
  className?: string;     // np. "absolute inset-0"
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export default function PierogiParticles({ count = 14, className }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const items = Array.from({ length: count }).map((_, i) => {
    // losowe parametry ruchu
    const left = random(2, 98);         // %
    const size = random(16, 28);        // px
    const delay = random(0, 6);         // s
    const duration = random(10, 18);    // s
    const driftX = random(-20, 20);     // px (dryf poziomy)

    return (
      <span
        key={i}
        className="absolute select-none pointer-events-none will-change-transform"
        style={{
          left: `${left}%`,
          top: '-40px',
          fontSize: `${size}px`,
          animation: `pc-fall ${duration}s linear ${delay}s infinite`,
          transform: `translateX(${driftX}px)`,
          filter: 'drop-shadow(0 0 6px rgba(250,204,21,.25))',
        }}
        aria-hidden
      >
        🥟
      </span>
    );
  });

  return (
    <div className={className}>
      <style jsx>{`
        @keyframes pc-fall {
          0%   { transform: translateY(-40px) translateX(0) rotate(0deg);    opacity: 0; }
          5%   { opacity: 0.9; }
          50%  { opacity: 0.9; }
          100% { transform: translateY(110vh) translateX(0) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {items}
    </div>
  );
}
