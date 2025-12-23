'use client';

import * as React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCheckCircle, FiChevronRight, FiClock, FiActivity
} from 'react-icons/fi';
import SimpleBackground from '@/components/SimpleBackground';
import { allPhasesData as importedPhases } from '@/data/roadmapData';

// ===== Dane (fazy) =====
export interface RoadmapPhase {
  id: number;
  i18nKey: string;
  quarter: string;
  startDate: string;
}

// ===== UI/typy wewnętrzne =====
export type Status = 'done' | 'now' | 'next' | 'later';
export interface RoadmapItemData {
  id?: string | number;
  title?: string;
  description?: string;
  _date?: Date | null;
  quarterLabel?: string | null;
  status?: Status;
  when?: string | null;
}

type IconLike = React.ComponentType<{ size?: number; className?: string }>;
const STATUS_UI: Record<
  Status,
  { icon: IconLike; dot: string; text: string; pill: string; i18nKey: string; dotRing: string; pulse?: boolean }
> = {
  done: {
    icon: FiCheckCircle, dot: 'bg-emerald-400', text: 'text-emerald-300',
    pill: 'bg-emerald-400/10 border-emerald-500/30 text-emerald-200',
    i18nKey: 'status_done', dotRing: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]'
  },
  now: {
    icon: FiActivity, dot: 'bg-gold-400', text: 'text-gold-300',
    pill: 'bg-gold-500/10 border-gold-500/40 text-gold-200 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
    i18nKey: 'status_now', dotRing: 'shadow-[0_0_25px_rgba(251,191,36,0.6)]', pulse: true
  },
  next: {
    icon: FiChevronRight, dot: 'bg-indigo-400', text: 'text-indigo-300',
    pill: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200',
    i18nKey: 'status_next', dotRing: 'shadow-[0_0_15px_rgba(129,140,248,0.4)]'
  },
  later: {
    icon: FiClock, dot: 'bg-gray-600', text: 'text-gray-400',
    pill: 'bg-white/5 border-white/10 text-gray-400',
    i18nKey: 'status_later', dotRing: 'shadow-none'
  },
};

// ===== Helpery czasu/ćwiartek =====
const quarterToDate = (label?: string | null): Date | null => {
  if (!label) return null;
  const m = /Q([1-4])\s+(\d{4})/i.exec(label);
  if (!m) return null;
  const q = Number(m[1]);
  const y = Number(m[2]);
  return new Date(y, (q - 1) * 3, 1);
};

const getYearFrom = (quarter?: string | null, d?: Date | null): number | null => {
  if (d instanceof Date && !isNaN(+d)) return d.getFullYear();
  const m = /(\d{4})/.exec(quarter || '');
  return m ? Number(m[1]) : null;
};

const sortTs = (q?: string | null, d?: Date | null): number => {
  if (d instanceof Date && !isNaN(+d)) return +d;
  const qd = quarterToDate(q || undefined);
  return qd ? +qd : Number.MAX_SAFE_INTEGER;
};

const inferStatus = (date: Date | null, q: string | null): Status => {
  const now = new Date();
  const start = date ?? quarterToDate(q || undefined);
  if (!start) return 'later';

  const nowQ = Math.floor(now.getMonth() / 3) + 1;
  const itemQ = Math.floor(start.getMonth() / 3) + 1;

  if (start.getFullYear() < now.getFullYear() ||
    (start.getFullYear() === now.getFullYear() && itemQ < nowQ)) return 'done';
  // "Now" window: roughly current month +/- 15 days or explicit quarter match
  if (start.getFullYear() === now.getFullYear() && itemQ === nowQ) {
    // Special logic for daily precision if provided
    if (date && Math.abs(date.getTime() - now.getTime()) < 30 * 24 * 60 * 60 * 1000) return 'now';
    return 'now';
  }

  const nextQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
  if (+start <= +nextQuarter.getTime() + (90 * 24 * 60 * 60 * 1000)) return 'next'; // Wider "next" window

  return 'later';
};

