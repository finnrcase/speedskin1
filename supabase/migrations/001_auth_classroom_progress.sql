-- SpeedSkin auth, classroom, assignment, and progress schema.
-- Run this in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('student', 'teacher', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_track as enum ('basics', 'python', 'shortcuts');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_status as enum ('completed', 'current', 'locked', 'available');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.shortcut_mastery_state as enum (
    'Learning',
    'Practicing',
    'Comfortable',
    'Mastered'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid generated always as (id) stored,
  email text not null,
  full_name text not null,
  role public.user_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classrooms(id) on delete cascade,
  title text not null,
  due_date date not null,
  required_level integer,
  required_track public.lesson_track,
  min_wpm integer,
  min_accuracy integer,
  required_minutes integer,
  min_python_lessons integer,
  min_shortcut_lessons integer,
  min_shortcut_mastery_pct integer,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  track public.lesson_track not null,
  status public.lesson_status not null default 'available',
  best_wpm integer,
  best_accuracy integer,
  stars integer not null default 0 check (stars between 0 and 3),
  completed_sessions integer not null default 0,
  minutes_practiced integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  track public.lesson_track not null,
  wpm integer not null,
  accuracy integer not null,
  duration_seconds integer not null,
  mistakes integer not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.shortcut_skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shortcut_id text not null,
  correct_attempts integer not null default 0,
  incorrect_attempts integer not null default 0,
  average_reaction_ms integer,
  mastery_state public.shortcut_mastery_state not null default 'Learning',
  updated_at timestamptz not null default now(),
  unique (user_id, shortcut_id)
);

create table if not exists public.shortcut_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  status public.lesson_status not null default 'available',
  best_accuracy integer,
  average_reaction_ms integer,
  completed_sessions integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.shortcut_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text,
  shortcut_id text not null,
  correct boolean not null,
  reaction_ms integer not null,
  expected_combo text not null,
  actual_combo text not null,
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists classrooms_touch_updated_at on public.classrooms;
create trigger classrooms_touch_updated_at
before update on public.classrooms
for each row execute function public.touch_updated_at();

drop trigger if exists assignments_touch_updated_at on public.assignments;
create trigger assignments_touch_updated_at
before update on public.assignments
for each row execute function public.touch_updated_at();

drop trigger if exists lesson_progress_touch_updated_at on public.lesson_progress;
create trigger lesson_progress_touch_updated_at
before update on public.lesson_progress
for each row execute function public.touch_updated_at();

drop trigger if exists shortcut_skill_progress_touch_updated_at on public.shortcut_skill_progress;
create trigger shortcut_skill_progress_touch_updated_at
before update on public.shortcut_skill_progress
for each row execute function public.touch_updated_at();

drop trigger if exists shortcut_lesson_progress_touch_updated_at on public.shortcut_lesson_progress;
create trigger shortcut_lesson_progress_touch_updated_at
before update on public.shortcut_lesson_progress
for each row execute function public.touch_updated_at();

create or replace function public.profile_role_from_metadata(raw_role text)
returns public.user_role
language plpgsql
immutable
as $$
begin
  if raw_role in ('student', 'teacher', 'admin') then
    return raw_role::public.user_role;
  end if;
  return null;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1),
    'SpeedSkin learner'
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    display_name,
    public.profile_role_from_metadata(new.raw_user_meta_data ->> 'role')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = coalesce(public.profiles.role, excluded.role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_teacher_for_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classrooms
    where id = target_class_id and teacher_id = auth.uid()
  );
$$;

