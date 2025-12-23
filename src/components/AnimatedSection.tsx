// Plik: src/components/AnimatedSection.tsx
'use client';

import React from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';

type TagName = 'section' | 'div' | 'article';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;

  /** Framer variants to use. If not provided, a simple fade+slide will be used. */
  variants?: Variants;

  /** HTML tag to render as (for semantics). Defaults to `section`. */
  as?: TagName;

  /** Optional id for anchoring/ARIA */
  id?: string;
  ariaLabel?: string;

  /** Viewport trigger settings */
  once?: boolean;            // trigger only once (default true)
  viewportAmount?: number;   // portion of the element that must be visible (default 0.1)

  /** Simple builder options for the default variant */
  y?: number;                // slide offset on enter (default 50)
  duration?: number;         // animation duration (default 0.7)
  delay?: number;            // animation delay (default 0)
  ease?: 'easeOut' | 'easeInOut' | 'linear'; // default 'easeOut'

  /** Disable animation entirely (e.g. inside critical above-the-fold blocks) */
  disabled?: boolean;
}

const buildDefaultVariants = ({
  y = 50,
  duration = 0.7,
  delay = 0,
  ease = 'easeOut',
}: Pick<AnimatedSectionProps, 'y' | 'duration' | 'delay' | 'ease'>): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease, // string easings are valid in framer-motion typings
    },
  },
});

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  variants,
  as = 'section',
  id,
  ariaLabel,
  once = true,
  viewportAmount = 0.1,
  y,
  duration,
  delay,
  ease,
  disabled = false,
}) => {
  const reduceMotion = useReducedMotion();

  // If animations are disabled or user prefers reduced motion,
  // render a plain semantic wrapper to avoid any hydration diff/flicker.
  const Tag = (as || 'section') as TagName;
  if (disabled || reduceMotion) {
    return (
      <Tag id={id} aria-label={ariaLabel} className={`py-12 md:py-16 ${className}`}>
        {children}
      </Tag>
    );
  }

  // Get correct motion component for the chosen tag.
  // Get correct motion component for the chosen tag.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionComp = (motion as unknown as Record<string, React.ComponentType<any>>)[as] || motion.section;

  const usedVariants: Variants =
    variants || buildDefaultVariants({ y, duration, delay, ease });

  return (
    <MotionComp
      id={id}
      aria-label={ariaLabel}
      className={`py-12 md:py-16 ${className}`}
      variants={usedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: viewportAmount }}
    >
      {children}
    </MotionComp>
  );
};

export default AnimatedSection;