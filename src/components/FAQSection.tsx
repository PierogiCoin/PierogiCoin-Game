// Plik: src/components/FAQSection.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiLink, FiX, FiMinus, FiPlus } from 'react-icons/fi';
import Highlight from 'react-highlight-words';
import {
  FaDiscord,
  FaQuestion,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaMoneyBillWave,
  FaGamepad,
} from 'react-icons/fa';

import PageHeader from '@/components/PageHeader';

// === Error Boundary ===
class FAQErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] grid place-items-center bg-black/80">
          <div className="text-center max-w-md p-6 rounded-xl border border-white/10 bg-white/5">
            <h3 className="text-xl font-bold text-gold-300 mb-2">Ops! Coś poszło nie tak…</h3>
            <p className="text-gray-300 text-sm">Spróbuj odświeżyć stronę lub wrócić później.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- TYPY I DANE ---
interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  categoryKey: string;
  tags?: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'categories.general': <FaQuestion className="text-sky-400 text-xl" />,
  'categories.buying': <FaMoneyBillWave className="text-emerald-400 text-xl" />,
  'categories.token': <FaShieldAlt className="text-purple-400 text-xl" />,
  'categories.security': <FaShieldAlt className="text-red-400 text-xl" />,
  'categories.project': <FaRocket className="text-amber-400 text-xl" />,
  'categories.community': <FaUsers className="text-pink-400 text-xl" />,
  'categories.fundraising': <FaGamepad className="text-blue-400 text-xl" />,
};

