-- Escape Flag: jeu Smash or Pass + upload d'images (Phase 5, sections 8-9).
-- À exécuter après 001 à 004.
--
-- Le modèle "SmashPassVote" du cahier des charges (section 16) stocke `image_url`
-- directement sur le vote ; ici on normalise en deux tables (`smash_pass_photos` pour
-- le pool de photos à faire tourner dans le jeu, `smash_pass_votes` pour les votes)
-- afin qu'un même upload puisse recevoir plusieurs votes sans dupliquer l'URL.

create table if not exists public.smash_pass_photos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.smash_pass_votes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.smash_pass_photos(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  choice text not null check (choice in ('smash', 'pass')),
  comment text,
  created_at timestamptz not null default now(),
  constraint smash_pass_votes_unique_per_voter unique (photo_id, voter_id)
);

create index if not exists smash_pass_photos_uploader_idx on public.smash_pass_photos (uploader_id, created_at desc);
create index if not exists smash_pass_votes_photo_idx on public.smash_pass_votes (photo_id);
create index if not exists smash_pass_votes_voter_idx on public.smash_pass_votes (voter_id);

alter table public.smash_pass_photos enable row level security;
alter table public.smash_pass_votes enable row level security;

create policy "Photos are visible to authenticated users" on public.smash_pass_photos
  for select to authenticated using (true);
create policy "Users can upload their own photos" on public.smash_pass_photos
  for insert to authenticated with check (auth.uid() = uploader_id);
create policy "Users can delete their own photos" on public.smash_pass_photos
  for delete to authenticated using (auth.uid() = uploader_id);

create policy "Users can view their own votes" on public.smash_pass_votes
  for select to authenticated using (auth.uid() = voter_id);
create policy "Users can vote as themselves" on public.smash_pass_votes
  for insert to authenticated with check (auth.uid() = voter_id);
