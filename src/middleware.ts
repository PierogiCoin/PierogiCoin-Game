// Plik: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Upewnij się, że ten import wskazuje na poprawny plik
import { i18n } from './i18n-config';

// Pomocnicza lista i strażnik typu dla locales
const LOCALES: string[] = [...i18n.locales];
const isSupportedLocale = (val: string): val is (typeof i18n.locales)[number] => LOCALES.includes(val);

const PUBLIC_FILE = /\.[^/]+$/; // np. /favicon.ico, /image.png

function detectPreferredLocale(request: NextRequest, fallback: string): string {
  // 1) ?lang=XX ma najwyższy priorytet
  const urlLang = request.nextUrl.searchParams.get('lang');
  if (urlLang && isSupportedLocale(urlLang)) return urlLang;

  // 2) Cookie ustawiane np. przez przełącznik języka (kompatybilne z next-i18next)
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLang && isSupportedLocale(cookieLang)) return cookieLang;

  // 3) Nagłówki przeglądarki
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales: string[] = LOCALES;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  return matchLocale(languages, locales, fallback);
}

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Pomiń pliki statyczne i API
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Jeżeli ścieżka JUŻ zawiera obsługiwany prefix locale — nic nie rób
  const hasLocalePrefix = i18n.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Wybierz docelowy język na podstawie query/cookie/nagłówków
  const targetLocale = detectPreferredLocale(request, i18n.defaultLocale);

  // Zbuduj nowy URL z prefixem locale, zachowując ścieżkę i query (bez ?lang=)
  const url = new URL(`${origin}/${targetLocale}${pathname === '/' ? '' : pathname}`);
  // Przenieś pozostałe parametry zapytania
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== 'lang') url.searchParams.set(key, value);
  });

  const res = NextResponse.redirect(url);

  // Ustaw ciasteczko z wybranym językiem, żeby kolejne żądania nie skakały
  res.cookies.set('NEXT_LOCALE', targetLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });

  return res;
}

export const config = {
  matcher: [
    // Pomiń standardowe ścieżki techniczne/assetowe
    '/((?!api|_next|images|assets|favicon.ico|sw.js).*)',
  ],
};