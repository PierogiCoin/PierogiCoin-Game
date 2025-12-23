// Plik: i18n-config.ts

export const i18n = {
  defaultLocale: 'en', // domyślny język
  locales: ['en', 'pl'], // dostępne języki
  fallbackLng: 'en', // fallback jeśli tłumaczenia brakuje
} as const;

export type Locale = (typeof i18n.locales)[number];