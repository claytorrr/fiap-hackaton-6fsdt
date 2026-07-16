"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DISCIPLINES, GRADE_LEVELS } from "@/lib/constants";
import {
  updateLessonPlanSchema,
  type UpdateLessonPlanInput,
} from "@/lib/ai/schema";

interface EditPlanFormProps {
  plan: {
    id: string;
    title: string;
    discipline: string;
    grade_level: string;
    topic: string;
    duration_minutes: number;
    status: string;
    learning_objectives: string[];
    bncc_skills: string[];
    prerequisites: string;
    methodology: string;
    resources: string[];
  };
}

type FormValues = {
  title: string;
  discipline: string;
  grade_level: string;
  topic: string;
  duration_minutes: number;
  status: "draft" | "archived";
  learning_objectives_raw: string;
  bncc_skills_raw: string;
  prerequisites: string;
  methodology: string;
  resources_raw: string;
};

const STATUS_OPTIONS: Array<{ value: FormValues["status"]; label: string }> = [
  { value: "draft", label: "Ativo" },
  { value: "archived", label: "Arquivado" },
];

export function EditPlanForm({ plan }: EditPlanFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: plan.title,
      discipline: plan.discipline,
      grade_level: plan.grade_level,
      topic: plan.topic,
      duration_minutes: plan.duration_minutes,
      // Coerce: se o plano vier com um status legado (ex.: 'published' de dados
      // antigos), forcamos 'draft' para nao gerar select vazio.
      status:
        plan.status === "archived"
          ? "archived"
          : ("draft" as FormValues["status"]),
      learning_objectives_raw: plan.learning_objectives.join("\n"),
      bncc_skills_raw: plan.bncc_skills.join(", "),
      prerequisites: plan.prerequisites,
      methodology: plan.methodology,
      resources_raw: plan.resources.join("\n"),
    },
  });

  async function onSubmit(values: FormValues) {
    // Normaliza campos livres
    const learning_objectives = values.learning_objectives_raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const bncc_skills = values.bncc_skills_raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const resources = values.resources_raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: UpdateLessonPlanInput = {
      title: values.title,
      discipline: values.discipline,
      grade_level: values.grade_level,
      topic: values.topic,
      duration_minutes: Number(values.duration_minutes),
      status: values.status,
      learning_objectives,
      bncc_skills,
      prerequisites: values.prerequisites,
      methodology: values.methodology,
      resources,
    };

    const parsed = updateLessonPlanSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Verifique os campos";
      toast.error("Dados inválidos", { description: first });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Salvando alterações...");
    try {
      const res = await fetch(`/api/lesson-plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error ?? "Falha ao salvar");
      }

      toast.success("Alterações salvas", { id: toastId });
      router.push(`/app/planos/${plan.id}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register("title", { required: "Título obrigatório" })}
              placeholder="Ex.: Frações no cotidiano"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic">Tema da aula</Label>
            <Textarea
              id="topic"
              rows={2}
              {...register("topic", { required: "Descreva o tema" })}
              placeholder="Descrição curta do tema abordado"
            />
            {errors.topic && (
              <p className="text-xs text-destructive">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="discipline">Disciplina</Label>
              <select
                id="discipline"
                {...register("discipline", { required: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade_level">Ano/série</Label>
              <select
                id="grade_level"
                {...register("grade_level", { required: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">Duração (min)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min={15}
                max={300}
                {...register("duration_minutes", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register("status", { required: true })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objetivos e alinhamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="learning_objectives_raw">
              Objetivos de aprendizagem
            </Label>
            <Textarea
              id="learning_objectives_raw"
              rows={5}
              {...register("learning_objectives_raw", { required: true })}
              placeholder="Um objetivo por linha"
            />
            <p className="text-xs text-muted-foreground">Um objetivo por linha.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bncc_skills_raw">Habilidades BNCC</Label>
            <Input
              id="bncc_skills_raw"
              {...register("bncc_skills_raw")}
              placeholder="Ex.: EF06MA01, EF06MA02"
            />
            <p className="text-xs text-muted-foreground">
              Separadas por vírgula ou espaço.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contexto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prerequisites">Pré-requisitos</Label>
            <Textarea
              id="prerequisites"
              rows={3}
              {...register("prerequisites")}
              placeholder="Conhecimentos prévios esperados"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="methodology">Metodologia</Label>
            <Textarea
              id="methodology"
              rows={4}
              {...register("methodology")}
              placeholder="Abordagem pedagógica adotada"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resources_raw">Recursos necessários</Label>
            <Textarea
              id="resources_raw"
              rows={4}
              {...register("resources_raw")}
              placeholder="Um recurso por linha"
            />
            <p className="text-xs text-muted-foreground">Um recurso por linha.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/app/planos/${plan.id}`)}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
