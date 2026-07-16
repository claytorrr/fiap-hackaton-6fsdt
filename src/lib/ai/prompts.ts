import type { GenerateLessonPlanRequest } from "./schema";
import { GRADE_LEVELS } from "@/lib/constants";

export const PROMPT_VERSION = "2026-07-16.v1";

/**
 * System prompt: papel do modelo + regras de formato.
 * Mantido curto e imperativo para reduzir alucinação e custo de tokens.
 */
export const LESSON_PLAN_SYSTEM_PROMPT = `Você é um especialista em pedagogia brasileira e na Base Nacional Comum Curricular (BNCC).
Sua tarefa é criar planos de aula completos, práticos e alinhados à BNCC para professores da rede pública brasileira.

REGRAS OBRIGATÓRIAS:
1. Responda SEMPRE em português do Brasil.
2. Retorne EXCLUSIVAMENTE um objeto JSON válido, sem markdown, sem comentários, sem texto antes ou depois.
3. O JSON DEVE respeitar exatamente o schema abaixo (chaves, tipos e enumerações).
4. Seja concreto: sugira materiais acessíveis à escola pública (quadro, cartolina, celular, computador quando houver).
5. As durações das seções (introdução + desenvolvimento + fechamento) devem somar aproximadamente a duração total pedida.
6. Habilidades BNCC devem usar códigos oficiais quando aplicável (ex: EF06MA01, EM13LP01). Se não tiver certeza, deixe a lista vazia.
7. Objetivos de aprendizagem devem começar com verbos no infinitivo (compreender, analisar, aplicar, resolver, etc).
8. Atividades devem ter títulos claros e instruções acionáveis pelo professor.
9. Inclua pelo menos 1 avaliação formativa.

SCHEMA JSON ESPERADO:
{
  "title": "string curto e descritivo (max 100 chars)",
  "learning_objectives": ["string", ...],
  "bncc_skills": ["EF06MA01", ...],
  "prerequisites": "string com o que os alunos precisam saber antes",
  "methodology": "string descrevendo a abordagem pedagógica",
  "resources": ["string", ...],
  "introduction": { "duration_minutes": number, "description": "string", "steps": ["string", ...] },
  "development":  { "duration_minutes": number, "description": "string", "steps": ["string", ...] },
  "closure":      { "duration_minutes": number, "description": "string", "steps": ["string", ...] },
  "activities": [
    {
      "title": "string",
      "description": "string",
      "activity_type": "individual | grupo | discussao | exercicio | pratica | exposicao",
      "duration_minutes": number,
      "position": number (0-based),
      "instructions": "string com passo a passo para o professor",
      "resources": ["string", ...]
    }
  ],
  "assessments": [
    {
      "type": "formativa | somativa | diagnostica",
      "description": "string",
      "criteria": ["string", ...]
    }
  ]
}`;

/**
 * Monta o prompt do usuário a partir da requisição do professor.
 */
export function buildLessonPlanUserPrompt(
  input: GenerateLessonPlanRequest,
): string {
  const gradeLabel =
    GRADE_LEVELS.find((g) => g.value === input.grade_level)?.label ??
    input.grade_level;

  const skillsLine =
    input.bncc_skills && input.bncc_skills.length > 0
      ? `Habilidades BNCC que devem ser contempladas: ${input.bncc_skills.join(", ")}.`
      : "Sugira as habilidades BNCC mais adequadas ao tema.";

  const contextLine = input.additional_context
    ? `Contexto adicional fornecido pelo professor: ${input.additional_context}`
    : "";

  return [
    `Elabore um plano de aula com os seguintes parâmetros:`,
    ``,
    `- Disciplina: ${input.discipline}`,
    `- Etapa/Ano: ${gradeLabel}`,
    `- Tema/Conteúdo: ${input.topic}`,
    `- Duração total: ${input.duration_minutes} minutos`,
    `- ${skillsLine}`,
    contextLine,
    ``,
    `Retorne apenas o JSON, exatamente no schema definido.`,
  ]
    .filter(Boolean)
    .join("\n");
}
