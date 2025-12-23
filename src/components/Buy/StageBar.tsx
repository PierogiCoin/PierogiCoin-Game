'use client';

import React from 'react';
import Countdown from '../ui/Countdown';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

type StageProgressMeta = { sold: number; cap: number; pct: number } | null;

interface StageBarProps {
  t: (k: string, opts?: Record<string, unknown>) => string;
  usd0: Intl.NumberFormat;
  stageProgress: StageProgressMeta;
  stageEndsAt: number;
  slotsLeft: number | null;
  milestones?: number[];
  showPercent?: boolean;
  source?: 'props' | 'supabase';
  milestonesAbsUSD?: number[];
  milestoneReferenceCapUSD?: number;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createSupabaseClient(url, key);
  } catch {
    console.error('[StageBar] Failed to init Supabase client');
    return null;
  }
}

export default function StageBar({
  t,
  usd0,
  stageProgress,
  stageEndsAt,
  slotsLeft,
  milestones,
  showPercent,
  source,
  milestonesAbsUSD,
  milestoneReferenceCapUSD,
}: StageBarProps) {
  const [fetched, setFetched] = React.useState<StageProgressMeta>(null);
  const [fetchedEndsAt, setFetchedEndsAt] = React.useState<number | null>(null);
  const [fetchedSlotsLeft, setFetchedSlotsLeft] = React.useState<number | null>(null);
  const [fetchedCurrentPrice, setFetchedCurrentPrice] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [live, setLive] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (source !== 'supabase') return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[StageBar] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Falling back to props.');
      // Do not set error, allow fallback to props
      return;
    }
    const sb = supabase;

    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    async function fetchOnce() {
      try {
        setLoading(true);
        setErr(null);

        const { data: stagesData, error: stagesError } = await sb
          .from('presale_stages')
          .select('cap, stage_ends_at, slots_left, current_price, is_active')
          .eq('is_active', true)
          .single();

        if (stagesError || !stagesData) {
          console.warn('[StageBar] Using fallback (props) due to Supabase stages error/empty:', stagesError);
          // Do not set user-facing error, fallback to props
          return;
        }

        const { data: salesData, error: salesError } = await sb
          .from('sales')
          .select('usd_amount')
          .eq('status', 'success');

        if (salesError) {
          console.warn('[StageBar] Using fallback (props) due to Supabase sales error:', salesError);
          // Do not set user-facing error, fallback to props
          return;
        }

        if (!isMounted) return;

        // Obliczamy sold (kwotę zebraną) sumując wartości z kolumny usd_amount
        const sold = salesData.reduce((sum, sale) => sum + (sale.usd_amount || 0), 0);
        const cap = Number(stagesData.cap ?? 0);
        const pct = (cap > 0) ? Math.min(100, Math.max(0, (sold / cap) * 100)) : 0;

        setFetched({ sold, cap, pct });
        setFetchedEndsAt(stagesData.stage_ends_at ? Number(new Date(stagesData.stage_ends_at)) : null);
        setFetchedSlotsLeft(Number.isFinite(Number(stagesData.slots_left)) ? Number(stagesData.slots_left) : null);
        setFetchedCurrentPrice(Number.isFinite(Number(stagesData.current_price)) ? Number(stagesData.current_price) : null);

      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOnce();

    const channel = sb
      .channel('stagebar-presale')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, () => {
        fetchOnce();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presale_stages' }, () => {
        fetchOnce();
      })
      .subscribe((status) => {
        if (!isMounted) return;
        if (status === 'SUBSCRIBED') {
          setLive(true);
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setLive(false);
          if (!pollTimer) {
            pollTimer = setInterval(fetchOnce, 20000);
          }
        }
      });

    pollTimer = setInterval(fetchOnce, 20000);

    return () => {
      isMounted = false;
      try { sb.removeChannel(channel); } catch { }
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [source, t]);

  const resolvedProgress = source === 'supabase' && fetched ? fetched : stageProgress;
  const resolvedEndsAt = source === 'supabase' && fetchedEndsAt ? fetchedEndsAt : stageEndsAt;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resolvedSlotsLeft = source === 'supabase' ? (fetchedSlotsLeft ?? slotsLeft) : slotsLeft;
  const resolvedCurrentPrice = source === 'supabase' && fetchedCurrentPrice ? fetchedCurrentPrice : null;

  const safePct = Number.isFinite(resolvedProgress?.pct ?? NaN) ? Math.max(0, Math.min(100, resolvedProgress!.pct)) : 0;
  const safeCap = Number.isFinite(resolvedProgress?.cap ?? NaN) ? Math.max(0, resolvedProgress!.cap) : 0;
  const safeSold = Number.isFinite(resolvedProgress?.sold ?? NaN) ? Math.max(0, resolvedProgress!.sold) : 0;

  let absMilestones: number[] | null = null;
  const refCapForMilestones = (Array.isArray(milestonesAbsUSD) && milestonesAbsUSD.length)
    ? ((typeof milestoneReferenceCapUSD === 'number' && milestoneReferenceCapUSD > 0)
      ? milestoneReferenceCapUSD
      : (safeCap > 0 ? safeCap : milestonesAbsUSD[milestonesAbsUSD.length - 1]))
    : null;

  let milestonePairs: { abs: number; pct: number }[] = [];
  if (Array.isArray(milestonesAbsUSD) && milestonesAbsUSD.length) {
    absMilestones = [...milestonesAbsUSD].sort((a, b) => a - b);
    const cap = refCapForMilestones ?? absMilestones[absMilestones.length - 1];
    milestonePairs = absMilestones.map((v, idx) => {
      const pct = Math.max(0, Math.min(100, (v / (cap || 1)) * 100));
      const jitter = 0.0001 * idx;
      return { abs: v, pct: Math.min(100, pct + jitter) };
    }).sort((a, b) => a.pct - b.pct);
  }

  const milestonesArr = (() => {
    if (milestonePairs.length) return milestonePairs.map((p) => p.pct);
    return (Array.isArray(milestones) && milestones.length) ? milestones : [25, 50, 75, 100];
  })();

  const milestonePercents = milestonesArr;
  const nextMilestone = milestonesArr.find((m) => safePct < m) ?? null;
  const nextMilestoneAbs = (() => {
    if (nextMilestone == null) return null;
    if (milestonePairs.length) {
      const found = milestonePairs.find((p) => Math.abs(p.pct - nextMilestone) < 0.5);
      if (found) return found.abs;
    }
    const refCap = (typeof milestoneReferenceCapUSD === 'number' && milestoneReferenceCapUSD > 0)
      ? milestoneReferenceCapUSD
      : (safeCap > 0 ? safeCap : 0);
    return Math.round((refCap * nextMilestone) / 100);
  })();

  const missingToNext = (nextMilestoneAbs != null)
    ? Math.max(0, Number(nextMilestoneAbs) - safeSold)
    : null;

  const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
  const compactLabel = React.useMemo(() => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }), []);

  const priceFormatter = React.useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }), []);

  return (
    <div className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4">
      {source === 'supabase' && (
        <div className="mb-2 flex items-center gap-2 text-xs">
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          )}
          {loading && <span className="text-white/60">{t('common.loading', { defaultValue: 'Ładowanie…' })}</span>}
          {err && <span className="text-red-300">{err}</span>}
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-white/90">
        <span>{t("buy_section.stage_progress", { defaultValue: "Postęp presale" })}</span>
        {showPercent !== false && <span className="font-semibold tabular-nums">{safePct}%</span>}
      </div>
      <div className="mt-2">
        <div
          className="relative h-3 rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-label={t('buy_section.stage_progress', { defaultValue: 'Postęp presale' })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safePct}
          title={`${safePct}%`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_12%,transparent_12%_50%,rgba(255,255,255,0.06)_50%_62%,transparent_62%)] bg-[length:16px_16px]" />
          <div
            className={
              "relative h-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out motion-reduce:transition-none " +
              (safePct < 33
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : safePct < 66
                  ? "bg-gradient-to-r from-gold-400 to-amber-500"
                  : "bg-gradient-to-r from-green-400 to-emerald-600")
            }
            style={{ width: `${safePct}%` }}
          />
          {milestonePercents.map((m) => (
            <div
              key={m}
              className="absolute top-0 h-full w-px bg-white/30"
              style={{ left: `${m}%` }}
              title={`${m}%`}
              aria-hidden
            />
          ))}
        </div>
        <div className="relative mt-1 h-6">
          {milestonePercents.map((m, i) => {
            const absVal = milestonePairs.length ? milestonePairs[i]?.abs ?? null : (absMilestones ? absMilestones[i] : null);
            const label = (absVal != null)
              ? `${compactLabel.format(absVal)} USD`
              : `${Math.round(m)}%`;

            const clamped = Math.max(0, Math.min(100, m));
            const atStart = clamped <= 0;
            const atEnd = clamped >= 100;
            const translate = atStart ? "translate-x-0" : atEnd ? "-translate-x-full" : "-translate-x-1/2";
            return (
              <span
                key={`label-${m}-${i}`}
                className={`absolute ${translate} ${i % 2 ? 'top-3' : 'top-0'} text-[10px] leading-4 text-white/80 hidden sm:block font-mono px-1 rounded bg-black/30 z-10 whitespace-nowrap`}
                style={{ left: `${clamped}%` }}
                title={label}
              >
                {label}
              </span>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gold-200">
          <span title={`${usd0.format(Math.round(safeSold))} / ${usd0.format(Math.round(safeCap))}`}>
            {compact.format(Math.max(0, Math.round(safeSold)))} / {compact.format(Math.max(0, Math.round(safeCap)))}
          </span>
          <span className="opacity-80">
            • {t("buy_section.price_increase_in", { defaultValue: "Cena wzrośnie za:" })}{" "}
            <Countdown endsAt={resolvedEndsAt} />
          </span>
        </div>
        {resolvedCurrentPrice && (
          <div className="mt-2 text-center text-sm font-bold text-white">
            <span className="mr-1">💰</span>
            {t('buy_section.current_price', { defaultValue: 'Aktualna cena' })}: {priceFormatter.format(resolvedCurrentPrice)}
          </div>
        )}
        {(() => {
          if (!(nextMilestone && safePct < 100 && safeCap > 0)) return null;
          return (
            <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80" role="status" aria-live="polite">
              <span className="mr-2">🎯</span>
              <>
                {t("buy_section.next_progress_milestone", {
                  defaultValue: "Następny kamień milowy: {{usd}} ({{pct}}%)",
                  usd: usd0.format(nextMilestoneAbs ?? 0),
                  pct: nextMilestone,
                })}
                {typeof missingToNext === 'number' && missingToNext > 0 && (
                  <span className="ml-2 opacity-90">
                    • {t('buy_section.missing_to_next', {
                      defaultValue: 'Brakuje {{usd}} do następnego progu',
                      usd: usd0.format(Math.round(missingToNext)),
                    })}
                  </span>
                )}
              </>
            </div>
          );
        })()}
      </div>
    </div>
  );
}