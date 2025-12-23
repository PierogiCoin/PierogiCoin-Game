'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, CircleDot, ChevronRightCircle, Clock, Calendar } from 'lucide-react';

type IconLike = React.ComponentType<{
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

// Wrap lucide-react icons to avoid JSX type issues across React versions
// Wrap lucide-react icons to avoid JSX type issues across React versions
function wrapLucide(Icon: React.ElementType): IconLike {
  const Wrapped: React.FC<{
    size?: number;
    className?: string;
    'aria-hidden'?: boolean;
  }> = (props) => React.createElement(Icon, props);

  // Give the wrapper a display name to satisfy eslint/react-display-name and aid debugging
  const DisplayName = (Icon as React.ComponentType).displayName || (Icon as React.ComponentType).name || 'Icon';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Wrapped as unknown as React.FC).displayName = `WrappedLucide(${DisplayName})`;

  return Wrapped as IconLike;
}

// Wrap Calendar as well to avoid JSX type issues
const CalendarIcon = wrapLucide(Calendar as React.ElementType);

type PhaseStatus = 'done' | 'now' | 'next' | 'later';

interface RoadmapItemData {
  id?: number | string;
  i18nKey?: string;
  title?: string;          // fallback, gdy brak tłumaczenia
  description?: string;    // fallback
  points?: string[];       // fallback
  status?: PhaseStatus;
  quarterLabel?: string | null;
  _date?: Date | null;     // przekazywana z sekcji (do tooltipa)
}

interface RoadmapItemProps {
  item: RoadmapItemData;
  index: number;
  isHovered?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const STATUS_CONFIG: Record<
  PhaseStatus,
  { icon: IconLike; colorText: string; colorDot: string; badgeClass: string; labelKey: string }
> = {
  done: { icon: wrapLucide(CheckCircle), colorText: 'text-emerald-300', colorDot: 'bg-emerald-400', badgeClass: 'bg-emerald-400/15 border-emerald-300/30 text-emerald-200', labelKey: 'status_done' },
  now: { icon: wrapLucide(CircleDot), colorText: 'text-gold-300', colorDot: 'bg-gold-400', badgeClass: 'bg-gold-400/15 border-gold-300/30 text-gold-200', labelKey: 'status_now' },
  next: { icon: wrapLucide(ChevronRightCircle), colorText: 'text-sky-300', colorDot: 'bg-sky-400', badgeClass: 'bg-sky-400/15 border-sky-300/30 text-sky-200', labelKey: 'status_next' },
  later: { icon: wrapLucide(Clock), colorText: 'text-gray-300', colorDot: 'bg-gray-400', badgeClass: 'bg-white/10 border-white/15 text-gray-300', labelKey: 'status_later' },
};

function coerceStatus(s?: string): PhaseStatus {
  if (s === 'done' || s === 'now' || s === 'next' || s === 'later') return s;
  return 'later';
}

// Prosty tooltip bez zewnętrznych bibliotek
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
    >
      {children}
      <motion.span
        role="tooltip"
        initial={{ opacity: 0, y: -4 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/90 px-2 py-1 text-[11px] text-gray-100 shadow-lg"
      >
        {text}
      </motion.span>
    </span>
  );
};

export default function RoadmapItem({
  item,
  index,
  isHovered = false,
  onHoverStart,
  onHoverEnd,
}: RoadmapItemProps) {
  const { t, i18n } = useTranslation('roadmap-page');

  // i18n: pobierz tytuł/opis/punkty na bazie i18nKey z bezpiecznym fallbackiem
  const baseKey = item.i18nKey ? `phases.${item.i18nKey}` : '';
  const titleKey = baseKey ? `${baseKey}.title` : '';
  const descKey = baseKey ? `${baseKey}.description` : '';
  const pointsKey = baseKey ? `${baseKey}.points` : '';

  const missingTitle = baseKey ? !i18n.exists(titleKey, { ns: 'roadmap-page' }) : true;
  const missingDesc = baseKey ? !i18n.exists(descKey, { ns: 'roadmap-page' }) : true;

  const title = baseKey
    ? t(titleKey, { defaultValue: item.title ?? item.quarterLabel ?? '—' })
    : (item.title ?? item.quarterLabel ?? '—');

  const description = baseKey
    ? t(descKey, { defaultValue: item.description ?? '' })
    : (item.description ?? '');

  const points = (baseKey
    ? (t(pointsKey, { returnObjects: true, defaultValue: item.points ?? [] }) as string[])
    : (item.points ?? [])) || [];

  const safeStatus = coerceStatus(item.status);
  const config = STATUS_CONFIG[safeStatus];
  const IconComp = config.icon;
  const isReversed = index % 2 !== 0;

  // dokładna data do tooltipa
  const exactDateLabel = useMemo(() => {
    if (!item._date) return t('no_exact_date', 'Dokładna data niedostępna');
    try {
      return new Intl.DateTimeFormat(i18n.language || 'en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(item._date);
    } catch {
      return item._date.toISOString().slice(0, 10);
    }
  }, [item._date, i18n.language, t]);

  return (
    <div className="relative">
      {/* Punkt na osi */}
      <div className="absolute left-4 top-3 md:left-1/2 md:-translate-x-1/2">
        <span className={`block h-3 w-3 rounded-full shadow ${config.colorDot}`} aria-hidden />
      </div>

      <div className="mt-10 md:grid md:grid-cols-2 md:gap-10">
        <div className={isReversed ? 'md:col-start-2' : 'md:col-start-1'}>
          <motion.article
            onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur ${isHovered ? 'ring-1 ring-gold-300/40' : ''}`}
          >
            {safeStatus === 'now' && <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gold-400/5 blur-md" />}

            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconComp size={20} className={config.colorText} aria-hidden />
                <h3 className="text-base font-semibold leading-tight text-white">
                  {title}
                  {process.env.NODE_ENV !== 'production' && (missingTitle || missingDesc) && (
                    <span className="ml-2 inline-flex items-center rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                      missing i18n: {item.i18nKey}
                    </span>
                  )}
                </h3>
              </div>

              {/* Status + tooltip daty */}
              <Tooltip text={exactDateLabel}>
                <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badgeClass}`}>
                  <CalendarIcon size={12} aria-hidden />
                  {t(config.labelKey, { defaultValue: safeStatus })}
                </span>
              </Tooltip>
            </header>

            {item.quarterLabel && (
              <div className="mt-2 text-xs text-gray-300">
                <Tooltip text={exactDateLabel}>
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon size={12} className="opacity-80" aria-hidden />
                    {item.quarterLabel}
                  </span>
                </Tooltip>
              </div>
            )}

            {(description && description.trim().length > 0) ? (
              <p className="mt-3 text-sm leading-relaxed text-gray-200/90">{description}</p>
            ) : null}

            {Array.isArray(points) && points.length > 0 && (
              <ul className="mt-3 space-y-2">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-200/90">
                    <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.colorDot}`} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.article>
        </div>
      </div>
    </div>
  );
}
