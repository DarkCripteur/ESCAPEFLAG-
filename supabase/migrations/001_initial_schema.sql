-- Escape Flag: execute this migration in Supabase SQL Editor or with the Supabase CLI.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 50),
  phone text,
  avatar text,
  country text,
  country_code text,
  role text not null default 'player' check (role in ('player', 'moderator', 'admin')),
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  completed integer not null default 0 check (completed >= 0),
  challenges integer not null default 0 check (challenges >= 0),
  best_time text not null default '00:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('solo', 'duel', 'group', 'coop')),
  status text not null default 'active' check (status in ('active', 'finished', 'abandoned')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  elapsed_seconds integer check (elapsed_seconds >= 0),
  errors integer not null default 0 check (errors >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  doors_opened integer not null default 0 check (doors_opened >= 0),
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_leaderboard_idx on public.game_sessions (status, elapsed_seconds, errors, hints_used);

alter table public.profiles enable row level security;
alter table public.game_sessions enable row level security;

create policy "Profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can view their sessions" on public.game_sessions for select to authenticated using (auth.uid() = user_id);

-- create or replace function public.handle_new_user()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   insert into public.profiles (id, name, phone, country, country_code, avatar)
--   values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Joueur'), new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'country', new.raw_user_meta_data ->> 'country_code', upper(left(coalesce(new.raw_user_meta_data ->> 'name', 'J'), 1)));
--   return new;
-- end;
-- $$;
-- remplacer par ceux ci ligne 54-123
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles
  (
    id,
    name,
    phone,
    country,
    country_code,
    avatar,
    role,
    level,
    xp,
    streak,
    completed,
    challenges,
    best_time
  )

  values
  (
    new.id,

    coalesce(
      new.raw_user_meta_data ->> 'name',
      'Joueur'
    ),

    new.raw_user_meta_data ->> 'phone',

    new.raw_user_meta_data ->> 'country',

    new.raw_user_meta_data ->> 'country_code',

    upper(
      left(
        coalesce(
          new.raw_user_meta_data ->> 'name',
          'Joueur'
        ),
        1
      )
    ),

    'player',

    1,

    0,

    0,

    0,

    0,

    '00:00'
  );


  return new;

end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
