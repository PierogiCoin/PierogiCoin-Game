'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, Variants } from 'framer-motion';
import { PROJECT_STATS } from '@/data/projectData';
import Link from 'next/link';
import PierogiClicker from '@/components/EasterEgg/PierogiClicker';
import { useTranslation } from 'react-i18next';
import { useGameStats } from '@/hooks/useGameStats';
// import { usePresaleStatus } from '@/hooks/usePresaleStatus';

// --- Animated Counter Component ---
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <>{displayValue}{suffix}</>;
}

// --- Starfield Background Component ---
const Starfield = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// --- Floating Particle Component ---
const FloatingParticle = ({ color, size, startX, startY, duration }: {
  color: string; size: number; startX: number; startY: number; duration: number
}) => (
  <motion.div
    className={`absolute rounded-full ${color} blur-[1px]`}
    style={{ width: size, height: size, left: `${startX}%`, top: `${startY}%` }}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, -10, 0],
      opacity: [0.6, 1, 0.6],
    }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
  />
);

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 }
  },
};

const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 40px rgba(251,191,36,0.4)",
      "0 0 80px rgba(251,191,36,0.6)",
      "0 0 40px rgba(251,191,36,0.4)",
    ],
  },
};

// import { useFundStats } from '@/hooks/useFundStats'; // unused

// ...

