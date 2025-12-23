'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FiFlag, FiShield, FiZap } from 'react-icons/fi';

// --- Komponent: Tło z Gwiazdami (Starfield) ---
const StarField = () => {
    // Generujemy po stronie klienta, aby uniknąć błędów hydracji
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: number }[]>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-70"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// --- Komponent: Pojedyncza Planeta (Z efektem Tilt 3D) ---
interface PlanetProps {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    align: 'left' | 'right' | 'center';
    yOffset: MotionValue<string>;
    className?: string;
    delay?: number;
    color: string; // np. "gold", "green", "blue"
}

const Planet = ({ src, alt, title, subtitle, icon, align, yOffset, className, delay = 0, color }: PlanetProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    const resetMouse = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    // Dynamiczne klasy kolorów (Tailwind nie lubi dynamicznych nazw klas, więc mapujemy)
    const colorClasses: Record<string, { glow: string; border: string; text: string; bg: string }> = {
        gold: { glow: 'bg-amber-400/20', border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
        green: { glow: 'bg-emerald-400/20', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        blue: { glow: 'bg-blue-500/30', border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    };
    const styles = colorClasses[color] || colorClasses.blue;

    return (
        <motion.div
            style={{ y: yOffset, perspective: 1000 }}
            className={`absolute z-10 ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMouse}
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="relative w-full h-full group cursor-pointer"
            >
                {/* Glow behind planet */}
                <div className={`absolute inset-4 ${styles.glow} blur-[60px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-700`} />

                {/* Planet Image */}
                <div className="relative w-full h-full animate-float" style={{ animationDuration: '6s' }}>
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 200px, 400px"
                    />
                    {/* Orbit Ring visual */}
                    <div className={`absolute inset-0 border ${styles.border} rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-12`} />
                </div>

                {/* Floating Label */}
                <motion.div
                    className={`absolute -bottom-12 ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2'} w-max z-20`}
                    whileHover={{ y: -5 }}
                >
                    <div className={`flex flex-col items-center backdrop-blur-md p-4 rounded-2xl border ${styles.border} ${styles.bg} shadow-2xl`}>
                        <div className={`flex items-center gap-2 ${styles.text} font-bold text-lg uppercase tracking-wide`}>
                            {icon} {title}
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
                        <div className="text-gray-300 text-xs font-mono tracking-widest">{subtitle}</div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// --- Główny Komponent ---

export default function PierogiGalaxyMap() {
    const { t } = useTranslation('homepage');
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll Logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const springConfig = { stiffness: 70, damping: 20 };
    const scrollSpring = useSpring(scrollYProgress, springConfig);

    // Parallax Transforms
    const yBg = useTransform(scrollSpring, [0, 1], ["0%", "15%"]);
    const yPlanet1 = useTransform(scrollSpring, [0, 1], ["0%", "-15%"]);
    const yPlanet2 = useTransform(scrollSpring, [0, 1], ["10%", "-30%"]);
    const yPlanet3 = useTransform(scrollSpring, [0, 1], ["20%", "-5%"]);

    // Path drawing animation
    const pathLength = useTransform(scrollSpring, [0.1, 0.8], [0, 1]);

    return (
        <section ref={containerRef} className="relative min-h-[150vh] overflow-hidden bg-[#030014] py-20">

            {/* 1. Dynamic Background Layers */}
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1)_0%,_rgba(0,0,0,1)_100%)]" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <StarField />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col pt-10">

                {/* Header Section */}
                <div className="text-center mb-16 md:mb-32 z-20 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4 px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-mono"
                    >
                        SYSTEM OVERVIEW
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tight"
                    >
                        {t('galaxy.title_prefix') || "Galaxy"}<br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-600">
                            {t('galaxy.title_highlight') || "Roadmap"}
                        </span>
                    </motion.h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {t('galaxy.description') || "Explore the phases of our cosmic expansion."}
                    </p>
                </div>

                {/* Galaxy Container */}
                <div className="relative w-full flex-1 min-h-[1000px] md:min-h-[1200px]">

                    {/* Responsive Connector SVG */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Curve connecting: Left(15,10) -> Right(85, 40) -> Center(50, 85) */}
                        <motion.path
                            d="M 15,15 C 40,15, 60,30, 85,40 C 95,45, 80,70, 50,85"
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="0.3"
                            strokeDasharray="1 1"
                            filter="url(#glow)"
                            style={{ pathLength }}
                        />
                    </svg>

                    {/* Planet 1: Pierogi Prime (Top Left) */}
                    <Planet
                        src="/images/galaxy/pierogi_prime.png"
                        alt="Pierogi Prime"
                        title={t('galaxy.planet_1.name') || "Origin"}
                        subtitle={t('galaxy.planet_1.phase') || "Phase 1"}
                        icon={<FiFlag />}
                        align="left"
                        yOffset={yPlanet1}
                        color="gold"
                        className="top-[0%] left-[5%] md:left-[5%] w-48 h-48 md:w-80 md:h-80"
                    />

                    {/* Planet 2: Audit Moon (Middle Right) */}
                    <Planet
                        src="/images/galaxy/audit_moon.png"
                        alt="Audit Moon"
                        title={t('galaxy.planet_2.name') || "Audit"}
                        subtitle={t('galaxy.planet_2.phase') || "Phase 2"}
                        icon={<FiShield />}
                        align="right"
                        yOffset={yPlanet2}
                        color="green"
                        delay={0.2}
                        className="top-[35%] right-[5%] md:right-[5%] w-40 h-40 md:w-64 md:h-64"
                    />

                    {/* Planet 3: Presale City (Bottom Center - The Big One) */}
                    <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-3xl flex justify-center z-20">
                        <Planet
                            src="/images/galaxy/presale_city.png"
                            alt="Presale City"
                            title={t('galaxy.planet_3.name') || "Launchpad"}
                            subtitle={t('galaxy.planet_3.date') || "Incoming"}
                            icon={<FiZap />}
                            align="center"
                            yOffset={yPlanet3}
                            color="blue"
                            delay={0.4}
                            className="relative w-72 h-72 md:w-[500px] md:h-[500px]"
                        />

                        {/* Special Effects for the Main Planet */}
                        <motion.div
                            style={{ y: yPlanet3, opacity: pathLength }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -z-10"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}