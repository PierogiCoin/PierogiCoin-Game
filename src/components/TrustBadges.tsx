'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, CheckCircle, Clock } from 'lucide-react';

export default function TrustBadges() {
  const { t } = useTranslation('homepage');
  const badges = [
    {
      icon: Clock,
      label: t('trust_badges.audit_label'),
      status: 'pending',
      description: t('trust_badges.audit_desc'),
    },
    {
      icon: Shield,
      label: t('trust_badges.community_label'),
      status: 'active',
      description: t('trust_badges.community_desc'),
    },
    {
      icon: Lock,
      label: t('trust_badges.legal_label'),
      status: 'pending',
      description: t('trust_badges.legal_desc'),
    },
    {
      icon: CheckCircle,
      label: t('trust_badges.play_label'),
      status: 'active',
      description: t('trust_badges.play_desc'),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-20">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('trust_badges.title')}
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          {t('trust_badges.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          const isActive = badge.status === 'active';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`
                relative p-8 rounded-2xl border backdrop-blur-xl group
                transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-br from-[#0d0d14]/80 to-[#1a1a24]/80 border-gold-500/20 hover:border-gold-500/40 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                  : 'bg-[#0d0d14]/60 border-white/5 hover:border-white/10 hover:bg-[#15151e]'
                }
              `}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {t('trust_badges.live')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Clock size={10} strokeWidth={3} />
                    {t('trust_badges.soon')}
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`
                mb-6 inline-flex p-4 rounded-xl shadow-inner
                ${isActive
                  ? 'bg-gradient-to-br from-gold-500/20 to-amber-600/5 ring-1 ring-gold-500/30'
                  : 'bg-white/5 ring-1 ring-white/10'
                }
              `}>
                <Icon
                  size={32}
                  className={isActive ? 'text-gold-400' : 'text-gray-400'}
                  strokeWidth={1.5}
                />
              </div>

              {/* Label */}
              <h4 className={`text-xl font-bold mb-3 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {badge.label}
              </h4>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {badge.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 pt-8 border-t border-white/5 text-center"
      >
        <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm text-gray-400">
          <Lock className="w-3 h-3 text-gold-500" />
          <span><strong className="text-gold-400">{t('trust_badges.security_note_prefix')}</strong> {t('trust_badges.security_note')}</span>
        </p>
      </motion.div>
    </div>
  );
}
