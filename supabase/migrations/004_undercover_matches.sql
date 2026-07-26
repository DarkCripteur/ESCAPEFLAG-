-- Escape Flag: historique des parties Undercover (Phase 3, section 6).
-- À exécuter après 001, 002 et 003.

create table if not exists public.undercover_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('local', 'online')),
  winner text not null,
  civil_word text not null,
  undercover_word text not null,
  players jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists undercover_matches_user_idx on public.undercover_matches (user_id, created_at desc);

alter table public.undercover_matches enable row level security;

create policy "Users can view their own match history" on public.undercover_matches
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can record their own matches" on public.undercover_matches
  for insert to authenticated
  with check (auth.uid() = user_id);
