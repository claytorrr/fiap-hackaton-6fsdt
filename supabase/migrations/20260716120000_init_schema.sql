-- =============================================================================
-- PlanoAula.AI — Schema inicial
-- =============================================================================
-- Cria as tabelas do domínio de planos de aula:
--   profiles       : dados do professor (1:1 com auth.users)
--   lesson_plans   : plano de aula gerado pela IA
--   activities     : atividades que compõem o plano
--   assessments    : avaliações associadas ao plano
--
-- Convenções:
--   - PK sempre uuid com default gen_random_uuid()
--   - Todo registro tem created_at (timestamptz, default now())
--   - Tabelas mutáveis têm updated_at mantido por trigger
--   - Nenhuma tabela usa CASCADE sem intenção (deleção controlada)
--
-- Extensões necessárias já vêm habilitadas por padrão no Supabase:
--   pgcrypto (gen_random_uuid)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Função utilitária: mantém updated_at automaticamente
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- profiles
-- =============================================================================
-- Estende auth.users com dados do professor.
-- Criado automaticamente via trigger on_auth_user_created (abaixo).
-- =============================================================================
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  school_name        text,
  teaching_subjects  text[] default '{}'::text[],
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table  public.profiles is 'Perfil público do professor, 1:1 com auth.users';
comment on column public.profiles.teaching_subjects is 'Disciplinas que o professor leciona (ex: {Matemática, Física})';

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: cria profile automaticamente ao registrar usuário
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- lesson_plans
-- =============================================================================
-- Plano de aula gerado pela IA. Um usuário tem N planos.
-- O campo `content` guarda a estrutura completa do plano em JSON
-- (introdução, desenvolvimento, fechamento) para permitir edição livre
-- sem quebrar o schema. Campos-chave são normalizados em colunas para
-- filtros e busca.
-- =============================================================================
create table if not exists public.lesson_plans (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  title                 text not null,
  discipline            text not null,
  grade_level           text not null,
  topic                 text not null,
  duration_minutes      int  not null check (duration_minutes > 0 and duration_minutes <= 600),
  bncc_skills           text[] default '{}'::text[],
  learning_objectives   text[] default '{}'::text[],
  prerequisites         text,
  methodology           text,
  resources             text[] default '{}'::text[],
  content               jsonb  not null default '{}'::jsonb,
  status                text   not null default 'draft'
                          check (status in ('draft', 'published', 'archived')),
  ai_model              text,
  ai_prompt_version     text,
  generation_input      jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table  public.lesson_plans is 'Plano de aula gerado pela IA e editável pelo professor';
comment on column public.lesson_plans.content is 'Estrutura completa do plano em JSON (seções, timing, notas)';
comment on column public.lesson_plans.bncc_skills is 'Códigos BNCC (ex: {EF06MA01, EF06MA02})';
comment on column public.lesson_plans.generation_input is 'Payload original enviado para a IA (para reprodutibilidade)';

create index if not exists idx_lesson_plans_user_id     on public.lesson_plans(user_id);
create index if not exists idx_lesson_plans_created_at  on public.lesson_plans(created_at desc);
create index if not exists idx_lesson_plans_status      on public.lesson_plans(status);
create index if not exists idx_lesson_plans_discipline  on public.lesson_plans(discipline);

drop trigger if exists trg_lesson_plans_updated_at on public.lesson_plans;
create trigger trg_lesson_plans_updated_at
  before update on public.lesson_plans
  for each row execute function public.set_updated_at();

-- =============================================================================
-- activities
-- =============================================================================
-- Atividades que compõem um plano de aula. Ordenadas por `position`.
-- =============================================================================
create table if not exists public.activities (
  id                uuid primary key default gen_random_uuid(),
  lesson_plan_id    uuid not null references public.lesson_plans(id) on delete cascade,
  title             text not null,
  description       text,
  activity_type     text check (activity_type in
                        ('individual', 'grupo', 'discussao', 'exercicio', 'pratica', 'exposicao')),
  duration_minutes  int check (duration_minutes > 0),
  position          int  not null default 0,
  resources         text[] default '{}'::text[],
  instructions      text,
  created_at        timestamptz not null default now()
);

comment on table public.activities is 'Atividades sequenciais de um plano de aula';

create index if not exists idx_activities_lesson_plan on public.activities(lesson_plan_id, position);

-- =============================================================================
-- assessments
-- =============================================================================
-- Avaliações associadas a um plano (formativa, somativa, diagnóstica).
-- =============================================================================
create table if not exists public.assessments (
  id                uuid primary key default gen_random_uuid(),
  lesson_plan_id    uuid not null references public.lesson_plans(id) on delete cascade,
  type              text not null check (type in ('formativa', 'somativa', 'diagnostica')),
  description       text not null,
  criteria          text[] default '{}'::text[],
  rubric            jsonb,
  created_at        timestamptz not null default now()
);

comment on table  public.assessments is 'Avaliações vinculadas a um plano de aula';
comment on column public.assessments.rubric is 'Rubrica estruturada (níveis, indicadores)';

create index if not exists idx_assessments_lesson_plan on public.assessments(lesson_plan_id);
