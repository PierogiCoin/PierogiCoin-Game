'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ——— TYPY ———
interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    val?: number; // Added for the new particle logic
}

export default function PierogiClicker() {
    const { t } = useTranslation('common');
    // Persistent score state
    const [minedAmount, setMinedAmount] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]); // Renamed from ClickParticle to Particle

    // NEW: NFT Multiplier State
    const [multiplier, setMultiplier] = useState(1.00);

    const controls = useAnimation();
    const pierogiRef = useRef<HTMLDivElement>(null);

    // Load score from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('prg_mined');
        if (saved) {
            setMinedAmount(parseFloat(saved)); // Changed to parseFloat for decimal support
        }
    }, []);

    // Save score to localStorage on change
    useEffect(() => {
        localStorage.setItem('prg_mined', minedAmount.toString());
    }, [minedAmount]);

    // Efekt "bicia serca" zachęcający do kliknięcia, gdy użytkownik jest nieaktywny
    useEffect(() => {
        controls.start({
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } // Changed to tween (default) instead of spring
        });
    }, [controls]);

    const triggerReward = () => {
        // Placeholder for reward logic
        console.log("Milestone reached! Triggering reward.");
        // Example: setMultiplier(prev => prev + 0.1);
    };

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        // 1. Mining Logic
        const baseAmount = 1;
        const amount = baseAmount * multiplier; // Apply NFT Multiplier

        // Use functional state update to prevent stale closures if clicking fast
        setMinedAmount(prev => {
            const newTotal = prev + amount;

            // 3. Milestones & Rewards (Check against approx integers to avoid Float issues)
            if (Math.floor(newTotal) > Math.floor(prev) && Math.floor(newTotal) % 100 === 0) {
                triggerReward();
            }
            return newTotal;
        });

        // 2. Haptic Feedback (wibracja na mobile)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50); // Krótka, przyjemna wibracja
        }

        // 3. Oblicz pozycję kliknięcia (dla cząsteczek)
        // Obsługa zarówno myszki jak i dotyku
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = pierogiRef.current?.getBoundingClientRect();
        const randomX = (Math.random() - 0.5) * 40; // Added random X offset
        const x = rect ? (clientX - rect.left) + randomX : 50 + randomX;
        const y = rect ? clientY - rect.top : 50;

        // 4. Dodaj nową cząsteczkę (Floating Text)
        const newParticle: Particle = {
            id: Date.now() + Math.random(), // Unikalne ID
            x: x,
            y: y,
            rotation: Math.random() * 40 - 20, // Lekka rotacja losowa
        };

        setParticles((prev) => [...prev, newParticle]);

        // 5. Reset animacji "Idle" i uruchomienie animacji "Click"
        controls.start({
            scale: [0.9, 1.15, 1], // Squash and stretch
            rotate: [0, -5, 5, 0], // Shake
            transition: { duration: 0.3, ease: "easeOut" } // Changed from spring to tween (3 keyframes not supported with spring)
        });
    }, [multiplier, controls]);

    // Usuwanie cząsteczki po zakończeniu jej animacji
    const removeParticle = (id: number) => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
    };

    // NFT Simulation Handlers
    const simulateTier = (tierMultiplier: number) => {
        setMultiplier(tierMultiplier);
    };

    return (
        <div className="relative select-none" ref={pierogiRef}>

            {/* ——— COUNTER BADGE ——— */}
            <motion.div
                key={Math.floor(minedAmount)} // Klucz sprawia, że animacja odpala się przy każdej zmianie liczby
                initial={{ y: -20, opacity: 0, scale: 0.5 }}
                animate={{ y: -50, opacity: 1, scale: 1 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-30"
            >
                <div className="bg-gradient-to-r from-gold-400 to-amber-600 text-black font-black text-sm px-3 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md whitespace-nowrap">
                    {Math.floor(minedAmount)} PIEROGÓW
                </div>
            </motion.div>

            {/* ——— NFT MULTIPLIER DEBUG/SIMULATION ——— */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${multiplier > 1 ? 'bg-green-500/80 border-green-300 text-white' : 'bg-black/50 border-white/20 text-gray-300'}`}>
                    {t('nft_multiplier', 'Mnożnik NFT')}: x{multiplier.toFixed(2)}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => simulateTier(1.00)} className="w-6 h-6 rounded bg-gray-700 text-[10px] text-white flex items-center justify-center border border-white/20 hover:bg-gray-600 transition-colors" title="No NFT">🚫</button>
                    <button onClick={() => simulateTier(1.05)} className="w-6 h-6 rounded bg-blue-900 text-[10px] text-white flex items-center justify-center border border-blue-400 hover:bg-blue-800 transition-colors" title="Student (+5%)">🥉</button>
                    <button onClick={() => simulateTier(1.15)} className="w-6 h-6 rounded bg-purple-900 text-[10px] text-white flex items-center justify-center border border-purple-400 hover:bg-purple-800 transition-colors" title="Grandma (+15%)">🥈</button>
                    <button onClick={() => simulateTier(1.25)} className="w-6 h-6 rounded bg-yellow-900 text-[10px] text-white flex items-center justify-center border border-gold-400 hover:bg-yellow-800 transition-colors" title="Golden (+25%)">🥇</button>
                </div>
            </div>

            {/* ——— PARTICLE SYSTEM (FLOATING +1) ——— */}
            <AnimatePresence>
                {particles.map((particle) => (
                    <FloatingNumber
                        key={particle.id}
                        particle={particle}
                        onComplete={() => removeParticle(particle.id)}
                    />
                ))}
            </AnimatePresence>

            {/* ——— GLOW BEHIND ——— */}
            <div className="absolute inset-0 bg-amber-400/30 blur-[40px] rounded-full scale-75 animate-pulse-slow" />

            {/* ——— THE PIEROGI (CLICK TARGET) ——— */}
            <motion.div
                animate={controls}
                whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                className="relative z-20 cursor-pointer drop-shadow-2xl"
                style={{ touchAction: 'manipulation' }} // Zapobiega zoomowaniu na mobile przy szybkim klikaniu
            >
                <PierogiSVG />
            </motion.div>
        </div>
    );
}

// ——— SUBCOMPONENTS ———

// 1. Cząsteczka "+1"
function FloatingNumber({ particle, onComplete }: { particle: Particle, onComplete: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 1, x: particle.x, y: particle.y, scale: 0.5 }}
            animate={{
                opacity: 0,
                y: particle.y - 150, // Lecimy do góry
                x: particle.x + (Math.random() * 60 - 30), // Lekki dryf na boki
                scale: 1.5,
                rotate: particle.rotation
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={onComplete}
            className="absolute z-40 pointer-events-none"
        >
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-t from-white to-gold-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                +1
            </span>
        </motion.div>
    );
}

// 2. Grafika Pieroga (Inline SVG)
function PierogiSVG() {
    return (
        <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
        >
            <defs>
                {/* Ciasto - Gradient */}
                <linearGradient id="doughGradient" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE68A" /> {/* amber-200 */}
                    <stop offset="1" stopColor="#D97706" /> {/* amber-600 */}
                </linearGradient>

                {/* Połysk - Gradient */}
                <linearGradient id="shineGradient" x1="100" y1="40" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0.6" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>

                {/* Cień wewnętrzny (falbanka) */}
                <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset dx="1" dy="2" />
                    <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.4  0 0 0 0 0.1  0 0 0 0.4 0" />
                </filter>
            </defs>

            {/* Główny kształt pieroga */}
            <path
                d="M20 100 C20 40 60 10 100 10 C140 10 180 40 180 100 C180 130 160 160 100 160 C40 160 20 130 20 100 Z"
                fill="url(#doughGradient)"
                stroke="#B45309"
                strokeWidth="3"
                className="drop-shadow-xl"
            />

            {/* Falbanka (Dekoracyjny brzeg) */}
            <path
                d="M20 100 Q25 90 30 100 T40 100 T50 100 T60 100 T70 100 T80 100 T90 100 T100 100 T110 100 T120 100 T130 100 T140 100 T150 100 T160 100 T170 100 T180 100"
                fill="none"
                stroke="#92400E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />

            {/* Połysk (Olej/Masło) */}
            <path
                d="M40 80 Q100 40 160 80"
                fill="none"
                stroke="url(#shineGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.8"
            />

            {/* Tekstura (Podsmażenie) */}
            <circle cx="60" cy="120" r="2" fill="#92400E" opacity="0.4" />
            <circle cx="140" cy="110" r="3" fill="#92400E" opacity="0.3" />
            <circle cx="100" cy="130" r="2" fill="#92400E" opacity="0.5" />
        </svg>
    );
}