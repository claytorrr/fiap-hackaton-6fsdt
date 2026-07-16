import Link from "next/link";
import { Sparkles, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">PlanoAula.AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center gap-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Alinhado à BNCC • Feito para o ensino público</span>
        </div>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Planos de aula em segundos,
          <span className="text-primary"> não em horas</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Uma ferramenta gratuita para professores e professoras do ensino público
          gerarem planos de aula, atividades e avaliações completas com apoio de
          inteligência artificial — sempre alinhados à BNCC.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/cadastro">Começar agora — é grátis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-6 py-16 md:grid-cols-3">
        <FeatureCard
          icon={<Clock className="h-6 w-6 text-primary" />}
          title="Economize horas por semana"
          description="O que levava horas para preparar agora leva segundos. Sobra tempo para o que importa: seus alunos."
        />
        <FeatureCard
          icon={<BookOpen className="h-6 w-6 text-primary" />}
          title="Alinhado à BNCC"
          description="Todos os planos são gerados considerando os componentes curriculares e habilidades da Base Nacional Comum Curricular."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6 text-primary" />}
          title="Gratuito para professores"
          description="Projeto sem fins lucrativos criado para apoiar professores e professoras da rede pública brasileira."
        />
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 PlanoAula.AI — Hackaton FIAP 6FSDT</span>
          <span>Feito com IA para transformar a educação pública</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