// ===== Karta (Masterpiece Version) =====
const RoadmapCard = React.memo(function RoadmapCard({ item }: { item: RoadmapItemData }) {
  const { t } = useTranslation('roadmap-page');
  const tt = React.useCallback(
    (key: string, def?: string) => t(key, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: def }),
    [t]
  );

  const STATUS_DEFAULTS = {
    status_done: 'Done',
    status_now: 'Live Now',
    status_next: 'Up Next',
    status_later: 'Future',
  } as const;

  const safe = item ?? {};
  const status: Status = (safe.status as Status) ?? 'later';
  const cfg = STATUS_UI[status] ?? STATUS_UI.later;
  const Icon = cfg.icon;

  const title = safe.title || tt('missing_title', 'Untitled');
  const desc = safe.description || tt('missing_desc', 'Description coming soon.');
  const exact = safe.quarterLabel || safe.when || (safe._date ? safe._date.toLocaleDateString() : '—');

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${status === 'now' ? 'from-gold-500/20 to-amber-600/10' : 'from-white/5 to-transparent'} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <motion.article
        className={`relative w-full max-w-xl rounded-2xl border ${status === 'now' ? 'border-gold-500/50 bg-[#0d0d14]/90' : 'border-white/10 bg-[#0d0d14]/60'} p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:border-opacity-50 group-hover:translate-y-[-2px]`}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
      >

        {status === 'now' && (
          <span className="absolute -top-3 -right-3 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-gold-500 items-center justify-center text-[10px] font-bold text-black">!</span>
          </span>
        )}

        <header className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${cfg.pill}`}
            >
              <Icon size={12} aria-hidden />
              {tt(cfg.i18nKey, STATUS_DEFAULTS[cfg.i18nKey as keyof typeof STATUS_DEFAULTS])}
            </span>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-tighter">{exact}</span>
          </div>
          <h3 className={`text-xl md:text-2xl font-black leading-tight ${status === 'now' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-200 to-gold-500' : 'text-white'}`}>
            {title}
          </h3>
        </header>

        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed font-light">{desc}</p>
          {/* If description contains bullet points logic (optional enhancement for later) */}
        </div>
      </motion.article>
    </div>
  );
});

