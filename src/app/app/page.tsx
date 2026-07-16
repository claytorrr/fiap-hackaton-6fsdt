import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PlanCard } from "@/components/plan-card";

/**
 * Dashboard: lista os planos do professor logado e oferece o CTA
 * para gerar um novo plano com IA.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("lesson_plans")
    .select("id, title, discipline, grade_level, duration_minutes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const hasPlans = plans && plans.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus planos</h1>
          <p className="text-muted-foreground">
            Gere, edite e exporte planos de aula alinhados à BNCC.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
