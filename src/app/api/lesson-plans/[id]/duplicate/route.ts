import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/lesson-plans/[id]/duplicate
 *
 * Duplica um plano do professor: copia o registro principal (novo título
 * " (cópia)", status=draft) e todas as activities/assessments filhas.
 * Retorna o id do novo plano para navegação.
 */
export async function POST(
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
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 1) Busca o plano original (RLS garante que só o dono acessa)
  const { data: original, error: fetchErr } = await supabase
    .from("lesson_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !original) {
    return NextResponse.json(
      { error: "Plano não encontrado" },
      { status: 404 },
    );
  }

  // 2) Insere o novo plano (sem id/created_at/updated_at, com título e status novos)
  // Precisamos setar user_id explicitamente porque RLS insert exige auth.uid() = user_id
  const {
    id: _oldId,
    created_at: _c,
    updated_at: _u,
    ...rest
  } = original;
  void _oldId;
  void _c;
  void _u;

  const { data: created, error: insertErr } = await supabase
    .from("lesson_plans")
    .insert({
      ...rest,
      user_id: user.id,
      title: `${original.title} (cópia)`,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Falha ao duplicar plano" },
      { status: 500 },
    );
  }

  // 3) Duplica atividades
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("lesson_plan_id", id);

  if (activities && activities.length > 0) {
    const rows = activities.map((a) => {
      const { id: _aid, created_at: _ac, lesson_plan_id: _lp, ...body } = a;
      void _aid;
      void _ac;
      void _lp;
      return { ...body, lesson_plan_id: created.id };
    });
    const { error: actErr } = await supabase.from("activities").insert(rows);
    if (actErr) {
      // Rollback: apaga o plano recém criado para não deixar lixo parcial
      await supabase.from("lesson_plans").delete().eq("id", created.id);
      return NextResponse.json(
        { error: `Falha ao duplicar atividades: ${actErr.message}` },
        { status: 500 },
      );
    }
  }

  // 4) Duplica avaliações
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("lesson_plan_id", id);

  if (assessments && assessments.length > 0) {
    const rows = assessments.map((a) => {
      const { id: _aid, created_at: _ac, lesson_plan_id: _lp, ...body } = a;
      void _aid;
      void _ac;
      void _lp;
      return { ...body, lesson_plan_id: created.id };
    });
    const { error: asErr } = await supabase.from("assessments").insert(rows);
    if (asErr) {
      await supabase.from("lesson_plans").delete().eq("id", created.id);
      return NextResponse.json(
        { error: `Falha ao duplicar avaliações: ${asErr.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ id: created.id }, { status: 201 });
}
