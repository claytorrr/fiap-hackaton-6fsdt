"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dispara o diálogo de impressão do navegador.
 * O CSS @media print em globals.css cuida de esconder chrome, header
 * e botões, deixando só o conteúdo pronto pra "Salvar como PDF".
 */
export function PrintPlanButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-2"
    >
      <Printer className="h-4 w-4" aria-hidden />
      PDF
    </Button>
  );
}
