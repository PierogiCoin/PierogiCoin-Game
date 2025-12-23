// Plik: src/lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  // Tworzymy klienta Supabase dla komponentów serwerowych.
  // Używamy go do wszystkich operacji po stronie serwera (API routes, Server Actions).
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    
    // OSTATECZNA POPRAWKA: Zmieniamy klucz na SERVICE_ROLE_KEY.
    // Ten klucz ma pełne uprawnienia do zapisu i modyfikacji danych,
    // co jest niezbędne dla operacji takich jak tworzenie nowego zakupu.
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 

    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignorujemy błędy, które mogą wystąpić w Server Actions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Ignorujemy błędy jw.
          }
        },
      },
    }
  );
}
