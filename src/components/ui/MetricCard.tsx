// src/components/ui/MetricCard.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

export default function MetricCard({
  icon, label, value, className,
}: { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode; className?: string; }) {
  return (
    <div className={clsx('p-5 rounded-xl text-center border border-gray-700/40 bg-[#0d0d14]/60 shadow-md', className)}>
      <div className="flex items-center justify-center gap-2 text-xs uppercase text-gray-400">{icon}<span>{label}</span></div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}
