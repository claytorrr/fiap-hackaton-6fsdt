"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeletePlanButton } from "@/components/delete-plan-button";
import { ArchivePlanButton } from "@/components/archive-plan-button";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: {
    id: string;
    title: string;
    discipline: string;
    grade_level: string;
    duration_minutes: number;
    status: string;
  };
}

/**
 * Card do dashboard: link para o detalhe + acoes rapidas sobrepostas
 * (arquivar/desarquivar e excluir). Aparecem on hover em telas com
 * pointer:fine e permanentemente em toque.
 */
export function PlanCard({ plan }: PlanCardProps) {
  const isArchived = plan.status === "archived";
  const statusLabel = STATUS_LABELS[plan.status] ?? plan.status;

  return (
    <div className="group relative">
      <Link href={`/app/planos/${plan.id}`}>
        <Card
          className={cn(
            "h-full transition hover:border-primary/40 hover:shadow-md",
            isArchived && "opacity-75",
          )}
        >
          <CardHeader>
            <CardTitle className="line-clamp-2 pr-16 text-lg">
              {plan.title}
            </CardTitle>
            <CardDescription>
              {plan.discipline} · {plan.grade_level}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{plan.duration_minutes} min</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  isArchived
                    ? "border border-muted-foreground/30 text-muted-foreground"
                    : "bg-muted",
                )}
              >
                {statusLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Acoes rapidas fora do <Link> para nao navegar ao clicar */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <ArchivePlanButton
          planId={plan.id}
          currentStatus={plan.status}
          variant="icon"
        />
        <DeletePlanButton
          planId={plan.id}
          planTitle={plan.title}
          variant="icon"
        />
      </div>
    </div>
  );
}
