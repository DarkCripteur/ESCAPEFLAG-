-- Escape Flag: authentification par pseudo (Phase 1 du cahier des charges).
-- À exécuter après 001_initial_schema.sql dans le SQL Editor Supabase (ou via la CLI).
--
-- Supabase Auth exige un e-mail ou un téléphone en interne : le pseudo n'existe pas
-- côté auth.users. On ajoute donc `username` (identifiant affiché, unique) et `email`
-- (copie de l'e-mail réel, utilisée par le serveur pour résoudre pseudo -> e-mail avant
-- d'appeler signInWithPassword) sur `public.profiles`.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;

alter table public.profiles
  add constraint profiles_username_format check (username is null or username ~ '^[a-zA-Z0-9_]{3,24}$');

create unique index if not exists profiles_username_unique_idx on public.profiles (lower(username));

-- Remplace le trigger existant pour renseigner username/email à la création du compte.
-- Corrige au passage un bug préexistant : le trigger ignorait `role` dans
-- raw_user_meta_data et forçait toujours 'player', ce qui empêchait le compte admin
-- seedé (server/services/seedAdminUser.js, qui passe role:'admin' en métadonnée)
-- d'obtenir réellement le rôle admin côté Supabase.
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
    username,
    email,
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

    new.raw_user_meta_data ->> 'username',

    new.email,

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

    coalesce(new.raw_user_meta_data ->> 'role', 'player'),

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
