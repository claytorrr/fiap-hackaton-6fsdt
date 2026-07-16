import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EditPlanForm } from "@/components/edit-plan-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPlanPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("lesson_plans")
    .select(
      "id, title, discipline, grade_level, topic, duration_minutes, status, learning_objectives, bncc_skills, prerequisites, methodology, resources",
    )
    .eq("id", id)
    .single();

  if (!plan) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/planos/${plan.id}`} className="gap-1">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar ao plano
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar plano</h1>
        <p className="text-muted-foreground">
          Ajuste os dados principais. Atividades, avaliações e o conteúdo
          detalhado (introdução/desenvolvimento/fechamento) permanecem
          inalterados.
        </p>
      </div>

      <EditPlanForm
        plan={{
          id: plan.id,
          title: plan.title,
          discipline: plan.discipline,
          grade_level: plan.grade_level,
          topic: plan.topic,
          duration_minutes: plan.duration_minutes,
          status: plan.status,
          learning_objectives: plan.learning_objectives ?? [],
          bncc_skills: plan.bncc_skills ?? [],
          prerequisites: plan.prerequisites ?? "",
          methodology: plan.methodology ?? "",
          resources: plan.resources ?? [],
        }}
      />
    </div>
  );
}
