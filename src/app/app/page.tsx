import Link from "next/link";
import { BookOpen, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PlanCard } from "@/components/plan-card";

type PlanRow = {
  id: string;
  title: string;
  discipline: string;
  grade_level: string;
  duration_minutes: number;
  status: string;
  created_at: string;
};

/**
 * Dashboard: lista os planos do professor logado agrupados por
 * disciplina (seções ordenadas alfabeticamente, planos dentro de
 * cada seção mantêm a ordem cronológica reversa vinda do banco).
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("lesson_plans")
    .select(
      "id, title, discipline, grade_level, duration_minutes, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const hasPlans = plans && plans.length > 0;

  // Agrupa por disciplina preservando a ordem cronológica (mais recente
  // primeiro) dentro de cada grupo. Depois ordena as disciplinas alfabeticamente.
  const groups = new Map<string, PlanRow[]>();
  if (plans) {
    for (const plan of plans as PlanRow[]) {
      const key = plan.discipline || "Sem disciplina";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(plan);
    }
  }
  const sortedDisciplines = Array.from(groups.keys()).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus planos</h1>
          <p className="text-muted-foreground">
            {hasPlans
              ? `${plans!.length} ${plans!.length === 1 ? "plano" : "planos"} em ${sortedDisciplines.length} ${sortedDisciplines.length === 1 ? "disciplina" : "disciplinas"}`
              : "Gere, edite e exporte planos de aula alinhados à BNCC."}
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/app/novo">
            <Plus className="h-4 w-4" aria-hidden />
            Novo plano
          </Link>
        </Button>
      </div>

      {!hasPlans ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                Você ainda não gerou nenhum plano
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Descreva o tema, a disciplina e a duração. Nossa IA prepara
                objetivos, atividades, avaliações e mapeamento BNCC em segundos.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/app/novo">
                <Plus className="h-4 w-4" aria-hidden />
                Criar meu primeiro plano
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedDisciplines.map((discipline) => {
            const items = groups.get(discipline)!;
            return (
              <section key={discipline} className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                  <BookOpen
                    className="h-5 w-5 text-primary"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold tracking-tight">
                    {discipline}
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
