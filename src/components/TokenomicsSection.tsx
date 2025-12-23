// Plik: src/components/TokenomicsSection.tsx
'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartEvent,
  ActiveElement,
  Chart,
  Plugin,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';

import PageHeader from '@/components/PageHeader';
import TokenomicCard from '@/components/Tokenomics/TokenomicCard';
import { MAX_SUPPLY, tokenomicsRawData } from '@/data/tokenomicsData';
// SimpleBackground import removed

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Guard przed podwójną rejestracją pluginu podczas HMR/SSR
let ACTIVE_GLOW_REGISTERED = false;

// ——— Typ z dodanym `details` (to właśnie trafia do TokenomicCard) ———
export type TokenomicSegment = (typeof tokenomicsRawData)[number] & {
  details: {
    rawAmount: number;
    vestingKey: string;
    purposeKey: string;
  };
};

export default function TokenomicsSection() {
  const { t } = useTranslation('tokenomics');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const chartRef = useRef<Chart<'doughnut'> | null>(null);



  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Dane + precomputy (TU powstaje prawidłowy typ z `details`)
  const tokenomicsData = useMemo<TokenomicSegment[]>(() => {
    return tokenomicsRawData.map((segment) => ({
      ...segment,
      details: {
        rawAmount: Math.round(MAX_SUPPLY * (segment.numericPercentage / 100)),
        vestingKey: `segments.${segment.id}.vesting`,
        purposeKey: `segments.${segment.id}.purpose`,
      },
    }));
  }, []);

  const idToIndex = useMemo(() => {
    const map = new Map<string, number>();
    tokenomicsData.forEach((d, i) => map.set(d.id, i));
    return map;
  }, [tokenomicsData]);

  const activeItemId = selectedItemId || hoveredItemId;
  const activeItemIndex =
    activeItemId && idToIndex.has(activeItemId) ? idToIndex.get(activeItemId)! : -1;

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  // Plugin: neonowy glow aktywnego klina
  const glowPlugin = useMemo(() => {
    const plugin = {
      id: 'activeGlow',
      afterDatasetDraw(chart: Chart, _args: unknown, pluginOptions: { activeIndex: number }) {
        const index = pluginOptions.activeIndex;
        if (index === -1) return;

        type ChartElement = {
          getProps: (keys: string[], final: boolean) => { x: number; y: number };
          draw: (ctx: CanvasRenderingContext2D) => void;
        };

        const meta = chart.getDatasetMeta(0);
        const el = meta.data[index] as unknown as ChartElement;
        if (!el) return;

        const { ctx } = chart;
        const { x, y } = el.getProps(['x', 'y'], true);

        ctx.save();
        ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
        ctx.shadowBlur = 28;
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.beginPath();
        el.draw(ctx);
        ctx.stroke();
        ctx.restore();

        // Bloom w centrum
        const r = Math.min(chart.width, chart.height) * 0.14;
        const grd = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        grd.addColorStop(0, 'rgba(250, 204, 21, 0.18)');
        grd.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.save();
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    };
    return plugin;
  }, []);

  // Cache gradientów
  const gradientCache = useRef<Record<number, CanvasGradient>>({});

  const makeSliceGradient = useCallback(
    (ctx: CanvasRenderingContext2D, area: { left: number; right: number; top: number; bottom: number; width: number; height: number }, hex: string, i: number) => {
      if (gradientCache.current[i]) return gradientCache.current[i];

      const hexToRgb = (h: string) => {
        const s = h.replace('#', '');
        const v = s.length === 3 ? s.split('').map((x) => x + x).join('') : s;
        const num = parseInt(v, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      };

      const { r, g, b } = hexToRgb(hex);
      const safe = (n: number, fb: number) => (Number.isFinite(n) ? n : fb);
      const R = safe(r, 250), G = safe(g, 204), B = safe(b, 21); // fallback: amber

      const centerX = (area.left + area.right) / 2;
      const centerY = (area.top + area.bottom) / 2;
      const radius = Math.min(area.width, area.height) / 2;

      const grad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.1,
        centerX, centerY, radius
      );

      grad.addColorStop(0, `rgba(${R}, ${G}, ${B}, 0.95)`);
      grad.addColorStop(0.55, `rgba(${R}, ${G}, ${B}, 0.75)`);
      grad.addColorStop(1, `rgba(${R}, ${G}, ${B}, 0.55)`);
      gradientCache.current[i] = grad;
      return grad;
    },
    []
  );

  // chartData
  const chartData = useMemo(() => {
    return {
      labels: tokenomicsData.map((item) => t(item.titleKey)),
      datasets: [
        {
          data: tokenomicsData.map((item) => item.numericPercentage),
          backgroundColor: (ctx: { dataIndex: number; chart: Chart }) => {
            const i = ctx.dataIndex as number;
            const base = tokenomicsData[i].color;
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart as unknown as { ctx: CanvasRenderingContext2D; chartArea?: { left: number; right: number; top: number; bottom: number; width: number; height: number } };
            if (!chartArea) return base;

            // Gradient tylko dla koloru w HEX; w innym wypadku użyj bazowego koloru
            const isHex =
              typeof base === 'string' &&
              /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(base);
            return isHex ? makeSliceGradient(canvasCtx, chartArea, base, i) : base;
          },
          hoverBackgroundColor: tokenomicsData.map((item) => item.hoverColor),
          offset: tokenomicsData.map((_, idx) => (idx === activeItemIndex ? 22 : 6)),
          hoverOffset: 26,
          borderColor: '#0b0f19',
          borderWidth: 3,
          spacing: 2,
        },
      ],
    };
  }, [tokenomicsData, t, activeItemIndex, makeSliceGradient]);

  // chartOptions
  const chartOptions: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '66%',
      layout: { padding: 20 }, // luz na etykiety
      onHover: (_: ChartEvent, activeEls: ActiveElement[]) => {
        setHoveredItemId(
          activeEls.length > 0 ? tokenomicsData[activeEls[0].index].id : null
        );
      },
      onClick: (_: ChartEvent, activeEls: ActiveElement[]) => {
        if (activeEls.length > 0) {
          handleItemSelect(tokenomicsData[activeEls[0].index].id);
        }
      },
      animation: prefersReducedMotion ? false : { duration: 900, easing: 'easeOutQuart' },
      transitions: {
        active: { animation: { duration: prefersReducedMotion ? 0 : 300 } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: {
          display: (context) =>
            (context.dataset.data[context.dataIndex] as number) >= 5,
          formatter: (value) => `${value}%`,
          color: '#0b0f19',
          font: { weight: 'bold', size: 14 },
          clamp: true,
        },
        // Własny plugin przekazywany jako zwykłe pole
        ...({ activeGlow: { activeIndex: activeItemIndex } } as Record<string, unknown>),
      },
    }),
    [tokenomicsData, handleItemSelect, activeItemIndex, prefersReducedMotion]
  );

  // Rejestracja pluginu (raz)
  useEffect(() => {
    if (!ACTIVE_GLOW_REGISTERED) {
      ChartJS.register(glowPlugin as Plugin);
      ACTIVE_GLOW_REGISTERED = true;
    }
  }, [glowPlugin]);

  // Klawiatura: ←/→ – nawigacja, Enter – select
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const total = tokenomicsData.length;
      if (!total) return;

      const idx = activeItemIndex === -1 ? 0 : activeItemIndex;

      if (e.key === 'ArrowRight') {
        const next = (idx + 1) % total;
        setHoveredItemId(tokenomicsData[next].id);
      }
      if (e.key === 'ArrowLeft') {
        const prev = (idx - 1 + total) % total;
        setHoveredItemId(tokenomicsData[prev].id);
      }
      if (e.key === 'Enter') {
        const id = (hoveredItemId ?? activeItemId) ?? tokenomicsData[0].id;
        handleItemSelect(id);
      }
    },
    [tokenomicsData, activeItemIndex, hoveredItemId, activeItemId, handleItemSelect]
  );

  // Mini-legend (klikane kapsułki)
  const LegendPills: React.FC = () => (
    <div
      className="mt-6 flex flex-wrap gap-2 justify-center"
      aria-label={t('legend_aria', 'Legenda tokenomiki')}
    >
      {tokenomicsData.map((seg, i) => {
        const isActive = activeItemIndex === i;
        return (
          <button
            key={seg.id}
            onMouseEnter={() => setHoveredItemId(seg.id)}
            onMouseLeave={() => setHoveredItemId(null)}
            onFocus={() => setHoveredItemId(seg.id)}
            onBlur={() => setHoveredItemId(null)}
            onClick={() => handleItemSelect(seg.id)}
            aria-pressed={selectedItemId === seg.id}
            className={[
              'group inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm transition',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/70',
              isActive
                ? 'border-gold-300/60 bg-gold-300/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10',
            ].join(' ')}
          >
            <span
              className="h-3 w-3 rounded-full ring-1 ring-white/20"
              style={{ background: seg.color }}
            />
            <span className="text-white/90">{t(seg.titleKey)}</span>
            <span className="text-white/50">{seg.numericPercentage}%</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      id="tokenomics"
      className="relative py-24 md:py-28 pb-44 text-white overflow-visible"
      aria-labelledby="tokenomics-heading"
    >


      <div className="relative z-10 container mx-auto px-4">
        {/* Accessible hidden heading for aria-labelledby */}
        <h2 id="tokenomics-heading" className="sr-only">{t('title')}</h2>
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div
          className="flex flex-col lg:flex-row items-center justify-center lg:gap-12 xl:gap-16 mt-16"
          onKeyDown={handleKey}
          tabIndex={0}
          aria-label={t('keyboard_help', 'Użyj strzałek, aby nawigować, Enter aby zaznaczyć')}
        >
          {/* Chart + centrum KPI */}
          <motion.div
            className="w-full lg:w-2/5 max-w-md h-[420px] sm:h-[460px] mb-12 lg:mb-0"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="w-full h-full relative">
              <Doughnut
                ref={(r) => (chartRef.current = r as unknown as Chart<'doughnut'>)}
                data={chartData}
                options={chartOptions}
                aria-label={t('chart_aria_label', 'Wykres kołowy tokenomiki')}
              />

              {/* Centrum – domyślnie Całkowita Podaż; na hover/klik pokazuje segment */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                <AnimatePresence mode="wait">
                  {activeItemIndex !== -1 ? (
                    <motion.div
                      key={tokenomicsData[activeItemIndex].id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gold-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]">
                        {t(tokenomicsData[activeItemIndex].titleKey)}
                      </h3>
                      <p className="text-3xl sm:text-4xl font-extrabold text-white my-1 tracking-tight">
                        {tokenomicsData[activeItemIndex].numericPercentage}%
                      </p>
                      <p className="text-[13px] sm:text-sm text-gray-300 font-mono">
                        <CountUp
                          end={tokenomicsData[activeItemIndex].details.rawAmount}
                          separator=","
                          duration={prefersReducedMotion ? 0 : 0.6}
                        />{' '}
                        PRG
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="total"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                    >
                      <div className="text-xs sm:text-sm text-gray-300">
                        {t('total_supply_label')}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-gold-300 mt-1 drop-shadow-[0_0_14px_rgba(250,204,21,0.35)]">
                        <CountUp end={MAX_SUPPLY} separator="," duration={prefersReducedMotion ? 0 : 2.2} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mini legenda – kapsułki */}
            <LegendPills />
          </motion.div>

          {/* Karty segmentów */}
          <motion.div
            className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
            variants={{ whileInView: { transition: { staggerChildren: 0.07 } } }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {tokenomicsData.map((item) => (
              <TokenomicCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                isHovered={hoveredItemId === item.id}
                onSelect={() => handleItemSelect(item.id)}
                onHoverStart={() => setHoveredItemId(item.id)}
                onHoverEnd={() => setHoveredItemId(null)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div aria-hidden="true" className="h-10 sm:h-14 md:h-20"></div>

      {/* Dekoracyjna aureola pod wykresem */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-28 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(closest-side, rgba(250,204,21,0.35), rgba(250,204,21,0))' }}
        />
      </div>
    </section>
  );
}