create or replace function public.is_student_in_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_memberships
    where class_id = target_class_id and student_id = auth.uid()
  );
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is not null and new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change an existing role';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.join_class_by_code(p_join_code text)
returns table (
  id uuid,
  name text,
  join_code text,
  teacher_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select c.id into target_class_id
  from public.classrooms c
  where c.join_code = upper(trim(p_join_code))
  limit 1;

  if target_class_id is null then
    return;
  end if;

  insert into public.class_memberships (class_id, student_id)
  values (target_class_id, auth.uid())
  on conflict (class_id, student_id) do nothing;

  return query
  select c.id, c.name, c.join_code, c.teacher_id, c.created_at
  from public.classrooms c
  where c.id = target_class_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.class_memberships enable row level security;
alter table public.assignments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.progress_logs enable row level security;
alter table public.shortcut_skill_progress enable row level security;
alter table public.shortcut_lesson_progress enable row level security;
alter table public.shortcut_attempts enable row level security;

drop policy if exists "profiles_select_related" on public.profiles;
create policy "profiles_select_related"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where c.teacher_id = auth.uid()
      and cm.student_id = public.profiles.id
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "classrooms_select_related" on public.classrooms;
create policy "classrooms_select_related"
on public.classrooms for select
to authenticated
using (
  teacher_id = auth.uid()
  or public.is_admin()
  or public.is_student_in_class(id)
);

drop policy if exists "classrooms_insert_teacher" on public.classrooms;
create policy "classrooms_insert_teacher"
on public.classrooms for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

drop policy if exists "classrooms_update_teacher" on public.classrooms;
create policy "classrooms_update_teacher"
on public.classrooms for update
to authenticated
using (teacher_id = auth.uid() or public.is_admin())
with check (teacher_id = auth.uid() or public.is_admin());

drop policy if exists "classrooms_delete_teacher" on public.classrooms;
create policy "classrooms_delete_teacher"
on public.classrooms for delete
to authenticated
using (teacher_id = auth.uid() or public.is_admin());

drop policy if exists "memberships_select_related" on public.class_memberships;
create policy "memberships_select_related"
on public.class_memberships for select
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin()
  or public.is_teacher_for_class(class_id)
);

drop policy if exists "memberships_delete_related" on public.class_memberships;
create policy "memberships_delete_related"
on public.class_memberships for delete
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin()
  or public.is_teacher_for_class(class_id)
);

drop policy if exists "assignments_select_related" on public.assignments;
create policy "assignments_select_related"
on public.assignments for select
to authenticated
using (
  public.is_admin()
  or public.is_teacher_for_class(class_id)
  or public.is_student_in_class(class_id)
);

drop policy if exists "assignments_insert_teacher" on public.assignments;
create policy "assignments_insert_teacher"
on public.assignments for insert
to authenticated
with check (
  created_by = auth.uid()
  and (public.is_admin() or public.is_teacher_for_class(class_id))
);

drop policy if exists "assignments_update_teacher" on public.assignments;
create policy "assignments_update_teacher"
on public.assignments for update
to authenticated
using (public.is_admin() or public.is_teacher_for_class(class_id))
with check (public.is_admin() or public.is_teacher_for_class(class_id));

drop policy if exists "assignments_delete_teacher" on public.assignments;
create policy "assignments_delete_teacher"
on public.assignments for delete
to authenticated
using (public.is_admin() or public.is_teacher_for_class(class_id));

drop policy if exists "lesson_progress_select_related" on public.lesson_progress;
create policy "lesson_progress_select_related"
on public.lesson_progress for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.lesson_progress.user_id
      and c.teacher_id = auth.uid()
  )
);

drop policy if exists "lesson_progress_upsert_own" on public.lesson_progress;
create policy "lesson_progress_upsert_own"
on public.lesson_progress for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own"
on public.lesson_progress for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "progress_logs_select_related" on public.progress_logs;
create policy "progress_logs_select_related"
on public.progress_logs for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.progress_logs.user_id
      and c.teacher_id = auth.uid()
  )
);

drop policy if exists "progress_logs_insert_own" on public.progress_logs;
create policy "progress_logs_insert_own"
on public.progress_logs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "shortcut_skill_select_related" on public.shortcut_skill_progress;
create policy "shortcut_skill_select_related"
on public.shortcut_skill_progress for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_skill_progress.user_id
      and c.teacher_id = auth.uid()
  )
);

drop policy if exists "shortcut_skill_insert_own" on public.shortcut_skill_progress;
create policy "shortcut_skill_insert_own"
on public.shortcut_skill_progress for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "shortcut_skill_update_own" on public.shortcut_skill_progress;
create policy "shortcut_skill_update_own"
on public.shortcut_skill_progress for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "shortcut_lesson_select_related" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_select_related"
on public.shortcut_lesson_progress for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_lesson_progress.user_id
      and c.teacher_id = auth.uid()
  )
);

drop policy if exists "shortcut_lesson_insert_own" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_insert_own"
on public.shortcut_lesson_progress for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "shortcut_lesson_update_own" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_update_own"
on public.shortcut_lesson_progress for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "shortcut_attempts_select_related" on public.shortcut_attempts;
create policy "shortcut_attempts_select_related"
on public.shortcut_attempts for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_attempts.user_id
      and c.teacher_id = auth.uid()
  )
);

drop policy if exists "shortcut_attempts_insert_own" on public.shortcut_attempts;
create policy "shortcut_attempts_insert_own"
on public.shortcut_attempts for insert
to authenticated
with check (user_id = auth.uid());

grant execute on function public.join_class_by_code(text) to authenticated;
