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
 * Card do dashboard: link para o detalhe + botão de excluir sobreposto
 * (visível on hover em telas com pointer:fine, sempre visível no toque).
 */
export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="group relative">
      <Link href={`/app/planos/${plan.id}`}>
        <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="line-clamp-2 pr-8 text-lg">
              {plan.title}
            </CardTitle>
            <CardDescription>
              {plan.discipline} · {plan.grade_level}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{plan.duration_minutes} min</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {plan.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Botão de excluir posicionado fora do <Link> para não navegar */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <DeletePlanButton
          planId={plan.id}
          planTitle={plan.title}
          variant="icon"
        />
      </div>
    </div>
  );
}