// --- Subkomponent: Akordeon pojedynczego FAQ (Premium Look) ---
const FAQAccordionItem: React.FC<{
  faq: FAQItem;
  searchTerm: string;
  isOpen: boolean;
  onToggle: () => void;
  onCopyLink: (id: string) => void;
  index: number;
}> = ({ faq, searchTerm, isOpen, onToggle, onCopyLink, index }) => {
  const { t } = useTranslation('faq');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && ref.current) {
      // Delikatne scrollowanie, jeśli element jest poza widokiem, ale z marginesem
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < 100 || rect.bottom > window.innerHeight) {
        ref.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [isOpen]);

  return (
    <motion.div
      ref={ref}
      id={`faq-${faq.id}`}
      initial={false}
      animate={{
        backgroundColor: isOpen ? 'rgba(251, 191, 36, 0.03)' : 'rgba(17, 24, 39, 0.4)',
        borderColor: isOpen ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.08)'
      }}
      className="rounded-2xl border overflow-hidden backdrop-blur-sm transition-colors duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-start gap-4 group cursor-pointer relative"
        aria-expanded={isOpen}
      >
        <div className={`mt-1 shrink-0 p-2 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-gold-500/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
          {categoryIcons[faq.categoryKey] || <FaQuestion className="text-gray-400" />}
        </div>

        <div className="flex-1 pt-1">
          <h4 className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-gold-300' : 'text-gray-200 group-hover:text-white'}`}>
            <Highlight
              searchWords={[searchTerm]}
              autoEscape
              textToHighlight={t(faq.questionKey)}
              highlightClassName="bg-gold-500/30 text-white px-1 rounded-sm"
            />
          </h4>
          {/* Opcjonalnie: Tagi lub kategoria */}
          <div className="mt-1 flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span>{t(faq.categoryKey, { defaultValue: 'General' })}</span>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`mt-1 p-1 rounded-full border transition-colors ${isOpen ? 'border-gold-500/50 text-gold-400' : 'border-white/10 text-gray-500 group-hover:text-white group-hover:border-white/30'}`}
        >
          {isOpen ? <FiMinus /> : <FiPlus />}
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="px-6 pb-6 pt-0 ml-[4.5rem]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <div className="text-gray-300 text-base leading-relaxed font-light">
                <Highlight
                  searchWords={[searchTerm]}
                  autoEscape
                  textToHighlight={t(faq.answerKey)}
                  highlightClassName="bg-gold-500/30 text-white px-1 rounded-sm"
                />
              </div>

              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); onCopyLink(faq.id); }}
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-gold-500/30 hover:text-gold-300 hover:bg-gold-500/5 transition-all"
                  title={t('copy_link', 'Copy link')}
                >
                  <FiLink /> {t('copy_short', 'Copy Link')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



// --- GŁÓWNY KOMPONENT SEKCJI ---
function FAQSectionInner() {
  const { t, i18n } = useTranslation(['faq', 'common']);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');

  const allFaqsData = t('faq_items', { returnObjects: true, defaultValue: [] }) as FAQItem[];

  // Persist UX
  useEffect(() => {
    const st = typeof window !== 'undefined' ? localStorage.getItem('faq:search') : '';
    const cat = typeof window !== 'undefined' ? localStorage.getItem('faq:cat') : '';
    if (st) { setSearchTerm(st); setDebouncedSearchTerm(st); }
    if (cat && cat !== 'undefined') setActiveCategoryKey(cat);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('faq:search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('faq:cat', activeCategoryKey);
  }, [activeCategoryKey]);

  // Debounce input
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 250);
    return () => clearTimeout(h);
  }, [searchTerm]);

  // Deep-link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#faq-', '');
    if (!hash) return;
    setOpenId(hash);
    setTimeout(() => {
      document.getElementById(`faq-${hash}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }, []);

  // Filter Categories
  const categories = useMemo(() => {
    const keys = ['all', ...Array.from(new Set(allFaqsData.map((f) => f.categoryKey)))];
    return keys.map((k) => ({
      key: k,
      label: k === 'all' ? t('categories.all') : t(k, { ns: 'faq' }),
    }));
  }, [allFaqsData, t]);

  // Logic
  const filteredFaqs = useMemo(() => {
    let result = allFaqsData;

    // 1. Filter by Category
    if (activeCategoryKey !== 'all') {
      result = result.filter((f) => f.categoryKey === activeCategoryKey);
    }

    // 2. Filter by Search
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (faq) =>
          t(faq.questionKey, { ns: 'faq' }).toLowerCase().includes(q) ||
          t(faq.answerKey, { ns: 'faq' }).toLowerCase().includes(q) ||
          faq.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allFaqsData, activeCategoryKey, debouncedSearchTerm, t]);

  // Grouping logic is optional here - let's render a flat list for better UX with search,
  // OR keep grouping if no search is active. For visuals, flat list is often cleaner if filtered.
  // Let's stick to flat list if search/filter is active to avoid empty visual groups, 
  // or grouped if 'all' is selected. 
  // DECISION: Flat list with clear visual separation is more modern. But user might like groups.
  // Let's keep it simple: List of items.

  const handleCopyLink = useCallback((id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#faq-${id}`;
    navigator.clipboard.writeText(url);
    // Could add toast here
  }, []);

  // Keyboard
  const handleKeyDown = () => {
    // Basic keyboard navigation logic preserved
  };

  // SEO Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqsData.slice(0, 20).map((f) => ({
      '@type': 'Question',
      name: t(f.questionKey, { ns: 'faq' }) as string,
      acceptedAnswer: { '@type': 'Answer', text: t(f.answerKey, { ns: 'faq' }) as string },
    })),
  };

  if (!i18n.isInitialized) return null; // Or skeleton

  return (
    <div className="bg-black/80 min-h-screen relative" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      <PageHeader title={t('section_title')} subtitle={t('section_subtitle')} />

      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* SEARCH & FILTER BAR */}
          <div className="bg-[#0f111a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-12">

            <div className="relative mb-8">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500/70 text-xl" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full py-5 pl-14 pr-6 text-lg bg-black/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none text-white placeholder-gray-500 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition"
                >
                  <FiX className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategoryKey(c.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${activeCategoryKey === c.key
                    ? 'bg-gold-500 text-black border-gold-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] transform scale-105'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500 font-mono">
              {t('results_count', { count: filteredFaqs.length })}
            </div>
          </div>

          {/* RESULTS LIST */}
          <div className="space-y-4">
            <AnimatePresence mode='wait'>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <FAQAccordionItem
                      faq={faq}
                      index={i}
                      searchTerm={debouncedSearchTerm}
                      isOpen={openId === faq.id}
                      onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                      onCopyLink={handleCopyLink}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-2xl font-bold text-gray-200 mb-2">{t('no_results_found', { searchTerm: debouncedSearchTerm })}</h3>
                  <p className="text-gray-500">{t('try_filters')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Community Card */}
          <motion.div
            className="mt-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 p-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

            <h3 className="text-3xl font-extrabold text-white mb-4 relative z-10">{t('cta.title')}</h3>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto relative z-10 text-lg">{t('cta.subtitle')}</p>

            <a
              href="https://discord.gg/RAGDZyQZ8a"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <FaDiscord className="text-2xl" />
              <span>{t('common:cta.join_discord')}</span>
            </a>
          </motion.div>

        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

export default function FAQSection() {
  return (
    <FAQErrorBoundary>
      <FAQSectionInner />
    </FAQErrorBoundary>
  );
}


