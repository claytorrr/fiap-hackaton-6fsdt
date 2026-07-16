/**
 * Tipos do schema Supabase — PlanoAula.AI
 *
 * Escrito manualmente (não gerado via CLI) para manter o workflow 100% Docker.
 * Se novos campos forem adicionados às migrations, atualize aqui também.
 *
 * Convenções:
 *   - `Row`    → shape retornado por SELECT
 *   - `Insert` → shape aceito por INSERT (campos com default são opcionais)
 *   - `Update` → shape aceito por UPDATE (tudo opcional exceto o que for imutável)
 */

export type LessonPlanStatus = "draft" | "published" | "archived";

export type ActivityType =
  | "individual"
  | "grupo"
  | "discussao"
  | "exercicio"
  | "pratica"
  | "exposicao";

export type AssessmentType = "formativa" | "somativa" | "diagnostica";

/**
 * Estrutura do campo jsonb `lesson_plans.content`.
 * O plano é dividido em seções sequenciais com timing e notas.
 */
export interface LessonPlanContent {
  introduction?: {
    duration_minutes: number;
    description: string;
    steps?: string[];
  };
  development?: {
    duration_minutes: number;
    description: string;
    steps?: string[];
  };
  closure?: {
    duration_minutes: number;
    description: string;
    steps?: string[];
  };
  notes?: string;
  [key: string]: unknown;
}

/**
 * Payload que o professor envia para gerar um plano.
 * Guardado em `lesson_plans.generation_input` para reprodutibilidade.
 */
export interface LessonPlanGenerationInput {
  discipline: string;
  grade_level: string;
  topic: string;
  duration_minutes: number;
  bncc_skills?: string[];
  additional_context?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          school_name: string | null;
          teaching_subjects: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          school_name?: string | null;
          teaching_subjects?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          school_name?: string | null;
          teaching_subjects?: string[];
          updated_at?: string;
        };
      };
      lesson_plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          discipline: string;
          grade_level: string;
          topic: string;
          duration_minutes: number;
          bncc_skills: string[];
          learning_objectives: string[];
          prerequisites: string | null;
          methodology: string | null;
          resources: string[];
          content: LessonPlanContent;
          status: LessonPlanStatus;
          ai_model: string | null;
          ai_prompt_version: string | null;
          generation_input: LessonPlanGenerationInput | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          discipline: string;
          grade_level: string;
          topic: string;
          duration_minutes: number;
          bncc_skills?: string[];
          learning_objectives?: string[];
          prerequisites?: string | null;
          methodology?: string | null;
          resources?: string[];
          content?: LessonPlanContent;
          status?: LessonPlanStatus;
          ai_model?: string | null;
          ai_prompt_version?: string | null;
          generation_input?: LessonPlanGenerationInput | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          discipline?: string;
          grade_level?: string;
          topic?: string;
          duration_minutes?: number;
          bncc_skills?: string[];
          learning_objectives?: string[];
          prerequisites?: string | null;
          methodology?: string | null;
          resources?: string[];
          content?: LessonPlanContent;
          status?: LessonPlanStatus;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          lesson_plan_id: string;
          title: string;
          description: string | null;
          activity_type: ActivityType | null;
          duration_minutes: number | null;
          position: number;
          resources: string[];
          instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_plan_id: string;
          title: string;
          description?: string | null;
          activity_type?: ActivityType | null;
          duration_minutes?: number | null;
          position?: number;
          resources?: string[];
          instructions?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          activity_type?: ActivityType | null;
          duration_minutes?: number | null;
          position?: number;
          resources?: string[];
          instructions?: string | null;
        };
      };
      assessments: {
        Row: {
          id: string;
          lesson_plan_id: string;
          type: AssessmentType;
          description: string;
          criteria: string[];
          rubric: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_plan_id: string;
          type: AssessmentType;
          description: string;
          criteria?: string[];
          rubric?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          type?: AssessmentType;
          description?: string;
          criteria?: string[];
          rubric?: Record<string, unknown> | null;
        };
      };
    };
  };
}

// Aliases práticos para uso no código
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LessonPlan = Database["public"]["Tables"]["lesson_plans"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
