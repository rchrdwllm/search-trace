"use client";

import "client-only";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export function createBrowserSupabaseClient(): SupabaseClient {
  const { url, publishableKey } = getPublicSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
