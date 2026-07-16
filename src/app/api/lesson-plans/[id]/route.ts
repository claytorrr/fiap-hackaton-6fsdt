import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * DELETE /api/lesson-plans/[id]
 *
 * Exclui um plano do professor logado.
 * RLS já garante que só o dono consegue apagar; ainda assim conferimos
 * a sessão para retornar 401 explícito em vez de 204 silencioso.
 * activities e assessments caem em cascata (FK ON DELETE CASCADE).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { error, count } = await supabase
    .from("lesson_plans")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    // Nada apagado: ou não existe, ou não pertence ao usuário (RLS bloqueou).
    return NextResponse.json(
      { error: "Plano não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
