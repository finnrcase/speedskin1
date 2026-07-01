-- Wrap auth.uid()/helpers in scalar subqueries so they are evaluated once per
-- query instead of once per row (Supabase auth_rls_initplan optimization).
-- Correlated per-row column references (e.g. public.<table>.user_id) are left
-- as-is; only auth.uid() and the is_* helper calls are wrapped.

-- profiles
drop policy if exists "profiles_select_related" on public.profiles;
create policy "profiles_select_related" on public.profiles for select to authenticated using (
  id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1 from public.class_memberships cm
    join public.classrooms c on c.id = cm.class_id
    where c.teacher_id = (select auth.uid()) and cm.student_id = public.profiles.id
  )
);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated
with check (id = (select auth.uid()));
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select public.is_admin()))
with check (id = (select auth.uid()) or (select public.is_admin()));

-- classrooms
drop policy if exists "classrooms_select_related" on public.classrooms;
create policy "classrooms_select_related" on public.classrooms for select to authenticated using (
  teacher_id = (select auth.uid()) or (select public.is_admin()) or (select public.is_student_in_class(id))
);
drop policy if exists "classrooms_insert_teacher" on public.classrooms;
create policy "classrooms_insert_teacher" on public.classrooms for insert to authenticated
with check (
  teacher_id = (select auth.uid())
  and exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('teacher','admin'))
);
drop policy if exists "classrooms_update_teacher" on public.classrooms;
create policy "classrooms_update_teacher" on public.classrooms for update to authenticated
using (teacher_id = (select auth.uid()) or (select public.is_admin()))
with check (teacher_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "classrooms_delete_teacher" on public.classrooms;
create policy "classrooms_delete_teacher" on public.classrooms for delete to authenticated
using (teacher_id = (select auth.uid()) or (select public.is_admin()));

-- class_memberships
drop policy if exists "memberships_select_related" on public.class_memberships;
create policy "memberships_select_related" on public.class_memberships for select to authenticated using (
  student_id = (select auth.uid()) or (select public.is_admin()) or (select public.is_teacher_for_class(class_id))
);
drop policy if exists "memberships_delete_related" on public.class_memberships;
create policy "memberships_delete_related" on public.class_memberships for delete to authenticated using (
  student_id = (select auth.uid()) or (select public.is_admin()) or (select public.is_teacher_for_class(class_id))
);

-- assignments
drop policy if exists "assignments_select_related" on public.assignments;
create policy "assignments_select_related" on public.assignments for select to authenticated using (
  (select public.is_admin()) or (select public.is_teacher_for_class(class_id)) or (select public.is_student_in_class(class_id))
);
drop policy if exists "assignments_insert_teacher" on public.assignments;
create policy "assignments_insert_teacher" on public.assignments for insert to authenticated with check (
  created_by = (select auth.uid())
  and ((select public.is_admin()) or (select public.is_teacher_for_class(class_id)))
);
drop policy if exists "assignments_update_teacher" on public.assignments;
create policy "assignments_update_teacher" on public.assignments for update to authenticated
using ((select public.is_admin()) or (select public.is_teacher_for_class(class_id)))
with check ((select public.is_admin()) or (select public.is_teacher_for_class(class_id)));
drop policy if exists "assignments_delete_teacher" on public.assignments;
create policy "assignments_delete_teacher" on public.assignments for delete to authenticated
using ((select public.is_admin()) or (select public.is_teacher_for_class(class_id)));

-- lesson_progress
drop policy if exists "lesson_progress_select_related" on public.lesson_progress;
create policy "lesson_progress_select_related" on public.lesson_progress for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.class_memberships cm join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.lesson_progress.user_id and c.teacher_id = (select auth.uid())
  )
);
drop policy if exists "lesson_progress_upsert_own" on public.lesson_progress;
create policy "lesson_progress_upsert_own" on public.lesson_progress for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own" on public.lesson_progress for update to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- progress_logs
drop policy if exists "progress_logs_select_related" on public.progress_logs;
create policy "progress_logs_select_related" on public.progress_logs for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.class_memberships cm join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.progress_logs.user_id and c.teacher_id = (select auth.uid())
  )
);
drop policy if exists "progress_logs_insert_own" on public.progress_logs;
create policy "progress_logs_insert_own" on public.progress_logs for insert to authenticated
with check (user_id = (select auth.uid()));

-- shortcut_skill_progress
drop policy if exists "shortcut_skill_select_related" on public.shortcut_skill_progress;
create policy "shortcut_skill_select_related" on public.shortcut_skill_progress for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.class_memberships cm join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_skill_progress.user_id and c.teacher_id = (select auth.uid())
  )
);
drop policy if exists "shortcut_skill_insert_own" on public.shortcut_skill_progress;
create policy "shortcut_skill_insert_own" on public.shortcut_skill_progress for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "shortcut_skill_update_own" on public.shortcut_skill_progress;
create policy "shortcut_skill_update_own" on public.shortcut_skill_progress for update to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- shortcut_lesson_progress
drop policy if exists "shortcut_lesson_select_related" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_select_related" on public.shortcut_lesson_progress for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.class_memberships cm join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_lesson_progress.user_id and c.teacher_id = (select auth.uid())
  )
);
drop policy if exists "shortcut_lesson_insert_own" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_insert_own" on public.shortcut_lesson_progress for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "shortcut_lesson_update_own" on public.shortcut_lesson_progress;
create policy "shortcut_lesson_update_own" on public.shortcut_lesson_progress for update to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- shortcut_attempts
drop policy if exists "shortcut_attempts_select_related" on public.shortcut_attempts;
create policy "shortcut_attempts_select_related" on public.shortcut_attempts for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.class_memberships cm join public.classrooms c on c.id = cm.class_id
    where cm.student_id = public.shortcut_attempts.user_id and c.teacher_id = (select auth.uid())
  )
);
drop policy if exists "shortcut_attempts_insert_own" on public.shortcut_attempts;
create policy "shortcut_attempts_insert_own" on public.shortcut_attempts for insert to authenticated
with check (user_id = (select auth.uid()));
