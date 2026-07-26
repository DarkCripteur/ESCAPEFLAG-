-- Escape Flag: boîte à suggestions (Phase 7, section 11).
-- À exécuter après 001 à 006.
--
-- Toujours persisté, que l'envoi d'e-mail (Resend) soit configuré ou non : une
-- suggestion ne doit jamais se perdre si RESEND_API_KEY est absent ou si l'appel
-- API échoue. `emailed` trace si la notification par e-mail a bien été envoyée.

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  message text not null check (char_length(message) between 10 and 2000),
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists suggestions_created_at_idx on public.suggestions (created_at desc);

alter table public.suggestions enable row level security;

create policy "Users can submit suggestions" on public.suggestions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view their own suggestions" on public.suggestions
  for select to authenticated using (auth.uid() = user_id);
