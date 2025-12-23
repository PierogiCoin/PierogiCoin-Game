// src/components/ui/SectionHeading.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

type Props = { title: React.ReactNode; subtitle?: React.ReactNode; center?: boolean; id?: string; };
export default function SectionHeading({ title, subtitle, center = true, id }: Props) {
  return (
    <header id={id} className={clsx(center ? 'text-center' : '')}>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-300">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-gray-300 max-w-2xl mx-auto">{subtitle}</p>}
    </header>
  );
}
