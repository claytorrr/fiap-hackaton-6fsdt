import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Cliente Supabase para uso no navegador (client components).
 * Usa apenas a chave `anon` (pública). O acesso aos dados é controlado
 * pelas policies de Row Level Security (RLS) definidas no banco.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
