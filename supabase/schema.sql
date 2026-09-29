-- Readora production database
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text,
  category text not null default 'General',
  cover_path text,
  file_path text not null,
  file_type text not null check (file_type in ('pdf','epub')),
  published boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_search_idx
on public.books using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(category,'') || ' ' || coalesce(description,'')));

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.books enable row level security;

create policy "public can read published books"
on public.books for select
using (published = true);

create policy "admins can read all books"
on public.books for select to authenticated
using (exists(select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can insert books"
on public.books for insert to authenticated
with check (exists(select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can update books"
on public.books for update to authenticated
using (exists(select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists(select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can delete books"
on public.books for delete to authenticated
using (exists(select 1 from public.admins a where a.user_id = auth.uid()));

-- Storage buckets: create these in Supabase Storage:
-- 1) covers (public)
-- 2) ebooks (private)
--
-- The ebooks bucket MUST remain private. The server creates short-lived signed URLs.

create or replace function public.is_admin()
returns boolean language sql security definer set search_path=public
as $$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;
