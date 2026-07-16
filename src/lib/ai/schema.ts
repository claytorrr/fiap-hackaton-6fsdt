import { z } from "zod";
import { GRADE_LEVELS } from "@/lib/constants";

const gradeValues = GRADE_LEVELS.map((g) => g.value) as [string, ...string[]];

/**
 * Payload que o cliente envia para gerar um plano.
 * Validado tanto no client (formulário) quanto no server (API route).
 */
export const generateLessonPlanRequestSchema = z.object({
  discipline: z.string().min(1, "Selecione a disciplina").max(80),
  grade_level: z.enum(gradeValues, {
    errorMap: () => ({ message: "Selecione o ano/série" }),
  }),
  topic: z
    .string()
    .min(5, "Descreva o tema com pelo menos 5 caracteres")
    .max(200),
  duration_minutes: z
    .number({ invalid_type_error: "Duração deve ser um número" })
    .int()
    .min(15, "Duração mínima: 15 min")
    .max(300, "Duração máxima: 300 min"),
  bncc_skills: z
    .array(z.string().min(1))
    .max(20, "Máximo 20 habilidades")
    .optional()
    .default([]),
  additional_context: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .default(""),
});

export type GenerateLessonPlanRequest = z.infer<
  typeof generateLessonPlanRequestSchema
>;

// ---------------------------------------------------------------------------
// Schema da resposta da IA (o que esperamos que o Groq retorne em JSON)
// ---------------------------------------------------------------------------

const sectionSchema = z.object({
  duration_minutes: z.number().int().min(1),
  description: z.string().min(1),
  steps: z.array(z.string()).default([]),
});

const activitySchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  activity_type: z
    .enum([
      "individual",
      "grupo",
      "discussao",
      "exercicio",
      "pratica",
      "exposicao",
    ])
    .default("individual"),
  duration_minutes: z.number().int().min(1).default(15),
  position: z.number().int().min(0).default(0),
  instructions: z.string().default(""),
  resources: z.array(z.string()).default([]),
});

const assessmentSchema = z.object({
  type: z.enum(["formativa", "somativa", "diagnostica"]).default("formativa"),
  description: z.string().min(1),
  criteria: z.array(z.string()).default([]),
});

const workedExampleSchema = z.object({
  statement: z.string().min(1),
  solution: z.string().min(1),
});

const exerciseSchema = z.object({
  statement: z.string().min(1),
  answer: z.string().min(1),
  difficulty: z.enum(["facil", "medio", "dificil"]).default("medio"),
});

const teachingMaterialSchema = z.object({
  explanation: z.string().default(""),
  guided_examples: z.array(workedExampleSchema).default([]),
  exercises: z.array(exerciseSchema).default([]),
  homework: z.string().default(""),
});

export type TeachingMaterial = z.infer<typeof teachingMaterialSchema>;

export const lessonPlanAiResponseSchema = z.object({
  title: z.string().min(1),
  learning_objectives: z.array(z.string()).min(1),
  bncc_skills: z.array(z.string()).default([]),
  prerequisites: z.string().default(""),
  methodology: z.string().default(""),
  resources: z.array(z.string()).default([]),
  introduction: sectionSchema,
  development: sectionSchema,
  closure: sectionSchema,
  activities: z.array(activitySchema).default([]),
  assessments: z.array(assessmentSchema).default([]),
  teaching_material: teachingMaterialSchema.default({
    explanation: "",
    guided_examples: [],
    exercises: [],
    homework: "",
  }),
});

export type LessonPlanAiResponse = z.infer<typeof lessonPlanAiResponseSchema>;
