'use client';

import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  rootMargin?: string;
}

export default function LazySection({ 
  children, 
  className = '', 
  fallback,
  rootMargin = '200px'
}: LazySectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ 
    rootMargin, 
    freezeOnceVisible: true 
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <div className="min-h-[400px]" />)}
    </div>
  );
}
