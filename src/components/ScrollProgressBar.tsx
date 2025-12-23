'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1.5 origin-left z-[100] bg-gradient-to-r from-gold-300 via-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{ scaleX }}
        />
    );
}
