/**
 * Constantes de domínio pedagógico.
 * Baseadas na BNCC e no vocabulário comum do professor da rede pública.
 */

export const DISCIPLINES = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "Ciências da Natureza",
  "História",
  "Geografia",
  "Arte",
  "Educação Física",
  "Inglês",
  "Espanhol",
  "Ensino Religioso",
  "Física",
  "Química",
  "Biologia",
  "Filosofia",
  "Sociologia",
] as const;

export const GRADE_LEVELS = [
  { value: "EI", label: "Educação Infantil" },
  { value: "EF1_1", label: "1º ano — Fundamental" },
  { value: "EF1_2", label: "2º ano — Fundamental" },
  { value: "EF1_3", label: "3º ano — Fundamental" },
  { value: "EF1_4", label: "4º ano — Fundamental" },
  { value: "EF1_5", label: "5º ano — Fundamental" },
  { value: "EF2_6", label: "6º ano — Fundamental" },
  { value: "EF2_7", label: "7º ano — Fundamental" },
  { value: "EF2_8", label: "8º ano — Fundamental" },
  { value: "EF2_9", label: "9º ano — Fundamental" },
  { value: "EM_1", label: "1ª série — Ensino Médio" },
  { value: "EM_2", label: "2ª série — Ensino Médio" },
  { value: "EM_3", label: "3ª série — Ensino Médio" },
  { value: "EJA", label: "EJA" },
] as const;

export type GradeValue = (typeof GRADE_LEVELS)[number]["value"];

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  grupo: "Em grupo",
  discussao: "Discussão",
  exercicio: "Exercício",
  pratica: "Prática",
  exposicao: "Exposição",
};

export const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  formativa: "Formativa",
  somativa: "Somativa",
  diagnostica: "Diagnóstica",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

/** Duração comum de uma aula, em minutos. */
export const DURATION_PRESETS = [30, 45, 50, 60, 90, 100, 120] as const;
