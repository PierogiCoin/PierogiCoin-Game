'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { type Engine } from '@tsparticles/engine';
import { useReducedMotion } from 'framer-motion';

// --- CSS Mesh Gradient Component (Lightweight Default) ---
const AuroraBackground = () => (
    <div className="absolute inset-0 -z-50 overflow-hidden bg-black">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gold-900/20 blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-amber-700/10 blur-[90px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-[0.03]" />
    </div>
);

// --- Particle Configs ---

const GOLD_DUST_CONFIG = {
    background: {
        color: { value: "#000000" },
    },
    fpsLimit: 60,
    particles: {
        color: { value: "#fbbf24" },
        move: {
            direction: "top" as const,
            enable: true,
            random: true,
            speed: 0.8,
            straight: false,
        },
        number: {
            density: { enable: true, height: 800, width: 800 },
            value: 60,
        },
        opacity: {
            value: { min: 0.1, max: 0.5 },
            animation: { enable: true, speed: 1, sync: false }
        },
        size: {
            value: { min: 1, max: 3 },
        },
        shape: { type: "circle" },
    },
    detectRetina: true,
};

const CYBER_NET_CONFIG = {
    background: {
        color: { value: "#050505" },
    },
    fpsLimit: 60,
    particles: {
        color: { value: "#fbbf24" },
        links: {
            color: "#fbbf24",
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
        },
        move: {
            enable: true,
            speed: 1,
        },
        number: {
            density: { enable: true, height: 800, width: 800 },
            value: 40,
        },
        opacity: { value: 0.3 },
        size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
};

export default function ModernBackground() {
    const [init, setInit] = useState(false);
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    // Initialize tsparticles engine once
    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = useCallback(async () => {
        // console.log("Particles loaded");
    }, []);

    const currentEffect = useMemo(() => {
        if (reduceMotion) return 'aurora'; // Always use CSS mesh on reduced motion

        if (pathname === '/' || pathname === '/en' || pathname === '/pl') return 'gold_dust';
        if (pathname?.includes('/tokenomics')) return 'cyber_net';
        if (pathname?.includes('/buy-tokens')) return 'cyber_net';

        // Default to Aurora Mesh for About, Contact, Roadmap, etc.
        return 'aurora';
    }, [pathname, reduceMotion]);

    if (!init && currentEffect !== 'aurora') return <AuroraBackground />; // Fallback while loading

    return (
        <div className="fixed inset-0 -z-50 pointer-events-none">
            {currentEffect === 'gold_dust' && (
                <Particles
                    id="tsparticles-gold"
                    particlesLoaded={particlesLoaded}
                    options={GOLD_DUST_CONFIG}
                    className="absolute inset-0"
                />
            )}

            {currentEffect === 'cyber_net' && (
                <Particles
                    id="tsparticles-net"
                    particlesLoaded={particlesLoaded}
                    options={CYBER_NET_CONFIG}
                    className="absolute inset-0"
                />
            )}

            {currentEffect === 'aurora' && <AuroraBackground />}
        </div>
    );
}
