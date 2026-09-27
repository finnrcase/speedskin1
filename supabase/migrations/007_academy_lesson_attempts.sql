-- Academy curriculum stays version-controlled in TypeScript. This migration
-- stores student-created attempt data and extends assignments additively.

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  academy_id text not null check (
    academy_id in (
      'keyboard', 'language', 'chromebook', 'digital',
      'communication', 'people', 'money', 'life'
    )
  ),
  think_response text not null check (char_length(think_response) <= 2000),
  quiz_answers jsonb not null default '[]'::jsonb,
  quiz_correct integer not null check (quiz_correct >= 0),
  quiz_total integer not null check (quiz_total > 0),
  quiz_percentage integer not null check (quiz_percentage between 0 and 100),
  wpm integer not null check (wpm >= 0),
  accuracy integer not null check (accuracy between 0 and 100),
  mistakes integer not null check (mistakes >= 0),
  duration_seconds integer not null check (duration_seconds > 0),
  correct_chars integer not null check (correct_chars >= 0),
  total_chars integer not null check (total_chars >= 0),
  xp_earned integer not null check (xp_earned >= 0),
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  check (quiz_correct <= quiz_total),
  check (correct_chars <= total_chars),
  check (completed_at >= started_at)
);

create index if not exists lesson_attempts_user_completed_idx
  on public.lesson_attempts (user_id, completed_at desc);
create index if not exists lesson_attempts_lesson_idx
  on public.lesson_attempts (lesson_id);
create index if not exists lesson_attempts_academy_idx
  on public.lesson_attempts (academy_id);

alter table public.lesson_attempts enable row level security;

drop policy if exists "lesson_attempts_select_related" on public.lesson_attempts;
create policy "lesson_attempts_select_related"
on public.lesson_attempts for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.lesson_attempts.user_id
      and c.teacher_id = (select auth.uid())
  )
);

drop policy if exists "lesson_attempts_insert_own" on public.lesson_attempts;
create policy "lesson_attempts_insert_own"
on public.lesson_attempts for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "lesson_attempts_delete_own_or_admin" on public.lesson_attempts;
create policy "lesson_attempts_delete_own_or_admin"
on public.lesson_attempts for delete
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

grant select, insert, delete on public.lesson_attempts to authenticated;

alter table public.assignments
  add column if not exists academy_id text,
  add column if not exists typing_level text,
  add column if not exists curriculum_level text;

alter table public.assignments
  drop constraint if exists assignments_academy_id_check,
  add constraint assignments_academy_id_check check (
    academy_id is null or academy_id in (
      'keyboard', 'language', 'chromebook', 'digital',
      'communication', 'people', 'money', 'life'
    )
  ),
  drop constraint if exists assignments_typing_level_check,
  add constraint assignments_typing_level_check check (
    typing_level is null or typing_level in ('beginner', 'intermediate', 'advanced')
  ),
  drop constraint if exists assignments_curriculum_level_check,
  add constraint assignments_curriculum_level_check check (
    curriculum_level is null or curriculum_level in ('foundation', 'developing', 'applied')
  );

