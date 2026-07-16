"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DuplicatePlanButtonProps {
  planId: string;
}

/**
 * Duplica o plano atual (com atividades e avaliações) e navega
 * para o detalhe da cópia recém-criada.
 */
export function DuplicatePlanButton({ planId }: DuplicatePlanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const toastId = toast.loading("Duplicando plano...");
      try {
        const res = await fetch(`/api/lesson-plans/${planId}/duplicate`, {
          method: "POST",
        });
        const body = await res.json().catch(() => ({}));

        if (!res.ok || !body?.id) {
          throw new Error(body?.error ?? "Falha ao duplicar");
        }

        toast.success("Plano duplicado", { id: toastId });
        router.push(`/app/planos/${body.id}`);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao duplicar plano";
        toast.error(message, { id: toastId });
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
      {isPending ? "Duplicando..." : "Duplicar"}
    </Button>
  );
}
