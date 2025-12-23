'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaPaperPlane, FaDiscord, FaTwitter, FaTelegram,
  FaFacebook, FaInstagram, FaTiktok
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface SocialLink {
  href: string;
  icon: React.ElementType;
  name: string;
}

interface NavLink {
  path: string;
  nameKey: string;
  external?: boolean;
}

const socialLinks: SocialLink[] = [
  { href: 'https://x.com/PRGCoin', icon: FaTwitter, name: 'Twitter' },
  { href: 'https://t.me/PierogiC', icon: FaTelegram, name: 'Telegram' },
  { href: 'https://discord.gg/27NqCM3b', icon: FaDiscord, name: 'Discord' },
  { href: 'https://www.facebook.com/pierogicoin', icon: FaFacebook, name: 'Facebook' },
  { href: 'https://www.instagram.com/pierogicoin/', icon: FaInstagram, name: 'Instagram' },
  { href: 'https://tiktok.com/@pierogicoin', icon: FaTiktok, name: 'TikTok' },
];

const quickLinks: NavLink[] = [
  { path: '/', nameKey: 'nav.home' },
  { path: '/buy-tokens', nameKey: 'nav.buy_tokens' },
  { path: '/roadmap', nameKey: 'nav.roadmap' },
  { path: '/faq', nameKey: 'nav.faq' },
];

const resourceLinks: NavLink[] = [
  { path: '/documents/whitepaper.pdf', nameKey: 'nav.whitepaper', external: true },
  { path: '/privacy-policy', nameKey: 'nav.privacy_policy' },
  { path: '/terms-of-service', nameKey: 'nav.terms_of_service' },
];

export default function Footer() {
  const { t, i18n } = useTranslation('common');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentLocale = i18n.language || 'en';

  // unikamy podwójnych // przy budowaniu ścieżek
  const localePrefix = useMemo(() => (currentLocale ? `/${currentLocale}` : ''), [currentLocale]);

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const email = newsletterEmail.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !valid) {
      toast.error(t('validation.email_invalid'), { theme: 'dark' });
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: currentLocale }),
      });

      if (!res.ok) throw new Error(await res.text());

      // Success
      await new Promise((r) => setTimeout(r, 500)); // small delay for UX

      toast.success(t('toast.newsletter_success'), { theme: 'dark' });
      setNewsletterEmail('');

      // ewentualnie GA:
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as unknown as { gtag: (cmd: string, action: string, params: object) => void }).gtag('event', 'newsletter_subscribe', { email_domain: email.split('@')[1] });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t('toast.generic_error', { defaultValue: 'Coś poszło nie tak. Spróbuj ponownie.' }) + ` (${msg})`, { theme: 'dark' });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <motion.footer
      className="pt-16 pb-10 bg-[#07070d] text-gray-400 border-t border-gold-500/10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* logo + social */}
          <div className="space-y-5">
            <Link href={`${localePrefix}`} className="inline-flex items-center gap-3 group">
              <Image src="/images/logo.png" alt={t('logoAlt')} width={44} height={44} className="rounded-full" />
              <span className="text-xl font-bold text-gold-300 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.4)] transition">
                PierogiCoin
              </span>
            </Link>
            <p className="text-sm leading-relaxed">{t('footer.description')}</p>

            <div className="pt-2">
              <h6 className="text-md font-semibold text-gray-200 mb-3">{t('footer.follow_us')}</h6>
              <div className="flex flex-wrap gap-5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      aria-label={social.name}
                      className="text-gray-400 hover:text-gold-400 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 rounded transition-colors"
                      whileHover={{ y: -3, scale: 1.12 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="sr-only">{social.name}</span>
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* szybkie linki */}
          <div>
            <h5 className="text-lg font-semibold text-gray-100 mb-6">{t('footer.quick_links_title')}</h5>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={`${localePrefix}${link.path}`}
                    className="hover:text-gold-400 text-sm transition-colors hover:underline underline-offset-4"
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* zasoby */}
          <div>
            <h5 className="text-lg font-semibold text-gray-100 mb-6">{t('footer.resources_title')}</h5>
            <ul className="space-y-3">
              {resourceLinks.map((link) => {
                const href = link.external ? link.path : `${localePrefix}${link.path}`;
                const externalProps = link.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {};
                return (
                  <li key={link.path}>
                    <Link
                      href={href}
                      {...externalProps}
                      className="hover:text-gold-400 text-sm transition-colors hover:underline underline-offset-4"
                    >
                      {t(link.nameKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h5 className="text-lg font-semibold text-gray-100 mb-6">{t('footer.stay_updated_title')}</h5>
            <p className="text-sm mb-4">{t('footer.newsletter_subtitle')}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('form.email_placeholder')}
                className="w-full px-4 py-2.5 text-sm bg-[#0d0d14] border border-gray-700/50 rounded-md outline-none focus:ring-2 focus:ring-gold-500/70 focus:border-gold-500/50 transition-colors"
                required
                aria-label={t('form.email_placeholder')}
                inputMode="email"
                autoComplete="email"
              />
              <motion.button
                type="submit"
                disabled={isSubscribing}
                className={[
                  'w-full font-bold py-2.5 px-5 text-sm rounded-md flex items-center justify-center transition-all',
                  isSubscribing ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 hover:shadow-lg hover:shadow-gold-400/30 text-gray-900'
                ].join(' ')}
                whileHover={{ scale: isSubscribing ? 1 : 1.05 }}
                whileTap={{ scale: isSubscribing ? 1 : 0.98 }}
                aria-busy={isSubscribing}
              >
                {isSubscribing
                  ? t('form.subscribing_button')
                  : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      {t('form.subscribe_button')}
                    </>
                  )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* dół */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500 max-w-4xl mx-auto space-y-4">
          <p>
            <strong>LEGAL DISCLAIMER:</strong> PierogiCoin ($PRG) is a utility token designed for gaming and entertainment within the PierogiCoin Ecosystem.
            It is not a financial security, stock, or investment contract. Purchasing $PRG, Founder Packs, or Game Items does not grant any equity, dividends, or ownership rights in the company.
          </p>
          <p>
            <strong>RISK WARNING:</strong> Cryptocurrency value is volatile. Only buy what you intend to use in the game or spend at participating partners.
            Do not spend money you cannot afford to lose. This project is community-driven and currently in a &quot;Donation to Audit&quot; phase.
          </p>
          <p className="mt-4">
            © {currentYear} PierogiCoin. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
