// Plik: src/i18n.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// --- POPRAWKA: Importujemy potrzebne typy z biblioteki i18next ---
import type { i18n as I18nInstanceType, Resource } from 'i18next';

// Zakładamy, że ten plik istnieje w głównym folderze projektu
import { i18n as i18nConfig } from '../i18n-config'; 

/**
 * Inicjalizuje i konfiguruje instancję i18next do użytku w Komponentach Serwerowych.
 */
export default async function initTranslations(
  locale: string,
  namespaces: string[],
  // --- POPRAWKA: Używamy zaimportowanych, konkretnych typów ---
  i18nInstance?: I18nInstanceType, 
  resources?: Resource          
) {
  // Tworzymy nową instancję tylko, jeśli nie została przekazana
  const i18n = i18nInstance || createInstance();

  i18n.use(initReactI18next);

  // Ładujemy pliki JSON z tłumaczeniami, jeśli nie zostały przekazane
  if (!resources) {
    i18n.use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`@/locales/${language}/${namespace}.json`)
      )
    );
  }

  // Inicjalizujemy i18next z pełną konfiguracją
  await i18n.init({
    lng: locale,
    resources, 
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales, 
  });

  return {
    i18n: i18n,
    resources: i18n.services.resourceStore.data,
    t: i18n.t,
  };
}