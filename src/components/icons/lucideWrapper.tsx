'use client';

import * as React from 'react';
import type { LucideProps } from 'lucide-react';

/** Prosty interfejs, jaki lubią nasze komponenty */
export type IconLike = React.ComponentType<{
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

/** Opakowanie lucide, żeby nie krzyczał TS i pasował do IconLike */
/** Opakowanie lucide, żeby nie krzyczał TS i pasował do IconLike */
export function wrapLucide(
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
): IconLike {
  const Wrapped: IconLike = ({ size = 18, className, ...rest }) => (
    <Icon
      width={size}
      height={size}
      className={className}
      {...(rest as LucideProps)}
    />
  );
  Wrapped.displayName = `Icon(${Icon.displayName || 'Lucide'})`;
  return Wrapped;
}