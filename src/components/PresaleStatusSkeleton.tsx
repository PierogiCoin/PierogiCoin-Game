'use client';

import React from 'react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

type Props = {
  /** Card (default) shows header/timer/progress; "inline" is tiny row placeholder */
  variant?: 'card' | 'inline';
  /** Disable shimmer animation (also auto-disables when prefers-reduced-motion) */
  animated?: boolean;
  /** Show progress bar placeholder */
  showProgress?: boolean;
  /** Extra classes for outer wrapper */
  className?: string;
  label?: string;
};

const TimerBlock = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg shimmer-bg" />
    <div className="h-3 w-10 rounded-md shimmer-bg" />
  </div>
);

/**
 * Accessible, lightweight presale skeleton.
 * - role="status" + aria-live for SR
 * - respects prefers-reduced-motion
 * - compact "inline" variant
 */
export const PresaleStatusSkeleton: React.FC<Props> = ({
  variant = 'card',
  animated = true,
  showProgress = true,
  className,
  label = 'Sekcja zakupu – Presale',
}) => {
  // Respect prefers-reduced-motion
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const shimmerClass = animated && !reduceMotion ? 'shimmer-bg' : 'shimmer-bg--static';

  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={clsx(
          'flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2',
          className
        )}
      >
        <span className="text-xs font-medium text-amber-300/90">
          {label}
        </span>
        <span className={clsx('h-4 w-24 rounded', shimmerClass)} />
        <span className={clsx('h-4 w-12 rounded', shimmerClass)} />
        <span className={clsx('ml-auto h-4 w-16 rounded', shimmerClass)} />
        <span className="sr-only">Loading presale status…</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'w-full max-w-2xl mx-auto bg-[#0a0a12]/50 backdrop-blur-md border border-gray-700/40 rounded-2xl shadow-2xl p-6 sm:p-8',
        className
      )}
    >
      {/* Section context */}
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-amber-300">
          {label}
        </p>
        <p className="text-xs text-gray-300">Wczytywanie danych przedsprzedaży…</p>
      </div>

      {/* Title placeholder */}
      <div className={clsx('h-7 w-3/4 mx-auto rounded-md mb-8', shimmerClass)} />

      {/* Timer placeholder */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-8">
        <div className="sr-only">Loading countdown blocks…</div>
        <div className={clsx('flex flex-col items-center gap-2')}>
          <div className={clsx('h-14 w-14 sm:h-16 sm:w-16 rounded-lg', shimmerClass)} />
          <div className={clsx('h-3 w-10 rounded-md', shimmerClass)} />
        </div>
        <TimerBlock />
        <TimerBlock />
        <TimerBlock />
      </div>

      {/* Progress placeholder */}
      {showProgress && (
        <div className="mt-6 border-t border-gray-700/40 pt-6 space-y-4">
          <div className={clsx('h-4 w-full rounded-full', shimmerClass)} />
          <div className="flex justify-between">
            <div className={clsx('h-5 w-1/3 rounded-md', shimmerClass)} />
            <div className={clsx('h-5 w-1/5 rounded-md', shimmerClass)} />
          </div>
        </div>
      )}

      <span className="sr-only">Loading presale details…</span>
    </div>
  );
};

// --- Self-fetching wrapper with graceful error handling ---
type PresaleData = {
  raisedUsd?: number;
  bonusPct?: number;
  nextTierUsd?: number;
};

/**
 * PresaleStatusAutoload
 * Klientowy fetch z timeoutem + komunikat błędu i przycisk ponów.
 * Użycie: <PresaleStatusAutoload />
 */
export function PresaleStatusAutoload({
  endpoint = '/api/presale-status',
  label = 'Sekcja zakupu – Presale',
  authHeaderName,
  authHeaderValue,
  fallbackData,
}: {
  endpoint?: string;
  label?: string;
  authHeaderName?: string;
  authHeaderValue?: string;
  fallbackData?: { raisedUsd?: number; bonusPct?: number; nextTierUsd?: number };
}) {
  const [data, setData] = useState<PresaleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const buildHeaders = () => {
    const h: Record<string, string> = {};
    if (authHeaderName && authHeaderValue) {
      h[authHeaderName] = authHeaderValue;
    }
    return h;
  };

  const fetchWithTimeout = async (url: string, ms = 12000, init?: RequestInit) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal, ...init });
      return res;
    } finally {
      clearTimeout(t);
    }
  };

  const fetchPresale = async (): Promise<PresaleData> => {
    const res = await fetchWithTimeout(endpoint, 12000, { headers: buildHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    // Try to parse safely
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(`Invalid content-type: ${ct}`);
    }
    return (await res.json()) as PresaleData;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // retry up to 2 times
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const json = await fetchPresale();
          setData(json);
          setLoading(false);
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      // If retries failed, maybe use fallback
      if (fallbackData) {
        setData(fallbackData);
        setLoading(false);
        setError(`Użyto danych przykładowych (endpoint nie działa). Szczegóły: ${String((lastErr as Error)?.message || lastErr)}`);
        return;
      }
      throw lastErr ?? new Error('Unknown error');
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  if (loading) return <PresaleStatusSkeleton label={label} />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-xl border border-red-500/30 bg-red-950/20">
        <p className="font-semibold text-red-300">Nie udało się wczytać danych presale.</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={load}
            className="px-4 py-2 rounded-md bg-gold-500 text-gray-900 hover:opacity-90"
          >
            Spróbuj ponownie
          </button>
          <button
            onClick={() => {
              const demo = fallbackData ?? { raisedUsd: 12345, bonusPct: 15, nextTierUsd: 4000 };
              setData(demo);
              setError('Użyto danych przykładowych (endpoint chwilowo niedostępny).');
              setLoading(false);
            }}
            className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/5"
          >
            Pokaż dane przykładowe
          </button>
        </div>
      </div>
    );
  }

  const { raisedUsd = 0, bonusPct = 0, nextTierUsd = 0 } = data ?? {};

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5">
      <h3 className="text-xl font-bold mb-2">Presale – aktualny stan</h3>
      <div className="space-y-1 text-sm opacity-90">
        <div>
          Zebrano: <strong>${Number(raisedUsd ?? 0).toLocaleString()}</strong>
        </div>
        <div>
          Bonus: <strong>{Number(bonusPct ?? 0)}%</strong>
        </div>
        <div>
          Do kolejnego progu: <strong>${Number(nextTierUsd ?? 0).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

export default PresaleStatusSkeleton;
