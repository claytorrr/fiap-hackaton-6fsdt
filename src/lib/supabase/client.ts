import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso no navegador (client components).
 * Usa apenas a chave `anon` (pública). O acesso aos dados é controlado
 * pelas policies de Row Level Security (RLS) definidas no banco.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
