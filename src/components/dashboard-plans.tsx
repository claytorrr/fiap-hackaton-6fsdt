"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlanCard } from "@/components/plan-card";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

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

interface DashboardPlansProps {
  plans: PlanRow[];
}

// Publicado nao aparece na UI (nao ha compartilhamento entre professores no MVP).
// A opcao permanece no banco pra nao quebrar dados legados.
const STATUS_OPTIONS = ["draft", "archived"] as const;

/**
 * Dashboard cliente: busca por texto + filtros por status/disciplina
 * + colapso das secoes por disciplina. Toda a lista de planos ja
 * chega renderizada pelo server (nao ha refetch); o filtro e feito
 * em memoria — dataset pequeno (limite 100 planos).
 */
export function DashboardPlans({ plans }: DashboardPlansProps) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(),
  );
  const [selectedDisciplines, setSelectedDisciplines] = useState<Set<string>>(
    new Set(),
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Lista fixa de disciplinas existentes (para os chips), com contagem total
  const allDisciplines = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plans) {
      const k = p.discipline || "Sem disciplina";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
      .map(([name, count]) => ({ name, count }));
  }, [plans]);

  // Aplica busca + filtros
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter((p) => {
      if (selectedStatuses.size > 0 && !selectedStatuses.has(p.status))
        return false;
      const disc = p.discipline || "Sem disciplina";
      if (selectedDisciplines.size > 0 && !selectedDisciplines.has(disc))
        return false;
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const inTopic = (p.topic ?? "").toLowerCase().includes(q);
        if (!inTitle && !inTopic) return false;
      }
      return true;
    });
  }, [plans, search, selectedStatuses, selectedDisciplines]);

  // Agrupa o resultado filtrado por disciplina
  const groups = useMemo(() => {
    const map = new Map<string, PlanRow[]>();
    for (const p of filtered) {
      const key = p.discipline || "Sem disciplina";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR"),
    );
  }, [filtered]);

  const hasActiveFilter =
    search.length > 0 ||
    selectedStatuses.size > 0 ||
    selectedDisciplines.size > 0;

  function toggleSet<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function toggleStatus(s: string) {
    setSelectedStatuses((prev) => toggleSet(prev, s));
  }
  function toggleDiscipline(d: string) {
    setSelectedDisciplines((prev) => toggleSet(prev, d));
  }
  function toggleCollapse(d: string) {
    setCollapsed((prev) => toggleSet(prev, d));
  }

  function clearFilters() {
    setSearch("");
    setSelectedStatuses(new Set());
    setSelectedDisciplines(new Set());
  }

  return (
    <div className="space-y-6">
      {/* Barra de busca + filtros */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por título ou tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Status:
          </span>
          {STATUS_OPTIONS.map((s) => {
            const active = selectedStatuses.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {STATUS_LABELS[s] ?? s}
              </button>
            );
          })}
        </div>

        {/* Disciplinas */}
        {allDisciplines.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Disciplinas:
            </span>
            {allDisciplines.map(({ name, count }) => {
              const active = selectedDisciplines.has(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleDiscipline(name)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <span>{name}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      active
                        ? "bg-primary-foreground/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {hasActiveFilter && (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {filtered.length} de {plans.length} planos
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 gap-1 text-xs"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="rounded-full bg-muted p-3">
              <Sparkles
                className="h-6 w-6 text-muted-foreground"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nenhum plano encontrado</h2>
              <p className="text-sm text-muted-foreground">
                Tente ajustar a busca ou os filtros aplicados.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map(([discipline, items]) => {
            const isCollapsed = collapsed.has(discipline);
            return (
              <section key={discipline} className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleCollapse(discipline)}
                  className="group flex w-full items-center gap-3 border-b pb-2 text-left hover:border-primary/40"
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? (
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  )}
                  <BookOpen
                    className="h-5 w-5 text-primary"
                    aria-hidden
                  />
                  <h2 className="flex-1 text-xl font-semibold tracking-tight">
                    {discipline}
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((plan) => (
                      <PlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Empty state exportado — usado pela pagina server quando plans.length === 0 */
export function EmptyPlansState() {
  return (
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
            <Sparkles className="h-4 w-4" aria-hidden />
            Criar meu primeiro plano
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
