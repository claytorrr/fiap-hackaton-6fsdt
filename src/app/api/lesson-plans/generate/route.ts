import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import {
  generateLessonPlanRequestSchema,
  lessonPlanAiResponseSchema,
  type LessonPlanAiResponse,
} from "@/lib/ai/schema";
import {
  LESSON_PLAN_SYSTEM_PROMPT,
  buildLessonPlanUserPrompt,
  PROMPT_VERSION,
} from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60; // Groq geralmente responde em <10s, damos folga.

/**
 * POST /api/lesson-plans/generate
 *
 * Fluxo:
 *   1. Verifica sessão (RLS depende do JWT do usuário).
 *   2. Valida payload com Zod.
 *   3. Chama Groq com response_format=json_object.
 *   4. Valida a resposta contra o schema esperado.
 *   5. Persiste lesson_plan + activities + assessments no Supabase.
 *   6. Retorna { id } para o cliente navegar.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  // 1) Sessão
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

  // 2) Payload
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = generateLessonPlanRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload inválido",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // 3) Chamada à IA
  let aiJson: unknown;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 16384,
      messages: [
        { role: "system", content: LESSON_PLAN_SYSTEM_PROMPT },
        { role: "user", content: buildLessonPlanUserPrompt(input) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw) {
      throw new Error("Resposta vazia da IA");
    }
    aiJson = JSON.parse(raw);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido na IA";
    console.error("[generate] IA falhou:", message);
    return NextResponse.json(
      { error: "Falha ao gerar plano com IA", details: message },
      { status: 502 },
    );
  }

  // 4) Validação da resposta da IA
  const aiParsed = lessonPlanAiResponseSchema.safeParse(aiJson);
  if (!aiParsed.success) {
    console.error(
      "[generate] IA retornou schema inválido:",
      z.treeifyError(aiParsed.error),
    );
    return NextResponse.json(
      {
        error:
          "A IA retornou um plano em formato inesperado. Tente novamente.",
      },
      { status: 502 },
    );
  }
  const ai: LessonPlanAiResponse = aiParsed.data;

  // 5) Persistência — insere o plano principal
  const { data: plan, error: planError } = await supabase
    .from("lesson_plans")
    .insert({
      user_id: user.id,
      title: ai.title,
      discipline: input.discipline,
      grade_level: input.grade_level,
      topic: input.topic,
      duration_minutes: input.duration_minutes,
      bncc_skills: ai.bncc_skills,
      learning_objectives: ai.learning_objectives,
      prerequisites: ai.prerequisites || null,
      methodology: ai.methodology || null,
      resources: ai.resources,
      content: {
        introduction: ai.introduction,
        development: ai.development,
        closure: ai.closure,
        teaching_material: ai.teaching_material,
      },
      status: "draft",
      ai_model: GROQ_MODEL,
      ai_prompt_version: PROMPT_VERSION,
      generation_input: input,
    })
    .select("id")
    .single();

  if (planError || !plan) {
    console.error("[generate] insert lesson_plan falhou:", planError);
    return NextResponse.json(
      { error: "Falha ao salvar o plano", details: planError?.message },
      { status: 500 },
    );
  }

  // 5b) Persiste activities (opcional — pode vir vazio)
  if (ai.activities.length > 0) {
    const activitiesRows = ai.activities.map((a, i) => ({
      lesson_plan_id: plan.id,
      title: a.title,
      description: a.description || null,
      activity_type: a.activity_type,
      duration_minutes: a.duration_minutes,
      position: a.position ?? i,
      resources: a.resources,
      instructions: a.instructions || null,
    }));
    const { error: actError } = await supabase
      .from("activities")
      .insert(activitiesRows);
    if (actError) {
      console.error("[generate] insert activities falhou:", actError);
      // Não bloqueia: o plano já existe. Log e segue.
    }
  }

  // 5c) Persiste assessments
  if (ai.assessments.length > 0) {
    const assessmentsRows = ai.assessments.map((a) => ({
      lesson_plan_id: plan.id,
      type: a.type,
      description: a.description,
      criteria: a.criteria,
    }));
    const { error: assError } = await supabase
      .from("assessments")
      .insert(assessmentsRows);
    if (assError) {
      console.error("[generate] insert assessments falhou:", assError);
    }
  }

  return NextResponse.json({ id: plan.id }, { status: 201 });
}
