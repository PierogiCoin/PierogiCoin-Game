// src/components/ui/SectionShell.tsx
'use client';
import React from 'react';
import clsx from 'clsx';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean; // max-w + px
};
export default function SectionShell({ className, container = true, children, ...rest }: Props) {
  return (
    <section className={clsx('relative py-12 md:py-16', className)} {...rest}>
      <div className={clsx(container && 'container mx-auto px-4')}>{children}</div>
    </section>
  );
}
