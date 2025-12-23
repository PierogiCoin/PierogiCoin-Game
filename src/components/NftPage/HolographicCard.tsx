'use client';

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

interface HolographicCardProps {
    imgSrc: string;
    title: string;
    subtitle: string;
}

export default function HolographicCard({ imgSrc, title, subtitle }: HolographicCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse position state
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for rotation
    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    // Transform mouse position to rotation degrees
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    // Dynamic glare effect
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const glareBackground = useMotionTemplate`radial-gradient(
    circle at ${glareX} ${glareY},
    rgba(255, 215, 0, 0.4) 0%,
    transparent 60%
  )`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate normalized position (-0.5 to 0.5)
        const mouseXPos = (e.clientX - rect.left) / width - 0.5;
        const mouseYPos = (e.clientY - rect.top) / height - 0.5;

        x.set(mouseXPos);
        y.set(mouseYPos);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div style={{ perspective: 1000 }} className="relative group w-full max-w-sm mx-auto">
            <motion.div
                ref={ref}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-square rounded-2xl bg-black border border-gold-500/30 shadow-[0_0_50px_-10px_rgba(251,191,36,0.2)]"
            >
                {/* ——— IMAGE LAYER (Base) ——— */}
                <div
                    style={{ transform: "translateZ(0px)" }}
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                >
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                </div>

                {/* ——— HOLOGRAPHIC OVERLAY (Glare) ——— */}
                <motion.div
                    style={{
                        background: glareBackground,
                        transform: "translateZ(1px)",
                    }}
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
                />

                {/* ——— BORDER GLOW ——— */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-gold-400/50 transition-all duration-300" />

                {/* ——— CONTENT LAYER (Floating Text) ——— */}
                <div
                    style={{ transform: "translateZ(30px)" }}
                    className="absolute bottom-6 left-6 right-6 pointer-events-none"
                >
                    <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gold-500/20 border border-gold-500/30 backdrop-blur-md">
                        <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest">
                            Featured
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-md mb-1">{title}</h3>
                    <p className="text-sm text-gray-300 drop-shadow-sm">{subtitle}</p>
                </div>

                {/* ——— FLOATING BADGE (Top Right) ——— */}
                <div
                    style={{ transform: "translateZ(40px)" }}
                    className="absolute top-4 right-4 pointer-events-none"
                >
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                        <span className="text-lg">🥟</span>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
