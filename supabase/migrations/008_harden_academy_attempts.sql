-- Production hardening for Academy attempts. Curriculum remains code-backed,
-- so the database can bound client-calculated XP but cannot independently
-- recompute each lesson's exact award.

alter table public.lesson_attempts
  drop constraint if exists lesson_attempts_xp_earned_bound,
  add constraint lesson_attempts_xp_earned_bound
    check (xp_earned between 0 and 100);

-- If 007 was briefly live before this hardening migration, keep the earliest
-- positive award and make later practice attempts non-awarding.
with ranked_awards as (
  select
    id,
    row_number() over (
      partition by user_id, lesson_id
      order by completed_at asc, id asc
    ) as award_number
  from public.lesson_attempts
  where xp_earned > 0
)
update public.lesson_attempts attempts
set xp_earned = 0
from ranked_awards ranked
where attempts.id = ranked.id
  and ranked.award_number > 1;

create unique index if not exists lesson_attempts_one_xp_award_idx
  on public.lesson_attempts (user_id, lesson_id)
  where xp_earned > 0;

-- Explicit grants complement RLS. Attempts are immutable from the browser.
revoke all on public.lesson_attempts from anon;
revoke update on public.lesson_attempts from authenticated;
grant select, insert, delete on public.lesson_attempts to authenticated;

drop policy if exists "lesson_attempts_select_related" on public.lesson_attempts;
create policy "lesson_attempts_select_related"
on public.lesson_attempts for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_admin())
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
using (
  user_id = (select auth.uid())
  or (select public.is_admin())
);

