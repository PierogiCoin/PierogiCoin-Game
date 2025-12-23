'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Trophy, Coins, TrendingUp } from 'lucide-react';

interface GameStats {
  activePlayers: number;
  totalEarned: number;
  gamesPlayed: number;
  topScore: number;
}

export default function LiveGameStats() {
  const { t } = useTranslation('homepage');
  const [stats, setStats] = useState<GameStats>({
    activePlayers: 142,
    totalEarned: 12500,
    gamesPlayed: 3420,
    topScore: 2450,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/game-stats');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        setStats({
          activePlayers: data.activePlayers,
          totalEarned: data.totalEarned,
          gamesPlayed: data.gamesPlayed,
          topScore: data.topScore
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch game stats:', error);
        // Fallback to initial state logic if API fails, but ideally API handles fallback
        // ensuring we don't show broken state
        setIsLoading(false);
      }
    };

    fetchStats();

    // Update every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: Users,
      label: t('live_stats.stat_active'),
      value: stats.activePlayers.toLocaleString(),
      color: 'from-green-500 to-emerald-500', // Green for "Active/Alive"
      pulse: true,
    },
    {
      icon: Coins,
      label: t('live_stats.stat_earned'),
      value: stats.totalEarned.toLocaleString(),
      suffix: ' PRG',
      color: 'from-gold-500 to-amber-500', // Gold for "Money/PRG"
    },
    {
      icon: Trophy,
      label: t('live_stats.stat_games'),
      value: stats.gamesPlayed.toLocaleString(),
      color: 'from-orange-500 to-red-500', // Orange/Red for "Action/Gaming"
    },
    {
      icon: TrendingUp,
      label: t('live_stats.stat_score'),
      value: stats.topScore.toLocaleString(),
      color: 'from-gold-400 to-gold-600', // Gold for "Winner/Top"
    },
  ];

  if (isLoading) {
    return (
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-400 text-sm font-semibold">{t('live_stats.label_live')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('live_stats.title_prefix')} <span className="text-gold-400">{t('live_stats.title_highlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('live_stats.subtitle')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:scale-105 hover:border-gold-400/30">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4 relative`}>
                  <stat.icon className="w-6 h-6 text-white" />
                  {stat.pulse && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                    </span>
                  )}
                </div>

                {/* Value */}
                <div className="relative">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-gold-400 text-lg ml-1">{stat.suffix}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="https://t.me/PRGWHEEL_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-400 to-orange-500 text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gold-500/25"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
            {t('live_stats.cta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