// ===== Sekcja (Masterpiece) =====
export default function RoadmapSection({
  phases,
}: {
  phases?: RoadmapPhase[];
}) {
  const { t } = useTranslation('roadmap-page');
  const tt = React.useCallback(
    (key: string, def?: string) => t(key, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: def }),
    [t]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Normalizacja danych
  const normalized: RoadmapItemData[] = React.useMemo(() => {
    const src = (Array.isArray(phases) && phases.length > 0)
      ? phases
      : (Array.isArray(importedPhases) && importedPhases.length > 0 ? importedPhases : []);

    if (src.length === 0) return []; // Should rely on default data if empty, handled below

    return src.map((p) => {
      const d = new Date(p.startDate);
      const qLabel = p.quarter || null;
      const status = inferStatus(isNaN(+d) ? null : d, qLabel);

      const rawTitle = t(`phases.${p.i18nKey}.title`, { ns: ['roadmap-page'], defaultValue: '' });
      const rawDesc = t(`phases.${p.i18nKey}.description`, { ns: ['roadmap-page'], defaultValue: '' });
      // Logic for points retrieval could go here if JSON structure supports it

      const fallbackTitle = p.quarter
        ? tt('fallback.generic_with_quarter', 'Milestone {{quarter}}').replace('{{quarter}}', p.quarter)
        : tt('fallback.generic', 'Roadmap Item');

      const title = rawTitle && rawTitle !== `${p.i18nKey}.title` ? rawTitle : fallbackTitle;
      const desc = rawDesc && rawDesc !== `${p.i18nKey}.description` ? rawDesc : tt('fallback.desc', 'Details coming soon.');

      return {
        id: p.id,
        title,
        description: desc,
        _date: isNaN(+d) ? quarterToDate(qLabel) : d,
        quarterLabel: qLabel,
        status,
        when: qLabel,
      } as RoadmapItemData;
    });
  }, [phases, t, tt]);

  // Filtry
  const years = React.useMemo(() => {
    const set = new Set<number>();
    normalized.forEach(d => {
      const y = getYearFrom(d.quarterLabel || null, d._date);
      if (y) set.add(y);
    });
    return Array.from(set).sort();
  }, [normalized]);

  const [statusFilter, setStatusFilter] = React.useState<'all' | Status>('all');
  const [yearFilter, setYearFilter] = React.useState<number | 'all'>('all');

  const filtered = React.useMemo(() => {
    return normalized
      .filter(d => statusFilter === 'all' ? true : (d.status ?? 'later') === statusFilter)
      .filter(d => yearFilter === 'all' ? true : getYearFrom(d.quarterLabel, d._date) === yearFilter)
      .sort((a, b) => sortTs(a.quarterLabel, a._date) - sortTs(b.quarterLabel, b._date));
  }, [normalized, statusFilter, yearFilter]);

  const STATUS_DEFAULTS = {
    status_done: 'Done',
    status_now: 'Live',
    status_next: 'Next',
    status_later: 'Later',
  } as const;

  return (
    <section
      id="roadmap"
      ref={containerRef}
      className="relative py-32 bg-black text-white overflow-hidden scroll-mt-20 min-h-screen"
    >
      <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay layer */}
      <SimpleBackground variant="grid" />

      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header - Cinematic */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-gold-500/20 bg-gold-500/10 backdrop-blur-md"
          >
            <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              {tt('hero.badge', 'Project Timeline')}
            </span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="text-white">{tt('hero.title_journey', 'Our Journey')} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-600">
              {tt('hero.title_forward', 'Forward')}
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            {tt('hero.subtitle', 'From the first line of code to global adoption. Follow our path.')}
          </p>
        </div>

        {/* Filters - Minimalist Glass */}
        <div className="mb-20 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            {(['all', 'done', 'now', 'next'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${statusFilter === s ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {s === 'all' ? tt('filter_all', 'All') : STATUS_DEFAULTS[`status_${s}` as keyof typeof STATUS_DEFAULTS]}
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-1 my-auto hidden sm:block" />
            {years.map(y => (
              <button
                key={y}
                onClick={() => setYearFilter(y === yearFilter ? 'all' : y)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${yearFilter === y ? 'bg-gold-500 text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="relative">
          {/* The Beam (Background Track) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 bg-white/10 rounded-full" />

          {/* The Beam (Active Fill) */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 bg-gradient-to-b from-gold-400 via-amber-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]"
          />

          <div className="space-y-16 md:space-y-32 pb-32">
            {filtered.map((item, index) => {
              const isLeft = index % 2 === 0;
              const status = (item.status as Status) ?? 'later';
              const cfg = STATUS_UI[status];

              return (
                <div key={item.id} className={`relative flex flex-col md:flex-row items-start ${isLeft ? 'md:flex-row-reverse' : ''} group`}>

                  {/* Spacer for desktop layout */}
                  <div className="hidden md:block flex-1" />

                  {/* Center Node */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`w-4 h-4 rounded-full ${cfg.dot} shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-4 ring-black`}
                    />
                    {status === 'now' && (
                      <div className="absolute inset-0 rounded-full border border-gold-400 animate-ping opacity-50" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`pl-12 md:pl-0 flex-1 w-full ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    {/* Connector Line (Mobile only) */}
                    <div className="absolute left-4 top-4 w-8 h-px bg-white/20 md:hidden" />

                    {/* Connector Line (Desktop) */}
                    <div className={`hidden md:block absolute top-4 w-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent ${isLeft ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`} />

                    <RoadmapCard item={item} />
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}