export default function HeroContent() {
  const { t } = useTranslation('homepage');
  const { stats, loading: loadingStats } = useGameStats();
  // const { loading: loadingFund } = useFundStats(); // usdRaised unused

  // Use live stats if available, otherwise fall back to project data (activePlayers only, fund starts at 0)
  const activePlayers = loadingStats ? PROJECT_STATS.activePlayers : stats.activePlayers;
  // const currentFund = loadingFund ? 0 : usdRaised; // Unused



  return (
    <div className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#030014] pt-20 lg:pt-0">

      {/* ——— BACKGROUND LAYERS ——— */}

      {/* 1. Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,20,60,0.4)_0%,_transparent_70%)]" />

      {/* 2. Starfield */}
      <Starfield />

      {/* 3. Grid Pattern with fade */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]" />

      {/* 4. Aurora Gradient Waves */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 30%, rgba(251,191,36,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse at 60% 20%, rgba(251,191,36,0.2) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(6,182,212,0.15) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 30%, rgba(251,191,36,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 5. Floating Ambient Orbs */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 6. Floating Particles */}
      <FloatingParticle color="bg-amber-400" size={8} startX={15} startY={20} duration={6} />
      <FloatingParticle color="bg-green-400" size={6} startX={85} startY={30} duration={7} />
      <FloatingParticle color="bg-cyan-400" size={5} startX={75} startY={70} duration={8} />
      <FloatingParticle color="bg-amber-300" size={4} startX={25} startY={75} duration={5} />
      <FloatingParticle color="bg-purple-400" size={7} startX={90} startY={60} duration={9} />

      {/* ——— MAIN CONTENT ——— */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ——— LEFT COLUMN: Content ——— */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left flex flex-col justify-center"
          >
            {/* Live Badge with dramatic glow */}
            <motion.div variants={itemVariants}>
              <motion.div
                className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full bg-green-950/50 border border-green-500/40 backdrop-blur-xl"
                animate={glowPulse.animate}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ boxShadow: "0 0 30px rgba(34,197,94,0.3)" }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                </span>
                <span className="text-green-400 font-bold text-xs uppercase tracking-[0.2em]">
                  {t('hero.badge_phase')}
                </span>
              </motion.div>
            </motion.div>

            {/* Main Title with enhanced typography */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl xl:text-[5.5rem] font-black mb-8 leading-[0.9] tracking-tight text-white"
            >
              <span className="block drop-shadow-2xl">{t('hero.title_prefix')}</span>
              <motion.span
                className="relative inline-block my-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Multi-layer glow effect */}
                <span className="absolute -inset-4 blur-[40px] bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 rounded-full" />
                <span className="absolute -inset-2 blur-xl bg-amber-500/20 rounded-full" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                  {t('hero.title_highlight')}
                </span>
              </motion.span>
              <span className="block drop-shadow-2xl">{t('hero.title_suffix')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl leading-relaxed"
            >
              {t('hero.subtitle_prefix')}{' '}
              <span className="text-white font-semibold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                {t('hero.subtitle_highlight')}
              </span>{' '}
              {t('hero.subtitle_suffix')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              {/* Primary CTA - Telegram */}
              <motion.a
                href="https://t.me/PRGWHEEL_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 rounded-2xl font-black text-lg overflow-hidden"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                />

                {/* Shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] group-hover:animate-shine" />

                {/* Outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />

                <span className="relative z-10 flex items-center justify-center gap-3 text-black">
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                  <span>{t('hero.cta_telegram')}</span>
                </span>
              </motion.a>

              {/* Secondary CTA - Browser */}
              <motion.a
                href="https://teleprg.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 text-white font-bold text-lg backdrop-blur-xl transition-all flex items-center justify-center gap-3 overflow-hidden"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-xl">🌐</span>
                <span className="relative z-10">{t('hero.cta_browser')}</span>
              </motion.a>

              {/* Dashboard / Login CTA */}
              <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="group relative px-10 py-5 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 hover:border-indigo-500/40 text-white font-bold text-lg backdrop-blur-xl transition-all flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-indigo-500/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-indigo-400 group-hover:text-indigo-300 transition-colors text-xl">👤</span>
                  <span className="relative z-10">{t('hero.cta_dashboard', { defaultValue: 'My Dashboard' })}</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Dashboard */}
            <motion.div
              variants={itemVariants}
              className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 md:gap-8"
            >
              <StatItem
                value={activePlayers}
                suffix="+"
                label={t('hero.stat_players')}
                icon="👥"
              />
              <StatItem
                value={PROJECT_STATS.targetFund / 1000}
                prefix="$"
                suffix="k"
                label={t('hero.stat_goal')}
                icon="🎯"
              />
              <StatItem
                value={100}
                suffix="%"
                label={t('hero.stat_launch')}
                icon="✅"
                highlight
              />
            </motion.div>

          </motion.div>

          {/* ——— RIGHT COLUMN: Interactive Pierogi ——— */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
            className="relative flex justify-center items-center mt-10 lg:mt-0"
          >
            {/* Massive Central Glow */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)",
                filter: "blur(40px)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary Glow Ring */}
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full border border-amber-500/20 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            {/* The Clicker Core */}
            <motion.div
              className="relative z-20 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6))" }}
            >
              <PierogiClicker />
            </motion.div>

            {/* Orbiting Elements */}
            <motion.div
              className="absolute w-[140%] h-[140%] rounded-full pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute w-2 h-2 bg-amber-400 rounded-full top-0 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              <div className="absolute w-2 h-2 bg-amber-400 rounded-full bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
            </motion.div>

            <motion.div
              className="absolute w-[120%] h-[120%] border border-dashed border-amber-500/30 rounded-full pointer-events-none"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full left-0 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <div className="absolute w-1.5 h-1.5 bg-green-400 rounded-full right-0 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </motion.div>

            {/* Floating Icons */}
            <motion.div
              className="absolute top-[-5%] right-[10%] text-3xl"
              animate={{ y: [-15, 15, -15], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              💰
            </motion.div>
            <motion.div
              className="absolute bottom-[5%] left-[5%] text-2xl"
              animate={{ y: [15, -15, 15], rotate: [0, -15, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              🥟
            </motion.div>

          </motion.div>

        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}

// Enhanced Stat Item Component
function StatItem({
  value,
  label,
  icon,
  prefix = '',
  suffix = '',
  highlight = false
}: {
  value: number;
  label: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className="group cursor-default text-center"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <div className={`text-2xl md:text-3xl font-black ${highlight
        ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]'
        : 'text-white'
        } transition-all`}>
        {prefix}<AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.15em] mt-1.5 group-hover:text-gray-300 transition-colors">
        {label}
      </div>
    </motion.div>
  );
}