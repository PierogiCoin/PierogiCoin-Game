'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePresale } from '@/context/PresaleContext';
import Countdown from '@/components/ui/Countdown';

type Props = {
  className?: string;
};

const currency = (n: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function EnhancedPresaleProgress({ className = '' }: Props) {
  // --- Stages table state ---
  type StageRow = {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
    bonus_percent: number | null;
    is_active: boolean | null;
    price?: number | null;
    hardcap_usd?: number | null;
  };

  const [stages, setStages] = useState<StageRow[] | null>(null);

  // Load stages from API for the price table
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/stage/list', { cache: 'no-store' });
        const json = await r.json().catch(() => ({} as Record<string, unknown>));
        const items = Array.isArray(json?.items) ? (json.items as StageRow[]) : [];
        if (!cancelled) setStages(items);
      } catch {
        if (!cancelled) setStages([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { t, i18n } = useTranslation(['buy-tokens-page', 'common']);
  // Access context in a flexible way to avoid type errors when PresaleContextState
  // doesn't declare raisedUsd yet.
  const presaleCtx = usePresale() as unknown as {
    raisedUsd?: number;
    currentStage?: {
      hardcap_usd?: number | null;
      end_date?: string | null;
      price?: number | null;
    } | null;
  };

  const currentStage = presaleCtx?.currentStage ?? null;

  // Prefer value from context if available; otherwise fetch from API.
  const [raisedUsd, setRaisedUsd] = useState<number>(
    typeof presaleCtx?.raisedUsd === 'number' ? presaleCtx.raisedUsd! : 0
  );

  useEffect(() => {
    if (typeof presaleCtx?.raisedUsd === 'number') return; // already provided by context
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/presale-status', { cache: 'no-store' });
        const json = await r.json().catch(() => ({}));
        const v = Number(json?.raisedUsd ?? 0);
        if (!cancelled && Number.isFinite(v)) setRaisedUsd(v);
      } catch {
        // ignore; keep default 0
      }
    })();
    return () => { cancelled = true; };
  }, [presaleCtx?.raisedUsd]);

  const locale = i18n.language || 'en-US';

  const priceFmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 6 }),
    [locale]
  );

  // ... (fmtDate, getStageStatus omitted for brevity as they are unchanged)

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(iso));
    } catch {
      return iso as string;
    }
  };

  type StageStatus = 'active' | 'upcoming' | 'completed';
  const getStageStatus = (s: StageRow): StageStatus => {
    const now = Date.now();
    const start = s.start_date ? Date.parse(s.start_date) : NaN;
    const end = s.end_date ? Date.parse(s.end_date) : NaN;
    if (Number.isFinite(start) && Number.isFinite(end)) {
      if (now >= start && now <= end) return 'active';
      if (now < start) return 'upcoming';
      if (now > end) return 'completed';
    }
    if (s.is_active) return 'active';
    return 'upcoming';
  };

  const cap = Number(currentStage?.hardcap_usd ?? 0);
  const endIso = currentStage?.end_date as string | undefined;
  const price = currentStage?.price ?? null;

  const { pct, remaining, nextMilestonePct } = useMemo(() => {
    if (!cap || cap <= 0 || !Number.isFinite(raisedUsd)) {
      return { pct: 0, remaining: null as number | null, nextMilestone: null as number | null, nextMilestonePct: null as number | null };
    }
    const p = Math.max(0, Math.min(100, Math.round((raisedUsd / cap) * 100)));
    const rem = Math.max(0, cap - raisedUsd);
    // Milestony co 25%
    const milestones = [25, 50, 75, 100];
    const next = milestones.find((m) => p < m) ?? null;
    return { pct: p, remaining: rem, nextMilestone: next, nextMilestonePct: next };
  }, [raisedUsd, cap]);

  // Skeleton gdy brak danych o etapie
  if (!currentStage || !cap) {
    return (
      <div className={`rounded-xl border border-gold-500/30 bg-gold-500/10 p-4 ${className}`}>
        <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
        <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-white/20" />
        </div>
        <div className="mt-2 h-4 w-56 rounded bg-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* === Progress Section (existing) === */}
      <section
        className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4"
        aria-label={t('buy_section.stage_progress', { defaultValue: 'Presale progress' })}
      >
        <header className="flex items-center justify-between text-sm text-white/90">
          <div className="font-semibold">
            {t('buy_section.stage_progress', { defaultValue: 'Presale progress' })}
          </div>
          <div aria-live="polite" className="tabular-nums">{pct}%</div>
        </header>

        {/* Pasek postępu */}
        <div className="mt-2">
          <div className="relative h-3 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            {/* Tło w paski przy końcówce */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_12%,transparent_12%_50%,rgba(255,255,255,0.06)_50%_62%,transparent_62%)] bg-[length:16px_16px]" />
            {/* Wypełnienie */}
            <div
              className="relative h-full transition-[width] duration-700 ease-out bg-gradient-to-r from-gold-400 to-amber-500"
              style={{ width: `${pct}%` }}
              title={`${pct}%`}
            />
            {/* Tiki milestonów */}
            {[25, 50, 75, 100].map((m) => (
              <div
                key={m}
                className="absolute top-0 h-full w-px bg-white/30"
                style={{ left: `${m}%` }}
                aria-hidden
              />
            ))}
          </div>

          {/* belka z opisem */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gold-200">
            <span>
              {currency(raisedUsd, locale)} / {currency(cap, locale)}
            </span>
            {remaining !== null && remaining > 0 && (
              <span className="opacity-80">• {t('buy_section.left_to_cap', { defaultValue: 'Left to hardcap' })}: {currency(remaining, locale)}</span>
            )}
            {endIso && (
              <span className="opacity-80">
                • {t('buy_section.price_increase_in', { defaultValue: 'Price increases in' })}{' '}
                <Countdown endsAt={Date.parse(endIso)} />
              </span>
            )}
            {price !== null && price !== undefined && (
              <span className="opacity-80">
                • {t('buy_section.stage_price', { defaultValue: 'Price' })}: {priceFmt.format(price)} / PRG
              </span>
            )}
            {cap && (
              <span className="opacity-80">
                • {t('buy_section.hardcap_amount', { defaultValue: 'Hardcap' })}: {currency(cap, locale)}
              </span>
            )}
          </div>

          {/* sugestia kolejnego progu */}
          {nextMilestonePct && pct < 100 && (
            <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80">
              <span className="mr-2">🎯</span>
              {t('buy_section.next_progress_milestone', {
                defaultValue: 'Next milestone: {{pct}}%',
                pct: nextMilestonePct,
              })}{' '}
              • {t('buy_section.raise_to_reach', {
                defaultValue: 'Raise to {{target}} total',
                target: currency((cap * (nextMilestonePct as number)) / 100, locale),
              })}
            </div>
          )}
        </div>
      </section>

      {/* === Stages Price Table === */}
      <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-white font-semibold">
            {t('buy_section.stage_price_table_title', { defaultValue: 'Stage prices & bonuses' })}
          </h3>
          <span className="text-xs text-white/60">{t('buy_section.timezone_note', { defaultValue: 'Local timezone' })}</span>
        </div>

        {stages === null ? (
          <div className="h-24 rounded bg-white/10 animate-pulse" />
        ) : stages.length === 0 ? (
          <div className="text-sm text-white/70">{t('buy_section.no_stages', { defaultValue: 'No stages configured yet.' })}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/80">
                  <th className="px-3 py-2">{t('buy_section.table.stage', { defaultValue: 'Stage' })}</th>
                  <th className="px-3 py-2">{t('buy_section.table.price', { defaultValue: 'Price (USD / PRG)' })}</th>
                  <th className="px-3 py-2">{t('buy_section.table.bonus', { defaultValue: 'Stage bonus' })}</th>
                  <th className="px-3 py-2">{t('buy_section.table.start', { defaultValue: 'Start' })}</th>
                  <th className="px-3 py-2">{t('buy_section.table.end', { defaultValue: 'End' })}</th>
                  <th className="px-3 py-2">{t('buy_section.table.status', { defaultValue: 'Status' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stages
                  .slice()
                  .sort((a, b) => {
                    const as = a.start_date ? Date.parse(a.start_date) : 0;
                    const bs = b.start_date ? Date.parse(b.start_date) : 0;
                    return as - bs;
                  })
                  .map((s, idx) => {
                    const status = getStageStatus(s);
                    const statusLabel =
                      status === 'active'
                        ? t('stages.status.active', { defaultValue: 'Active' })
                        : status === 'upcoming'
                          ? t('stages.status.upcoming', { defaultValue: 'Upcoming' })
                          : t('stages.status.completed', { defaultValue: 'Completed' });
                    return (
                      <tr key={s.id} className="text-white/90">
                        <td className="px-3 py-2 font-medium">Stage {idx + 1} — {s.name}</td>
                        <td className="px-3 py-2 tabular-nums">{priceFmt.format(Number(s.price ?? 0))}</td>
                        <td className="px-3 py-2">+{Number(s.bonus_percent ?? 0)}%</td>
                        <td className="px-3 py-2">{fmtDate(s.start_date)}</td>
                        <td className="px-3 py-2">{fmtDate(s.end_date)}</td>
                        <td className="px-3 py-2">{statusLabel}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}