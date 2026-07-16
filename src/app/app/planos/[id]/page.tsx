import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  Users,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  FileText,
  Lightbulb,
  ListChecks,
  Home,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ACTIVITY_TYPE_LABELS,
  ASSESSMENT_TYPE_LABELS,
  DIFFICULTY_LABELS,
  GRADE_LEVELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { LessonPlanContent } from "@/lib/supabase/types";
import { DeletePlanButton } from "@/components/delete-plan-button";
import { DuplicatePlanButton } from "@/components/duplicate-plan-button";
import { PrintPlanButton } from "@/components/print-plan-button";
import { ArchivePlanButton } from "@/components/archive-plan-button";

type Section = {
  duration_minutes?: number;
  description?: string;
  steps?: string[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("lesson_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (!plan) {
    notFound();
  }

  const [{ data: activities }, { data: assessments }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("lesson_plan_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("assessments")
      .select("*")
      .eq("lesson_plan_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const content = (plan.content ?? {}) as LessonPlanContent;
  const intro = content.introduction as Section | undefined;
  const dev = content.development as Section | undefined;
  const closure = content.closure as Section | undefined;
  const material = content.teaching_material;
  // Aceita tanto o nome atual (guided_examples) quanto o legado (worked_examples)
  // para não quebrar planos gerados antes da v3 do prompt.
  const materialLegacy = material as
    | { worked_examples?: Array<{ statement: string; solution: string }> }
    | undefined;
  const examples =
    material?.guided_examples ?? materialLegacy?.worked_examples ?? [];
  const hasMaterial =
    material &&
    ((material.explanation && material.explanation.length > 0) ||
      examples.length > 0 ||
      (material.exercises && material.exercises.length > 0) ||
      (material.homework && material.homework.length > 0));

  const gradeLabel =
    GRADE_LEVELS.find((g) => g.value === plan.grade_level)?.label ??
    plan.grade_level;

  return (
    <div className="print-area mx-auto max-w-4xl space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app" className="gap-1">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar aos planos
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{STATUS_LABELS[plan.status] ?? plan.status}</Badge>
          <PrintPlanButton />
          <DuplicatePlanButton planId={plan.id} />
          <ArchivePlanButton planId={plan.id} currentStatus={plan.status} />
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/app/planos/${plan.id}/editar`}>
              <Pencil className="h-4 w-4" aria-hidden />
              Editar
            </Link>
          </Button>
          <DeletePlanButton planId={plan.id} planTitle={plan.title} />
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {plan.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-hidden />
            {plan.discipline}
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" aria-hidden />
            {gradeLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden />
            {plan.duration_minutes} min
          </span>
          {plan.ai_model && (
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" aria-hidden />
              {plan.ai_model}
            </span>
          )}
        </div>
      </header>

      {/* Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tema da aula</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{plan.topic}</p>
        </CardContent>
      </Card>

      {/* Objetivos + BNCC lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" aria-hidden />
              Objetivos de aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {plan.learning_objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Habilidades BNCC</CardTitle>
            <CardDescription>
              {plan.bncc_skills.length > 0
                ? "Códigos alinhados ao tema"
                : "Nenhuma habilidade específica mapeada"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plan.bncc_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {plan.bncc_skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pré-requisitos e metodologia */}
      {(plan.prerequisites || plan.methodology) && (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.prerequisites && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pré-requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{plan.prerequisites}</p>
              </CardContent>
            </Card>
          )}
          {plan.methodology && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metodologia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{plan.methodology}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recursos */}
      {plan.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recursos necessários</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-1.5 pl-5 text-sm sm:grid-cols-2 list-disc">
              {plan.resources.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Estrutura da aula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Estrutura da aula</CardTitle>
          <CardDescription>
            Sequência didática dividida em três momentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SectionBlock title="Introdução" section={intro} />
          <SectionBlock title="Desenvolvimento" section={dev} />
          <SectionBlock title="Fechamento" section={closure} />
        </CardContent>
      </Card>

      {/* Material didático — o que apresentar aos alunos */}
      {hasMaterial && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" aria-hidden />
              Material didático da aula
            </CardTitle>
            <CardDescription>
              Conteúdo pronto para apresentar, projetar ou entregar aos alunos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {material?.explanation && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                  Conteúdo (texto de apoio)
                </h3>
                <div className="prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {material.explanation}
                </div>
              </section>
            )}

            {examples.length > 0 && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4 text-primary" aria-hidden />
                  Exemplos comentados
                </h3>
                <div className="space-y-3">
                  {examples.map((ex, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-muted/30 p-4 space-y-2"
                    >
                      <p className="text-sm font-semibold">
                        Exemplo {i + 1}
                      </p>
                      <p className="text-sm whitespace-pre-line">
                        <span className="font-medium">Enunciado: </span>
                        {ex.statement}
                      </p>
                      <div className="text-sm whitespace-pre-line">
                        <span className="font-medium">Análise/Solução: </span>
                        {ex.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {material?.exercises && material.exercises.length > 0 && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <ListChecks className="h-4 w-4 text-primary" aria-hidden />
                  Questões / atividades ({material.exercises.length})
                </h3>
                <ol className="list-decimal space-y-3 pl-5">
                  {material.exercises.map((q, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="flex-1 whitespace-pre-line">
                          {q.statement}
                        </p>
                        {q.difficulty && (
                          <Badge variant="outline">
                            {DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line">
                        <span className="font-semibold">Resposta esperada: </span>
                        {q.answer}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {material?.homework && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Home className="h-4 w-4 text-primary" aria-hidden />
                  Para casa
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {material.homework}
                </p>
              </section>
            )}
          </CardContent>
        </Card>
      )}

      {/* Atividades */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" aria-hidden />
              Atividades ({activities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((a, i) => (
              <div
                key={a.id}
                className="rounded-lg border bg-muted/30 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {i + 1}. {a.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {a.activity_type && (
                      <Badge variant="outline">
                        {ACTIVITY_TYPE_LABELS[a.activity_type] ??
                          a.activity_type}
                      </Badge>
                    )}
                    {a.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {a.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
                {a.description && (
                  <p className="text-sm leading-relaxed">{a.description}</p>
                )}
                {a.instructions && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Instruções para o professor
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {a.instructions}
                    </p>
                  </div>
                )}
                {a.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {a.resources.map((r, ri) => (
                      <Badge key={ri} variant="outline">
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Avaliações */}
      {assessments && assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
              Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border bg-muted/30 p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Badge>
                    {ASSESSMENT_TYPE_LABELS[a.type] ?? a.type}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{a.description}</p>
                {a.criteria.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Critérios
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {a.criteria.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ------------------- Componentes locais -------------------

function SectionBlock({
  title,
  section,
}: {
  title: string;
  section: Section | undefined;
}) {
  if (!section?.description) {
    return null;
  }
  return (
    <div className="border-l-2 border-primary/40 pl-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">{title}</h3>
        {section.duration_minutes && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {section.duration_minutes} min
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed">{section.description}</p>
      {section.steps && section.steps.length > 0 && (
        <ul className="list-decimal pl-5 text-sm space-y-1">
          {section.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const styles =
    variant === "outline"
      ? "border border-input text-foreground"
      : "bg-primary/10 text-primary";
  return <span className={`${base} ${styles}`}>{children}</span>;
}
