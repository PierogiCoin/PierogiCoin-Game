'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';

export default function NFTTiers() {
  const { t } = useTranslation('nft-page');

  const tiers = [
    {
      id: 'student',
      img: '/nft/tier1_student.png',
      color: 'from-blue-400 to-cyan-500',
      shadow: 'shadow-cyan-500/20',
      delay: 0.1,
    },
    {
      id: 'grandma',
      img: '/nft/tier2_grandma.png',
      color: 'from-orange-400 to-amber-500',
      shadow: 'shadow-amber-500/20',
      featured: true,
      delay: 0.2,
    },
    {
      id: 'golden',
      img: '/nft/tier3_golden.png',
      color: 'from-yellow-300 to-gold-500',
      shadow: 'shadow-gold-500/30',
      delay: 0.3,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-black text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('tiers.title')}
        </motion.h2>
        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('tiers.subtitle')}
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: tier.delay }}
            className={`relative rounded-3xl p-[1px] bg-gradient-to-b ${
              tier.featured ? 'from-gold-500 to-amber-700' : 'from-gray-700 to-gray-900'
            } ${tier.featured ? 'md:-mt-8 md:mb-8 z-10' : ''}`}
          >
            <div className={`h-full bg-[#0a0a12] rounded-[23px] overflow-hidden flex flex-col relative`}>
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden group">
                <Image
                  src={tier.img}
                  alt={t(`tiers.${tier.id}.name`)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent" />
                
                {/* Price Badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                  <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>
                  {t(`tiers.${tier.id}.price`)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{t(`tiers.${tier.id}.name`)}</h3>
                <p className="text-gray-400 text-sm mb-6 h-10">{t(`tiers.${tier.id}.desc`)}</p>

                <div className="flex-1 space-y-3 mb-8">
                  {(t(`tiers.${tier.id}.features`, { returnObjects: true }) as string[]).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className={`mt-1 min-w-[16px] flex justify-center text-transparent bg-clip-text bg-gradient-to-r ${tier.color}`}>
                        <FaCheck size={12} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3 rounded-xl font-bold text-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] bg-gradient-to-r ${tier.color}`}>
                  {t('tiers.cta')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
