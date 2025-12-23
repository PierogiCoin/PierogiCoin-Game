'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function NewsletterSection() {
  const { t } = useTranslation('homepage');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'err' | 'loading'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState('loading');

      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to subscribe');
      }

      setState('ok');
      setEmail('');
    } catch {
      setState('err');
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-6 text-center backdrop-blur-md">
        <h3 className="text-2xl font-extrabold text-gold-300">🔔 {t('newsletter.title')}</h3>
        <p className="mt-1 text-sm text-gray-300">
          {t('newsletter.subtitle')}
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-5 flex max-w-md gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="w-full rounded-lg border border-gray-700 bg-[#0a0a12] px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-gold-400"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-gold-400/50 bg-gold-400/10 px-4 py-2 text-sm font-semibold text-gold-200 hover:bg-gold-400/15"
            disabled={state === 'loading'}
          >
            {state === 'loading' ? t('newsletter.sending') : t('newsletter.button')}
          </motion.button>
        </form>
        {state === 'ok' && <div className="mt-2 text-sm text-green-400">{t('newsletter.success')}</div>}
        {state === 'err' && <div className="mt-2 text-sm text-red-400">{t('newsletter.error')}</div>}
      </div>
    </div>
  );
}
