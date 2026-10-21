import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cleanSupabaseEnv } from "./supabase-env";

// Client lecture seule pour le site public (côté serveur).
export function supabaseServer(): SupabaseClient | null {
  const env = cleanSupabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Les pages se rafraîchissent toutes les 30 secondes au plus.
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 30 } }),
    },
  });
}
