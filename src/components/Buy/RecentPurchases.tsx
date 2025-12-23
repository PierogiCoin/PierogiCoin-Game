'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import supabase from '@/lib/supabase/client';

// --- Typy ---
export type Item = { amt: number; crypto: 'SOL' | 'USDC', id?: string };

type RecentPurchasesProps = {
  initial?: Item[];
  /** Ile "chipsów" ma być widocznych. */
  limit?: number;
  /** Interwał odpytywania API (ms) */
  pollMs?: number;
  /** Włącza symulację, jeśli API jest puste/niedostępne. */
  simulate?: boolean;
};

// --- Funkcje pomocnicze ---
function isItem(x: unknown): x is Item {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  const amt = typeof r.amt === 'number' && Number.isFinite(r.amt) && r.amt > 0;
  const c = r.crypto === 'SOL' || r.crypto === 'USDC';
  return amt && c;
}

function toStringOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function toNumberOrNaN(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  return Number.NaN;
}

/**
 * Mały, poziomy ticker z ostatnimi zakupami.
 *
 * - W pełni po stronie klienta
 * - Wsparcie dla i18n
 * - Dostępne dla czytników ekranu (aria-live)
 * - Niezawodne odpytywanie API z opcjonalną lokalną symulacją
 * - Aktualizacja w czasie rzeczywistym przez Supabase Realtime
 */
export default function RecentPurchases({
  initial = [],
  limit = 8,
  pollMs = 20000,
  simulate = false,
}: RecentPurchasesProps) {
  const { t, i18n } = useTranslation(['buy-tokens-page', 'common']);
  const [items, setItems] = useState<Item[]>(initial);

  const locale = (t('common:locale_code', { defaultValue: i18n.language || 'en-US' }) as string) || 'en-US';

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  // --- HARDCODED RESET FOR USER REQUEST ---
  // Overriding API/Simulation to show only Sebastian PL's transaction ($35)
  // This effectively "clears" the view of previous test data.
  useEffect(() => {
    setItems([
      { amt: 35, crypto: 'USDC', id: 'seb-audit-found-1' }
    ]);
  }, []);

  // --- Realtime & Polling Disabled to enforce "Reset" state ---
  /*
  useEffect(() => {
    if (!supabase) return;
    // ... (Realtime logic commented out)
  }, [limit]);

  useEffect(() => {
    // ... (Polling logic commented out)
  }, [limit, pollMs, simulate]);
  */

  // Stan pusty (szkielet)
  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm text-white/80 mb-2">
          {t('buy_section.recent_purchases_title', { defaultValue: 'Recent purchases' })}
        </div>
        <div className="flex gap-2 overflow-x-hidden" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="shrink-0 h-6 w-28 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-sm text-white/80 mb-2">
        {t('buy_section.recent_purchases_title', { defaultValue: 'Recent purchases' })}
      </div>

      <div className="flex gap-2 overflow-x-auto" aria-live="polite">
        {items.map((it, i) => (
          <span
            key={`${it.crypto}-${it.amt}-${i}`}
            className="shrink-0 text-xs rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
          >
            {it.crypto} • {money.format(Math.max(0, it.amt))}
          </span>
        ))}
      </div>
    </div>
  );
}