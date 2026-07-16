import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { groq, GROQ_MODEL } from "@/lib/groq";

/**
 * Health check das integrações externas.
 * Rota temporária apenas para validar que Supabase e Groq estão conectados.
 * REMOVER em produção.
 */
export async function GET() {
  const results = {
    supabase: { ok: false, message: "" },
    groq: { ok: false, message: "" },
  };

  // Testa Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    results.supabase = { ok: true, message: "Conectado ao Supabase" };
  } catch (error) {
    results.supabase = {
      ok: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }

  // Testa Groq com um prompt mínimo
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: "Responda apenas 'ok' se você está funcionando.",
        },
      ],
      max_tokens: 10,
    });
    const answer = response.choices[0]?.message?.content?.trim();
    results.groq = { ok: true, message: `Groq respondeu: "${answer}"` };
  } catch (error) {
    results.groq = {
      ok: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }

  const allOk = results.supabase.ok && results.groq.ok;
  return NextResponse.json(results, { status: allOk ? 200 : 500 });
}
