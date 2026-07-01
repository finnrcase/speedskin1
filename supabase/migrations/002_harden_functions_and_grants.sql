-- Security hardening surfaced by the Supabase advisor after 001.
-- Keep class joining on the secure RPC-only path (join by code).
drop policy if exists "memberships_insert_self" on public.class_memberships;

-- Pin search_path on the two functions that lacked it.
alter function public.touch_updated_at() set search_path = public;
alter function public.profile_role_from_metadata(text) set search_path = public;

-- Trigger/internal functions must never be callable via the REST RPC surface.
revoke execute on function public.touch_updated_at() from anon, authenticated, public;
revoke execute on function public.profile_role_from_metadata(text) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.protect_profile_role() from anon, authenticated, public;

-- RLS helper functions: remove anon/public exposure, keep authenticated
-- (required so policy expressions can evaluate them).
revoke execute on function public.is_admin() from anon, public;
revoke execute on function public.is_teacher_for_class(uuid) from anon, public;
revoke execute on function public.is_student_in_class(uuid) from anon, public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_teacher_for_class(uuid) to authenticated;
grant execute on function public.is_student_in_class(uuid) to authenticated;

-- Joining a class is authenticated-only (the function already rejects anon).
revoke execute on function public.join_class_by_code(text) from anon, public;
grant execute on function public.join_class_by_code(text) to authenticated;
