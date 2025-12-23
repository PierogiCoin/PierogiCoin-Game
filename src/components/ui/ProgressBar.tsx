// src/components/ui/ProgressBar.tsx
'use client';
import React from 'react';
export default function ProgressBar({ percent, ariaLabel }: { percent: number; ariaLabel?: string }) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  return (
    <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-gray-600/50 bg-gray-700/50"
         role="progressbar" aria-label={ariaLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}>
      <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-amber-500"
           style={{ width: `${clamped}%` }}/>
    </div>
  );
}
