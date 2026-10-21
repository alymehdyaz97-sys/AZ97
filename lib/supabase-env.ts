// Nettoie les variables d'environnement : espaces, guillemets, "/" final ou chemin en trop.
export function cleanSupabaseEnv(): { url: string; key: string } | null {
  const strip = (v: string | undefined) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
  const rawUrl = strip(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = strip(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!rawUrl || !key) return null;
  let url = rawUrl;
  try { url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`).origin; } catch { return null; }
  return { url, key };
}
