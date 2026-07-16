"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DISCIPLINES,
  DURATION_PRESETS,
  GRADE_LEVELS,
} from "@/lib/constants";
import {
  generateLessonPlanRequestSchema,
  type GenerateLessonPlanRequest,
} from "@/lib/ai/schema";

type FormValues = {
  discipline: string;
  grade_level: string;
  topic: string;
  duration_minutes: number;
  bncc_skills_raw: string;
  additional_context: string;
};

export default function NewLessonPlanPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      discipline: "",
      grade_level: "",
      topic: "",
      duration_minutes: 50,
      bncc_skills_raw: "",
      additional_context: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // Normaliza o campo livre de habilidades BNCC em array
    const bncc_skills = values.bncc_skills_raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Valida com o mesmo schema do servidor antes de enviar
    const payload: GenerateLessonPlanRequest = {
      discipline: values.discipline,
      grade_level: values.grade_level,
      topic: values.topic,
      duration_minutes: Number(values.duration_minutes),
      bncc_skills,
      additional_context: values.additional_context,
    };

    const parsed = generateLessonPlanRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "Verifique os campos do formulário";
      toast.error("Dados inválidos", { description: firstError });
      return;
    }

    setIsGenerating(true);
    const loadingId = toast.loading("Gerando seu plano com IA...", {
      description: "Isso costuma levar menos de 15 segundos.",
    });

    try {
      const res = await fetch("/api/lesson-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const body = await res.json().catch(() => ({}));
      toast.dismiss(loadingId);

      if (!res.ok) {
        toast.error("Falha ao gerar plano", {
          description: body.error ?? `Erro HTTP ${res.status}`,
        });
        setIsGenerating(false);
        return;
      }

      toast.success("Plano gerado com sucesso!");
      router.push(`/app/planos/${body.id}`);
      router.refresh();
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error("Erro de rede", {
        description:
          err instanceof Error ? err.message : "Verifique sua conexão",
      });
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app" className="gap-1">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Sparkles className="h-7 w-7 text-primary" aria-hidden />
          Novo plano de aula
        </h1>
        <p className="text-muted-foreground">
          Descreva sua aula. A IA cuida do resto — objetivos, atividades, avaliação e BNCC.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Parâmetros da aula</CardTitle>
            <CardDescription>
              Quanto mais específico o tema, melhor o plano gerado.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discipline">Disciplina *</Label>
                <select
                  id="discipline"
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("discipline", { required: true })}
                >
                  <option value="">Selecione…</option>
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.discipline && (
                  <p className="text-sm text-destructive">
                    Selecione uma disciplina
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_level">Ano / Etapa *</Label>
                <select
                  id="grade_level"
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("grade_level", { required: true })}
                >
                  <option value="">Selecione…</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {errors.grade_level && (
                  <p className="text-sm text-destructive">
                    Selecione um ano/etapa
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Tema ou conteúdo *</Label>
              <Input
                id="topic"
                placeholder="Ex: Equações de 1º grau com uma incógnita"
                disabled={isGenerating}
                {...register("topic", {
                  required: true,
                  minLength: 5,
                  maxLength: 200,
                })}
              />
              {errors.topic && (
                <p className="text-sm text-destructive">
                  Descreva o tema (5 a 200 caracteres)
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
                <select
                  id="duration_minutes"
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("duration_minutes", {
                    required: true,
                    valueAsNumber: true,
                  })}
                >
                  {DURATION_PRESETS.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bncc_skills_raw">Habilidades BNCC</Label>
                <Input
                  id="bncc_skills_raw"
                  placeholder="EF07MA18, EF07MA19"
                  disabled={isGenerating}
                  {...register("bncc_skills_raw")}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Separe por vírgula. A IA sugere se deixar vazio.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_context">
                Contexto adicional (opcional)
              </Label>
              <Textarea
                id="additional_context"
                rows={4}
                placeholder="Ex: Turma com 32 alunos, sem laboratório. Alguns alunos com dificuldade em interpretação de enunciados."
                disabled={isGenerating}
                {...register("additional_context", { maxLength: 1000 })}
              />
              <p className="text-xs text-muted-foreground">
                Perfil da turma, recursos disponíveis, aulas anteriores, etc.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Gerando plano...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Gerar plano com IA
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
