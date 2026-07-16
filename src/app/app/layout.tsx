import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

/**
 * Layout do dashboard. Todas as rotas sob /app exigem sessão ativa.
 * A verificação server-side aqui é a fonte de verdade — o middleware
 * apenas mantém os cookies renovados.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Professor(a)";

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b bg-background no-print">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/app"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <GraduationCap className="h-6 w-6" aria-hidden />
            <span>PlanoAula.AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {displayName}
            </span>
            <form action="/logout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
