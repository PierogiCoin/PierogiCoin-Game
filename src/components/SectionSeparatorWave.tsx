// Plik: src/components/SectionSeparatorWave.tsx
'use client';

import React from 'react';
import clsx from 'clsx';

type Props = {
  /** Wysokość fali w px (całego komponentu) */
  height?: number;
  /** Odwrócenie fali (użyteczne na dole sekcji) */
  flip?: boolean;
  /** Przyciemnia tło pod falą (gradient maskujący) */
  backdrop?: boolean;
  /** Szybkość animacji w sekundach (np. 8 = wolno, 4 = szybciej) */
  speed?: number;
  /** Dodatkowe klasy tailwind */
  className?: string;
  /** Przezroczystość gradientu 0–1 */
  opacity?: number;
};

export default function SectionSeparatorWave({
  height = 88,
  flip = false,
  backdrop = false,
  speed = 6,
  className,
  opacity = 0.9,
}: Props) {
  const h = Math.max(24, height); // bez przesady z małą falą
  const waveId = React.useId();
  const gradId = `${waveId}-grad`;

  return (
    <div
      className={clsx('relative w-full overflow-hidden', className)}
      style={{ height: h }}
      aria-hidden
    >
      {/* delikatne przyciemnienie tła na krawędziach (opcjonalne) */}
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      )}

      <svg
        width="100%"
        height={h}
        viewBox={`0 0 1440 ${h}`}
        preserveAspectRatio="none"
        className={clsx(
          'absolute inset-0',
          flip && 'rotate-180'
        )}
      >
        <defs>
          {/* Ciemno‑złoty, animowany gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="200%" y2="0%">
            <stop offset="0%" stopColor="rgba(112,85,0,1)" />
            <stop offset="50%" stopColor="rgba(218,165,32,1)" />
            <stop offset="100%" stopColor="rgba(112,85,0,1)" />
            {/* Duplikat stopów poza 100% by uzyskać płynną pętlę */}
            <animate
              attributeName="x1"
              values="0%;-100%"
              dur={`${speed}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="200%;100%"
              dur={`${speed}s`}
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* maska, żeby fala miękko znikała */}
          <linearGradient id={`${waveId}-mask`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Główna fala */}
        <path
          fill={`url(#${gradId})`}
          fillOpacity={opacity}
          d={`
            M0,${h * 0.6}
            C 180,${h * 0.2} 360,${h * 1.0} 540,${h * 0.6}
            C 720,${h * 0.2} 900,${h * 1.0} 1080,${h * 0.6}
            C 1260,${h * 0.2} 1440,${h * 1.0} 1620,${h * 0.6}
            L 1440,${h} L 0,${h} Z
          `}
          style={{ transform: 'translateX(-90px)' }}
        />

        {/* Druga, subtelniejsza fala pod spodem dla głębi */}
        <path
          fill={`url(#${gradId})`}
          fillOpacity={opacity * 0.45}
          d={`
            M0,${h * 0.7}
            C 160,${h * 0.3} 320,${h * 1.05} 480,${h * 0.65}
            C 640,${h * 0.25} 800,${h * 1.05} 960,${h * 0.65}
            C 1120,${h * 0.25} 1280,${h * 1.05} 1440,${h * 0.65}
            L 1440,${h} L 0,${h} Z
          `}
        />

        {/* Maska wygaszająca dół fali */}
        <rect width="1440" height={h} fill={`url(#${waveId}-mask)`} />
      </svg>

      {/* prefers-reduced-motion: wyłącz animacje w SVG */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
