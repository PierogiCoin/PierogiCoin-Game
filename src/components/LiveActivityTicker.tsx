'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameEvents } from '@/hooks/useGameEvents';
import { Trophy, Coins, Sparkles, ArrowUpCircle, Shield, Sword } from 'lucide-react';

export default function LiveActivityTicker() {
  // const { t } = useTranslation('funding-hub'); // potentially useful later
  const { events, loading } = useGameEvents(20);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <Coins className="w-3.5 h-3.5 text-gold-400" />;
      case 'achievement': return <Trophy className="w-3.5 h-3.5 text-purple-400" />;
      case 'rare_drop': return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'level_up': return <ArrowUpCircle className="w-3.5 h-3.5 text-green-400" />;
      case 'raid_win': return <Sword className="w-3.5 h-3.5 text-red-400" />;
      case 'guild_join': return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Coins className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const displayEvents = useMemo(() => {
    if (loading || events.length === 0) return [
      { id: 'loading-1', user: 'System', description: 'Initializing Live Feed...', type: 'guild_join', timestamp: new Date().toISOString(), value: '' } as any
    ];
    // Duplicate simply for infinite scroll illusion if needed, but marquee handles it better if content is wide enough
    return events;
  }, [events, loading]);

  return (
    <div className="w-full bg-[#0a0a0f] border-b border-white/5 overflow-hidden py-1.5 hidden md:block z-50 relative">
      <div className="max-w-[1920px] mx-auto px-4 flex items-center">
        <div className="flex items-center gap-2 mr-6 shrink-0 relative z-10 bg-[#0a0a0f] pr-4 border-r border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            LIVE <span className="text-white">GAME FEED</span>
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative mask-linear-fade">
          <motion.div
            className="flex gap-12 whitespace-nowrap items-center"
            animate={{ x: events.length > 5 ? [0, -1000] : 0 }} // Only scroll if enough content
            transition={{
              repeat: Infinity,
              duration: Math.max(20, events.length * 4), // Dynamic speed
              ease: "linear"
            }}
          >
            {/* Render twice for seamless loop */}
            {[...displayEvents, ...displayEvents, ...displayEvents].map((event, i) => (
              <div key={`${event.id}-${i}`} className="flex items-center gap-2.5 text-xs group">
                {getTypeIcon(event.type)}
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors">{event.user}</span>
                  <span className="text-gray-400">{event.description}</span>
                  {event.value && (
                    <span className={`font-bold ${event.type === 'purchase' ? 'text-green-400' : 'text-gold-300'}`}>
                      {event.value}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-600 border-l border-white/10 pl-2">
                  {Math.max(0, Math.floor((new Date().getTime() - new Date(event.timestamp).getTime()) / 60000))}m ago
                </span>
              </div>
            ))}
          </motion.div>

          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
