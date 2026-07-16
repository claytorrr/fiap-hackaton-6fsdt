"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ArchivePlanButtonProps {
  planId: string;
  currentStatus: string;
}

/**
 * Alterna o status entre 'draft' e 'archived' via PATCH /api/lesson-plans/[id].
 * Rascunho eh o padrao; arquivar tira o plano do fluxo ativo sem apagar.
 */
export function ArchivePlanButton({
  planId,
  currentStatus,
}: ArchivePlanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isArchived = currentStatus === "archived";
  const nextStatus = isArchived ? "draft" : "archived";
  const label = isArchived ? "Desarquivar" : "Arquivar";
  const Icon = isArchived ? ArchiveRestore : Archive;

  function handleClick() {
    startTransition(async () => {
      const toastId = toast.loading(
        isArchived ? "Desarquivando..." : "Arquivando...",
      );
      try {
        const res = await fetch(`/api/lesson-plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.error ?? "Falha ao atualizar status");
        }
        toast.success(isArchived ? "Plano desarquivado" : "Plano arquivado", {
          id: toastId,
        });
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao atualizar status";
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
        <Icon className="h-4 w-4" aria-hidden />
      )}
      {label}
    </Button>
  );
}
