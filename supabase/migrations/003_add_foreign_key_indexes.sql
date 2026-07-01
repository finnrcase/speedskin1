-- Cover foreign keys that lacked an index (teacher/roster/analytics lookups),
-- surfaced by the Supabase performance advisor.
create index if not exists idx_assignments_class_id on public.assignments (class_id);
create index if not exists idx_assignments_created_by on public.assignments (created_by);
create index if not exists idx_class_memberships_student_id on public.class_memberships (student_id);
create index if not exists idx_class_memberships_class_id on public.class_memberships (class_id);
create index if not exists idx_classrooms_teacher_id on public.classrooms (teacher_id);
create index if not exists idx_progress_logs_user_id on public.progress_logs (user_id);
create index if not exists idx_progress_logs_user_date on public.progress_logs (user_id, date);
create index if not exists idx_shortcut_attempts_user_id on public.shortcut_attempts (user_id);
