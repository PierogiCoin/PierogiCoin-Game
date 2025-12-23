import { useEffect, useState } from 'react';

/**
 * Hook decydujący czy ładować Vanta na podstawie:
 * - prefers-reduced-motion
 * - typu urządzenia (mobile vs desktop)
 * - performance (connection speed)
 */
export function useVantaOptimization() {
  const [shouldLoadVanta, setShouldLoadVanta] = useState(false);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldLoadVanta(false);
      return;
    }

    // 2. Check device (disable on mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      setShouldLoadVanta(false);
      return;
    }

    // 3. Check connection speed (if available)
    const nav = navigator as Navigator & {
      connection?: { effectiveType: string; saveData: boolean };
      mozConnection?: { effectiveType: string };
      webkitConnection?: { effectiveType: string };
      deviceMemory?: number;
    };

    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      // Only load on fast connections (4g)
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
        setShouldLoadVanta(false);
        return;
      }
    }

    // 4. Check device memory (if available)
    const deviceMemory = nav.deviceMemory;
    if (deviceMemory && deviceMemory < 4) {
      // Less than 4GB RAM - skip Vanta
      setShouldLoadVanta(false);
      return;
    }

    // All checks passed - load Vanta
    setShouldLoadVanta(true);
  }, []);

  return shouldLoadVanta;
}
