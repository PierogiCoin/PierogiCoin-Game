// src/components/ui/GradientButton.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' | 'a'; href?: string; };
export default function GradientButton({ as = 'button', href, className, children, ...rest }: Props) {
  const base = clsx(
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-bold',
    'bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-500 hover:to-amber-600',
    'text-gray-900 shadow-lg transition-all duration-300'
  );
  if (as === 'a' && href) return <a href={href} className={clsx(base, className)} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
  return <button className={clsx(base, className)} {...rest}>{children}</button>;
}
