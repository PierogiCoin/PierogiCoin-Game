// Plik: src/lib/supabase/route-handler-client.ts
import { createClient } from '@supabase/supabase-js'

export function createRouteHandlerClient() {
  // Ten klient używa klucza service_role i jest idealny dla API Routes.
  // Nie polega na ciasteczkach, więc unika błędów.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}