// Plik: src/components/ThemeProvider.tsx
'use client'

import * as React from 'react';
// ZMIANA: Importujemy zarówno komponent, jak i jego typy z jednego, głównego miejsca
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * Komponent-wrapper, który dostarcza kontekst motywu dla całej aplikacji.
 * Używa biblioteki next-themes do zarządzania motywem jasnym/ciemnym.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Przekazujemy wszystkie propsy (np. attribute="class", defaultTheme="system")
  // do oryginalnego providera, a wewnątrz renderujemy dzieci aplikacji.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}