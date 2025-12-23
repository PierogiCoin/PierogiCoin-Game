'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiCalendar, FiCheckCircle, FiCircle, FiChevronRight, FiClock, FiFilter,
} from 'react-icons/fi';
// SimpleBackground import removed

// ===== Dane (fazy) =====
export interface RoadmapPhase {
  id: number;
  i18nKey: string;   // np. "q4_2025.e2"
  quarter: string;   // np. "Q4 2025"
  startDate: string; // ISO
}

// Spróbujmy wczytać z centralnego pliku
import { allPhasesData } from '@/data/roadmapData';
const importedPhases: RoadmapPhase[] = allPhasesData ?? [];

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
    pill: 'bg-emerald-400/15 border-emerald-300/30 text-emerald-200',
    i18nKey: 'status_done', dotRing: 'ring-emerald-300/40'
  },
  now: {
    icon: FiCircle, dot: 'bg-gold-400', text: 'text-gold-300',
    pill: 'bg-gold-400/15 border-gold-300/30 text-gold-200',
    i18nKey: 'status_now', dotRing: 'ring-gold-300/60', pulse: true
  },
  next: {
    icon: FiChevronRight, dot: 'bg-sky-400', text: 'text-sky-300',
    pill: 'bg-sky-400/15 border-sky-300/30 text-sky-200',
    i18nKey: 'status_next', dotRing: 'ring-sky-300/40'
  },
  later: {
    icon: FiClock, dot: 'bg-gray-400', text: 'text-gray-300',
    pill: 'bg-white/10 border-white/15 text-gray-300',
    i18nKey: 'status_later', dotRing: 'ring-white/20'
  },
};

// ===== Helpery czasu/ćwiartek =====
const quarterToDate = (label?: string | null): Date | null => {
  if (!label) return null;
  const m = /Q([1-4])\s+(\d{4})/i.exec(label);
  if (!m) return null;
  const q = Number(m[1]);
  const y = Number(m[2]);
  return new Date(y, (q - 1) * 3, 1); // 0,3,6,9
};

const getYearFrom = (quarter?: string | null, d?: Date | null): number | null => {
  if (d instanceof Date && !isNaN(+d)) return d.getFullYear();
  const m = /(\d{4})/.exec(quarter || '');
  return m ? Number(m[1]) : null;
};

const getQuarterFrom = (quarter?: string | null, d?: Date | null): number | null => {
  if (quarter) {
    const m = /Q([1-4])/i.exec(quarter);
    if (m) return Number(m[1]);
  }
  if (d instanceof Date && !isNaN(+d)) return Math.floor(d.getMonth() / 3) + 1;
  return null;
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
  if (start.getFullYear() === now.getFullYear() && itemQ === nowQ) return 'now';

  // w kolejnym kwartale => "next"
  const nextQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
  if (+start <= +nextQuarter) return 'next';

  return 'later';
};

