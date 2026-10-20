import { supabaseServer } from "./supabase";
import { SEED_COLLECTIONS, SEED_PRODUCTS, SEED_SETTINGS } from "./seed";
import type { Catalog, Collection, Product, Settings } from "./types";

export async function getCatalog(): Promise<Catalog> {
  const sb = supabaseServer();
  if (sb) {
    try {
      const [c, p, s] = await Promise.all([
        sb.from("collections").select("*").eq("active", true).order("sort"),
        sb.from("products").select("*").eq("active", true).order("sort"),
        sb.from("settings").select("key,value"),
      ]);
      if (!c.error && !p.error && c.data && c.data.length > 0) {
        const settings: Settings = { ...SEED_SETTINGS };
        for (const row of (s.data ?? []) as { key: string; value: string }[]) {
          if (row.key === "whatsapp") settings.whatsapp = row.value;
          if (row.key === "currency" && row.value) settings.currency = row.value;
        }
        return {
          collections: c.data as Collection[],
          products: (p.data ?? []) as Product[],
          settings,
          source: "supabase",
        };
      }
      console.warn("Supabase est vide ou a répondu une erreur, utilisation des données de départ.", c.error?.message, p.error?.message);
    } catch (e) {
      console.warn("Supabase injoignable, utilisation des données de départ.", e);
    }
  }
  return { collections: SEED_COLLECTIONS, products: SEED_PRODUCTS, settings: SEED_SETTINGS, source: "seed" };
}
