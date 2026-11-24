create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  video_path text not null,
  thumbnail_path text,
  created_at timestamptz not null default now()
);
grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;
grant all on public.videos to service_role;
alter table public.videos enable row level security;
create policy "Anyone can view videos" on public.videos for select to anon, authenticated using (true);
create policy "Admins insert videos" on public.videos for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update videos" on public.videos for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete videos" on public.videos for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins upload footage" on storage.objects for insert to authenticated with check (bucket_id = 'footage' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update footage" on storage.objects for update to authenticated using (bucket_id = 'footage' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete footage" on storage.objects for delete to authenticated using (bucket_id = 'footage' and public.has_role(auth.uid(), 'admin'));