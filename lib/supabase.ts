import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client lecture seule pour le site public (côté serveur).
export function supabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Les pages se rafraîchissent toutes les 30 secondes au plus.
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 30 } }),
    },
  });
}
