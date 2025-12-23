// supabase/functions/refresh-presale/index.ts
// Deno Edge Function: refresh materialized view after sales change
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase platform injects SUPABASE_URL automatically, but CLI forbids secrets starting with SUPABASE_.
// Fallbacks make local CLI-friendly names work too.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("SB_URL") || "";
const SERVICE_ROLE =
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("SB_SERVICE_ROLE_KEY") ||
  Deno.env.get("SB_SERVICE_ROLE") ||
  Deno.env.get("SERVICE_ROLE") ||
  "";
const REFRESH_SECRET = Deno.env.get("REFRESH_SECRET") || Deno.env.get("REFRESH_TOKEN") || "";

if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL/SB_URL env");
if (!SERVICE_ROLE) throw new Error("Missing SERVICE_ROLE_KEY (set via secrets as SERVICE_ROLE_KEY or SB_SERVICE_ROLE_KEY)");
if (!REFRESH_SECRET) throw new Error("Missing REFRESH_SECRET env");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const hdr = req.headers.get("x-refresh-secret");
    if (!hdr || hdr !== REFRESH_SECRET) return new Response("Unauthorized", { status: 401 });

    const { error } = await supabase.rpc("refresh_mv_sales_success_agg");
    if (error) {
      console.error("RPC error:", error);
      return new Response("RPC error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Internal", { status: 500 });
  }
});