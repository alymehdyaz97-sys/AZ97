"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cleanSupabaseEnv } from "./supabase-env";

let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (client) return client;
  const env = cleanSupabaseEnv();
  if (!env) return null;
  client = createClient(env.url, env.key);
  return client;
}
