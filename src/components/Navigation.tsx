'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, Variants, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

import LanguageSwitcher from './LanguageSwitcher';

const WalletMultiButtonDynamic = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => (
      <button className="bg-cyber-600 text-white px-4 py-2 rounded-full text-sm font-semibold opacity-70 cursor-wait animate-pulse">
        Loading Wallet...
      </button>
    )
  }
);

interface NavLinkItem {
  nameKey: string;
  path: string;
}

const NAV_LINKS_CONFIG: NavLinkItem[] = [
  { nameKey: 'home', path: '/' },
  { nameKey: 'about', path: '/about' },
  { nameKey: 'whitepaper', path: '/whitepaper' },
  { nameKey: 'tokenomics', path: '/tokenomics' },
  { nameKey: 'roadmap', path: '/roadmap' },
  { nameKey: 'nfts', path: '/nft' },
  { nameKey: 'dashboard', path: '/dashboard' },
  { nameKey: 'faq', path: '/faq' },
  { nameKey: 'contact', path: '/contact' },
];

const navVariants: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function Navigation() {
  const { publicKey, connected, disconnect } = useWallet();
  const { t, i18n } = useTranslation(['navigation', 'common']);
  const pathname = usePathname();

  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-hide on scroll & Command Palette state
  const [hiddenNav, setHiddenNav] = useState(false);
  const lastScrollYRef = useRef(0);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  const currentLocale = i18n.language;
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const THRESH = 4; // minimal delta to react
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return; // throttle to rAF
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 20);

        const lastY = lastScrollYRef.current;
        const delta = y - lastY;
        lastScrollYRef.current = y;

        if (y < 10) {
          setHiddenNav(false);
          rafId = null;
          return;
        }

        if (Math.abs(delta) < THRESH) {
          rafId = null;
          return;
        }

        if (menuOpen) {
          setHiddenNav(false);
          rafId = null;
          return;
        }

        const goingDown = delta > 0;
        if (goingDown && y > 80) {
          setHiddenNav(true);
        } else if (delta < 0) {
          setHiddenNav(false);
        }

        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
        navButtonRef.current && !navButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const copyToClipboard = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
        .then(() => toast.success(t('wallet.addressCopied', { ns: 'common' })))
        .catch(() => toast.error(t('wallet.copyFailed', { ns: 'common' })));
      if (menuOpen) setMenuOpen(false);
    }
  }, [publicKey, t, menuOpen]);

  const handleDisconnect = useCallback(() => {
    disconnect().then(() => {
      toast.info(t('wallet.disconnected', { ns: 'common' }));
    });
    if (menuOpen) setMenuOpen(false);
  }, [disconnect, t, menuOpen]);

  const filteredLinks = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return NAV_LINKS_CONFIG;
    return NAV_LINKS_CONFIG.filter((it) => t(`nav.${it.nameKey}`).toLowerCase().includes(q));
  }, [cmdQuery, t]);

  const renderNavLink = (item: NavLinkItem, isMobile = false) => {
    const basePath = item.path === '/' ? `/${currentLocale}` : `/${currentLocale}${item.path}`;
    const isActive = pathname === basePath;

    return (
      <Link
        href={basePath}
        onClick={() => { if (isMobile) setMenuOpen(false); }}
        className={`relative font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 group ${isActive ? 'text-gold-400' : 'text-gray-300 hover:text-gold-300'} ${isMobile ? 'block w-full text-left text-lg py-3' : 'text-sm'}`}
        aria-current={isActive ? "page" : undefined}
      >
        <span className={`relative z-10 ${isActive ? 'animate-pulse' : ''}`}>{t(`nav.${item.nameKey}`)}</span>
        {!isMobile && (
          <>
            <span className={`pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gold-400/20 blur-sm`} />
            {isActive && (
              <motion.div
                className="absolute bottom-[-7px] left-0 right-0 h-[3px] bg-gradient-to-r from-gold-400 via-amber-400 to-cyber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                layoutId="activeNavLinkUnderline"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Scroll progress bar */}
      {!prefersReducedMotion && (
        <motion.div
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-gold-400 via-amber-400 to-cyber-400 z-[60] origin-left"
          style={{ scaleX: progress }}
        />
      )}

      <header className={`fixed top-0 left-0 w-full flex justify-center z-50 p-3 sm:p-4 print:hidden transform transition-transform duration-300 ${hiddenNav ? '-translate-y-full' : 'translate-y-0'}`}>
        <motion.nav
          variants={navVariants}
          initial="initial"
          animate="animate"
          className={`w-full max-w-7xl p-[1.5px] rounded-full transition-all duration-300 ${scrolled
            ? 'bg-gradient-to-r from-gold-500/60 via-amber-400/60 to-cyber-500/40 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
            : 'bg-white/10'
            }`}
        >
          <div
            className={`
              flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-shadow duration-500 ${scrolled
                ? 'bg-[#07070d]/95 backdrop-blur-xl border border-gold-500/30 shadow-[0_0_24px_rgba(251,191,36,0.4)]'
                : 'bg-[#07070d]/70 backdrop-blur-md border border-white/5'
              }
            `}
          >
            <Link href={`/${currentLocale}`} className="flex items-center space-x-3 group" aria-label={t('logoAlt', { ns: 'common' })}>
              <Image
                src="/images/logo.png"
                alt={t('logoAlt', { ns: 'common' })}
                width={40}
                height={40}
                className="rounded-full border-2 border-gold-400/80 group-hover:border-gold-300 transition-colors drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                priority
              />
              <span className="text-gold-300 text-xl font-bold group-hover:text-gold-200 transition-colors hidden sm:block">PierogiCoin</span>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <ul className="flex items-center gap-1">
                {/* Main Links */}
                {NAV_LINKS_CONFIG.filter(item => ['home', 'tokenomics', 'roadmap'].includes(item.nameKey)).map((item) => (
                  <li key={item.path}>{renderNavLink(item)}</li>
                ))}

                {/* More Dropdown */}
                <li className="relative group">
                  <button className="flex items-center gap-1 font-semibold px-3 py-1.5 text-sm text-gray-300 hover:text-gold-300 transition-colors focus:outline-none">
                    {t('nav.more', { defaultValue: 'More' })} <FaChevronDown className="text-[10px] transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left pt-2">
                    <div className="rounded-xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-xl p-2 shadow-2xl flex flex-col gap-1">
                      {NAV_LINKS_CONFIG.filter(item => ['about', 'whitepaper', 'nfts', 'faq', 'contact'].includes(item.nameKey)).map((item) => (
                        <Link
                          key={item.path}
                          href={item.path === '/' ? `/${currentLocale}` : `/${currentLocale}${item.path}`}
                          className="block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {t(`nav.${item.nameKey}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>

              <LanguageSwitcher />

              <Link href={`/${currentLocale}/dashboard`} className="ml-2">
                <motion.div
                  className="bg-white/5 border border-white/10 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-white/10 hover:border-gold-500/30 transition-all flex items-center gap-2"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                >
                  <span className="text-gold-400">👤</span> {t('nav.dashboard')}
                </motion.div>
              </Link>

              <Link href={`/${currentLocale}/buy-tokens`} className="ml-2">
                <motion.div
                  className="bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-gold-400/40"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.07, y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                >
                  {t('nav.buy_tokens')}
                </motion.div>
              </Link>

              <div className="pl-1">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                >
                  <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-cyber-600 !to-cyber-500 !text-white !rounded-full !text-sm !px-4 !py-2.5 !shadow-lg hover:!brightness-110 shadow-cyber-500/50" />
                </motion.div>
              </div>
            </div>

            {/* Mobile trigger */}
            <div className="md:hidden flex items-center">
              <button
                ref={navButtonRef}
                onClick={() => setMenuOpen((p) => !p)}
                className="p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70"
                aria-label={t(menuOpen ? 'menu.close' : 'menu.open', { ns: 'navigation' })}
              >
                {menuOpen ? <FaTimes className="h-6 w-6 text-gold-300" /> : <FaBars className="h-6 w-6 text-gold-300" />}
              </button>
            </div>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={mobileMenuRef}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              className="md:hidden absolute top-full right-4 w-72 rounded-2xl shadow-xl shadow-black/50 border border-white/15 bg-[#0a0a12]/98 p-4"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href={`/${currentLocale}/buy-tokens`}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center text-lg py-3 bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 text-gray-900 font-bold rounded-xl shadow-lg shadow-gold-400/40 hover:brightness-110"
                  >
                    {t('nav.buy_tokens')}
                  </Link>
                </li>
                <hr className="border-gray-700/70 my-2" />
                {NAV_LINKS_CONFIG.map((item) => (
                  <li key={item.path}>
                    {(() => {
                      const basePath = item.path === '/' ? `/${currentLocale}` : `/${currentLocale}${item.path}`;
                      const isActive = pathname === basePath;
                      return (
                        <Link
                          href={basePath}
                          onClick={() => setMenuOpen(false)}
                          className={`relative font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 group block w-full text-left text-lg py-3 ${isActive
                            ? 'text-gold-300'
                            : 'text-white hover:text-gold-300'
                            }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span className={`relative z-10 ${isActive ? 'animate-pulse' : ''}`}>{t(`nav.${item.nameKey}`)}</span>
                        </Link>
                      );
                    })()}
                  </li>
                ))}
              </ul>
              <hr className="border-gray-700/70 my-4" />
              <LanguageSwitcher />
              <div className="pt-4">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                >
                  <WalletMultiButtonDynamic className="!w-full !bg-gradient-to-r !from-cyber-600 !to-cyber-500 !text-white !rounded-xl !py-3 !shadow-lg hover:!brightness-110 shadow-cyber-500/50" />
                </motion.div>
                {connected && publicKey && (
                  <div className="text-center mt-4 flex flex-col gap-2">
                    <button onClick={copyToClipboard} className="text-sm text-gold-400 hover:underline">{t('wallet.copyAddress', { ns: 'common' })}</button>
                    <button onClick={handleDisconnect} className="text-sm text-red-400 hover:underline">{t('wallet.disconnect', { ns: 'common' })}</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Command Palette (Ctrl/Cmd + K) */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              className="w-full max-w-xl rounded-2xl bg-[#0a0a12] border border-white/10 shadow-2xl overflow-hidden"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-white/10 bg-[#0a0a12]/80">
                <input
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder={t('palette.placeholder', { ns: 'navigation', defaultValue: 'Search pages…' }) as string}
                  className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500 text-base"
                />
              </div>
              <ul className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                {filteredLinks.map((it) => {
                  const basePath = it.path === '/' ? `/${currentLocale}` : `/${currentLocale}${it.path}`;
                  return (
                    <li key={it.path}>
                      <Link
                        href={basePath}
                        onClick={() => setCmdOpen(false)}
                        className="block px-4 py-3 hover:bg-white/5 text-gray-200"
                      >
                        {t(`nav.${it.nameKey}`)}
                      </Link>
                    </li>
                  );
                })}
                {filteredLinks.length === 0 && (
                  <li className="px-4 py-6 text-center text-gray-500">{t('palette.no_results', { ns: 'navigation', defaultValue: 'No results' })}</li>
                )}
              </ul>
              <div className="px-4 py-2 text-xs text-gray-500 bg-[#0a0a12]/80 flex items-center justify-between">
                <span>{t('palette.hint', { ns: 'navigation', defaultValue: 'Navigate with ↑ ↓, Enter to go' })}</span>
                <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd> {t('palette.close', { ns: 'navigation', defaultValue: 'close' })}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}