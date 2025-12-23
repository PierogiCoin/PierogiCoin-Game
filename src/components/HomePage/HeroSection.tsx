'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Lekki, samowystarczalny wrapper na Vanta.js:
 *  - SSR‑safe (uruchamia się tylko w przeglądarce)
 *  - sam dociąga skrypty THREE + konkretny efekt Vanty z CDN (bez bundlowania ich w aplikację)
 *  - współpracuje z prefers-reduced-motion
 *  - dodaje wsparcie dla większej liczby efektów (net, topology, halo, cells, fog, birds, waves, globe, rings, trunk)
 *  - odporność na wielokrotną inicjalizację (cache Promise ładowania i sprzątanie instancji)
 */

type VantaEffectName =
  | 'halo'
  | 'net'
  | 'topology'
  | 'cells'
  | 'fog'
  | 'birds'
  | 'waves'
  | 'globe'
  | 'rings'
  | 'trunk';

type VantaInstance = { destroy?: () => void } | null;

type Props = {
  /** Nazwa efektu Vanta */
  effect?: VantaEffectName;
  /** Opcje przekazywane do Vanty (np. kolory) */
  options?: Record<string, unknown>;
  /** Klasa dla kontenera */
  className?: string;
  /** Jeżeli true — nie inicjalizuj animacji (np. w sekcjach off‑screen) */
  paused?: boolean;
};

// ───────────────────────────────────────────────────────────────────────────────
// Loader skryptów z CDN (cache na poziomie modułu)
// ───────────────────────────────────────────────────────────────────────────────

const threeUrl =
  'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';

const vantaCdnBase = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist';

const effectToUrl: Record<VantaEffectName, string> = {
  net: `${vantaCdnBase}/vanta.net.min.js`,
  topology: `${vantaCdnBase}/vanta.topology.min.js`,
  halo: `${vantaCdnBase}/vanta.halo.min.js`,
  cells: `${vantaCdnBase}/vanta.cells.min.js`,
  fog: `${vantaCdnBase}/vanta.fog.min.js`,
  birds: `${vantaCdnBase}/vanta.birds.min.js`,
  waves: `${vantaCdnBase}/vanta.waves.min.js`,
  globe: `${vantaCdnBase}/vanta.globe.min.js`,
  rings: `${vantaCdnBase}/vanta.rings.min.js`,
  trunk: `${vantaCdnBase}/vanta.trunk.min.js`,
};

const scriptPromises = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  if (scriptPromises.has(src)) return scriptPromises.get(src)!;

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    // Jeżeli skrypt już istnieje w DOM
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

  scriptPromises.set(src, promise);
  return promise;
}

async function ensureVanta(effect: VantaEffectName): Promise<void> {
  await loadScriptOnce(threeUrl);
  await loadScriptOnce(effectToUrl[effect]);
}

// ───────────────────────────────────────────────────────────────────────────────

export default function VantaLayer({
  effect = 'net',
  options = {},
  className = 'absolute inset-0 -z-10',
  paused = false,
}: Props) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<VantaInstance>(null);

  // Ustabilizuj options – zmieniaj referencję tylko gdy faktycznie zmieni się treść
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    let cancelled = false;

    if (paused || reduce) return;
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;

    let retries = 0;

    const boot = async () => {
      try {
        await ensureVanta(effect);
        if (cancelled || !containerRef.current) return;

        const w = window as unknown as {
          THREE?: unknown;
          VANTA?: Record<string, (opts: unknown) => VantaInstance>;
        };

        // Fabryka efektu
        const factory = getEffectFactory(w.VANTA, effect);
        if (!factory) {
          // Jeżeli VANTA nie zdążyła się zarejestrować — spróbuj jeszcze kilka razy
          if (retries++ < 15) {
            setTimeout(boot, 100);
          }
          return;
        }

        // Domyślne bezpieczne opcje — Vanta ignoruje nieużywane
        const baseOpts = {
          el: containerRef.current!,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          backgroundColor: 0x000000,
          color: 0xc8a415, // #C8A415
          baseColor: 0x000000,
          shininess: 25,
        };

        // Sprzątnięcie poprzedniej instancji (np. przy zmianie efektu/opcji)
        try {
          vantaRef.current?.destroy?.();
        } catch {
          /* noop */
        }

        vantaRef.current = factory({
          ...baseOpts,
          ...(stableOptions as object),
        }) as VantaInstance;
      } catch {
        // ciche odpuszczenie — nie psujemy widoku gdy CDN nie działa
      }
    };

    boot();

    return () => {
      cancelled = true;
      try {
        vantaRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      vantaRef.current = null;
    };
  }, [effect, stableOptions, paused, reduce]);

  return <div ref={containerRef} className={className} aria-hidden />;
}

/** Mapowanie nazw efektów na fabryki VANTA.* */
function getEffectFactory(
  VANTA: Record<string, (opts: unknown) => VantaInstance> | undefined,
  name: VantaEffectName
) {
  if (!VANTA) return null;
  switch (name) {
    case 'halo':
      return VANTA.HALO ?? null;
    case 'net':
      return VANTA.NET ?? null;
    case 'topology':
      return VANTA.TOPOLOGY ?? null;
    case 'cells':
      return VANTA.CELLS ?? null;
    case 'fog':
      return VANTA.FOG ?? null;
    case 'birds':
      return VANTA.BIRDS ?? null;
    case 'waves':
      return VANTA.WAVES ?? null;
    case 'globe':
      return VANTA.GLOBE ?? null;
    case 'rings':
      return VANTA.RINGS ?? null;
    case 'trunk':
      return VANTA.TRUNK ?? null;
    default:
      return null;
  }
}
