-- Escape Flag: modération admin (Phase 6, section 10) — bannissement des comptes.
-- À exécuter après 001 à 005.

alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.profiles add column if not exists banned_reason text;

create index if not exists profiles_banned_idx on public.profiles (banned);
