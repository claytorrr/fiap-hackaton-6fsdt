-- =============================================================================
-- PlanoAula.AI — Row Level Security (RLS)
-- =============================================================================
-- Regra geral: cada usuário só enxerga e manipula seus próprios dados.
-- Activities e assessments herdam a permissão do lesson_plan pai.
--
-- Todas as políticas usam auth.uid() para identificar o usuário logado.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles: select own"  on public.profiles;
drop policy if exists "profiles: update own"  on public.profiles;
drop policy if exists "profiles: insert own"  on public.profiles;

-- SELECT: apenas o próprio perfil
create policy "profiles: select own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- UPDATE: apenas o próprio perfil
create policy "profiles: update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: em geral o trigger handle_new_user já cria, mas permitimos
-- que o próprio usuário insira caso o registro ainda não exista.
create policy "profiles: insert own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Nota: DELETE não é permitido pelo cliente. A remoção do perfil
-- acontece via cascade quando auth.users é deletado.

-- -----------------------------------------------------------------------------
-- lesson_plans
-- -----------------------------------------------------------------------------
alter table public.lesson_plans enable row level security;

drop policy if exists "lesson_plans: select own"  on public.lesson_plans;
drop policy if exists "lesson_plans: insert own"  on public.lesson_plans;
drop policy if exists "lesson_plans: update own"  on public.lesson_plans;
drop policy if exists "lesson_plans: delete own"  on public.lesson_plans;

create policy "lesson_plans: select own"
  on public.lesson_plans
  for select
  using (auth.uid() = user_id);

create policy "lesson_plans: insert own"
  on public.lesson_plans
  for insert
  with check (auth.uid() = user_id);

create policy "lesson_plans: update own"
  on public.lesson_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lesson_plans: delete own"
  on public.lesson_plans
  for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- activities
-- -----------------------------------------------------------------------------
-- Permissão derivada do plano pai: o usuário pode manipular atividades
-- somente se o lesson_plan referenciado pertence a ele.
-- -----------------------------------------------------------------------------
alter table public.activities enable row level security;

drop policy if exists "activities: select via plan"  on public.activities;
drop policy if exists "activities: insert via plan"  on public.activities;
drop policy if exists "activities: update via plan"  on public.activities;
drop policy if exists "activities: delete via plan"  on public.activities;

create policy "activities: select via plan"
  on public.activities
  for select
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = activities.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "activities: insert via plan"
  on public.activities
  for insert
  with check (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = activities.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "activities: update via plan"
  on public.activities
  for update
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = activities.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = activities.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "activities: delete via plan"
  on public.activities
  for delete
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = activities.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- assessments
-- -----------------------------------------------------------------------------
alter table public.assessments enable row level security;

drop policy if exists "assessments: select via plan"  on public.assessments;
drop policy if exists "assessments: insert via plan"  on public.assessments;
drop policy if exists "assessments: update via plan"  on public.assessments;
drop policy if exists "assessments: delete via plan"  on public.assessments;

create policy "assessments: select via plan"
  on public.assessments
  for select
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = assessments.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "assessments: insert via plan"
  on public.assessments
  for insert
  with check (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = assessments.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "assessments: update via plan"
  on public.assessments
  for update
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = assessments.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = assessments.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );

create policy "assessments: delete via plan"
  on public.assessments
  for delete
  using (
    exists (
      select 1 from public.lesson_plans lp
      where lp.id = assessments.lesson_plan_id
        and lp.user_id = auth.uid()
    )
  );
