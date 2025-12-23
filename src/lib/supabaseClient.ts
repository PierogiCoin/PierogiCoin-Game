// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Twarde sprawdzenie — ten klient ma sens tylko po stronie serwera
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in your server env.'
  );
}

/**
 * Admin client (service role) — UŻYWAJ TYLKO PO STRONIE SERWERA!
 * Nigdy nie bundluj go do przeglądarki.
 */
let _admin: SupabaseClient | undefined;

export const supabaseAdmin: SupabaseClient = (() => {
  if (_admin) return _admin;
  _admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'pierogi-admin' } },
  });
  return _admin;
})();