'use client';

import React from 'react';
import Countdown from '@/components/ui/Countdown';

type Props = {
  pct: number | null;           // procent etapu (0–100)
  endsAt: number;               // timestamp (ms) końca etapu
  slotsLeft?: number | null;    // ile slotów pozostało (opcjonalnie)
  onCta?: () => void;           // akcja po kliknięciu "Kup teraz"
  hideWhenInViewId?: string;    // id elementu, przy którego widoczności pasek ma się ukrywać (np. "buy-card")
};

export default function SmartStickyTopBar({
  pct,
  endsAt,
  slotsLeft = null,
  onCta,
  hideWhenInViewId,
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const lastY = React.useRef(0);
  const inViewRef = React.useRef(false);

  // Pokazuj przy scrollu > 200 i kierunku do góry
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const scrollingUp = y < lastY.current;
      lastY.current = y;
      if (dismissed || inViewRef.current) return setVisible(false);
      if (y > 200 && scrollingUp) setVisible(true);
      else if (y < 120 || !scrollingUp) setVisible(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  // Ukrywaj, gdy dany element jest w kadrze
  React.useEffect(() => {
    if (!hideWhenInViewId) return;
    const el = document.getElementById(hideWhenInViewId);
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
        if (inViewRef.current) setVisible(false);
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hideWhenInViewId]);

  if (!visible || dismissed) return null;

  const pctSafe = Math.max(0, Math.min(100, pct ?? 0));

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mt-2 rounded-xl border border-gold-500/40 bg-[#0b0f1a]/85 backdrop-blur-md shadow-xl">
          {/* pasek progresu (ultra-cienki) */}
          <div className="h-1 w-full rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-amber-500"
              style={{ width: `${pctSafe}%` }}
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2">
            <span className="hidden sm:inline text-xs font-semibold text-gold-300">PRG Presale</span>

            <div className="text-[11px] sm:text-sm text-white/80">
              ⏳ Cena wzrośnie za <Countdown endsAt={endsAt} />
            </div>

            {typeof pct === 'number' && Number.isFinite(pct) && (
              <div className="ml-auto text-xs sm:text-sm text-white/80">
                {pctSafe}% {slotsLeft != null && <span className="opacity-70">• 🪙 {slotsLeft} slotów</span>}
              </div>
            )}

            <button
              onClick={onCta}
              className="ml-1 sm:ml-2 shrink-0 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-gray-900 shadow hover:brightness-[1.05]"
            >
              Kup teraz
            </button>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Zamknij pasek"
              className="ml-1 rounded-lg px-2 py-1 text-xs text-white/60 hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
