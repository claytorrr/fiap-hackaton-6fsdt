"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DeletePlanButtonProps {
  planId: string;
  planTitle: string;
  /** Onde ir após deletar. Default: /app (dashboard). */
  redirectTo?: string;
  /** Variante visual. "full" mostra rótulo, "icon" só o ícone. */
  variant?: "full" | "icon";
}

/**
 * Botão de exclusão com confirmação em dois cliques (sem dependência
 * de biblioteca de dialog). Primeiro clique arma; segundo confirma.
 * Reseta sozinho após 4s se o professor mudar de ideia.
 */
export function DeletePlanButton({
  planId,
  planTitle,
  redirectTo = "/app",
  variant = "full",
}: DeletePlanButtonProps) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function arm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setArmed(true);
    // Auto-desarma
    setTimeout(() => setArmed(false), 4000);
  }

  function confirmDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const toastId = toast.loading(`Excluindo "${planTitle}"...`);
      try {
        const res = await fetch(`/api/lesson-plans/${planId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "Falha ao excluir");
        }

        toast.success("Plano excluído", { id: toastId });
        // Volta ao dashboard e revalida a lista
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao excluir plano";
        toast.error(message, { id: toastId });
        setArmed(false);
      }
    });
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={armed ? "Confirmar exclusão" : "Excluir plano"}
        title={armed ? "Clique novamente para confirmar" : "Excluir plano"}
        onClick={armed ? confirmDelete : arm}
        disabled={isPending}
        className={
          armed
            ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
            : "text-muted-foreground hover:text-destructive"
        }
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={armed ? "destructive" : "outline"}
      size="sm"
      onClick={armed ? confirmDelete : arm}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden />
      )}
      {isPending
        ? "Excluindo..."
        : armed
          ? "Confirmar exclusão"
          : "Excluir plano"}
    </Button>
  );
}
