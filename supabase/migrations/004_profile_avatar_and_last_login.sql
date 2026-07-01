-- Extra profile fields from the product spec.
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists last_login timestamptz;

-- Capture avatar from OAuth metadata (Google returns avatar_url / picture).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  avatar text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1),
    'SpeedSkin learner'
  );
  avatar := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    display_name,
    avatar,
    public.profile_role_from_metadata(new.raw_user_meta_data ->> 'role')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = coalesce(public.profiles.role, excluded.role);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
