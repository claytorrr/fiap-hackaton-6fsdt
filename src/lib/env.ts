import { z } from "zod";

/**
 * Validação centralizada das variáveis de ambiente.
 * Roda no boot da aplicação — se algo estiver faltando, o build/dev quebra
 * de forma explícita, evitando erros obscuros em runtime.
 */
const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY é obrigatória"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY é obrigatória"),
});

export const env = envSchema.parse({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
