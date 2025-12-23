// Plik: src/lib/supabase/action-client.ts
// Ostateczna wersja asynchroniczna

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Oznaczamy funkcję jako asynchroniczną, ponieważ używamy `await`
export async function createActionClient() {
  
  // KROK 1: Walidacja zmiennych środowiskowych
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('❌ Critical Error: Missing Supabase Environment Variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY). Backend actions will fail.');
    // Zwracamy atrapę klienta lub rzucamy błąd, który obsłuży ErrorBoundary, zamiast walić aplikację "Invalid URL"
    throw new Error("Missing Supabase configuration");
  }

  // KROK 2: Pobieramy instancję `cookieStore` i czekamy na nią.
  const cookieStore = await cookies();

  // KROK 3: Tworzymy i zwracamy klienta
  return createServerClient(
    url,
    key,
    {
      cookies: {
        // Teraz te funkcje są proste i synchroniczne, bo operują na gotowym obiekcie.
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignorowane
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Ignorowane
          }
        },
      },
    }
  );
}