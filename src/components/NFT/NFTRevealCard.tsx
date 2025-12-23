'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { FaQuestion, FaStar } from 'react-icons/fa';

interface NFTRevealCardProps {
    revealImage: string;
    name: string;
    rarity?: string;
}

export default function NFTRevealCard({ revealImage, name, rarity = 'Common' }: NFTRevealCardProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleReveal = () => {
        if (isRevealed || isAnimating) return;

        setIsAnimating(true);

        // 1. Shake animation triggered by state change in framer-motion variants
        setTimeout(() => {
            // 2. Confetti burst
            const rect = document.getElementById(`nft-card-${name}`)?.getBoundingClientRect();
            if (rect) {
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { x, y },
                    colors: ['#fbbf24', '#f59e0b', '#ffffff'],
                    zIndex: 2000,
                });
            }

            // 3. Flip to revealed state
            setIsRevealed(true);
            setIsAnimating(false);
        }, 800); // Wait for shake to finish
    };

    return (
        <div className="perspective-1000 w-64 h-80 cursor-pointer group" onClick={handleReveal} id={`nft-card-${name}`}>
            <motion.div
                className="relative w-full h-full transition-all duration-700 preserve-3d"
                animate={isAnimating ? { x: [-5, 5, -5, 5, 0] } : isRevealed ? { rotateY: 180 } : { rotateY: 0 }}
                transition={isAnimating ? { duration: 0.5 } : { duration: 0.7 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT (Hidden) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border-2 border-gold-500/30 bg-[#0b0f19] shadow-[0_0_15px_rgba(250,204,21,0.1)] flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-10" />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/30 mb-4"
                    >
                        <FaQuestion className="text-4xl text-gold-400" />
                    </motion.div>
                    <div className="text-gold-200 font-bold uppercase tracking-widest text-sm z-10">Mystery Box</div>
                    <div className="text-gray-500 text-xs mt-2 z-10">Click to Reveal</div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>

                {/* BACK (Revealed) */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border-2 border-gold-400 bg-gray-900 shadow-[0_0_25px_rgba(250,204,21,0.4)]"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    {/* Rarity Badge */}
                    <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-black/60 border border-gold-500/30 backdrop-blur-md text-[10px] font-bold text-gold-300 uppercase tracking-wide flex items-center gap-1">
                        <FaStar className="text-gold-500" /> {rarity}
                    </div>

                    <div className="relative w-full h-4/5 bg-gray-800">
                        {/* Fallback pattern if image fails or generic placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            {/* Normally Next/Image here. Using a colored div for demo/placeholder if image missing */}
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <span className="text-4xl">🥟</span>
                            </div>
                        </div>
                        {/* If we had real images, we'd enable this: */}
                        <Image src={revealImage} alt={name} fill className="object-cover" />
                    </div>

                    <div className="h-1/5 bg-[#050505] flex items-center justify-center border-t border-white/10">
                        <h3 className="text-lg font-bold text-white tracking-tight">{name}</h3>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
