import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateLessonPlanSchema } from "@/lib/ai/schema";

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

/**
 * PATCH /api/lesson-plans/[id]
 *
 * Atualiza os campos "top-level" de um plano (título, status, metadados,
 * listas simples). Não altera o content JSON aninhado nem activities/assessments.
 */
export async function PATCH(
  request: Request,
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
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = updateLessonPlanSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload inválido",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Impede PATCH vazio (nenhum campo enviado)
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo para atualizar" },
      { status: 400 },
    );
  }

  const { data, error, count } = await supabase
    .from("lesson_plans")
    .update(parsed.data, { count: "exact" })
    .eq("id", id)
    .select("id")
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || count === 0) {
    return NextResponse.json(
      { error: "Plano não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
