// Plik: src/components/Providers/TranslationsProvider.tsx
'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance, type i18n as I18nInstanceType, type Resource } from 'i18next';
import { ReactNode, useEffect, useState } from 'react';

import initTranslations from '@/i18n';

interface TranslationsProviderProps {
  children: ReactNode;
  locale: string;
  namespaces: string[];
  resources: Resource;
}

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources,
}: TranslationsProviderProps) {
  const [i18n, setI18n] = useState<I18nInstanceType | null>(null);

  useEffect(() => {
    let isMounted = true;
    const i18nInstance = createInstance();

    (async () => {
      try {
        // Zainicjalizuj instancję i18next dostarczonymi zasobami i namespace'ami
        await initTranslations(locale, namespaces, i18nInstance, resources);
        // Upewnij się, że aktywny język na kliencie jest ustawiony (ważne dla strony głównej)
        if (i18nInstance.language !== locale) {
          await i18nInstance.changeLanguage(locale);
        }
        if (isMounted) setI18n(i18nInstance);
      } catch (e) {
        // W trybie dev łatwiej wychwycić problemy z brakującymi namespace'ami/plikami
        if (process.env.NODE_ENV !== 'production') {
          console.error('[i18n] Initialization failed', e);
        }
        if (isMounted) setI18n(i18nInstance);
      }
    })();

    return () => {
      isMounted = false;
      // Czyścimy instancję; nie rejestrowaliśmy konkretnych listenerów, więc niszczymy całość jeśli wspierane
      try {
        (i18nInstance as unknown as { destroy?: () => void }).destroy?.();
      } catch {}
    };
  }, [locale, namespaces, resources]);

  // Możesz podmienić na skeleton, by uniknąć mignięcia języków
  if (!i18n) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}