"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!isSupabaseConfigured) return null;
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

export { isSupabaseConfigured };