// ===== Karta =====
const RoadmapCard = React.memo(function RoadmapCard({ item }: { item: RoadmapItemData }) {
  const { t } = useTranslation('roadmap-page');
  const tt = React.useCallback(
    (key: string, def?: string) => t(key, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: def }),
    [t]
  );

  const STATUS_DEFAULTS = {
    status_done: 'Done',
    status_now: 'In progress',
    status_next: 'Up next',
    status_later: 'Later',
  } as const;

  const safe = item ?? {};
  const status: Status = (safe.status as Status) ?? 'later';
  const cfg = STATUS_UI[status] ?? STATUS_UI.later;
  const Icon = cfg.icon;

  const title = safe.title || tt('missing_title', 'Untitled');
  const desc = safe.description || tt('missing_desc', 'Description coming soon.');
  const exact = safe.quarterLabel || safe.when || (safe._date ? safe._date.toLocaleDateString() : '—');

  return (
    <motion.article
      className="relative w-full max-w-xl rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur transition-colors hover:border-white/20"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .35 }}
    >
      <span
        aria-hidden
        className={`absolute left-1/2 top-[-14px] h-3 w-3 -translate-x-1/2 rounded-full ring-2 ${cfg.dotRing} shadow ${cfg.dot} ${cfg.pulse ? 'after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-current after:opacity-30' : ''}`}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className={cfg.text} aria-hidden />
          <h3 className="text-white text-base font-semibold leading-tight">{title}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.pill}`}
          title={exact}
        >
          <FiCalendar size={12} aria-hidden />
          {tt(cfg.i18nKey, STATUS_DEFAULTS[cfg.i18nKey as keyof typeof STATUS_DEFAULTS])}
        </span>
      </header>

      <p className="mt-2 text-sm text-gray-300">{desc}</p>

      {exact !== '—' && (
        <footer className="mt-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            {exact}
          </span>
        </footer>
      )}
    </motion.article>
  );
});

// ===== Sekcja =====
export default function RoadmapSection({
  phases,
  showQuarterLabels = true,
}: {
  phases?: RoadmapPhase[];
  showQuarterLabels?: boolean;
}) {
  const { t } = useTranslation('roadmap-page');
  const tt = React.useCallback(
    (key: string, def?: string) => t(key, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: def }),
    [t]
  );



  // Normalizacja danych
  const normalized: RoadmapItemData[] = React.useMemo(() => {
    const src = (Array.isArray(phases) && phases.length > 0)
      ? phases
      : (Array.isArray(importedPhases) && importedPhases.length > 0 ? importedPhases : []);

    if (src.length === 0) {
      // awaryjnie – 4 elementy
      return [
        {
          id: 'q4_2024.e1', title: tt('fallback.q4.title', 'Idea born on Christmas Eve'),
          description: tt('fallback.q4.desc', 'Concept talk, tokenomics, direction'),
          quarterLabel: 'Q4 2024', status: 'done', _date: quarterToDate('Q4 2024')
        },
        {
          id: 'q1_2025.e1', title: tt('fallback.q1.title', 'Website, token, growth strategy'),
          description: tt('fallback.q1.desc', 'MVP, smart contracts, marketing plan'),
          quarterLabel: 'Q1 2025', status: 'done', _date: quarterToDate('Q1 2025')
        },
        {
          id: 'q2_2025.e1', title: tt('fallback.q2.title', 'Launch website + token'),
          description: tt('fallback.q2.desc', 'Public launch & listing'),
          quarterLabel: 'Q2 2025', status: 'now', _date: quarterToDate('Q2 2025')
        },
        {
          id: 'q3_2025.e1', title: tt('fallback.q3.title', 'Exchange listing'),
          description: tt('fallback.q3.desc', 'Liquidity & growth'),
          quarterLabel: 'Q3 2025', status: 'next', _date: quarterToDate('Q3 2025')
        },
      ];
    }

    return src.map((p) => {
      const d = new Date(p.startDate);
      const qLabel = p.quarter || null;
      const status = inferStatus(isNaN(+d) ? null : d, qLabel);
      // Teksty z i18n: `${i18nKey}.title` / `${i18nKey}.desc`
      const title = t(`${p.i18nKey}.title`, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: p.i18nKey });
      const desc = t(`${p.i18nKey}.desc`, { ns: ['roadmap-page', 'roadmap', 'common'], defaultValue: '' });

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
  const [range, setRange] = React.useState<'all' | 'this' | 'next12'>('all');

  const now = React.useMemo(() => new Date(), []);
  const next12 = React.useMemo(
    () => new Date(now.getFullYear(), now.getMonth() + 12, 1),
    [now]
  );

  const filtered = React.useMemo(() => {
    return normalized
      .filter(d => statusFilter === 'all' ? true : (d.status ?? 'later') === statusFilter)
      .filter(d => yearFilter === 'all' ? true : getYearFrom(d.quarterLabel, d._date) === yearFilter)
      .filter(d => {
        if (range === 'all') return true;
        const ts = sortTs(d.quarterLabel, d._date);
        if (range === 'this') {
          const start = new Date(now.getFullYear(), 0, 1).getTime();
          const end = new Date(now.getFullYear(), 11, 31).getTime();
          return ts >= start && ts <= end;
        }
        if (range === 'next12') return ts >= +now && ts <= +next12;
        return true;
      })
      .sort((a, b) => sortTs(a.quarterLabel, a._date) - sortTs(b.quarterLabel, b._date));
  }, [normalized, statusFilter, yearFilter, range, now, next12]);

  // ===== Render =====
  const STATUS_DEFAULTS = {
    status_done: 'Done',
    status_now: 'In progress',
    status_next: 'Up next',
    status_later: 'Later',
  } as const;

  return (
    <section
      id="roadmap"
      aria-labelledby="roadmap-heading"
      className="relative pt-44 pb-16 text-white overflow-hidden scroll-mt-28 min-h-[70vh]"
    >
      {/* Lekkie tło CSS */}


      <div className="container mx-auto px-4">
        <h2 id="roadmap-heading" className="sr-only">
          {tt('title', 'Roadmap')}
        </h2>

        {/* Hero */}
        <motion.div
          className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-5 sm:p-6 backdrop-blur relative overflow-hidden"
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.35), rgba(250,204,21,0))' }}
          />
          <div className="relative z-10 flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-300">
              <FiCalendar size={12} aria-hidden />
              {tt('hero.badge', 'Our roadmap')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90">
              {tt('hero.title', 'Step by step towards our goal')}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-gray-400">
              {tt('hero.subtitle', 'See what we’ve achieved and what’s planned in upcoming quarters.')}
            </p>
          </div>
        </motion.div>

        {/* Filtry */}
        <div className="mb-6 sticky top-28 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1324]/70 px-3 py-2 backdrop-blur">
          <h2 className="text-2xl font-bold">{tt('title', 'Roadmap')}</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              {(['all', 'done', 'now', 'next', 'later'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                  aria-label={
                    s === 'all'
                      ? tt('filters.all', 'All')
                      : tt(`status_${s}`, STATUS_DEFAULTS[`status_${s}` as keyof typeof STATUS_DEFAULTS] ?? String(s))
                  }
                  className={`px-3 py-1.5 text-xs rounded-full transition ${statusFilter === s ? 'bg-gold-400 text-gray-900' : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  {s === 'all'
                    ? tt('filters.all', 'All')
                    : tt(`status_${s}`, STATUS_DEFAULTS[`status_${s}` as keyof typeof STATUS_DEFAULTS] ?? String(s))}
                </button>
              ))}
            </div>

            {/* Rok */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <FiFilter size={14} className="text-white/60" />
              <select
                className="bg-transparent text-sm outline-none text-white/90"
                value={yearFilter === 'all' ? 'all' : String(yearFilter)}
                onChange={(e) => {
                  const v: number | 'all' = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setYearFilter(v);
                }}
              >
                <option value="all">{tt('filters.year_all', 'All years')}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Zakres */}
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              {(['all', 'this', 'next12'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs rounded-full transition ${range === r ? 'bg-white/90 text-gray-900' : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  {{
                    all: tt('filters.range_all', 'All time'),
                    this: tt('filters.range_this', 'This year'),
                    next12: tt('filters.range_next12', 'Next 12m'),
                  }[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Oś: kręgosłup + naprzemiennie lewo/prawo wg kwartału */}
        {filtered.length === 0 ? (
          <p className="text-gray-300">{tt('empty', 'No items to display for the selected filters.')}</p>
        ) : (
          <div className="relative">
            {/* Centralny kręgosłup */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-white/5 via-white/40 to-white/5"
            />

            <div className="flex flex-col gap-10">
              {filtered.map((it, idx) => {
                const q = getQuarterFrom(it.quarterLabel, it._date);
                const side: 'left' | 'right' = q ? (q % 2 === 1 ? 'left' : 'right') : (idx % 2 === 0 ? 'left' : 'right');

                const s: Status = (it.status as Status) ?? 'later';
                const cfg = STATUS_UI[s] ?? STATUS_UI.later;

                return (
                  <div
                    key={it.id ?? `${it.title}-${sortTs(it.quarterLabel, it._date)}`}
                    className={`relative flex ${side === 'left' ? 'justify-end pr-[52%]' : 'justify-start pl-[52%]'}`}
                  >
                    <div className="relative w-full max-w-xl group">
                      {/* Punkt na kręgosłupie */}
                      <span
                        aria-hidden
                        className={`absolute left-1/2 top-4 -translate-x-1/2 h-3 w-3 rounded-full ring-2 ${cfg.dotRing} shadow ${cfg.dot} ${cfg.pulse ? 'after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-current after:opacity-30' : ''}`}
                      />
                      {/* Etykieta kwartału */}
                      {showQuarterLabels && (
                        <span
                          className={`absolute top-2 whitespace-nowrap text-[10px] font-semibold tracking-wide text-white/70 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/10 ${side === 'left' ? 'left-[calc(50%+10px)]' : 'right-[calc(50%+10px)]'}`}
                          aria-hidden
                        >
                          {it.quarterLabel ||
                            (it._date ? `Q${getQuarterFrom(null, it._date)} ${it._date.getFullYear()}` : '')}
                        </span>
                      )}
                      {/* Łącznik */}
                      <span
                        aria-hidden
                        className={`absolute ${side === 'left' ? 'left-[calc(50%-24px)]' : 'right-[calc(50%-24px)]'} top-5 h-0.5 w-7 bg-white/20 group-hover:bg-white/35 transition-colors`}
                      />
                      <span
                        aria-hidden
                        className={`absolute ${side === 'left' ? 'left-[calc(50%-10px)]' : 'right-[calc(50%-10px)]'} top-[18px] h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors`}
                      />
                      {/* Karta */}
                      <div className={`${side === 'left' ? 'mr-6' : 'ml-6'} transition-transform duration-200 group-hover:translate-y-[-1px]`}>
                        <RoadmapCard item={it} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}