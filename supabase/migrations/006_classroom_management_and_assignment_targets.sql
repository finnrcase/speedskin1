-- Classroom management and concrete assignment targets.

alter table public.classrooms
  add column if not exists archived_at timestamptz;

alter table public.assignments
  add column if not exists target_mode text,
  add column if not exists lesson_ids text[],
  add column if not exists target_label text;

create index if not exists idx_classrooms_archived_at
  on public.classrooms (archived_at);

create index if not exists idx_assignments_lesson_ids
  on public.assignments using gin (lesson_ids);
