-- AZ#97 : tables, droits et stockage des photos.
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.

create extension if not exists "pgcrypto";

-- ---------- Tables ----------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  quote text,
  cover_image text not null default '',
  sort int not null default 0,
  active boolean not null default true,
  coming_soon boolean not null default false,
  created_at timestamptz not null default now()
);

-- Si la table existait déjà avant cette option :
alter table public.collections add column if not exists coming_soon boolean not null default false;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  piece text not null check (piece in ('tee','ls','zip')),
  color_index int not null check (color_index between 1 and 4),
  price int not null check (price >= 0),
  preorder boolean not null default true,
  active boolean not null default true,
  image_face text not null default '',
  image_back text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  unique (collection_id, piece, color_index)
);

create table if not exists public.settings (
  key text primary key,
  value text not null default ''
);

-- Les administrateurs sont les comptes listés ici.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- Droits ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.collections enable row level security;
alter table public.products   enable row level security;
alter table public.settings   enable row level security;
alter table public.admins     enable row level security;

-- Lecture publique : seulement ce qui est actif. Un admin voit tout.
drop policy if exists "collections lecture" on public.collections;
create policy "collections lecture" on public.collections for select using (active or public.is_admin());
drop policy if exists "collections ecriture" on public.collections;
create policy "collections ecriture" on public.collections for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products lecture" on public.products;
create policy "products lecture" on public.products for select using (active or public.is_admin());
drop policy if exists "products ecriture" on public.products;
create policy "products ecriture" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings lecture" on public.settings;
create policy "settings lecture" on public.settings for select using (true);
drop policy if exists "settings ecriture" on public.settings;
create policy "settings ecriture" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- Un compte peut seulement savoir s'il est admin lui-même. Personne ne peut s'ajouter via le site.
drop policy if exists "admins lecture propre" on public.admins;
create policy "admins lecture propre" on public.admins for select using (user_id = auth.uid());

-- ---------- Stockage des photos ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "photos lecture" on storage.objects;
create policy "photos lecture" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "photos ajout admin" on storage.objects;
create policy "photos ajout admin" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "photos modif admin" on storage.objects;
create policy "photos modif admin" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "photos suppression admin" on storage.objects;
create policy "photos suppression admin" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
