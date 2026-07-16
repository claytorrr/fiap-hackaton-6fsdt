import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  DashboardPlans,
  EmptyPlansState,
} from "@/components/dashboard-plans";

type PlanRow = {
  id: string;
  title: string;
  discipline: string;
  grade_level: string;
  topic: string;
  duration_minutes: number;
  status: string;
  created_at: string;
};

/**
 * Dashboard: server component. Busca os planos (RLS aplica) e delega
 * a apresentacao (busca + filtros + colapso por materia) para o
 * componente client DashboardPlans.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("lesson_plans")
    .select(
      "id, title, discipline, grade_level, topic, duration_minutes, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const plans = (data ?? []) as PlanRow[];
  const hasPlans = plans.length > 0;

  // Distintas apenas para o subtitulo
  const disciplineCount = new Set(plans.map((p) => p.discipline)).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus planos</h1>
          <p className="text-muted-foreground">
            {hasPlans
              ? `${plans.length} ${plans.length === 1 ? "plano" : "planos"} em ${disciplineCount} ${disciplineCount === 1 ? "disciplina" : "disciplinas"}`
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

      {hasPlans ? <DashboardPlans plans={plans} /> : <EmptyPlansState />}
    </div>
  );
}
